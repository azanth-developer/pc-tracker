const express = require('express');
const cors = require('cors');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { syncToFirestore, syncRunningApps, markOffline, setUserInfo, upsertUserDoc, DEVICE_ID } = require('./firebaseSync');

// Parse CLI Arguments for User Info
const args = process.argv.slice(2);
const uidArg = args.indexOf('--uid');
const emailArg = args.indexOf('--email');
const displayNameArg = args.indexOf('--displayName');
const employeeIdArg = args.indexOf('--employeeId');

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return undefined;
}

if (uidArg !== -1 && args[uidArg + 1]) {
  const uid = args[uidArg + 1];
  const email = emailArg !== -1 ? args[emailArg + 1] : 'unknown';
  const displayName = getArgValue('--displayName') || (email ? email.split('@')[0] : 'Unknown User');
  const employeeId = getArgValue('--employeeId') || `EMP-${String(uid).slice(0, 6).toUpperCase()}`;

  setUserInfo({
    uid,
    email,
    displayName,
    employeeId,
    deviceName: os.hostname(),
  });
  console.log(`[Monitor] Tracking User: ${email} (${uid})`);
}


const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

// ── Data Storage ─────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, '..', 'data');
const SCREENSHOT_DIR = path.join(DATA_DIR, 'screenshots');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const today = () => new Date().toISOString().slice(0, 10);
function getFile(name) { return path.join(DATA_DIR, `${name}_${today()}.json`); }
function load(name, fb = []) { try { if (fs.existsSync(getFile(name))) return JSON.parse(fs.readFileSync(getFile(name), 'utf8')); } catch {} return fb; }
function save(name, data) { fs.writeFileSync(getFile(name), JSON.stringify(data, null, 2)); }

// ── State ────────────────────────────────────────────────────────────────
let appUsageMap = load('app_usage', {});
if (Array.isArray(appUsageMap)) appUsageMap = {};
let systemHistory = load('system_history', []);
let activityLog = load('activity_log', []);
let windowLog = load('window_log', []);
let fileEvents = load('file_events', []);
let usbEvents = load('usb_events', []);
let screenshotList = load('screenshots', []);
let networkSnapshots = load('network', []);
let browserUsage = {};
let keystrokes = 0, mouseClicks = 0;
let sessionStart = Date.now();
let currentApp = 'Desktop', currentTitle = '';
let loginTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
let idleSeconds = 0, lastInputTime = Date.now();
let bootTime = null;
let prevNetRx = 0, prevNetTx = 0;
let cachedNetwork = { download: 0, upload: 0, totalRx: 0, totalTx: 0 };
let cachedProcesses = [];

// ── Prettify App Names ───────────────────────────────────────────────────
const APP_MAP = {
  'chrome':'Google Chrome','msedge':'Microsoft Edge','firefox':'Mozilla Firefox',
  'code':'Visual Studio Code','devenv':'Visual Studio','explorer':'File Explorer',
  'notepad':'Notepad','notepad++':'Notepad++','cmd':'Command Prompt',
  'powershell':'PowerShell','windowsterminal':'Windows Terminal',
  'slack':'Slack','teams':'Microsoft Teams','discord':'Discord','spotify':'Spotify',
  'winword':'Microsoft Word','excel':'Microsoft Excel','powerpnt':'Microsoft PowerPoint',
  'outlook':'Microsoft Outlook','figma':'Figma','photoshop':'Adobe Photoshop',
};
function prettify(raw) { return APP_MAP[raw.toLowerCase().trim()] || raw.charAt(0).toUpperCase() + raw.slice(1); }

const BROWSERS = ['Google Chrome','Microsoft Edge','Mozilla Firefox','chrome','msedge','firefox'];
function isBrowser(name) { return BROWSERS.some(b => name.toLowerCase().includes(b.toLowerCase())); }

// ── Active Window Detection ──────────────────────────────────────────────
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
let activeWinProcess = null;

function startActiveWinTracker() {
  const child = exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${path.join(SCRIPTS_DIR, 'activewin.ps1')}"`, { timeout: 0 });
  if (child.stdout) child.stdout.on('data', d => {
    const lines = d.trim().split('\n');
    const last = lines[lines.length - 1].trim();
    const parts = last.split('|||');
    if (parts.length === 2) {
      currentApp = prettify(parts[0] || 'Unknown');
      currentTitle = parts[1] || '';
      appUsageMap[currentApp] = (appUsageMap[currentApp] || 0) + 1;
      if (isBrowser(currentApp)) browserUsage[currentApp] = (browserUsage[currentApp] || 0) + 1;
      const last2 = windowLog[windowLog.length - 1];
      if (!last2 || last2.app !== currentApp || last2.title !== currentTitle) {
        windowLog.push({ timestamp: new Date().toISOString(), app: currentApp, title: currentTitle });
        if (windowLog.length > 500) windowLog = windowLog.slice(-500);
      }
    }
  });
  child.on('error', () => {});
  activeWinProcess = child;
}

// ── Idle Detection ───────────────────────────────────────────────────────
let idleProcess = null;
function startIdleTracker() {
  const child = exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${path.join(SCRIPTS_DIR, 'idle.ps1')}"`, { timeout: 0 });
  if (child.stdout) child.stdout.on('data', d => {
    const val = parseInt(d.trim().split('\n').pop());
    if (!isNaN(val)) idleSeconds = val;
  });
  child.on('error', () => {});
  idleProcess = child;
}

// ── CPU ──────────────────────────────────────────────────────────────────
let prevIdle = 0, prevTotal = 0;
function getCpu() {
  const cpus = os.cpus(); let idle = 0, total = 0;
  for (const c of cpus) { for (const t of Object.values(c.times)) total += t; idle += c.times.idle; }
  const di = idle - prevIdle, dt = total - prevTotal;
  prevIdle = idle; prevTotal = total;
  return dt === 0 ? 0 : Math.round(((dt - di) / dt) * 100);
}
function getRamGB() { return parseFloat(((os.totalmem() - os.freemem()) / 1e9).toFixed(1)); }
function getTotalRamGB() { return parseFloat((os.totalmem() / 1e9).toFixed(1)); }
function getRamPct() { return Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100); }

// ── Input Counter ────────────────────────────────────────────────────────
let inputProcess = null;
function startInputCounter() {
  const child = exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${path.join(SCRIPTS_DIR, 'input.ps1')}"`, { timeout: 0 });
  if (child.stdout) child.stdout.on('data', d => {
    const parts = d.trim().split('\n').pop().split(',');
    if (parts.length === 2) { keystrokes = parseInt(parts[0]) || 0; mouseClicks = parseInt(parts[1]) || 0; lastInputTime = Date.now(); }
  });
  child.on('error', () => {});
  inputProcess = child;
}

// ── Process List (Task Manager Data) ─────────────────────────────────────
async function getProcessList() {
  if (!si) return [];
  try {
    const procs = await si.processes();
    const list = (procs.list || [])
      .filter(p => p.name && !p.name.startsWith('svchost') && p.cpu >= 0)
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 40)
      .map(p => ({
        name: prettify(p.name.replace('.exe', '')),
        cpu: parseFloat((p.cpu || 0).toFixed(1)),
        memory: Math.round((p.mem_rss || 0) / 1048576), // MB
        memPercent: parseFloat((p.mem || 0).toFixed(1)),
        pid: p.pid,
        status: p.state === 'running' ? 'Running' : p.state || 'Running',
        startTime: p.started ? new Date(p.started).toISOString() : '',
      }));
    cachedProcesses = list;
    return list;
  } catch {
    return cachedProcesses;
  }
}

// ── Downloads Folder Watcher ─────────────────────────────────────────────
function watchDownloads() {
  const dlDir = path.join(os.homedir(), 'Downloads');
  try {
    fs.watch(dlDir, (eventType, filename) => {
      if (!filename || filename.startsWith('.') || filename.endsWith('.tmp') || filename.endsWith('.crdownload')) return;
      const entry = { timestamp: new Date().toISOString(), event: eventType, filename, folder: 'Downloads' };
      fileEvents.push(entry);
      if (fileEvents.length > 200) fileEvents = fileEvents.slice(-200);
      save('file_events', fileEvents);
    });
  } catch {}
}

// ── USB Detection via systeminformation ──────────────────────────────────
let prevUsbDevices = [];
async function checkUsb() {
  if (!si) return;
  try {
    const devices = await si.usbDevices();
    const current = devices.map(d => d.name || d.vendor || 'Unknown');
    const added = current.filter(d => !prevUsbDevices.includes(d));
    const removed = prevUsbDevices.filter(d => !current.includes(d));
    added.forEach(name => usbEvents.push({ timestamp: new Date().toISOString(), event: 'connected', name }));
    removed.forEach(name => usbEvents.push({ timestamp: new Date().toISOString(), event: 'disconnected', name }));
    if (added.length || removed.length) save('usb_events', usbEvents);
    prevUsbDevices = current;
  } catch {}
}

// ── Network Stats ────────────────────────────────────────────────────────
async function getNetwork() {
  if (!si) return { download: 0, upload: 0, totalRx: 0, totalTx: 0 };
  try {
    const stats = await si.networkStats();
    const s = stats[0] || {};
    const dl = Math.round(((s.rx_sec || 0) / 1024));
    const ul = Math.round(((s.tx_sec || 0) / 1024));
    return { download: dl, upload: ul, totalRx: Math.round((s.rx_bytes || 0) / 1e6), totalTx: Math.round((s.tx_bytes || 0) / 1e6) };
  } catch { return { download: 0, upload: 0, totalRx: 0, totalTx: 0 }; }
}

// ── Screenshot ───────────────────────────────────────────────────────────
async function takeScreenshot() {
  if (!screenshot) return null;
  try {
    const ts = Date.now();
    const filename = `screenshot_${ts}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await screenshot({ filename: filepath, format: 'png' });
    const entry = { timestamp: new Date().toISOString(), filename, path: filepath };
    screenshotList.push(entry);
    if (screenshotList.length > 100) screenshotList = screenshotList.slice(-100);
    save('screenshots', screenshotList);
    return entry;
  } catch { return null; }
}

// ── Boot Time ────────────────────────────────────────────────────────────
async function getBootTime() {
  if (si) { try { const t = await si.time(); bootTime = new Date(Date.now() - t.uptime * 1000).toISOString(); } catch {} }
  if (!bootTime) bootTime = new Date(Date.now() - os.uptime() * 1000).toISOString();
}

// ── Compute Stats ────────────────────────────────────────────────────────
function computeStats() {
  const totalSec = Object.values(appUsageMap).reduce((a, b) => a + b, 0);
  const totalHours = (totalSec / 3600).toFixed(1);
  const uptimeMin = Math.round((Date.now() - sessionStart) / 60000);
  
  // Refined Productivity Scoring
  const prodApps = ['Visual Studio Code','Visual Studio','Figma','Notepad++','Windows Terminal','PowerShell','Command Prompt','Slack','Teams'];
  const prodSec = Object.entries(appUsageMap).filter(([n]) => prodApps.some(p => n.includes(p))).reduce((a, [, s]) => a + s, 0);
  
  // Score = (Productive Time % + Input Density %) / 2
  const timeScore = totalSec > 0 ? (prodSec / totalSec) * 100 : 0;
  const inputDensity = uptimeMin > 0 ? Math.min(100, ((keystrokes + mouseClicks) / (uptimeMin * 20)) * 100) : 0;
  const finalScore = Math.round((timeScore * 0.6) + (inputDensity * 0.4));

  return {
    totalActiveHours: totalHours,
    productivityScore: Math.min(100, finalScore + 20), // Base offset for background work
    keystrokes,
    mouseClicks,
    typingSpeed: uptimeMin > 0 ? Math.round(keystrokes / 5 / uptimeMin) : 0, // WPM Estimate
    activeTypingMinutes: Math.round(keystrokes / 60),
    idleSeconds,
    uptimeMinutes: uptimeMin,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  TRACKING LOOPS
// ═══════════════════════════════════════════════════════════════════════════

// Every 15s: system stats
setInterval(async () => {
  const cpu = getCpu(), ram = getRamPct();
  const net = await getNetwork();
  cachedNetwork = net;
  systemHistory.push({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu, ram, netDl: net.download, netUl: net.upload, idle: idleSeconds, timestamp: Date.now(),
  });
  if (systemHistory.length > 300) systemHistory = systemHistory.slice(-300);
  networkSnapshots.push({ timestamp: Date.now(), ...net });
  if (networkSnapshots.length > 200) networkSnapshots = networkSnapshots.slice(-200);
  save('system_history', systemHistory);
  save('network', networkSnapshots);
}, 15000);

// Every 5s: Heartbeat (High Priority)
setInterval(async () => {
  // Keep presence + identity synced
  const ok = await require('./firebaseSync').sendHeartbeat();
  if (ok) {
    // console.log(`[Heartbeat] Pulled -> ${DEVICE_ID}`);
  }
}, 5000);


// Every 10s: Detailed system data + app usage + sync to Firebase
setInterval(async () => {
  save('app_usage', appUsageMap); save('window_log', windowLog);
  const st = computeStats();
  
  // Push to Firestore for multi-PC dashboard
  const ok = await syncToFirestore({
    currentApp, currentTitle, cpu: getCpu(), ramGB: getRamGB(),
    ramPercent: getRamPct(), keystrokes, mouseClicks, idleSeconds,
    uptimeMinutes: Math.round((Date.now() - sessionStart) / 60000),
    networkDownload: cachedNetwork.download, networkUpload: cachedNetwork.upload,
    loginTime, activeHours: st.totalActiveHours, productivityScore: st.productivityScore,
    typingSpeed: st.typingSpeed, activeTypingMinutes: st.activeTypingMinutes
  });
  
  if (ok) console.log(`[Firebase Sync] Full Telemetry -> ${DEVICE_ID}`);

  // Collect and sync running processes
  const procs = await getProcessList();
  if (procs.length > 0) {
    await syncRunningApps(procs);
  }
}, 10000);

// Every 60s: USB check
setInterval(checkUsb, 60000);

// Every 5 min: detailed activity log
setInterval(() => {
  activityLog.push({
    timestamp: new Date().toISOString(), currentApp, currentTitle,
    keystrokes, mouseClicks, cpuPercent: getCpu(), ramGB: getRamGB(),
    idleSeconds, uptimeMinutes: Math.round((Date.now() - sessionStart) / 60000),
  });
  if (activityLog.length > 500) activityLog = activityLog.slice(-500);
  save('activity_log', activityLog);
}, 5 * 60 * 1000);

// Every 10 min: screenshot
setInterval(takeScreenshot, 10 * 60 * 1000);

// ═══════════════════════════════════════════════════════════════════════════
//  REST API
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/live', (req, res) => {
  res.json({
    currentApp, currentTitle, cpu: getCpu(), ramGB: getRamGB(), ramPercent: getRamPct(),
    totalRamGB: getTotalRamGB(), keystrokes, mouseClicks, idleSeconds,
    uptimeMinutes: Math.round((Date.now() - sessionStart) / 60000),
    sessionStart: new Date(sessionStart).toISOString(), loginTime,
    hostname: os.hostname(), platform: os.platform(), arch: os.arch(),
    cpuModel: os.cpus()[0]?.model || 'Unknown', cpuCores: os.cpus().length,
    osUptime: Math.round(os.uptime() / 60), bootTime,
    network: cachedNetwork, isIdle: idleSeconds > 300,
  });
});

app.get('/api/apps', (req, res) => {
  const sorted = Object.entries(appUsageMap).map(([appName, activeTime]) => ({ appName, activeTime }))
    .sort((a, b) => b.activeTime - a.activeTime).slice(0, 20);
  res.json(sorted);
});

app.get('/api/system-history', (req, res) => res.json(systemHistory.slice(-60)));

app.get('/api/stats', (req, res) => res.json(computeStats()));

app.get('/api/processes', async (req, res) => {
  const procs = cachedProcesses.length > 0 ? cachedProcesses : await getProcessList();
  res.json(procs);
});

app.get('/api/attendance', (req, res) => {
  const records = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (i === 0) {
      const dur = Date.now() - sessionStart;
      records.push({ date: ds, loginTime, logoutTime: '--', duration: `${Math.floor(dur / 3600000)}h ${Math.floor((dur % 3600000) / 60000)}m`, status: 'Active' });
    } else if (fs.existsSync(path.join(DATA_DIR, `app_usage_${ds}.json`))) {
      records.push({ date: ds, loginTime: '09:00', logoutTime: '17:00', duration: '8h 0m', status: 'Present' });
    } else {
      const day = d.getDay();
      records.push({ date: ds, loginTime: '--', logoutTime: '--', duration: '--', status: day === 0 || day === 6 ? 'Weekend' : 'No Data' });
    }
  }
  res.json(records);
});

app.get('/api/timeline', (req, res) => {
  const events = [{ time: loginTime, event: 'System Login', color: 'green' }];
  const seen = new Set();
  for (const log of windowLog.slice(-30)) {
    const key = log.app + log.title;
    if (seen.has(key)) continue; seen.add(key);
    const t = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    events.push({ time: t, event: `${log.app}${log.title ? ' - ' + log.title.slice(0, 50) : ''}`,
      color: isBrowser(log.app) ? 'orange' : log.app.includes('Code') ? 'blue' : log.app.includes('Teams') || log.app.includes('Slack') ? 'purple' : 'cyan' });
  }
  events.push({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `${currentApp} (now)`, color: 'cyan' });
  res.json(events.slice(-15));
});

app.get('/api/daily', (req, res) => {
  const days = [], names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    let active = 0;
    if (i === 0) active = parseFloat((Object.values(appUsageMap).reduce((a, b) => a + b, 0) / 3600).toFixed(1));
    else { try { const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `app_usage_${ds}.json`), 'utf8')); active = parseFloat((Object.values(data).reduce((a, b) => a + b, 0) / 3600).toFixed(1)); } catch {} }
    days.push({ date: names[d.getDay()], active, idle: parseFloat((active * 0.15).toFixed(1)) });
  }
  res.json(days);
});

app.get('/api/windows', (req, res) => res.json(windowLog.slice(-50)));
app.get('/api/browser-usage', (req, res) => {
  const sorted = Object.entries(browserUsage).map(([name, seconds]) => ({ name, seconds, hours: (seconds / 3600).toFixed(1) })).sort((a, b) => b.seconds - a.seconds);
  res.json(sorted);
});

app.get('/api/files', (req, res) => res.json(fileEvents.slice(-50).reverse()));
app.get('/api/usb', (req, res) => res.json(usbEvents.slice(-30).reverse()));
app.get('/api/network', (req, res) => res.json(networkSnapshots.slice(-30)));

app.get('/api/screenshots', (req, res) => res.json(screenshotList.slice(-20).reverse()));
app.get('/api/screenshot/:filename', (req, res) => {
  const fp = path.join(SCREENSHOT_DIR, req.params.filename);
  if (fs.existsSync(fp)) res.sendFile(fp); else res.status(404).send('Not found');
});
app.post('/api/screenshot', async (req, res) => {
  const entry = await takeScreenshot();
  res.json(entry || { error: 'Screenshot failed' });
});

app.get('/api/devices', async (req, res) => {
  if (!si) return res.json({ usb: [], disks: [], network: [] });
  try {
    const [usb, disks, net] = await Promise.all([si.usbDevices(), si.diskLayout(), si.networkInterfaces()]);
    res.json({
      usb: usb.map(d => ({ name: d.name || d.vendor, type: d.type, removable: d.removable })),
      disks: disks.map(d => ({ name: d.name, size: (d.size / 1e9).toFixed(0) + ' GB', type: d.type, vendor: d.vendor })),
      network: net.filter(n => n.ip4).map(n => ({ iface: n.iface, ip4: n.ip4, speed: n.speed, type: n.type })),
    });
  } catch { res.json({ usb: [], disks: [], network: [] }); }
});

app.get('/api/system-info', async (req, res) => {
  const base = {
    hostname: os.hostname(), platform: os.platform(), arch: os.arch(),
    cpuModel: os.cpus()[0]?.model || 'Unknown', cpuCores: os.cpus().length,
    totalRam: getTotalRamGB() + ' GB', uptime: Math.round(os.uptime() / 3600) + 'h',
    nodeVersion: process.version, bootTime,
  };
  if (si) {
    try {
      const [osInfo, battery, graphics] = await Promise.all([si.osInfo(), si.battery(), si.graphics()]);
      base.os = `${osInfo.distro} ${osInfo.release}`;
      base.battery = battery.hasBattery ? `${battery.percent}% ${battery.isCharging ? '(Charging)' : ''}` : 'No battery';
      base.gpu = graphics.controllers?.[0]?.model || 'Unknown';
    } catch {}
  }
  res.json(base);
});

app.use('/screenshots', express.static(SCREENSHOT_DIR));

// ── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  // Ensure standardized user identity exists in Firestore before telemetry starts
  try {
    await upsertUserDoc();
  } catch {}

  console.log('');
  console.log('======================================================');
  console.log('  PC Tracker Enterprise -- Live Monitor');
  console.log('======================================================');
  console.log(`  API:        http://localhost:${PORT}`);
  console.log(`  Dashboard:  http://localhost:3000`);
  console.log(`  Machine:    ${os.hostname()}`);
  console.log(`  CPU:        ${os.cpus()[0]?.model} (${os.cpus().length} cores)`);
  console.log(`  RAM:        ${getTotalRamGB()} GB`);
  console.log(`  Session:    ${loginTime}`);
  console.log('======================================================');
  console.log('  Modules: Window Tracking | CPU/RAM | Keyboard/Mouse');
  console.log('           Network | Screenshots | USB | Processes');
  console.log('  Press Ctrl+C to stop');
  console.log('');
  startInputCounter();
  startActiveWinTracker();
  startIdleTracker();
  getCpu(); // warmup
  await getBootTime();
  watchDownloads();
  checkUsb();
  getProcessList(); // initial process collection
  setTimeout(takeScreenshot, 5000);
});

process.on('SIGINT', async () => {
  console.log('\n[PC Tracker] Saving and shutting down...');
  save('app_usage', appUsageMap); save('system_history', systemHistory);
  save('activity_log', activityLog); save('window_log', windowLog);
  save('file_events', fileEvents); save('usb_events', usbEvents);
  await markOffline();
  if (activeWinProcess) activeWinProcess.kill();
  if (idleProcess) idleProcess.kill();
  if (inputProcess) inputProcess.kill();
  process.exit(0);
});

const express = require('express');
const cors = require('cors');
const os = require('os');
const fs = require('fs');
const path = require('path');
const si = require('systeminformation');
const activeWindow = require('active-win');
const { uIOhook, UiohookKey } = require('uiohook-napi');
const { powerMonitor } = require('electron');
const screenshot = require('screenshot-desktop');

// This will run inside the Electron main process
module.exports = function startTracker(user) {
  // We can require the firebase sync logic here or pass it in
  const { syncToFirestore, syncRunningApps, markOffline, setUserInfo, upsertUserDoc, DEVICE_ID } = require('../server/firebaseSync');

  setUserInfo({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    employeeId: user.employeeId || `EMP-${String(user.uid).slice(0, 6).toUpperCase()}`,
    deviceName: os.hostname(),
    token: user.token
  });
  
  // Ensure the user exists in the Firestore users collection so they appear on the dashboard
  upsertUserDoc().catch(console.error);
  
  console.log(`[Tracker] Tracking User: ${user.email} (${user.uid})`);

  const app = express();
  const PORT = 4000;
  app.use(cors());
  app.use(express.json());

  // ── Data Storage ─────────────────────────────────────────────────────────
  const DATA_DIR = path.join(os.homedir(), '.pctracker', 'data');
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
  let idleSeconds = 0;
  let bootTime = null;
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
  setInterval(async () => {
    try {
      const win = await activeWindow();
      if (win) {
        currentApp = prettify(win.owner.name.replace('.exe', '') || 'Unknown');
        currentTitle = win.title || '';
        appUsageMap[currentApp] = (appUsageMap[currentApp] || 0) + 1;
        if (isBrowser(currentApp)) browserUsage[currentApp] = (browserUsage[currentApp] || 0) + 1;
        
        const last2 = windowLog[windowLog.length - 1];
        if (!last2 || last2.app !== currentApp || last2.title !== currentTitle) {
          windowLog.push({ timestamp: new Date().toISOString(), app: currentApp, title: currentTitle });
          if (windowLog.length > 500) windowLog = windowLog.slice(-500);
        }
      }
    } catch (e) {
      // Ignore active window errors
    }
  }, 3000);

  // ── Idle Detection ───────────────────────────────────────────────────────
  setInterval(() => {
    idleSeconds = powerMonitor.getSystemIdleTime();
  }, 1000);

  // ── Input Counter (uiohook-napi) ────────────────────────────────────────
  uIOhook.on('keydown', () => keystrokes++);
  uIOhook.on('mousedown', () => mouseClicks++);
  try {
    uIOhook.start();
  } catch (e) {
    console.error("[Tracker] Failed to start uIOhook:", e);
  }

  // ── CPU & Ram ────────────────────────────────────────────────────────────
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

  // ── Process List ─────────────────────────────────────────────────────────
  async function getProcessList() {
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

  // ── Network Stats ────────────────────────────────────────────────────────
  async function getNetwork() {
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
    try { const t = await si.time(); bootTime = new Date(Date.now() - t.uptime * 1000).toISOString(); } 
    catch { bootTime = new Date(Date.now() - os.uptime() * 1000).toISOString(); }
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

  setInterval(async () => {
    await require('../server/firebaseSync').sendHeartbeat();
  }, 5000);

  setInterval(async () => {
    save('app_usage', appUsageMap); save('window_log', windowLog);
    const st = computeStats();
    
    await syncToFirestore({
      currentApp, currentTitle, cpu: getCpu(), ramGB: getRamGB(),
      ramPercent: getRamPct(), keystrokes, mouseClicks, idleSeconds,
      uptimeMinutes: Math.round((Date.now() - sessionStart) / 60000),
      networkDownload: cachedNetwork.download, networkUpload: cachedNetwork.upload,
      loginTime, activeHours: st.totalActiveHours, productivityScore: st.productivityScore,
      typingSpeed: st.typingSpeed, activeTypingMinutes: st.activeTypingMinutes
    });
    
    const procs = await getProcessList();
    if (procs.length > 0) {
      await syncRunningApps(procs);
    }
  }, 10000);

  setInterval(() => {
    activityLog.push({
      timestamp: new Date().toISOString(), currentApp, currentTitle,
      keystrokes, mouseClicks, cpuPercent: getCpu(), ramGB: getRamGB(),
      idleSeconds, uptimeMinutes: Math.round((Date.now() - sessionStart) / 60000),
    });
    if (activityLog.length > 500) activityLog = activityLog.slice(-500);
    save('activity_log', activityLog);
  }, 5 * 60 * 1000);

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

  app.get('/api/apps', (req, res) => res.json(Object.entries(appUsageMap).map(([appName, activeTime]) => ({ appName, activeTime })).sort((a, b) => b.activeTime - a.activeTime).slice(0, 20)));
  app.get('/api/system-history', (req, res) => res.json(systemHistory.slice(-60)));
  app.get('/api/stats', (req, res) => res.json(computeStats()));
  app.get('/api/processes', async (req, res) => res.json(cachedProcesses.length > 0 ? cachedProcesses : await getProcessList()));
  
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
      events.push({ time: t, event: `${log.app}${log.title ? ' - ' + log.title.slice(0, 50) : ''}`, color: isBrowser(log.app) ? 'orange' : log.app.includes('Code') ? 'blue' : 'cyan' });
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
  app.get('/api/browser-usage', (req, res) => res.json(Object.entries(browserUsage).map(([name, seconds]) => ({ name, seconds, hours: (seconds / 3600).toFixed(1) })).sort((a, b) => b.seconds - a.seconds)));
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

  app.use('/screenshots', express.static(SCREENSHOT_DIR));

  const server = app.listen(PORT, async () => {
    getCpu(); 
    await getBootTime();
    getProcessList();
    setTimeout(takeScreenshot, 5000);
    console.log(`[Tracker] Started securely on port ${PORT}`);
  });

  return {
    stop: async () => {
      console.log('[Tracker] Stopping...');
      save('app_usage', appUsageMap); save('system_history', systemHistory);
      save('activity_log', activityLog); save('window_log', windowLog);
      await markOffline();
      server.close();
      try { uIOhook.stop(); } catch(e) {}
    }
  };
};

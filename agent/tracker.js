/**
 * PC Tracker — Background Monitoring Agent
 * Tracks active windows, CPU/RAM, keyboard & mouse counts
 * Uploads logs to Firebase Firestore every N minutes
 *
 * Usage: node agent/tracker.js
 * Build to EXE: pkg agent/tracker.js --targets node18-win-x64 --output pc-tracker-agent.exe
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const os   = require('os');
const path = require('path');

// ── Firebase config ────────────────────────────────────────────────────────
// Copy your config from Firebase Console → Project Settings → Web app
const firebaseConfig = {
  apiKey:            process.env.FB_API_KEY            || 'YOUR_API_KEY',
  authDomain:        process.env.FB_AUTH_DOMAIN        || 'YOUR_AUTH_DOMAIN',
  projectId:         process.env.FB_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     process.env.FB_STORAGE_BUCKET     || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID|| 'YOUR_MESSAGING_SENDER_ID',
  appId:             process.env.FB_APP_ID             || 'YOUR_APP_ID',
};

const fbApp = initializeApp(firebaseConfig);
const db    = getFirestore(fbApp);

// ── Config ─────────────────────────────────────────────────────────────────
const UPLOAD_INTERVAL_MS  = 5 * 60 * 1000; // 5 minutes
const IDLE_THRESHOLD_MS   = 5 * 60 * 1000; // 5 minutes idle
const userId = os.hostname();               // use machine name as user ID

// ── State ──────────────────────────────────────────────────────────────────
let appUsageMap   = {};   // { "App Name": totalSeconds }
let keystrokes    = 0;
let mouseClicks   = 0;
let lastActivity  = Date.now();
let idleMs        = 0;
let sessionStart  = Date.now();

// ── Try to load native hooks (Windows active window detection) ────────────
let activeWin;
try { activeWin = require('active-win'); } catch { activeWin = null; }

// ── Try to load iohook for key/mouse counting ─────────────────────────────
let ioHook;
try {
  ioHook = require('iohook');
  ioHook.on('keydown',    () => { keystrokes++;   lastActivity = Date.now(); });
  ioHook.on('mouseclick', () => { mouseClicks++;  lastActivity = Date.now(); });
  ioHook.start();
  console.log('[PC Tracker] iohook loaded — tracking keyboard & mouse');
} catch {
  console.log('[PC Tracker] iohook not available — keyboard/mouse counts will be 0');
}

// ── Get CPU usage ──────────────────────────────────────────────────────────
function getCpuPercent() {
  const cpus = os.cpus();
  let idle = 0, total = 0;
  for (const cpu of cpus) {
    for (const t of Object.values(cpu.times)) total += t;
    idle += cpu.times.idle;
  }
  return Math.round(((total - idle) / total) * 100);
}

// ── Get RAM usage GB ───────────────────────────────────────────────────────
function getRamUsedGB() {
  const used = os.totalmem() - os.freemem();
  return parseFloat((used / 1e9).toFixed(2));
}

// ── Track active window every second ──────────────────────────────────────
let trackInterval;
if (activeWin) {
  trackInterval = setInterval(async () => {
    try {
      const win = await activeWin();
      if (!win) return;
      const appName = win.owner?.name || 'Unknown';
      appUsageMap[appName] = (appUsageMap[appName] || 0) + 1;
      if (Date.now() - lastActivity < IDLE_THRESHOLD_MS) {
        lastActivity = Date.now();
      }
    } catch {}
  }, 1000);
} else {
  console.log('[PC Tracker] active-win not available — using simulated app names');
  // Simulate for demo / testing without native deps
  const DEMO_APPS = ['Visual Studio Code', 'Google Chrome', 'Windows Explorer', 'Notepad'];
  trackInterval = setInterval(() => {
    const app = DEMO_APPS[Math.floor(Math.random() * DEMO_APPS.length)];
    appUsageMap[app] = (appUsageMap[app] || 0) + 1;
  }, 1000);
}

// ── Upload logs to Firestore ───────────────────────────────────────────────
async function uploadLogs() {
  const now       = Date.now();
  const idleTotal = Math.max(0, now - lastActivity);
  const cpuUsage  = getCpuPercent();
  const ramUsage  = getRamUsedGB();
  const uptime    = Math.round((now - sessionStart) / 1000);

  console.log(`\n[PC Tracker] Uploading logs at ${new Date().toLocaleTimeString()}`);
  console.log(`  CPU: ${cpuUsage}%  RAM: ${ramUsage} GB  Uptime: ${uptime}s`);
  console.log(`  Keystrokes: ${keystrokes}  Clicks: ${mouseClicks}`);

  try {
    // Upload system_stats
    await addDoc(collection(db, 'system_stats'), {
      userId,
      cpuUsage,
      ramUsage,
      uptime,
      timestamp: serverTimestamp(),
    });

    // Upload each app's usage as activity_log entry
    for (const [appName, activeTime] of Object.entries(appUsageMap)) {
      if (activeTime < 2) continue; // skip very short bursts
      await addDoc(collection(db, 'activity_logs'), {
        userId,
        appName,
        activeTime,
        keystrokes,
        mouseClicks,
        idleMs: idleTotal,
        timestamp: serverTimestamp(),
      });
    }

    console.log('[PC Tracker] Upload complete ✓');

    // Reset counters
    appUsageMap = {};
    keystrokes  = 0;
    mouseClicks = 0;
    idleMs      = 0;

  } catch (err) {
    console.error('[PC Tracker] Upload failed:', err.message);
  }
}

// ── Schedule uploads ───────────────────────────────────────────────────────
setInterval(uploadLogs, UPLOAD_INTERVAL_MS);

// ── Startup ────────────────────────────────────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  PC Tracker — Background Monitoring Agent');
console.log(`  Machine: ${userId}`);
console.log(`  Upload interval: ${UPLOAD_INTERVAL_MS / 60000} minutes`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Log session login event immediately
addDoc(collection(db, 'activity_logs'), {
  userId,
  appName: '__LOGIN__',
  activeTime: 0,
  timestamp: serverTimestamp(),
}).catch(() => {});

// Graceful shutdown
process.on('SIGINT',  () => { uploadLogs().then(() => process.exit(0)); });
process.on('SIGTERM', () => { uploadLogs().then(() => process.exit(0)); });

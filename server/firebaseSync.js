// server/firebaseSync.js — Pushes local monitor data to Firestore via REST API
const os = require('os');
const https = require('https');

const PROJECT_ID = 'pc-tracker-8b48c';
const API_KEY = 'AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// We'll set these from monitor.js
let USER_ID = 'unknown';
let USER_EMAIL = 'unknown';
let DEVICE_ID = os.hostname().replace(/[^a-zA-Z0-9_-]/g, '_');

function setUserInfo(uid, email) {
  USER_ID = uid;
  USER_EMAIL = email;
  // Make device ID unique per user so multiple users on one PC don't overwrite
  DEVICE_ID = `${os.hostname().replace(/[^a-zA-Z0-9_-]/g, '_')}_${USER_ID}`;
}

function firebaseRequest(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(true);
        else reject(new Error(`HTTP ${res.statusCode}: ${out.slice(0, 150)}`));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function syncToFirestore(data) {
  try {
    const body = {
      fields: {
        userId:         { stringValue: USER_ID },
        userEmail:      { stringValue: USER_EMAIL },
        hostname:       { stringValue: os.hostname() },
        platform:       { stringValue: os.platform() },
        arch:           { stringValue: os.arch() },
        cpuModel:       { stringValue: os.cpus()[0]?.model || 'Unknown' },
        cpuCores:       { integerValue: String(os.cpus().length) },
        totalRamGB:     { doubleValue: parseFloat((os.totalmem() / 1e9).toFixed(1)) },
        currentApp:     { stringValue: data.currentApp || 'Desktop' },
        currentTitle:   { stringValue: (data.currentTitle || '').slice(0, 200) },
        cpu:            { integerValue: String(data.cpu || 0) },
        ramGB:          { doubleValue: data.ramGB || 0 },
        ramPercent:     { integerValue: String(data.ramPercent || 0) },
        keystrokes:     { integerValue: String(data.keystrokes || 0) },
        mouseClicks:    { integerValue: String(data.mouseClicks || 0) },
        typingSpeed:    { integerValue: String(data.typingSpeed || 0) },
        activeTypingMinutes: { integerValue: String(data.activeTypingMinutes || 0) },
        idleSeconds:    { integerValue: String(data.idleSeconds || 0) },
        uptimeMinutes:  { integerValue: String(data.uptimeMinutes || 0) },
        networkDownload:{ integerValue: String(data.networkDownload || 0) },
        networkUpload:  { integerValue: String(data.networkUpload || 0) },
        loginTime:      { stringValue: data.loginTime || '' },
        activeHours:    { stringValue: data.activeHours || '0' },
        productivityScore: { integerValue: String(data.productivityScore || 0) },
        isOnline:       { booleanValue: true },
        lastSeen:       { stringValue: new Date().toISOString() },
      }
    };
    await firebaseRequest(`${FIRESTORE_URL}/devices/${DEVICE_ID}?key=${API_KEY}`, body);
    return true;
  } catch (err) {
    console.error('[Firebase Sync] Error:', err.message);
    return false;
  }
}

async function syncRunningApps(processList) {
  try {
    const procs = processList.slice(0, 30).map(p => ({
      mapValue: {
        fields: {
          name:      { stringValue: p.name || 'Unknown' },
          cpu:       { doubleValue: p.cpu || 0 },
          memory:    { doubleValue: p.memory || 0 },
          memPercent:{ doubleValue: p.memPercent || 0 },
          pid:       { integerValue: String(p.pid || 0) },
          status:    { stringValue: p.status || 'Running' },
          startTime: { stringValue: p.startTime || '' },
        }
      }
    }));
    const body = {
      fields: {
        userId: { stringValue: USER_ID },
        deviceId: { stringValue: DEVICE_ID },
        hostname: { stringValue: os.hostname() },
        updatedAt: { stringValue: new Date().toISOString() },
        processes: { arrayValue: { values: procs } },
      }
    };
    await firebaseRequest(`${FIRESTORE_URL}/runningApps/${DEVICE_ID}?key=${API_KEY}`, body);
    return true;
  } catch (err) {
    console.error('[Firebase Sync] Process sync error:', err.message);
    return false;
  }
}

async function sendHeartbeat() {
  try {
    const body = {
      fields: {
        lastSeen: { stringValue: new Date().toISOString() },
        isOnline: { booleanValue: true },
        userId:   { stringValue: USER_ID },
        userEmail:{ stringValue: USER_EMAIL },
      }
    };
    // Use patch with updateMask to only update these two fields (efficient)
    await firebaseRequest(`${FIRESTORE_URL}/devices/${DEVICE_ID}?updateMask.fieldPaths=lastSeen&updateMask.fieldPaths=isOnline&updateMask.fieldPaths=userId&updateMask.fieldPaths=userEmail&key=${API_KEY}`, body);
    return true;
  } catch (err) {
    console.error('[Firebase Heartbeat] Error:', err.message);
    return false;
  }
}

async function markOffline() {
  try {
    const body = { fields: { isOnline: { booleanValue: false }, lastSeen: { stringValue: new Date().toISOString() } } };
    await firebaseRequest(`${FIRESTORE_URL}/devices/${DEVICE_ID}?updateMask.fieldPaths=isOnline&updateMask.fieldPaths=lastSeen&key=${API_KEY}`, body);
  } catch {}
}

module.exports = { syncToFirestore, syncRunningApps, markOffline, sendHeartbeat, setUserInfo, DEVICE_ID };

/**
 * PC Tracker — Export All Records to CSV
 * Pulls all tracking data from the monitor API and saves as CSV files
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const API = 'http://localhost:4000/api';
const OUTPUT_DIR = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

function toCSV(headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => {
      let val = row[h] ?? '';
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('"') || val.includes('\n')) val = `"${val}"`;
      return val;
    }).join(','));
  }
  return lines.join('\n');
}

function saveCSV(filename, content) {
  const fp = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`  ✅ ${filename} (${content.split('\n').length - 1} records)`);
}

async function exportAll() {
  const timestamp = new Date().toISOString().slice(0, 10);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📊 PC Tracker — CSV Export');
  console.log(`  📅 Date: ${timestamp}`);
  console.log(`  💻 Machine: ${os.hostname()}`);
  console.log(`  📁 Output: ${OUTPUT_DIR}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // 1. Live System Summary
  console.log('  Exporting...');
  const live = await fetch(`${API}/live`);
  saveCSV(`system_summary_${timestamp}.csv`, toCSV(
    ['hostname','cpuModel','cpuCores','totalRamGB','platform','arch','currentApp','currentTitle','cpu_percent','ram_gb','ram_percent','keystrokes','mouseClicks','idleSeconds','uptimeMinutes','loginTime','bootTime'],
    [{ ...live, cpu_percent: live.cpu, ram_gb: live.ramGB, ram_percent: live.ramPercent, totalRamGB: live.totalRamGB }]
  ));

  // 2. App Usage
  const apps = await fetch(`${API}/apps`);
  saveCSV(`app_usage_${timestamp}.csv`, toCSV(
    ['rank','appName','activeSeconds','activeMinutes','activeHours'],
    apps.map((a, i) => ({
      rank: i + 1, appName: a.appName, activeSeconds: a.activeTime,
      activeMinutes: Math.round(a.activeTime / 60), activeHours: (a.activeTime / 3600).toFixed(2),
    }))
  ));

  // 3. System History (CPU, RAM, Network over time)
  const history = await fetch(`${API}/system-history`);
  saveCSV(`system_history_${timestamp}.csv`, toCSV(
    ['time','cpu_percent','ram_percent','network_download_kbps','network_upload_kbps','idle_seconds','timestamp'],
    history.map(h => ({
      time: h.time, cpu_percent: h.cpu, ram_percent: h.ram,
      network_download_kbps: h.netDl, network_upload_kbps: h.netUl,
      idle_seconds: h.idle, timestamp: new Date(h.timestamp).toISOString(),
    }))
  ));

  // 4. Stats Summary
  const stats = await fetch(`${API}/stats`);
  saveCSV(`productivity_stats_${timestamp}.csv`, toCSV(
    ['totalActiveHours','avgDailyHours','productivityScore','idlePercent','keystrokes','mouseClicks','cpuAvg','ramUsed_gb','sessionsToday','uptimeMinutes','typingSpeed_keysPerMin','activeTypingMinutes'],
    [stats]
  ));

  // 5. Attendance
  const attendance = await fetch(`${API}/attendance`);
  saveCSV(`attendance_${timestamp}.csv`, toCSV(
    ['date','loginTime','logoutTime','duration','status'],
    attendance
  ));

  // 6. Daily Activity
  const daily = await fetch(`${API}/daily`);
  saveCSV(`daily_activity_${timestamp}.csv`, toCSV(
    ['day','active_hours','idle_hours'],
    daily.map(d => ({ day: d.date, active_hours: d.active, idle_hours: d.idle }))
  ));

  // 7. Window/App Timeline
  const windows = await fetch(`${API}/windows`);
  saveCSV(`window_log_${timestamp}.csv`, toCSV(
    ['timestamp','app','title'],
    windows
  ));

  // 8. Timeline Events
  const timeline = await fetch(`${API}/timeline`);
  saveCSV(`timeline_events_${timestamp}.csv`, toCSV(
    ['time','event','color'],
    timeline
  ));

  // 9. Screenshots
  const screenshots = await fetch(`${API}/screenshots`);
  saveCSV(`screenshots_${timestamp}.csv`, toCSV(
    ['timestamp','filename','url'],
    screenshots.map(s => ({
      timestamp: s.timestamp, filename: s.filename,
      url: `http://localhost:4000/api/screenshot/${s.filename}`,
    }))
  ));

  // 10. USB Events
  const usb = await fetch(`${API}/usb`);
  saveCSV(`usb_events_${timestamp}.csv`, toCSV(
    ['timestamp','device_name','event'],
    usb.map(u => ({ timestamp: u.timestamp, device_name: u.name, event: u.event }))
  ));

  // 11. File Activity
  const files = await fetch(`${API}/files`);
  saveCSV(`file_activity_${timestamp}.csv`, toCSV(
    ['timestamp','filename','event'],
    files
  ));

  // 12. Device Hardware
  const devices = await fetch(`${API}/devices`);
  if (devices.disks?.length) {
    saveCSV(`hardware_disks_${timestamp}.csv`, toCSV(
      ['vendor','name','size','type'], devices.disks
    ));
  }
  if (devices.network?.length) {
    saveCSV(`hardware_network_${timestamp}.csv`, toCSV(
      ['interface','ip4','speed_mbps','type'],
      devices.network.map(n => ({ interface: n.iface, ip4: n.ip4, speed_mbps: n.speed, type: n.type }))
    ));
  }

  // 13. System Info
  const sysInfo = await fetch(`${API}/system-info`);
  saveCSV(`system_info_${timestamp}.csv`, toCSV(
    ['hostname','platform','arch','cpuModel','cpuCores','totalRam','os','gpu','battery','uptime','nodeVersion','bootTime'],
    [sysInfo]
  ));

  // 14. Network Snapshots
  const network = await fetch(`${API}/network`);
  saveCSV(`network_history_${timestamp}.csv`, toCSV(
    ['timestamp','download_kbps','upload_kbps','totalRx_mb','totalTx_mb'],
    network.map(n => ({
      timestamp: new Date(n.timestamp).toISOString(),
      download_kbps: n.download, upload_kbps: n.upload,
      totalRx_mb: n.totalRx, totalTx_mb: n.totalTx,
    }))
  ));

  // 15. Browser Usage
  const browser = await fetch(`${API}/browser-usage`);
  saveCSV(`browser_usage_${timestamp}.csv`, toCSV(
    ['browser','seconds','hours'], browser
  ));

  console.log('');
  console.log(`  ✅ All records exported to: ${OUTPUT_DIR}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

exportAll().catch(err => {
  console.error('Export failed:', err.message);
  console.error('Make sure the monitor server is running: npm run monitor');
});

const http = require('http');
const endpoints = [
  '/api/live', '/api/apps', '/api/system-history', '/api/stats',
  '/api/attendance', '/api/daily', '/api/timeline', '/api/screenshots',
  '/api/devices', '/api/file-events', '/api/system-info',
];
let done = 0;
endpoints.forEach(ep => {
  http.get('http://localhost:4000' + ep, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const ok = res.statusCode === 200;
      const preview = d.slice(0, 80).replace(/\n/g, ' ');
      console.log(`${ok ? 'OK' : 'FAIL'} [${res.statusCode}] ${ep} → ${preview}...`);
      if (++done === endpoints.length) process.exit(0);
    });
  }).on('error', err => {
    console.log(`FAIL ${ep} → ${err.message}`);
    if (++done === endpoints.length) process.exit(1);
  });
});

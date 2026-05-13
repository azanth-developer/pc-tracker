const https = require('https');
const url = 'https://firestore.googleapis.com/v1/projects/pc-tracker-8b48c/databases/(default)/documents/devices/test?key=AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec';
const body = JSON.stringify({ fields: { test: { stringValue: 'hello' }, time: { stringValue: new Date().toISOString() } } });
const r = https.request(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Status:', res.statusCode, '\nResponse:', d.slice(0, 300)));
});
r.on('error', err => console.log('Error:', err.message));
r.write(body);
r.end();

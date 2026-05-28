require('dotenv').config();
const https = require('https');

const PROJECT_ID = 'pc-tracker-8b48c';
const API_KEY = 'AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec';

function firebaseRequest(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    
    const req = https.request(url, {
      method: 'PATCH',
      headers,
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

async function run() {
  const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  
  // Set the admin role
  const body = {
    fields: {
      role: { stringValue: 'admin' }
    }
  };
  
  await firebaseRequest(`${FIRESTORE_URL}/users/pmPtNa6TliYj1UoW1j5ZhdRKPkH3?updateMask.fieldPaths=role&key=${API_KEY}`, body);
  console.log("Restored admin role.");
}
run().catch(console.error);

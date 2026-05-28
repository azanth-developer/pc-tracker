require('dotenv').config();
const https = require('https');

const PROJECT_ID = 'pc-tracker-8b48c';
const API_KEY = 'AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec';

function fetchCollection(collection) {
  return new Promise((resolve, reject) => {
    https.get(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?key=${API_KEY}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const users = await fetchCollection('users');
  const devices = await fetchCollection('devices');

  console.log("---- USERS ----");
  if(users.documents) {
    users.documents.forEach(doc => {
        const uid = doc.fields.uid?.stringValue;
        const email = doc.fields.email?.stringValue;
        console.log(`UID: ${uid}, Email: ${email}`);
    });
  }

  console.log("---- DEVICES ----");
  if(devices.documents) {
    devices.documents.forEach(doc => {
        const userId = doc.fields.userId?.stringValue;
        const email = doc.fields.userEmail?.stringValue;
        const isOnline = doc.fields.isOnline?.booleanValue;
        const deviceId = doc.name.split('/').pop();
        console.log(`DeviceID: ${deviceId}, UserID: ${userId}, Email: ${email}, Online: ${isOnline}`);
    });
  }
}
run();

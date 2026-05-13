const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec",
  authDomain: "pc-tracker-8b48c.firebaseapp.com",
  projectId: "pc-tracker-8b48c",
  storageBucket: "pc-tracker-8b48c.firebasestorage.app",
  messagingSenderId: "686397860978",
  appId: "1:686397860978:web:95fe9d01827b1e569e66eb",
  measurementId: "G-BW36SL3P49",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  console.log(`Found ${querySnapshot.size} users in 'users' collection.`);
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
  });
  
  const devSnapshot = await getDocs(collection(db, "devices"));
  console.log(`Found ${devSnapshot.size} devices in 'devices' collection.`);
}

checkUsers().catch(console.error);

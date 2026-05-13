const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDT_5Vf1Ti4v5SXfcuvdWmh6iCaGQc52ec",
  authDomain: "pc-tracker-8b48c.firebaseapp.com",
  projectId: "pc-tracker-8b48c",
  storageBucket: "pc-tracker-8b48c.firebasestorage.app",
  messagingSenderId: "686397860978",
  appId: "1:686397860978:web:95fe9d01827b1e569e66eb",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MOCK_USERS = [
  {
    uid: "mock-1",
    email: "azanth@company.com",
    name: "Azanth S",
    employeeId: "EMP-2005",
    role: "employee",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    uid: "mock-2",
    email: "sarah@company.com",
    name: "Sarah Miller",
    employeeId: "EMP-1022",
    role: "employee",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    uid: "admin-uid",
    email: "admin@pctracker.com",
    name: "Admin User",
    employeeId: "ADM-0001",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  }
];

async function seed() {
  for (const user of MOCK_USERS) {
    await setDoc(doc(db, "users", user.uid), user);
    console.log(`Seeded user: ${user.email}`);
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);

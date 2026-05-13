// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

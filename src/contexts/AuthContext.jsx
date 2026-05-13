import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(user) {
    if (!user) { setUserRole(null); setUserProfile(null); return; }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserRole(data.role || "employee");
        setUserProfile(data);
      } else {
        // First-time user setup (usually handled in register, but fallback here)
        const profile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "Employee",
          role: user.email === "admin@pctracker.com" ? "admin" : "employee",
          status: "active",
          createdAt: new Date().toISOString(),
          totalWorkHours: 0,
        };
        await setDoc(doc(db, "users", user.uid), profile);
        setUserRole(profile.role);
        setUserProfile(profile);
      }
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password, fullName, employeeId) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    // Create professional enterprise profile
    const profile = {
      uid: user.uid,
      email: email,
      displayName: fullName,
      employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: email === "admin@pctracker.com" ? "admin" : "employee",
      deviceName: window.navigator.platform || "Windows PC",
      status: "active",
      createdAt: new Date().toISOString(),
      totalWorkHours: 0,
      weeklySummary: {
        avgProductivity: 0,
        attendanceRate: 0,
        lastWeekHours: 0
      }
    };
    
    await setDoc(doc(db, "users", user.uid), profile);
    return res;
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    return signOut(auth);
  }

  const isAdmin = userRole === "admin";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Clear loading immediately so UI can render
      if (user) fetchUserProfile(user); // Fetch profile in background
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser, userRole, userProfile, isAdmin,
    login, register, loginWithGoogle, logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

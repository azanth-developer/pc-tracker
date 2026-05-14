import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Monitor, Lock, Mail, Eye, EyeOff, Activity, UserPlus, LogIn } from "lucide-react";

// Electron IPC helper
const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
let ipcRenderer = null;
if (isElectron) {
  try {
    ipcRenderer = window.require('electron').ipcRenderer;
  } catch (e) {
    console.warn("Electron IPC not available");
  }
}

export default function Login() {
  const { login, register, loginWithGoogle, currentUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  // ... rest of state

  // Signal Electron to start monitor if we just logged in
  useEffect(() => {
    if (currentUser && ipcRenderer) {
      console.log("[Login] Signaling Electron to start monitor...");
      ipcRenderer.send('auth-success-start-monitor', { 
        uid: currentUser.uid, 
        email: currentUser.email 
      });
    }
  }, [currentUser]);
  const [email,      setEmail]      = useState("");
  const [fullName,   setFullName]   = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignUp) {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        await register(email, password, fullName, employeeId);
        setSuccess("Account created successfully!");
      } else {
        await login(email, password);
      }
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("No account found with this email. Click 'Create Account' to sign up.");
      } else if (code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in instead.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email address format.");
      } else {
        setError(isSignUp ? "Failed to create account. Please try again." : "Invalid credentials. Please try again.");
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(`Google sign-in failed: ${err.message || "Unknown error"}`);
    }
    setLoading(false);
  }

  return (
    <div className="login-root">
      <div className="login-bg-grid" />

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <Monitor size={28} />
          </div>
          <div>
            <h1 className="login-brand">Employee Attendance</h1>
            <p className="login-subtitle">Smart Workforce Monitoring & Attendance Management</p>
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-heading">{isSignUp ? "Create Account" : "Welcome back"}</h2>
        <p className="login-desc">
          {isSignUp
            ? "Sign up to access the workforce management platform"
            : "Sign in to manage your organization's attendance"}
        </p>

        {error && (
          <div className="login-error">
            <Activity size={14} />
            {error}
          </div>
        )}

        {success && (
          <div className="login-success">
            <Activity size={14} />
            {success}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          id="login-google"
          type="button"
          className="btn-google"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {isSignUp ? "Sign up with Google" : "Sign in with Google"}
        </button>

        <div className="login-or">
          <span className="login-or-line" />
          <span className="login-or-text">or</span>
          <span className="login-or-line" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Full Name (Sign Up Only) */}
          {isSignUp && (
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <div className="field-wrap">
                <Mail size={16} className="field-icon" style={{ opacity: 0 }} />
                <input
                  id="reg-name"
                  type="text"
                  className="field-input"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Employee ID (Sign Up Only) */}
          {isSignUp && (
            <div className="field-group">
              <label className="field-label">Employee ID</label>
              <div className="field-wrap">
                <Mail size={16} className="field-icon" style={{ opacity: 0 }} />
                <input
                  id="reg-emp-id"
                  type="text"
                  className="field-input"
                  placeholder="EMP-1234"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email</label>
            <div className="field-wrap">
              <Mail size={16} className="field-icon" />
              <input
                id="login-email"
                type="email"
                className="field-input"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <Lock size={16} className="field-icon" />
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                className="field-input"
                placeholder={isSignUp ? "Min. 6 characters" : "Enter password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 6 : undefined}
              />
              <button
                type="button"
                className="field-eye"
                onClick={() => setShowPw(p => !p)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className={`btn-primary btn-full${loading ? " btn-loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : isSignUp ? (
              <><UserPlus size={16} /> Create Account</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="login-toggle">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="login-toggle-btn"
              onClick={() => { setIsSignUp(v => !v); setError(""); setSuccess(""); }}
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>

        <p className="login-footer">
          Employee Attendance © 2026 — Enterprise Workforce Management
        </p>
      </div>
    </div>
  );
}

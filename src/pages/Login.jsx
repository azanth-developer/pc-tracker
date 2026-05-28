import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Monitor, Lock, Mail, Eye, EyeOff, Activity, UserPlus, LogIn } from "lucide-react";

// Electron IPC helper
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

export default function Login() {
  const { login, register, loginWithGoogle, currentUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  // ... rest of state

  // Signal Electron to start monitor if we just logged in
  useEffect(() => {
    if (isElectron) {
      if (currentUser) {
        console.log("[Login] Signaling Electron to start monitor...");
        currentUser.getIdToken().then(token => {
          window.electronAPI.sendLoginSuccess({ 
            uid: currentUser.uid, 
            email: currentUser.email,
            token
          });
        }).catch(err => console.error("Failed to get token:", err));
      } else {
        // Unauthenticated, show login window
        window.electronAPI.showLogin();
      }
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
    <>
      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #030712;
          color: #f8fafc;
        }
        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 4rem 4rem;
          z-index: 0;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.4;
        }
        .orb-1 { width: 400px; height: 400px; background: #3b82f6; top: -100px; left: -100px; }
        .orb-2 { width: 300px; height: 300px; background: #8b5cf6; bottom: -50px; right: -50px; }
        .orb-3 { width: 250px; height: 250px; background: #10b981; bottom: 20%; left: 20%; opacity: 0.2; }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0,0,0,0.5);
        }

        .login-logo-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .login-logo-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #fff; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
        .login-brand { font-size: 1.25rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; line-height: 1.2; margin: 0; }
        .login-subtitle { font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem; }

        .login-divider { height: 1px; background: rgba(255, 255, 255, 0.08); margin: 1.5rem 0; }

        .login-heading { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 0.5rem 0; letter-spacing: -0.02em; }
        .login-desc { font-size: 0.875rem; color: #94a3b8; margin: 0 0 2rem 0; }

        .login-error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
        .login-success { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.2); color: #22c55e; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }

        .btn-google {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f8fafc; font-weight: 600; font-size: 0.95rem;
          padding: 0.875rem; border-radius: 10px; cursor: pointer; transition: all 0.2s;
        }
        .btn-google:hover { background: rgba(255,255,255,0.08); border-color: rgba(255, 255, 255, 0.15); }

        .login-or { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .login-or-line { flex: 1; height: 1px; background: rgba(255, 255, 255, 0.08); }
        .login-or-text { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }

        .login-form { display: flex; flex-direction: column; gap: 1.25rem; margin: 0; }
        .field-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .field-label { font-size: 0.8rem; font-weight: 600; color: #cbd5e1; display: block; margin: 0; }
        .field-wrap { position: relative; display: flex; align-items: center; }
        .field-icon { position: absolute; left: 1rem; color: #94a3b8; pointer-events: none; }
        .field-input {
          width: 100%; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff; font-size: 0.95rem; padding: 0.875rem 1rem 0.875rem 2.75rem;
          border-radius: 10px; transition: all 0.2s; box-sizing: border-box;
        }
        .field-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 1px #3b82f6, 0 0 15px rgba(59, 130, 246, 0.4); background: rgba(15, 23, 42, 0.8); }
        .field-eye { position: absolute; right: 1rem; background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .field-eye:hover { color: #cbd5e1; }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb); 
          color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; 
          font-weight: 500; cursor: pointer; transition: all 0.2s; 
          display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-full { width: 100%; padding: 0.875rem; font-size: 0.95rem; justify-content: center; margin-top: 0.5rem; }

        .login-toggle { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #94a3b8; }
        .login-toggle p { margin: 0; }
        .login-toggle-btn { background: none; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; margin-left: 0.5rem; font-size: 0.875rem; transition: color 0.2s; }
        .login-toggle-btn:hover { color: #60a5fa; text-decoration: underline; }

        .login-footer { margin-top: 2rem; text-align: center; font-size: 0.7rem; color: rgba(148, 163, 184, 0.5); }
      `}</style>
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
    </>
  );
}

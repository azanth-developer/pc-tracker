import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { db, auth } from "../firebase";
import {
  User, Bell, Shield, Monitor, Save, RefreshCw, Check, AlertCircle,
} from "lucide-react";

function SettingSection({ title, icon, children }) {
  return (
    <div className="chart-card setting-section">
      <h3 className="chart-title setting-title">
        <span className="setting-icon">{icon}</span>
        {title}
      </h3>
      <div className="setting-body">{children}</div>
    </div>
  );
}

function Toggle({ label, desc, defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="toggle-row">
      <div>
        <p className="toggle-label">{label}</p>
        {desc && <p className="toggle-desc">{desc}</p>}
      </div>
      <button
        className={`toggle-btn${on ? " toggle-on" : ""}`}
        onClick={() => { setOn(v => !v); if (onChange) onChange(!on); }}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
}

export default function Settings() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [uploadInterval, setUploadInterval] = useState("5");

  useEffect(() => {
    if (userProfile?.displayName) setDisplayName(userProfile.displayName);
  }, [userProfile]);

  async function handleSaveProfile() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      // Update Firebase Auth profile
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
      }
      // Update Firestore user doc
      if (currentUser?.uid) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          displayName,
          updatedAt: new Date().toISOString(),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to update profile: " + (err.message || "Unknown error"));
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters");
      return;
    }
    setPasswordMsg("");
    setSaving(true);
    try {
      // Re-authenticate first if they have a password provider
      if (currentPassword && currentUser?.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }
      await updatePassword(currentUser, newPassword);
      setPasswordMsg("Password updated successfully!");
      setNewPassword("");
      setCurrentPassword("");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setPasswordMsg("Current password is incorrect");
      } else if (err.code === "auth/requires-recent-login") {
        setPasswordMsg("Please sign out and sign in again before changing password");
      } else {
        setPasswordMsg("Failed to change password: " + (err.message || ""));
      }
    }
    setSaving(false);
  }

  return (
    <div className="page-content">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-desc">Manage your account and monitoring preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Account Section - WORKING */}
        <SettingSection title="Account" icon={<User size={16} />}>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input field-readonly" value={currentUser?.email || ""} readOnly />
          </div>
          <div className="field-group">
            <label className="field-label">Display Name</label>
            <input
              className="field-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Role</label>
            <input className="field-input field-readonly" value={isAdmin ? "Admin" : "Employee"} readOnly />
          </div>
          <div className="field-group">
            <label className="field-label">Account Created</label>
            <input className="field-input field-readonly" value={userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "--"} readOnly />
          </div>

          {error && (
            <div className="settings-msg settings-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {saved && (
            <div className="settings-msg settings-success">
              <Check size={14} /> Profile updated successfully!
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSaveProfile}
            disabled={saving}
            style={{ marginTop: "0.75rem" }}
          >
            {saving ? <><RefreshCw size={14} className="spin-icon" /> Saving...</> : <><Save size={14} /> Save Profile</>}
          </button>
        </SettingSection>

        {/* Change Password */}
        <SettingSection title="Change Password" icon={<Shield size={16} />}>
          <div className="field-group">
            <label className="field-label">Current Password</label>
            <input
              className="field-input"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="field-group">
            <label className="field-label">New Password</label>
            <input
              className="field-input"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>

          {passwordMsg && (
            <div className={`settings-msg ${passwordMsg.includes("success") ? "settings-success" : "settings-error"}`}>
              {passwordMsg.includes("success") ? <Check size={14} /> : <AlertCircle size={14} />}
              {passwordMsg}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleChangePassword}
            disabled={saving || !newPassword}
            style={{ marginTop: "0.75rem" }}
          >
            <Shield size={14} /> Change Password
          </button>
        </SettingSection>

        {/* Monitoring */}
        <SettingSection title="Monitoring Agent" icon={<Monitor size={16} />}>
          <div className="field-group">
            <label className="field-label">Log Upload Interval (minutes)</label>
            <select
              className="field-input"
              value={uploadInterval}
              onChange={e => setUploadInterval(e.target.value)}
            >
              <option value="1">Every 1 minute</option>
              <option value="5">Every 5 minutes</option>
              <option value="10">Every 10 minutes</option>
              <option value="30">Every 30 minutes</option>
            </select>
          </div>
          <Toggle label="Track Application Usage" desc="Log active window names and durations" defaultOn />
          <Toggle label="Track Keyboard Activity" desc="Count keystrokes (not content)" defaultOn />
          <Toggle label="Track Mouse Activity" desc="Count mouse clicks and movements" defaultOn />
          <Toggle label="Collect Running Processes" desc="Fetch task manager data every 30 seconds" defaultOn />
          <Toggle label="Start on System Boot" desc="Auto-launch agent on Windows startup" defaultOn />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications" icon={<Bell size={16} />}>
          <Toggle label="Idle Alert" desc="Alert when system is idle for 10+ minutes" defaultOn />
          <Toggle label="System Resource Alert" desc="Notify when CPU or RAM exceeds 90%" defaultOn />
          <Toggle label="Device Online/Offline" desc="Alert when a device comes online or goes offline" defaultOn />
          <Toggle label="Daily Summary" desc="Show daily summary in dashboard" defaultOn />
        </SettingSection>
      </div>
    </div>
  );
}

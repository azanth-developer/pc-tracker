# PC Tracker — Smart System Activity Monitor

A desktop monitoring & analytics system built with **Electron + React + Firebase**.

## Features
- 📊 Real-time activity dashboard with charts
- 🖥️ App usage tracking & productivity scoring  
- ⏱️ Attendance log with login/logout times
- 💻 CPU & RAM monitoring with live gauges
- 📋 Daily/weekly reports with CSV export
- 🔒 Firebase authentication & Firestore storage
- 🤖 Background monitoring agent (EXE-ready)

## Quick Start

```bash
npm install
npm run dev          # React dashboard at http://localhost:3001
```

## Connect Firebase (Live Data)
1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Add a **Web App** → copy the config object
3. Paste config into `src/firebase.js`
4. In Firestore, create collections: `activity_logs`, `system_stats`
5. Enable **Email/Password** Authentication
6. Set `VITE_DEMO_MODE=false` in `.env`

## Run Monitoring Agent
```bash
# Install agent deps (optional native modules)
npm install active-win iohook --save-optional

# Start the agent (runs in background, uploads every 5 min)
npm run agent
```

## Build EXE (FULL Desktop App: Login + Dashboard + Hidden Monitor)
```bash
npm run electron:build   # outputs to /release folder (run the EXE inside /release)
```

## Build Agent EXE (AGENT-ONLY: no UI)
This runs only the background monitoring service.
```bash
npm install -g pkg
pkg agent/tracker.js --targets node18-win-x64 --output pc-tracker-agent.exe
```


## Project Structure
```
PC TRACKER/
├── src/                  # React dashboard
│   ├── pages/            # Dashboard, Reports, Attendance, System, Settings
│   ├── components/       # Sidebar, Header, Charts, StatCard, etc.
│   ├── hooks/            # useActivityData (Firestore + demo data)
│   ├── contexts/         # AuthContext (Firebase Auth)
│   └── firebase.js       # 🔑 Add your Firebase config here
├── electron/
│   ├── main.js           # Electron main process + system tray
│   └── preload.js        # Context bridge
├── agent/
│   └── tracker.js        # Background monitoring agent
└── package.json
```

## Firestore Schema
| Collection | Fields |
|---|---|
| `activity_logs` | userId, appName, activeTime, keystrokes, mouseClicks, idleMs, timestamp |
| `system_stats` | userId, cpuUsage, ramUsage, uptime, timestamp |
| `users` | name, email, role |

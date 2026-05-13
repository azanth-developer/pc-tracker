const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
let tray;
let monitorProcess;
let currentUser = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    frame: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // DISGUISE AS CHROME (Prevents Google from blocking Electron)
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Allow Google Auth Popups
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 500,
        height: 600,
        autoHideMenuBar: true,
        title: 'Google Sign-In',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          // Use the same User-Agent for the popup
          userAgent: userAgent
        }
      }
    };
  });

  // Load the agent login page through Localhost (Required by Firebase Auth)
  const loginUrl = isDev 
    ? 'http://localhost:3000/electron/agent-login.html' 
    : `file://${path.join(__dirname, 'agent-login.html')}`;

  // In dev we load the Vite server.
  // In production we load the bundled React app from /dist.
  const startUrl = isDev
    ? 'http://localhost:3000/login'
    : `file://${path.join(__dirname, '../dist/index.html')}#/login`;

  mainWindow.loadURL(startUrl);


  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function startMonitor(user) {
  if (monitorProcess) {
    console.log("[Main] Monitor already running, skipping start.");
    return;
  }

  console.log(`[Main] Attempting to start monitor for: ${user.email}`);
  currentUser = user;
  
  const monitorScript = path.join(__dirname, '../server/monitor.js');
  
  if (!fs.existsSync(monitorScript)) {
    console.error(`[Main Error] Monitor script not found at: ${monitorScript}`);
    if (mainWindow) mainWindow.webContents.send('auth-error', 'System Error: Monitor engine missing.');
    return;
  }

  // Start the monitor.js as a background process
  monitorProcess = spawn('node', [
    monitorScript,
    '--uid', user.uid,
    '--email', user.email,
    '--token', user.token || ''
  ], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_ENV: 'production' },

    // Keep it hidden/silent
    detached: true,
    stdio: 'ignore'
  });


  monitorProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    console.log(`[Monitor]: ${msg}`);
  });

  monitorProcess.stderr.on('data', (data) => {
    console.error(`[Monitor Error]: ${data}`);
  });

  monitorProcess.on('exit', (code) => {
    console.log(`[Main] Monitor process exited with code ${code}`);
    monitorProcess = null;
    
    // Auto-reconnect/restart if not intentionally quitting
    if (!app.isQuitting && currentUser) {
      console.log("[Main] Monitor crashed or exited. Restarting in 5s...");
      setTimeout(() => startMonitor(currentUser), 5000);
    }
  });

  createTray();

  if (mainWindow) {
    mainWindow.webContents.send('auth-success', user);
    setTimeout(() => {
      if (mainWindow) mainWindow.hide();
    }, 3000);
  }
}

function createTray() {
  if (tray) tray.destroy();

  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../public/icon.png')
  ).resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  const menu = Menu.buildFromTemplate([
    { label: 'PC Tracker Agent', enabled: false },
    { label: currentUser ? `Logged in: ${currentUser.email}` : 'Not logged in', enabled: false },
    { type: 'separator' },
    { label: 'Show Login Window', click: () => { mainWindow?.show(); } },
    { label: 'Restart Monitor', click: () => {
      if (monitorProcess) monitorProcess.kill();
      monitorProcess = null;
      if (currentUser) startMonitor(currentUser);
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => { 
      if (monitorProcess) monitorProcess.kill();
      app.isQuitting = true; 
      app.quit(); 
    }},
  ]);
  
  tray.setToolTip('PC Tracker — Monitoring Active');
  tray.setContextMenu(menu);
}

// IPC Listener for Login Success
ipcMain.on('auth-success-start-monitor', (event, user) => {
  startMonitor(user);
});

// Forced Google Login (System Fallback)
ipcMain.on('google-login-force', () => {
    const authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: true,
        webPreferences: { nodeIntegration: false }
    });

    // Load the web dashboard's login page which handles Google perfectly
    authWindow.loadURL('http://localhost:3000/login'); 
    
    // We can't easily capture the token from here, but the user can login
    // and since Firebase uses persistence, the agent will detect it.
    authWindow.on('closed', () => {
        // Refresh the main window to detect the new auth state
        mainWindow.reload();
    });
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

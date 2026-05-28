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
  // Enable run at startup for seamless monitoring
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
  });

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    frame: false,
    show: false, // Start hidden for silent initialization
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
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
  // Load the React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/login');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // In production, we MUST use loadFile to avoid absolute path protocol issues
    // Append hash directly to the file path if using HashRouter (which we aren't, we are using state routing, so just index.html)
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    
    // Temporarily enable DevTools in production for debugging the blank screen
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

function startMonitor(user) {
  if (monitorProcess) {
    console.log("[Main] Monitor already running, skipping start.");
    return;
  }

  console.log(`[Main] Starting secure tracker for: ${user.email}`);
  currentUser = user;
  
  try {
    const startTracker = require('./tracker');
    monitorProcess = startTracker(user);
  } catch (error) {
    console.error(`[Main Error] Failed to start tracker:`, error);
    if (mainWindow) mainWindow.webContents.send('auth-error', 'System Error: Monitor engine missing.');
    return;
  }

  createTray();

  if (mainWindow) {
    mainWindow.webContents.send('auth-success', user);
    
    // Only hide the window for standard employees to run silently in the background
    // Admins need the window to remain open to view the dashboard!
    if (user.role !== 'admin') {
      setTimeout(() => {
        if (mainWindow) mainWindow.hide();
      }, 3000);
    }
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
      if (monitorProcess) monitorProcess.stop();
      monitorProcess = null;
      if (currentUser) startMonitor(currentUser);
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => { 
      if (monitorProcess) monitorProcess.stop();
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

// IPC Listener to show login window if unauthenticated
ipcMain.on('show-login', () => {
  if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show();
  }
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

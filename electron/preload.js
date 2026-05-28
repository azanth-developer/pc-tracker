const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),
  
  // Auth channels
  sendLoginSuccess: (userData) => ipcRenderer.send('auth-success-start-monitor', userData),
  showLogin: () => ipcRenderer.send('show-login'),
  onAuthSuccess: (callback) => ipcRenderer.on('auth-success', (_event, value) => callback(value)),
  onAuthError: (callback) => ipcRenderer.on('auth-error', (_event, value) => callback(value)),
  forceGoogleLogin: () => ipcRenderer.send('google-login-force'),
});

// Preload script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startAppBlocker: (apps) => ipcRenderer.invoke('start-app-blocker', apps),
    stopAppBlocker: () => ipcRenderer.invoke('stop-app-blocker'),
    getBlockedApps: () => ipcRenderer.invoke('get-blocked-apps'),
    onAppBlockedWarning: (callback) => ipcRenderer.on('app-blocked-warning', (_event, appName) => callback(appName)),
});

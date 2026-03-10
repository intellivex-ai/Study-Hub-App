const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const activeWin = require('active-win');

let mainWindow;
let isAppBlockerActive = false;
let blockedApps = ['discord.exe', 'steam.exe', 'CalculatorApp.exe', 'Spotify.exe']; // Example list
let blockerInterval = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity in this demo, though contextIsolation is recommended for prod
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
    });

    // Load the Vite dev server in development, or the local html file in production
    const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
    mainWindow.loadURL(startUrl);

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// App Blocker Logic
ipcMain.handle('start-app-blocker', (event, appsToBlock) => {
    if (appsToBlock && appsToBlock.length > 0) {
        blockedApps = appsToBlock;
    }
    isAppBlockerActive = true;
    console.log('App Blocker started tracking...');

    if (blockerInterval) clearInterval(blockerInterval);

    blockerInterval = setInterval(async () => {
        try {
            const activeWindow = await activeWin();
            if (activeWindow && activeWindow.owner && activeWindow.owner.name) {
                const activeName = activeWindow.owner.name.toLowerCase();

                // Check if the active window is in the blocklist
                const isBlocked = blockedApps.some(blocked => activeName.includes(blocked.toLowerCase()));

                if (isBlocked) {
                    console.log(`[BLOCKED] User opened ${activeWindow.owner.name}.`);

                    // Forcefully minimize or close the offending app
                    // (In a real production app, we would use ffi-napi to call Windows API to minimize or close it,
                    //  but for this proof-of-concept, we'll just bring our window to the absolute front)
                    if (mainWindow) {
                        mainWindow.setAlwaysOnTop(true, 'screen-saver');
                        mainWindow.focus();
                        mainWindow.setFullScreen(true);

                        // Notify renderer to show warning
                        mainWindow.webContents.send('app-blocked-warning', activeWindow.owner.name);

                        setTimeout(() => {
                            if (mainWindow) {
                                mainWindow.setAlwaysOnTop(false);
                                mainWindow.setFullScreen(false);
                            }
                        }, 3000); // 3 seconds penalty focus
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching active window:', err);
        }
    }, 2000); // Check every 2 seconds

    return true;
});

ipcMain.handle('stop-app-blocker', () => {
    isAppBlockerActive = false;
    if (blockerInterval) {
        clearInterval(blockerInterval);
        blockerInterval = null;
    }
    console.log('App Blocker stopped tracking.');
    return true;
});

ipcMain.handle('get-blocked-apps', () => {
    return blockedApps;
});

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';
import Store from 'electron-store';

const store = new Store();
let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, 'renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Select Minecraft Server Plugins Folder',
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-last-path', () => {
  return store.get('lastServerPath', '') as string;
});

ipcMain.handle('set-last-path', (_, path: string) => {
  store.set('lastServerPath', path);
});

ipcMain.handle('validate-plugins-folder', async (_, path: string) => {
  try {
    if (!existsSync(path)) {
      return { valid: false, error: 'Folder does not exist' };
    }

    const files = readdirSync(path);
    const hasJarFiles = files.some(file => file.endsWith('.jar'));
    
    if (!hasJarFiles) {
      return { valid: false, error: 'No .jar files found in folder' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
});

ipcMain.handle('scan-plugins', async (_, path: string) => {
  try {
    if (!existsSync(path)) {
      throw new Error('Plugins folder does not exist');
    }

    const files = readdirSync(path);
    const plugins = files
      .filter(file => file.endsWith('.jar'))
      .map(file => {
        const filePath = join(path, file);
        const stats = statSync(filePath);
        return {
          name: file.replace('.jar', ''),
          fileName: file,
          version: 'Unknown',
          currentVersion: 'Unknown',
          latestVersion: 'Unknown',
          size: stats.size,
          lastModified: stats.mtime,
          updateAvailable: false,
          path: filePath,
        };
      });

    return { success: true, plugins };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-setting', (_, key: string, value: any) => {
  store.set(key, value);
});

ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async (_, options: any) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow?.close();
});
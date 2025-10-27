import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  // File operations
  selectFolder: () => Promise<string | null>;
  getLastPath: () => Promise<string>;
  setLastPath: (path: string) => Promise<void>;
  validatePluginsFolder: (path: string) => Promise<{ valid: boolean; error?: string }>;
  scanPlugins: (path: string) => Promise<{ success: boolean; plugins?: any[]; error?: string }>;
  
  // Settings
  getSettings: () => Promise<any>;
  setSetting: (key: string, value: any) => Promise<void>;
  
  // System
  openExternal: (url: string) => Promise<void>;
  showSaveDialog: (options: any) => Promise<any>;
  
  // Window controls
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

const electronAPI: ElectronAPI = {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getLastPath: () => ipcRenderer.invoke('get-last-path'),
  setLastPath: (path: string) => ipcRenderer.invoke('set-last-path', path),
  validatePluginsFolder: (path: string) => ipcRenderer.invoke('validate-plugins-folder', path),
  scanPlugins: (path: string) => ipcRenderer.invoke('scan-plugins', path),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key: string, value: any) => ipcRenderer.invoke('set-setting', key, value),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
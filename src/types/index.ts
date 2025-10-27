export interface Plugin {
  id: string;
  name: string;
  fileName: string;
  currentVersion: string;
  latestVersion: string;
  size: number;
  lastModified: Date;
  updateAvailable: boolean;
  path: string;
  selected?: boolean;
  status: 'up-to-date' | 'update-available' | 'error' | 'checking';
}

export interface ServerStatus {
  state: 'stopped' | 'starting' | 'running' | 'crashed';
  message?: string;
  lastCheck?: Date;
}

export interface Settings {
  lastServerPath: string;
  autoDownload: boolean;
  autoCheckUpdates: boolean;
  backupRetentionDays: number;
  theme: string;
  updateChannel: 'stable' | 'beta';
  apiKeys: {
    spigot?: string;
    bukkit?: string;
    modrinth?: string;
  };
}

export interface PluginScanResult {
  success: boolean;
  plugins?: Plugin[];
  error?: string;
}

export interface FolderValidationResult {
  valid: boolean;
  error?: string;
}
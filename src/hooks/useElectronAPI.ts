import { useState, useCallback } from 'react';
import { PluginScanResult, FolderValidationResult, Settings } from '../types';

export const useElectronAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const selectFolder = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    clearError();
    try {
      const result = await window.electronAPI.selectFolder();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select folder');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const getLastPath = useCallback(async (): Promise<string> => {
    try {
      return await window.electronAPI.getLastPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get last path');
      return '';
    }
  }, []);

  const setLastPath = useCallback(async (path: string): Promise<void> => {
    try {
      await window.electronAPI.setLastPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set last path');
    }
  }, []);

  const validatePluginsFolder = useCallback(async (path: string): Promise<FolderValidationResult> => {
    setIsLoading(true);
    clearError();
    try {
      return await window.electronAPI.validatePluginsFolder(path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate folder';
      setError(errorMessage);
      return { valid: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const scanPlugins = useCallback(async (path: string): Promise<PluginScanResult> => {
    setIsLoading(true);
    clearError();
    try {
      const result = await window.electronAPI.scanPlugins(path);
      if (result.success && result.plugins) {
        const pluginsWithIds = result.plugins.map((plugin: any, index: number) => ({
          ...plugin,
          id: `plugin-${index}`,
          status: 'up-to-date' as const,
        }));
        return { ...result, plugins: pluginsWithIds };
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan plugins';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const getSettings = useCallback(async (): Promise<Settings> => {
    try {
      return await window.electronAPI.getSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get settings');
      return {} as Settings;
    }
  }, []);

  const setSetting = useCallback(async (key: string, value: any): Promise<void> => {
    try {
      await window.electronAPI.setSetting(key, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setting');
    }
  }, []);

  const openExternal = useCallback(async (url: string): Promise<void> => {
    try {
      await window.electronAPI.openExternal(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open external URL');
    }
  }, []);

  const showSaveDialog = useCallback(async (options: any) => {
    try {
      return await window.electronAPI.showSaveDialog(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to show save dialog');
      return { canceled: true };
    }
  }, []);

  const minimizeWindow = useCallback(async (): Promise<void> => {
    try {
      await window.electronAPI.minimizeWindow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to minimize window');
    }
  }, []);

  const maximizeWindow = useCallback(async (): Promise<void> => {
    try {
      await window.electronAPI.maximizeWindow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to maximize window');
    }
  }, []);

  const closeWindow = useCallback(async (): Promise<void> => {
    try {
      await window.electronAPI.closeWindow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close window');
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    selectFolder,
    getLastPath,
    setLastPath,
    validatePluginsFolder,
    scanPlugins,
    getSettings,
    setSetting,
    openExternal,
    showSaveDialog,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  };
};
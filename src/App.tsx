import React, { useState, useEffect } from 'react';
import { Plugin, Settings } from './types';
import { useElectronAPI } from './hooks/useElectronAPI';
import TitleBar from './components/TitleBar';
import ServerPathSelector from './components/ServerPathSelector';
import PluginList from './components/PluginList';
import ServerControl from './components/ServerControl';
import SettingsModal from './components/SettingsModal';
import { 
  Settings as SettingsIcon, 
  Download, 
  RefreshCw, 
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [serverPath, setServerPath] = useState<string>('');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isPathValid, setIsPathValid] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoDownload, setAutoDownload] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>({
    lastServerPath: '',
    autoDownload: false,
    autoCheckUpdates: true,
    backupRetentionDays: 7,
    theme: 'dark',
    updateChannel: 'stable',
    apiKeys: {},
  });

  const {
    isLoading,
    error,
    clearError,
    scanPlugins,
    getSettings,
    setSetting,
  } = useElectronAPI();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings();
        setSettings(savedSettings);
        setAutoDownload(savedSettings.autoDownload);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, [getSettings]);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handlePathSelected = (path: string) => {
    setServerPath(path);
  };

  const handlePathValidated = (isValid: boolean) => {
    setIsPathValid(isValid);
    if (!isValid) {
      setPlugins([]);
    }
  };

  const handleScanPlugins = async () => {
    if (!serverPath || !isPathValid) return;

    setIsScanning(true);
    try {
      const result = await scanPlugins(serverPath);
      if (result.success && result.plugins) {
        setPlugins(result.plugins);
        
        // Simulate checking for updates
        const pluginsWithUpdates = result.plugins.map(plugin => ({
          ...plugin,
          status: 'checking' as const,
        }));
        setPlugins(pluginsWithUpdates);

        // Simulate API calls to check for updates
        setTimeout(() => {
          const updatedPlugins = pluginsWithUpdates.map(plugin => {
            // Simulate some plugins having updates available
            const hasUpdate = Math.random() > 0.7;
            if (hasUpdate) {
              const versionParts = plugin.currentVersion.split('.');
              if (versionParts.length >= 2) {
                const patchVersion = parseInt(versionParts[2] || '0') + 1;
                return {
                  ...plugin,
                  latestVersion: `${versionParts[0]}.${versionParts[1]}.${patchVersion}`,
                  updateAvailable: true,
                  status: 'update-available' as const,
                };
              }
            }
            return {
              ...plugin,
              latestVersion: plugin.currentVersion,
              updateAvailable: false,
              status: 'up-to-date' as const,
            };
          });
          setPlugins(updatedPlugins);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to scan plugins:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePluginSelect = (pluginId: string, selected: boolean) => {
    setPlugins(prev => 
      prev.map(plugin => 
        plugin.id === pluginId ? { ...plugin, selected } : plugin
      )
    );
  };

  const handleUpdatePlugin = async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    setPlugins(prev => 
      prev.map(p => 
        p.id === pluginId ? { ...p, status: 'checking' as const } : p
      )
    );

    // Simulate download and update
    setTimeout(() => {
      setPlugins(prev => 
        prev.map(p => 
          p.id === pluginId 
            ? { 
                ...p, 
                currentVersion: p.latestVersion,
                updateAvailable: false,
                status: 'up-to-date' as const,
              } 
            : p
        )
      );
    }, 3000);
  };

  const handleUpdateAll = async () => {
    setPlugins(prev => 
      prev.map(p => 
        p.updateAvailable ? { ...p, status: 'checking' as const } : p
      )
    );

    // Simulate batch update
    setTimeout(() => {
      setPlugins(prev => 
        prev.map(p => 
          p.updateAvailable 
            ? { 
                ...p, 
                currentVersion: p.latestVersion,
                updateAvailable: false,
                status: 'up-to-date' as const,
              } 
            : p
        )
      );
    }, 5000);
  };

  const handleOverridePlugins = () => {
    const selectedPlugins = plugins.filter(p => p.selected);
    if (selectedPlugins.length === 0) {
      alert('Please select plugins to override');
      return;
    }

    if (confirm(`Are you sure you want to override ${selectedPlugins.length} plugin(s)?\n\nBackups will be created automatically.`)) {
      // Simulate override process
      console.log('Overriding plugins:', selectedPlugins.map(p => p.name));
    }
  };

  const handleAutoDownloadToggle = async (enabled: boolean) => {
    setAutoDownload(enabled);
    await setSetting('autoDownload', enabled);
  };

  const selectedPluginsCount = plugins.filter(p => p.selected).length;
  const updateAvailableCount = plugins.filter(p => p.updateAvailable).length;

  return (
    <div className="h-screen flex flex-col bg-base-100">
      <TitleBar />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MC</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">MC Plugin Manager</h1>
                <p className="text-sm text-base-content/60">Professional Minecraft Server Plugin Management</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="btn btn-ghost btn-circle"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div role="alert" className="alert alert-error">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
              <div className="flex-1"></div>
              <button
                onClick={clearError}
                className="btn btn-ghost btn-xs"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Server Path Selection */}
          <ServerPathSelector
            onPathSelected={handlePathSelected}
            onPathValidated={handlePathValidated}
          />

          {/* Controls */}
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text mr-2">Enable Auto-Download</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={autoDownload}
                      onChange={(e) => handleAutoDownloadToggle(e.target.checked)}
                    />
                  </label>
                </div>

                {autoDownload && (
                  <div className="flex items-center space-x-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Auto-download enabled</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleScanPlugins}
                  className="btn btn-primary"
                  disabled={!isPathValid || isScanning || isLoading}
                >
                  {isScanning ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Scan Plugins
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Plugin List */}
          {plugins.length > 0 && (
            <PluginList
              plugins={plugins}
              onPluginSelect={handlePluginSelect}
              onUpdatePlugin={handleUpdatePlugin}
              onUpdateAll={handleUpdateAll}
              isLoading={isLoading}
            />
          )}

          {/* Plugin Actions */}
          {plugins.length > 0 && (
            <div className="bg-base-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    {selectedPluginsCount} plugin{selectedPluginsCount !== 1 ? 's' : ''} selected
                  </span>
                  {updateAvailableCount > 0 && (
                    <span className="text-sm text-warning">
                      {updateAvailableCount} update{updateAvailableCount !== 1 ? 's' : ''} available
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleOverridePlugins}
                    className="btn btn-warning"
                    disabled={selectedPluginsCount === 0}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Override Selected ({selectedPluginsCount})
                  </button>

                  {autoDownload && (
                    <button className="btn btn-outline btn-success">
                      <Download className="w-4 h-4 mr-2" />
                      Download Missing Plugins
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Server Control */}
          <ServerControl serverPath={serverPath} />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default App;
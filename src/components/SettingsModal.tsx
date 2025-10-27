import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { X, Save, RotateCcw, Key, Palette, Clock, Shield } from 'lucide-react';
import { useElectronAPI } from '../hooks/useElectronAPI';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>({
    lastServerPath: '',
    autoDownload: false,
    autoCheckUpdates: true,
    backupRetentionDays: 7,
    theme: 'dark',
    updateChannel: 'stable',
    apiKeys: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'backup' | 'appearance'>('general');

  const { getSettings, setSetting } = useElectronAPI();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings();
        setSettings({ ...settings, ...savedSettings });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, getSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await setSetting(key, value);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      lastServerPath: '',
      autoDownload: false,
      autoCheckUpdates: true,
      backupRetentionDays: 7,
      theme: 'dark',
      updateChannel: 'stable',
      apiKeys: {},
    });
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateApiKey = (service: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [service]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'general' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === 'api' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            API Keys
          </button>
          <button
            className={`tab ${activeTab === 'backup' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            Backup
          </button>
          <button
            className={`tab ${activeTab === 'appearance' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Default Server Path</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter default server plugins path..."
                  className="input input-bordered"
                  value={settings.lastServerPath}
                  onChange={(e) => updateSetting('lastServerPath', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Enable Auto-Download Plugins</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.autoDownload}
                    onChange={(e) => updateSetting('autoDownload', e.target.checked)}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Auto-Check Updates on Startup</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.autoCheckUpdates}
                    onChange={(e) => updateSetting('autoCheckUpdates', e.target.checked)}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Update Channel</span>
                </label>
                <select
                  className="select select-bordered"
                  value={settings.updateChannel}
                  onChange={(e) => updateSetting('updateChannel', e.target.value as 'stable' | 'beta')}
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="alert alert-info">
                <Key className="w-4 h-4" />
                <span>API keys are optional but may provide access to premium plugins and higher rate limits.</span>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">SpigotMC API Key</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter SpigotMC API key..."
                  className="input input-bordered"
                  value={settings.apiKeys?.spigot || ''}
                  onChange={(e) => updateApiKey('spigot', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bukkit Dev API Key</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter Bukkit Dev API key..."
                  className="input input-bordered"
                  value={settings.apiKeys?.bukkit || ''}
                  onChange={(e) => updateApiKey('bukkit', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Modrinth API Key</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter Modrinth API key..."
                  className="input input-bordered"
                  value={settings.apiKeys?.modrinth || ''}
                  onChange={(e) => updateApiKey('modrinth', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Backup Retention Days
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="input input-bordered"
                  value={settings.backupRetentionDays}
                  onChange={(e) => updateSetting('backupRetentionDays', parseInt(e.target.value) || 7)}
                />
                <label className="label">
                  <span className="label-text-alt">Older backups will be automatically deleted</span>
                </label>
              </div>

              <div className="alert alert-warning">
                <Shield className="w-4 h-4" />
                <span>Backups are created before plugin updates and stored in the plugins/backups/ folder.</span>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Theme
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="night">Night</option>
                  <option value="minecraft">Minecraft</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button
            onClick={handleReset}
            className="btn btn-ghost"
            disabled={isSaving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
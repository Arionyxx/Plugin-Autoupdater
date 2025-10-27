import React, { useState } from 'react';
import { Plugin } from '../types';
import { 
  Check, 
  Download, 
  RefreshCw, 
  Clock, 
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface PluginListProps {
  plugins: Plugin[];
  onPluginSelect: (pluginId: string, selected: boolean) => void;
  onUpdatePlugin: (pluginId: string) => void;
  onUpdateAll: () => void;
  isLoading?: boolean;
}

const PluginList: React.FC<PluginListProps> = ({
  plugins,
  onPluginSelect,
  onUpdatePlugin,
  onUpdateAll,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'version' | 'date' | 'size'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'updates' | 'uptodate'>('all');

  const filteredAndSortedPlugins = plugins
    .filter(plugin => {
      const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'updates' && plugin.updateAvailable) ||
        (filterStatus === 'uptodate' && !plugin.updateAvailable);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'size':
          return b.size - a.size;
        case 'version':
          return a.currentVersion.localeCompare(b.currentVersion);
        default:
          return 0;
      }
    });

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusIcon = (plugin: Plugin) => {
    if (plugin.status === 'checking') {
      return <RefreshCw className="w-4 h-4 animate-spin text-warning" />;
    }
    if (plugin.updateAvailable) {
      return <AlertCircle className="w-4 h-4 text-warning" />;
    }
    return <Check className="w-4 h-4 text-success" />;
  };

  const getStatusBadge = (plugin: Plugin) => {
    if (plugin.status === 'checking') {
      return <span className="badge badge-warning gap-2">Checking...</span>;
    }
    if (plugin.updateAvailable) {
      return <span className="badge badge-warning gap-2">Update Available</span>;
    }
    return <span className="badge badge-success gap-2">Up to Date</span>;
  };

  const updateAvailableCount = plugins.filter(p => p.updateAvailable).length;

  return (
    <div className="bg-base-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Installed Plugins</h3>
          <span className="badge badge-ghost">{plugins.length}</span>
          {updateAvailableCount > 0 && (
            <span className="badge badge-warning">{updateAvailableCount} updates</span>
          )}
        </div>
        
        {updateAvailableCount > 0 && (
          <button
            onClick={onUpdateAll}
            className="btn btn-sm btn-accent"
            disabled={isLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            Update All
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="form-control">
          <div className="input-group input-group-sm">
            <span>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search plugins..."
              className="input input-bordered input-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            {filterStatus === 'all' ? 'All' : filterStatus === 'updates' ? 'Updates' : 'Up to Date'}
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a onClick={() => setFilterStatus('all')}>All Plugins</a></li>
            <li><a onClick={() => setFilterStatus('updates')}>Updates Available</a></li>
            <li><a onClick={() => setFilterStatus('uptodate')}>Up to Date</a></li>
          </ul>
        </div>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-sm btn-outline">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sort by {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </label>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a onClick={() => setSortBy('name')}>Name</a></li>
            <li><a onClick={() => setSortBy('date')}>Last Modified</a></li>
            <li><a onClick={() => setSortBy('size')}>File Size</a></li>
            <li><a onClick={() => setSortBy('version')}>Version</a></li>
          </ul>
        </div>
      </div>

      {/* Plugin List */}
      <div className="overflow-x-auto custom-scrollbar">
        {filteredAndSortedPlugins.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            {plugins.length === 0 ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto opacity-50" />
                <p>No plugins found in the selected folder.</p>
                <p className="text-sm">Make sure you've selected the correct plugins directory.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Search className="w-12 h-12 mx-auto opacity-50" />
                <p>No plugins match your search criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      filteredAndSortedPlugins.forEach(plugin => {
                        onPluginSelect(plugin.id, checked);
                      });
                    }}
                  />
                </th>
                <th>Plugin</th>
                <th>Current Version</th>
                <th>Latest Version</th>
                <th>Size</th>
                <th>Modified</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlugins.map((plugin) => (
                <tr key={plugin.id} className="hover">
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={plugin.selected || false}
                      onChange={(e) => onPluginSelect(plugin.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(plugin)}
                      <span className="font-medium">{plugin.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{plugin.currentVersion}</span>
                  </td>
                  <td>
                    <span className="font-mono text-sm">
                      {plugin.latestVersion === 'Unknown' ? (
                        <span className="text-base-content/40">Unknown</span>
                      ) : (
                        plugin.latestVersion
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm">{formatFileSize(plugin.size)}</span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(plugin.lastModified)}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(plugin)}</td>
                  <td>
                    {plugin.updateAvailable && (
                      <button
                        onClick={() => onUpdatePlugin(plugin.id)}
                        className="btn btn-xs btn-primary"
                        disabled={isLoading}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PluginList;
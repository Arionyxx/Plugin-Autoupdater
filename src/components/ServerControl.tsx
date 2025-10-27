import React, { useState, useEffect, useRef } from 'react';
import { ServerStatus } from '../types';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Terminal, 
  FileText,
  Circle,
  Loader2
} from 'lucide-react';

interface ServerControlProps {
  serverPath?: string;
}

const ServerControl: React.FC<ServerControlProps> = ({ serverPath }) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    state: 'stopped',
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '[ERROR]' : type === 'success' ? '[SUCCESS]' : type === 'warning' ? '[WARNING]' : '[INFO]';
    setLogs(prev => [...prev, `${timestamp} ${prefix} ${message}`]);
  };

  const detectStartupScript = (): string | null => {
    if (!serverPath) return null;
    
    // Check for Windows start script
    if (process.platform === 'win32') {
      const startBat = `${serverPath}/start.bat`;
      return startBat;
    }
    
    // Check for Unix start script
    const startSh = `${serverPath}/start.sh`;
    return startSh;
  };

  const startServer = async () => {
    if (!serverPath) {
      addLog('No server path selected', 'error');
      return;
    }

    const startScript = detectStartupScript();
    if (!startScript) {
      addLog('No start script found (start.bat or start.sh)', 'error');
      return;
    }

    setIsStarting(true);
    setServerStatus({ state: 'starting', message: 'Starting server...' });
    addLog('Starting Minecraft server...', 'info');

    try {
      // Simulate server startup
      setTimeout(() => {
        addLog('Loading properties...', 'info');
        addLog('Default game type: SURVIVAL', 'info');
        addLog('Generating keypair...', 'info');
        addLog('Starting Minecraft server on *:25565', 'info');
        addLog('Using default channel type', 'info');
        addLog('Done (3.452s)! For help, type "help"', 'success');
        setServerStatus({ 
          state: 'running', 
          message: 'Server running on port 25565',
          lastCheck: new Date()
        });
        setIsStarting(false);
      }, 3000);
    } catch (error) {
      addLog(`Failed to start server: ${error}`, 'error');
      setServerStatus({ 
        state: 'crashed', 
        message: 'Server failed to start',
        lastCheck: new Date()
      });
      setIsStarting(false);
    }
  };

  const stopServer = async () => {
    setIsStopping(true);
    addLog('Stopping server...', 'warning');
    setServerStatus({ state: 'starting', message: 'Stopping server...' });

    try {
      // Simulate server shutdown
      setTimeout(() => {
        addLog('Saving the world...', 'info');
        addLog('Saving players...', 'info');
        addLog('Server stopped', 'success');
        setServerStatus({ 
          state: 'stopped', 
          message: 'Server stopped',
          lastCheck: new Date()
        });
        setIsStopping(false);
      }, 2000);
    } catch (error) {
      addLog(`Failed to stop server: ${error}`, 'error');
      setServerStatus({ 
        state: 'crashed', 
        message: 'Server failed to stop gracefully',
        lastCheck: new Date()
      });
      setIsStopping(false);
    }
  };

  const restartServer = async () => {
    addLog('Restarting server...', 'warning');
    await stopServer();
    setTimeout(() => {
      startServer();
    }, 3000);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusIndicator = () => {
    switch (serverStatus.state) {
      case 'running':
        return <Circle className="w-3 h-3 fill-success text-success" />;
      case 'starting':
        return <Loader2 className="w-3 h-3 animate-spin text-warning" />;
      case 'crashed':
        return <Circle className="w-3 h-3 fill-error text-error" />;
      default:
        return <Circle className="w-3 h-3 fill-base-content/30 text-base-content/30" />;
    }
  };

  const getStatusText = () => {
    switch (serverStatus.state) {
      case 'running':
        return 'Running';
      case 'starting':
        return 'Starting';
      case 'crashed':
        return 'Error';
      default:
        return 'Stopped';
    }
  };

  const getStatusColor = () => {
    switch (serverStatus.state) {
      case 'running':
        return 'text-success';
      case 'starting':
        return 'text-warning';
      case 'crashed':
        return 'text-error';
      default:
        return 'text-base-content/60';
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Server Control</h3>
        </div>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIndicator()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {serverStatus.message && (
        <div className="text-sm text-base-content/80 bg-base-300 rounded p-2">
          {serverStatus.message}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={startServer}
          className="btn btn-primary"
          disabled={serverStatus.state === 'running' || serverStatus.state === 'starting' || isStarting || !serverPath}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Server
            </>
          )}
        </button>

        <button
          onClick={stopServer}
          className="btn btn-error"
          disabled={serverStatus.state !== 'running' || isStopping}
        >
          {isStopping ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Stopping...
            </>
          ) : (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop Server
            </>
          )}
        </button>

        <button
          onClick={restartServer}
          className="btn btn-warning"
          disabled={serverStatus.state === 'starting' || isStarting || isStopping || !serverPath}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restart
        </button>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className="btn btn-outline"
        >
          <FileText className="w-4 h-4 mr-2" />
          {showLogs ? 'Hide Logs' : 'View Logs'}
        </button>
      </div>

      {!serverPath && (
        <div className="alert alert-warning">
          <span>Please select a server folder first.</span>
        </div>
      )}

      {showLogs && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Server Console</span>
            <button
              onClick={clearLogs}
              className="btn btn-xs btn-ghost"
            >
              Clear
            </button>
          </div>
          <div className="bg-black text-green-400 rounded p-3 h-48 overflow-y-auto custom-scrollbar font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center text-base-content/40 mt-16">
                No logs available. Start the server to see console output.
              </div>
            ) : (
              <>
                {logs.map((log, index) => (
                  <div key={index} className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARNING]') ? 'text-yellow-400' : log.includes('[SUCCESS]') ? 'text-green-400' : ''}>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerControl;
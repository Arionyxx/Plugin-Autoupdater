import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useElectronAPI } from '../hooks/useElectronAPI';

interface ServerPathSelectorProps {
  onPathSelected: (path: string) => void;
  onPathValidated: (isValid: boolean) => void;
}

const ServerPathSelector: React.FC<ServerPathSelectorProps> = ({
  onPathSelected,
  onPathValidated,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  
  const { selectFolder, getLastPath, setLastPath, validatePluginsFolder } = useElectronAPI();

  useEffect(() => {
    const loadLastPath = async () => {
      try {
        const lastPath = await getLastPath();
        if (lastPath) {
          setSelectedPath(lastPath);
          await validatePath(lastPath);
        }
      } catch (error) {
        console.error('Failed to load last path:', error);
      }
    };
    loadLastPath();
  }, [getLastPath]);

  const validatePath = async (path: string) => {
    if (!path) {
      setIsValid(false);
      setValidationMessage('');
      onPathValidated(false);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validatePluginsFolder(path);
      setIsValid(result.valid);
      setValidationMessage(result.error || (result.valid ? 'Valid plugins folder detected' : ''));
      onPathValidated(result.valid);
      if (result.valid) {
        await setLastPath(path);
      }
    } catch (error) {
      setIsValid(false);
      setValidationMessage('Failed to validate folder');
      onPathValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleBrowse = async () => {
    const path = await selectFolder();
    if (path) {
      setSelectedPath(path);
      onPathSelected(path);
      await validatePath(path);
    }
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value;
    setSelectedPath(newPath);
    onPathSelected(newPath);
    validatePath(newPath);
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <Folder className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Server Plugins Folder</h3>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={selectedPath}
            onChange={handlePathChange}
            placeholder="Select your Minecraft server plugins folder..."
            className="w-full input input-bordered input-primary bg-base-100 text-sm"
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <button
          onClick={handleBrowse}
          className="btn btn-primary"
          disabled={isValidating}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Browse
        </button>
      </div>
      
      {selectedPath && (
        <div className="flex items-center space-x-2 text-sm">
          {isValid ? (
            <>
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-success">{validationMessage}</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-error" />
              <span className="text-error">{validationMessage || 'Invalid plugins folder'}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ServerPathSelector;
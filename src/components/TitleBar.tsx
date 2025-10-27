import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useElectronAPI } from '../hooks/useElectronAPI';

const TitleBar: React.FC = () => {
  const { minimizeWindow, maximizeWindow, closeWindow } = useElectronAPI();

  return (
    <div className="flex items-center justify-between h-8 bg-base-300 px-4 select-none drag-region">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
        <span className="ml-4 text-sm font-semibold">🎮 MC Plugin Manager</span>
      </div>
      
      <div className="flex space-x-1 no-drag-region">
        <button
          onClick={minimizeWindow}
          className="p-1 hover:bg-base-200 rounded transition-colors duration-150"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={maximizeWindow}
          className="p-1 hover:bg-base-200 rounded transition-colors duration-150"
          title="Maximize"
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          onClick={closeWindow}
          className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors duration-150"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
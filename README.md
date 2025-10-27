# MC Plugin Manager

A professional Electron desktop application for managing and updating Minecraft server plugins with an exceptional, modern UI.

## Features

- **Server Folder Selection**: Elegant folder browser with path validation and persistence
- **Plugin Scanner**: Automatically detects and analyzes installed plugins
- **Auto-Download System**: Fetch latest versions from SpigotMC, Bukkit Dev, and Modrinth
- **Plugin Override Controls**: Safe plugin updates with automatic backups
- **Server Testing**: Built-in server control panel with real-time console output
- **Beautiful UI**: Modern interface built with React, TypeScript, and DaisyUI

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **React + TypeScript** - Modern UI development
- **DaisyUI + Tailwind CSS** - Beautiful, polished styling
- **Node.js** - File system operations
- **electron-store** - Persistent settings storage

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mc-plugin-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building

```bash
# Build for development
npm run build

# Build distributable
npm run build:all
```

## Usage

1. **Select Server Folder**: Browse to your Minecraft server's plugins directory
2. **Scan Plugins**: Click "Scan Plugins" to detect installed plugins
3. **Check Updates**: The app automatically checks for available updates
4. **Update Plugins**: Select individual plugins or update all at once
5. **Test Server**: Use the server control panel to start/stop your server

## Settings

Configure the application through the settings panel:

- Default server paths
- Auto-download preferences
- API keys for premium plugins
- Theme selection
- Backup retention settings

## License

MIT License - see LICENSE file for details
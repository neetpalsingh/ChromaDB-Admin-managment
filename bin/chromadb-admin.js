#!/usr/bin/env node

/**
 * ChromaDB Admin Management System (CAMS)
 * CLI tool to start the admin dashboard
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ASCII Art Banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗ █████╗      ║
║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗     ║
║  ██║     ███████║██████╔╝██║   ██║██╔████╔██║███████║     ║
║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║     ║
║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║     ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝     ║
║                                                           ║
║       Admin Management System for ChromaDB                ║
║                    Version 1.0.7                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

const args = process.argv.slice(2);

// Parse command-line arguments
function parseArgs(argv) {
  const parsed = { command: 'start' };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // Check if it's a command (no -- prefix)
    if (!arg.startsWith('--') && !parsed.commandFound) {
      // Check if it's a valid command
      if (['start', 'dev', 'build', 'help', 'version'].includes(arg)) {
        parsed.command = arg;
        parsed.commandFound = true;
        continue;
      }
    }

    // Parse options
    if (arg === '--port' && argv[i + 1]) {
      parsed.port = parseInt(argv[i + 1]);
      i++;
    } else if (arg === '--host' && argv[i + 1]) {
      parsed.host = argv[i + 1];
      i++;
    } else if (arg === '--chromadb-url' && argv[i + 1]) {
      parsed.chromadbUrl = argv[i + 1];
      i++;
    }
  }

  return parsed;
}

const cmdArgs = parseArgs(args);
const command = cmdArgs.command;

// Get the package root directory
const packageRoot = path.join(__dirname, '..');

// Command handlers
const commands = {
  start: () => {
    const port = cmdArgs.port || process.env.PORT || 3434;
    const chromadbUrl = cmdArgs.chromadbUrl || process.env.CHROMADB_URL || 'http://localhost:8000';

    console.log('🚀 Starting ChromaDB Admin Dashboard...');
    console.log(`📡 Default ChromaDB URL: ${chromadbUrl}`);
    console.log(`🌐 Server: http://localhost:${port}\n`);

    // Check if .env exists
    const envPath = path.join(packageRoot, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  Warning: .env file not found!');
      console.log('📝 Creating .env from .env.example...\n');

      const envExamplePath = path.join(packageRoot, '.env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file. Please edit it with your ChromaDB URL:');
        console.log(`   ${envPath}\n`);
      }
    }

    // Start the production server
    const serverPath = path.join(packageRoot, 'server', 'productionServer.js');
    const env = {
      ...process.env,
      PORT: port.toString(),
      CHROMADB_URL: chromadbUrl,
      VITE_CHROMADB_URL: chromadbUrl
    };

    const server = spawn('node', [serverPath], {
      cwd: packageRoot,
      stdio: 'inherit',
      env: env
    });
    
    server.on('error', (err) => {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down ChromaDB Admin...');
      server.kill();
      process.exit(0);
    });
  },
  
  dev: () => {
    console.log('🔧 Starting ChromaDB Admin in development mode...\n');
    
    const vite = spawn('npm', ['run', 'dev'], {
      cwd: packageRoot,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down development server...');
      vite.kill();
      process.exit(0);
    });
  },
  
  build: () => {
    console.log('📦 Building ChromaDB Admin for production...\n');
    
    const build = spawn('npm', ['run', 'build:vite'], {
      cwd: packageRoot,
      stdio: 'inherit',
      shell: true
    });
    
    build.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Build completed successfully!');
      } else {
        console.error('\n❌ Build failed with code:', code);
        process.exit(code);
      }
    });
  },
  
  help: () => {
    console.log(`
Usage: chromadb-admin [command] [options]

Commands:
  start       Start the production server (default)
  dev         Start the development server
  build       Build for production
  help        Show this help message
  version     Show version information

Options:
  --port <number>         Port to run on (default: 3434)
  --host <address>        Host address (default: 0.0.0.0)
  --chromadb-url <url>    ChromaDB server URL (default: http://localhost:8000)

Examples:
  chromadb-admin                                           # Start on port 3434
  chromadb-admin --port 8080                               # Start on port 8080
  chromadb-admin --chromadb-url http://localhost:8000      # Custom ChromaDB URL
  chromadb-admin --port 5000 --chromadb-url http://chroma:8000
  chromadb-admin dev                                       # Development mode
  chromadb-admin build                                     # Build for production

Environment Configuration:
  Edit .env file to configure ChromaDB URL and other settings.
  See .env.example for all available options.

Documentation:
  https://github.com/neetpalsingh/ChromaDB-Admin-managment

Report issues:
  https://github.com/neetpalsingh/ChromaDB-Admin-managment/issues
`);
  },
  
  version: () => {
    const packageJson = require(path.join(packageRoot, 'package.json'));
    console.log(`ChromaDB Admin v${packageJson.version}`);
  }
};

// Execute command
if (commands[command]) {
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run "chromadb-admin help" for usage information.');
  process.exit(1);
}

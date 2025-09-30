const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting B2B E-commerce Platform Setup and Testing\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Function to run command and return promise
const runCommand = (command, cwd = process.cwd()) => {
  return new Promise((resolve, reject) => {
    log(`Running: ${command}`, 'cyan');
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        log(`Error: ${error.message}`, 'red');
        reject(error);
        return;
      }
      if (stderr) {
        log(`Warning: ${stderr}`, 'yellow');
      }
      if (stdout) {
        console.log(stdout);
      }
      resolve();
    });
  });
};

// Function to check if port is in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    exec(`netstat -an | grep :${port}`, (error, stdout) => {
      resolve(stdout.includes(`:${port}`));
    });
  });
};

// Main setup function
const setupProject = async () => {
  try {
    log('📦 Installing server dependencies...', 'blue');
    await runCommand('npm install', path.join(__dirname, 'server'));
    
    log('📦 Installing client dependencies...', 'blue');
    await runCommand('npm install', path.join(__dirname, 'client'));
    
    log('✅ Dependencies installed successfully!', 'green');
    
    // Check if server is already running
    const serverRunning = await checkPort(5000);
    if (serverRunning) {
      log('⚠️  Server is already running on port 5000', 'yellow');
      log('Please stop the existing server and run this script again', 'yellow');
      return;
    }
    
    log('🚀 Starting server...', 'blue');
    
    // Start server in background
    const serverProcess = spawn('node', ['index.js'], {
      cwd: path.join(__dirname, 'server'),
      stdio: 'pipe'
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    log('🧪 Running API tests...', 'blue');
    
    // Run tests
    await runCommand('node test-api.js', path.join(__dirname, 'server'));
    
    log('🎉 Setup complete!', 'green');
    log('📝 Next steps:', 'blue');
    log('1. Server is running on http://localhost:5000', 'cyan');
    log('2. Start the client with: cd client && npm run dev', 'cyan');
    log('3. Open http://localhost:5173 in your browser', 'cyan');
    log('4. Test the application with different user roles', 'cyan');
    
    // Keep server running
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down server...', 'yellow');
      serverProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Run setup
setupProject();



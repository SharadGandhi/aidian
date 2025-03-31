const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the Obsidian plugins directory based on OS
function getObsidianPluginsDir() {
    const platform = os.platform();
    const homeDir = os.homedir();
    
    // Check for iCloud-synced vault first
    const iCloudVaultPath = path.join(homeDir, 'Library', 'Mobile Documents', 'iCloud~md~obsidian', 'Documents', "Sharad's Vault", '.obsidian', 'plugins');
    
    if (fs.existsSync(iCloudVaultPath)) {
        console.log('Found iCloud-synced Obsidian vault');
        return iCloudVaultPath;
    }
    
    // Fall back to default locations
    switch (platform) {
        case 'darwin': // macOS
            return path.join(homeDir, 'Library', 'Application Support', 'Obsidian', 'plugins');
        case 'win32': // Windows
            return path.join(process.env.APPDATA, 'Obsidian', 'plugins');
        default: // Linux and others
            return path.join(homeDir, '.config', 'Obsidian', 'plugins');
    }
}

const pluginsDir = getObsidianPluginsDir();
console.log('Obsidian plugins directory:', pluginsDir);

// Create plugin directory if it doesn't exist
const pluginDir = path.join(pluginsDir, 'aidian');
console.log('Plugin directory:', pluginDir);

if (!fs.existsSync(pluginsDir)) {
    console.error('Error: Obsidian plugins directory does not exist!');
    console.error('Please make sure Obsidian is installed and has been run at least once.');
    process.exit(1);
}

if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
    console.log('Created plugin directory');
}

// Copy files
const files = ['main.js', 'manifest.json', 'styles.css'];
let allFilesExist = true;

files.forEach(file => {
    const source = path.join(__dirname, file);
    const target = path.join(pluginDir, file);
    
    console.log(`\nChecking ${file}:`);
    console.log('Source:', source);
    console.log('Target:', target);
    
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, target);
        console.log(`✓ Copied ${file} successfully`);
    } else {
        console.error(`✗ Error: ${file} not found in source directory`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.error('\nError: Some files were not found. Please make sure to run "npm run build" first.');
    process.exit(1);
}

console.log('\nPlugin installed successfully!');
console.log('\nNext steps:');
console.log('1. Restart Obsidian');
console.log('2. Go to Settings > Community plugins');
console.log('3. Disable "Safe mode" if it\'s enabled');
console.log('4. Look for "Aidian" in the list');
console.log('5. If not visible, click the three dots menu (⋮) and select "Show installed plugins"'); 
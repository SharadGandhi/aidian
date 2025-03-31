const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to load config file
let config;
try {
    config = require('./config.js');
} catch (error) {
    console.error('Error: config.js not found. Please copy config.template.js to config.js and update the vault path.');
    process.exit(1);
}

if (!config.vaultPath) {
    console.error('Error: vaultPath not set in config.js. Please update the path to your Obsidian vault.');
    process.exit(1);
}

const pluginDir = path.join(config.vaultPath, 'aidian');

// Create plugin directory if it doesn't exist
if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
}

// Copy files
const files = ['main.js', 'manifest.json', 'styles.css'];
files.forEach(file => {
    const source = path.join(__dirname, file);
    const target = path.join(pluginDir, file);
    fs.copyFileSync(source, target);
    console.log(`Copied ${file} to plugin directory`);
});

console.log('\nPlugin installed successfully!');
console.log('Please restart Obsidian to load the plugin.'); 
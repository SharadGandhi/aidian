# Aidian - Manual Installation Guide

## Prerequisites
- Obsidian v1.0.0 or later
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Manual Installation Steps

1. Download the `aidian.zip` file from the [latest release](https://github.com/SharadGandhi/aidian/releases/latest)

2. Extract the contents of the zip file

3. Create the plugin directory:
   - Windows: `%appdata%\obsidian\plugins\aidian\`
   - Mac: `~/Library/Application Support/obsidian/plugins/aidian/`
   - Linux: `~/.config/obsidian/plugins/aidian/`
   - iCloud (Mac): `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/[Your Vault Name]/.obsidian/plugins/aidian/`

4. Copy the extracted files into the plugin directory

5. Restart Obsidian

6. Enable the plugin in Obsidian:
   - Go to Settings → Community plugins
   - Find "Aidian" in the list
   - Click the toggle to enable it

7. Configure the plugin:
   - Go to Settings → Aidian
   - Enter your Gemini API key
   - Select your preferred model and API version

## Features
- Chat with Gemini AI models
- Support for multiple Gemini models
- Markdown rendering
- Copy response functionality
- Context-aware responses using current note

## Troubleshooting
If you encounter any issues:
1. Make sure all files from the zip are in the correct directory
2. Check that the plugin is enabled in Obsidian
3. Verify your API key is correct
4. Try restarting Obsidian
5. For iCloud vaults, ensure you have write permissions to the plugins directory

## Support
For support, please [open an issue](https://github.com/SharadGandhi/aidian/issues) on GitHub. 
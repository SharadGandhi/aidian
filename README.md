# Aidian - Gemini AI Chat for Obsidian

Aidian is an Obsidian plugin that integrates Google's Gemini AI into your note-taking workflow. Chat with Gemini directly within Obsidian, using either the stable v1 or latest v1beta API.

## Features

- 🤖 Chat with Gemini AI directly in Obsidian
- 🔄 Support for both v1 and v1beta Gemini API versions
- 🎯 Multiple model selection (Gemini Pro, Gemini Ultra)
- 💬 Clean, modern chat interface
- ⚙️ Customizable settings for API configuration
- 🔒 Secure API key management

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Aidian"
4. Click Install

### Manual Installation

1. Download the latest release from the releases page
2. Extract the zip file into your Obsidian plugins folder
3. Enable the plugin in Obsidian Settings > Community Plugins

## Usage

1. Open the Aidian chat panel using the ribbon icon or command palette
2. Enter your Gemini API key in the plugin settings
3. Select your preferred model and API version
4. Start chatting!

## Settings

- **API Key**: Your Google Gemini API key
- **API Version**: Choose between v1 (stable) and v1beta (latest)
- **Default Model**: Select your preferred Gemini model

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Install the plugin to your vault
npm run install-plugin
```

## Requirements

- Obsidian v0.15.0 or higher
- A Google Gemini API key

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/yourusername/aidian/issues) on GitHub.

## License

MIT License - see LICENSE file for details 
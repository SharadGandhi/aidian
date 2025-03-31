# Aidian - Gemini AI Chat for Obsidian

Aidian is an Obsidian plugin that enables you to chat with Google's Gemini AI directly within your Obsidian workspace. It provides a sidebar interface for chatting with Gemini, using your current note's content as context for the conversation.

## Features

- Chat with Gemini AI in a sidebar interface
- Support for multiple Gemini models:
  - Gemini 1.5 Pro
  - Gemini 1.5 Flash
  - Gemini 2.0 Flash
- Uses current note content as context for conversations
- Markdown formatting for AI responses
- Clear chat functionality
- BYO (Bring Your Own) API key support

## Installation

1. Download the latest release from the releases page
2. Extract the zip file into your Obsidian plugins folder
3. Enable the plugin in Obsidian settings
4. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
5. Enter your API key in the plugin settings

## Usage

1. Click the chat icon in the ribbon to open the Aidian chat sidebar
2. Select your preferred Gemini model from the dropdown
3. Type your message and press Enter or click Send
4. The AI will respond using the context from your current note
5. Use the Clear Chat button to start a new conversation

## Development

To build the plugin:

```bash
npm install
npm run build
```

For development:

```bash
npm run dev
```

## Requirements

- Obsidian v0.15.0 or higher
- A Gemini API key

## License

MIT License 
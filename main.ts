import { App, Plugin, PluginSettingTab, Setting, View, WorkspaceLeaf, ViewCreator, MarkdownRenderer } from 'obsidian';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface AidianSettings {
    apiKey: string;
    defaultModel: string;
    apiVersion: 'v1' | 'v1beta';
}

export interface ModelVersion {
    name: string;
    endpoint: string;
}

export type ModelVersions = {
    [key: string]: ModelVersion;
};

const DEFAULT_SETTINGS: AidianSettings = {
    apiKey: '',
    defaultModel: 'gemini-2.0-flash',
    apiVersion: 'v1beta'
}

export const MODEL_VERSIONS: ModelVersions = {
    'gemini-1.5-pro': {
        name: 'gemini-1.5-pro',
        endpoint: 'https://generativelanguage.googleapis.com'
    },
    'gemini-1.5-flash': {
        name: 'gemini-1.5-flash',
        endpoint: 'https://generativelanguage.googleapis.com'
    },
    'gemini-2.0-flash': {
        name: 'gemini-2.0-flash',
        endpoint: 'https://generativelanguage.googleapis.com'
    }
};

export const defaultModel = 'gemini-2.0-flash';

export default class AidianPlugin extends Plugin {
    settings: AidianSettings;
    genAI: GoogleGenerativeAI | null = null;

    async onload() {
        await this.loadSettings();

        // Register the chat view
        this.registerView('aidian-chat', (leaf: WorkspaceLeaf) => new AidianChatView(leaf, this));

        // Add ribbon icon
        this.addRibbonIcon('message-square', 'Open Aidian chat', () => {
            this.activateView();
        });

        // Add settings tab
        this.addSettingTab(new AidianSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getRightLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: 'aidian-chat',
                active: true,
            });
        }
    }
}

class AidianChatView extends View {
    chatContainer: HTMLElement;
    messageInput: HTMLTextAreaElement;
    modelSelect: HTMLSelectElement;
    clearButton: HTMLButtonElement;
    messages: Array<{ role: string; content: string }> = [];
    plugin: AidianPlugin;
    model: GenerativeModel | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: AidianPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return 'aidian-chat';
    }

    getDisplayText(): string {
        return 'Aidian chat';
    }

    async onOpen() {
        this.containerEl.empty();
        this.containerEl.addClass('aidian-chat-container');

        // Create chat container
        this.chatContainer = this.containerEl.createDiv('aidian-chat-messages');
        
        // Create input container
        const inputContainer = this.containerEl.createDiv('aidian-chat-input-container');
        
        // Create message input
        this.messageInput = inputContainer.createEl('textarea', 'aidian-chat-input');
        this.messageInput.placeholder = 'Type your message...';
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Create controls row
        const controlsRow = inputContainer.createDiv('aidian-controls-row');
        
        // Create model selector
        this.modelSelect = controlsRow.createEl('select', 'aidian-model-select');
        this.modelSelect.addClass('aidian-select');
        
        // Add model options
        Object.entries(MODEL_VERSIONS).forEach(([key, value]) => {
            const option = this.modelSelect.createEl('option');
            option.value = key;
            option.text = value.name;
        });
        
        // Set the default model
        this.modelSelect.value = this.plugin.settings.defaultModel;

        // Create send button
        const sendButton = controlsRow.createEl('button', 'aidian-send-button');
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', () => this.sendMessage());

        // Create clear button
        this.clearButton = controlsRow.createEl('button', 'aidian-clear-button');
        this.clearButton.textContent = 'Clear chat';
        this.clearButton.addEventListener('click', () => this.clearChat());
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.messageInput.value = '';

        // Get current note content as context
        const activeFile = this.app.workspace.getActiveFile();
        let context = '';
        if (activeFile) {
            context = await this.app.vault.cachedRead(activeFile);
        }

        try {
            if (!this.plugin.settings.apiKey) {
                this.addMessage('assistant', 'Please set your Gemini API key in the settings.');
                return;
            }

            const selectedModel = MODEL_VERSIONS[this.modelSelect.value];
            const genAI = new GoogleGenerativeAI(this.plugin.settings.apiKey);
            const model = genAI.getGenerativeModel({ 
                model: selectedModel.name 
            }, { 
                apiVersion: this.plugin.settings.apiVersion 
            });

            const prompt = context ? 
                `Context from current note:\n${context}\n\nUser message: ${message}` :
                message;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            this.addMessage('assistant', text);
        } catch (error) {
            this.addMessage('assistant', `Error: ${error.message}`);
        }
    }

    async clearChat() {
        this.messages = [];
        this.chatContainer.empty();
    }

    addMessage(role: string, content: string) {
        const messageEl = this.chatContainer.createDiv('aidian-message');
        messageEl.addClass(`aidian-message-${role}`);
        
        // Create message header with copy button for assistant messages
        const messageHeader = messageEl.createDiv('aidian-message-header');
        if (role === 'assistant') {
            const copyButton = messageHeader.createEl('button', 'aidian-copy-button');
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(content).then(() => {
                    // Show copied indicator
                    copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    setTimeout(() => {
                        copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                    }, 2000);
                });
            });
        }
        
        const contentEl = messageEl.createDiv('aidian-message-content');
        
        // Use Obsidian's MarkdownRenderer for safe rendering
        const activeFile = this.app.workspace.getActiveFile();
        MarkdownRenderer.render(
            this.app,
            content,
            contentEl,
            activeFile?.path || '',
            this
        );
        
        this.messages.push({ role, content });
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

class AidianSettingTab extends PluginSettingTab {
    plugin: AidianPlugin;

    constructor(app: App, plugin: AidianPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('API Settings')
            .setHeading();

        new Setting(containerEl)
            .setName('Gemini API key')
            .setDesc('Enter your Gemini API key')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default model')
            .setDesc('Select the default model to use')
            .addDropdown(dropdown => dropdown
                .addOption('gemini-1.5-pro', 'Gemini 1.5 Pro')
                .addOption('gemini-1.5-flash', 'Gemini 1.5 Flash')
                .addOption('gemini-2.0-flash', 'Gemini 2.0 Flash')
                .setValue(this.plugin.settings.defaultModel)
                .onChange(async (value) => {
                    this.plugin.settings.defaultModel = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API version')
            .setDesc('Select the API version to use')
            .addDropdown(dropdown => dropdown
                .addOption('v1', 'V1 (Stable)')
                .addOption('v1beta', 'V1beta (Latest)')
                .setValue(this.plugin.settings.apiVersion)
                .onChange(async (value) => {
                    this.plugin.settings.apiVersion = value as 'v1' | 'v1beta';
                    await this.plugin.saveSettings();
                }));
    }
}
import { App, Plugin, PluginSettingTab, Setting, View, WorkspaceLeaf, ViewCreator } from 'obsidian';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { marked } from 'marked';
import { MarkdownRenderer } from 'obsidian';

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
        this.addRibbonIcon('message-square', 'Open Aidian Chat', () => {
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
        return 'Aidian Chat';
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
        this.clearButton.textContent = 'Clear Chat';
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
            context = await this.app.vault.read(activeFile);
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
        const contentEl = messageEl.createDiv('aidian-message-content');
        
        // Use Obsidian's MarkdownRenderer for safe rendering
        MarkdownRenderer.renderMarkdown(
            content,
            contentEl,
            '', // source path
            this // view
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

        containerEl.createEl('h2', { text: 'Aidian Settings' });

        new Setting(containerEl)
            .setName('Gemini API Key')
            .setDesc('Enter your Gemini API key')
            .addText(text => text
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default Model')
            .setDesc('Select the default Gemini model to use')
            .addDropdown(dropdown => {
                Object.entries(MODEL_VERSIONS).forEach(([key, value]) => {
                    dropdown.addOption(key, value.name);
                });
                return dropdown
                    .setValue(this.plugin.settings.defaultModel)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultModel = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('API Version')
            .setDesc('Select which API version to use (v1beta recommended for newer models)')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('v1', 'v1 (Stable)')
                    .addOption('v1beta', 'v1beta (Latest)')
                    .setValue(this.plugin.settings.apiVersion)
                    .onChange(async (value: 'v1' | 'v1beta') => {
                        this.plugin.settings.apiVersion = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}
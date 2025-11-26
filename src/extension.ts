import * as vscode from 'vscode';
import { Client } from '@xhayper/discord-rpc';

const clientId = 'YOUR_DISCORD_APP_ID'; // This will be replaced by user config
let rpcClient: Client | null = null;
let startTimestamp: number = Date.now();
let activityUpdateInterval: NodeJS.Timeout | null = null;

export function activate(context: vscode.ExtensionContext) {
    console.log('miyauw\'s simple discord rpc extension is now active!');

    // Initialize start timestamp (persists across file changes)
    startTimestamp = Date.now();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('simplerpc.enable', () => {
            vscode.workspace.getConfiguration('simplerpc').update('enabled', true, true);
            connectToDiscord();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('simplerpc.disable', () => {
            vscode.workspace.getConfiguration('simplerpc').update('enabled', false, true);
            disconnectFromDiscord();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('simplerpc.reconnect', () => {
            disconnectFromDiscord();
            setTimeout(() => connectToDiscord(), 1000);
        })
    );

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('simplerpc')) {
                disconnectFromDiscord();
                setTimeout(() => connectToDiscord(), 1000);
            }
        })
    );

    // Listen for active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            updateActivity();
        })
    );

    // Listen for workspace folder changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            updateActivity();
        })
    );

    // Initial connection
    connectToDiscord();
}

async function connectToDiscord() {
    const config = vscode.workspace.getConfiguration('simplerpc');
    const enabled = config.get<boolean>('enabled', true);

    if (!enabled) {
        console.log('miyauw\'s simple discord rpc is disabled');
        return;
    }

    const appId = config.get<string>('applicationId', '');

    if (!appId) {
        vscode.window.showWarningMessage(
            'miyauw\'s simple discord rpc: Please set your Discord Application ID in settings',
            'Open Settings'
        ).then(selection => {
            if (selection === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'simplerpc.applicationId');
            }
        });
        return;
    }

    try {
        rpcClient = new Client({ clientId: appId });

        rpcClient.on('ready', () => {
            console.log('Discord RPC connected!');
            updateActivity();

            // Update activity every 15 seconds to keep it fresh
            if (activityUpdateInterval) {
                clearInterval(activityUpdateInterval);
            }
            activityUpdateInterval = setInterval(() => {
                updateActivity();
            }, 15000);
        });

        rpcClient.on('disconnected', () => {
            console.log('Discord RPC disconnected');
            if (activityUpdateInterval) {
                clearInterval(activityUpdateInterval);
                activityUpdateInterval = null;
            }
        });

        await rpcClient.login();
    } catch (error) {
        console.error('Failed to connect to Discord:', error);
        vscode.window.showErrorMessage(`miyauw's simple discord rpc: Failed to connect to Discord - ${error}`);
    }
}

function disconnectFromDiscord() {
    if (activityUpdateInterval) {
        clearInterval(activityUpdateInterval);
        activityUpdateInterval = null;
    }

    if (rpcClient) {
        rpcClient.user?.clearActivity();
        rpcClient.destroy();
        rpcClient = null;
        console.log('Disconnected from Discord RPC');
    }
}

async function updateActivity() {
    if (!rpcClient || !rpcClient.user) {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    // Get current file info
    let fileName = 'No file open';
    let fileType = '';

    if (editor) {
        const document = editor.document;
        fileName = document.fileName.split('/').pop() || 'Unknown file';
        fileType = document.languageId;
    }

    // Get workspace name
    const workspaceName = workspaceFolder?.name || 'No workspace';

    const config = vscode.workspace.getConfiguration('simplerpc');

    // Get image configuration
    const largeImageKey = config.get<string>('largeImageKey', 'vscode');
    const largeImageText = config.get<string>('largeImageText', 'Visual Studio Code');
    const smallImageKey = config.get<string>('smallImageKey', '');
    const smallImageText = config.get<string>('smallImageText', '');

    // Build base activity
    const activity: any = {
        details: `Editing ${fileName}`,
        state: `Workspace: ${workspaceName}`,
        startTimestamp: startTimestamp,
        largeImageKey: largeImageKey,
        largeImageText: largeImageText,
        instance: false,
    };

    // Handle small image
    if (smallImageKey) {
        // User specified a custom small image
        activity.smallImageKey = smallImageKey;
        activity.smallImageText = smallImageText;
    } else if (fileType) {
        // Fallback to file type icon if no custom small image is set
        activity.smallImageKey = fileType;
        activity.smallImageText = fileType.toUpperCase();
    }

    try {
        // Set activity with a timeout to prevent hanging
        await Promise.race([
            rpcClient.user.setActivity(activity),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Activity update timeout')), 5000)
            )
        ]);

        console.log('Activity set successfully');
    } catch (error) {
        console.error('Failed to set activity:', error);
        vscode.window.showErrorMessage(`miyauw's simple discord rpc: Failed to update activity - ${error}`);
    }
}

export function deactivate() {
    disconnectFromDiscord();
}

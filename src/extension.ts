import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
const sound = require('sound-play');

let outputChannel: vscode.OutputChannel;

// Debounce: avoid playing multiple sounds in rapid succession
let lastSoundTime = 0;
const DEBOUNCE_MS = 2000;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Terminal Sound');
    outputChannel.appendLine('Terminal Sound Alert extension activated.');

    // ─── Terminal Data Listener ───────────────────────────
    // Uses the proposed `onDidWriteTerminalData` API to intercept
    // all text written to any terminal instance.
    const terminalListener = (vscode.window as any).onDidWriteTerminalData(
        (e: { terminal: vscode.Terminal; data: string }) => {
            const config = vscode.workspace.getConfiguration('terminalSound');
            if (!config.get<boolean>('enabled', true)) {
                return;
            }

            const data = e.data.toLowerCase();
            const keywords: string[] = config.get<string[]>('errorKeywords', [
                'error',
                'command not found',
                'not recognized',
                'failed',
                'exception',
                'denied',
                'fatal',
            ]);

            const isError = keywords.some((keyword) =>
                data.includes(keyword.toLowerCase())
            );

            if (isError) {
                const now = Date.now();
                if (now - lastSoundTime > DEBOUNCE_MS) {
                    lastSoundTime = now;
                    playSound(context);
                }
            }
        }
    );

    // ─── Command: Upload Custom Sound ────────────────────
    const uploadCmd = vscode.commands.registerCommand(
        'terminalSound.uploadSound',
        async () => {
            const result = await vscode.window.showOpenDialog({
                canSelectMany: false,
                filters: { 'Audio Files': ['mp3', 'wav', 'ogg'] },
                title: 'Select your custom error sound',
            });

            if (result && result[0]) {
                const selectedPath = result[0].fsPath;
                await vscode.workspace
                    .getConfiguration('terminalSound')
                    .update(
                        'customSoundPath',
                        selectedPath,
                        vscode.ConfigurationTarget.Global
                    );

                vscode.window.showInformationMessage(
                    `✅ Custom sound set! File: ${path.basename(selectedPath)}`
                );
            }
        }
    );

    // ─── Command: Test Sound ─────────────────────────────
    const testCmd = vscode.commands.registerCommand(
        'terminalSound.testSound',
        () => {
            playSound(context);
            vscode.window.showInformationMessage('🔊 Playing test sound...');
        }
    );

    context.subscriptions.push(terminalListener, uploadCmd, testCmd);

    outputChannel.appendLine(
        'Registered terminal listener and commands successfully.'
    );
}

// ─── Play Sound Function ──────────────────────────────────
function playSound(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration('terminalSound');
    const customPath: string = config.get<string>('customSoundPath', '');

    // Resolve sound file: custom → bundled default
    let soundFile = '';

    if (customPath && fs.existsSync(customPath)) {
        soundFile = customPath;
    } else {
        soundFile = path.join(context.extensionPath, 'sounds', 'faaah.mp3');
    }

    if (!fs.existsSync(soundFile)) {
        outputChannel.appendLine('⚠ Sound file not found: ' + soundFile);
        vscode.window.showWarningMessage(
            'Terminal Sound: No sound file found. Use "Terminal Sound: Upload Custom Sound" to set one.'
        );
        return;
    }

    outputChannel.appendLine('Playing sound: ' + soundFile);

    sound.play(soundFile).catch((err: any) => {
        outputChannel.appendLine('Sound playback error: ' + (err.message || err.toString()));
    });
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}

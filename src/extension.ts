import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

let outputChannel: vscode.OutputChannel;

// Debounce: avoid playing multiple sounds in rapid succession
let lastSoundTime = 0;
const DEBOUNCE_MS = 2000;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Terminal Sound');
    outputChannel.appendLine('Terminal Sound Alert extension activated.');

    // ─── Task Event Listener (Tasks via Tasks API) ─────
    const taskListener = vscode.tasks.onDidEndTaskProcess((e) => {
        const config = vscode.workspace.getConfiguration('terminalSound');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (e.exitCode !== undefined && e.exitCode !== 0) {
            outputChannel.appendLine(`Task '${e.execution.task.name}' failed with exit code ${e.exitCode}`);
            const now = Date.now();
            if (now - lastSoundTime > DEBOUNCE_MS) {
                lastSoundTime = now;
                playSound(context);
            }
        }
    });

    // ─── Terminal Execution Listener (Manual Terminal Commands) ──
    const terminalListener = vscode.window.onDidEndTerminalShellExecution?.((e) => {
        const config = vscode.workspace.getConfiguration('terminalSound');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (e.exitCode !== undefined && e.exitCode !== 0) {
            outputChannel.appendLine(`Terminal command failed with exit code ${e.exitCode}`);
            const now = Date.now();
            if (now - lastSoundTime > DEBOUNCE_MS) {
                lastSoundTime = now;
                playSound(context);
            }
        }
    });

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

    const subscriptions = [taskListener, uploadCmd, testCmd];
    if (terminalListener) {
        subscriptions.push(terminalListener);
    }
    context.subscriptions.push(...subscriptions);

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

    let playCommand = '';
    if (process.platform === 'win32') {
        const safePath = soundFile.replace(/'/g, "''");
        const psScript = `$player = New-Object -ComObject WMPlayer.OCX.7; $player.URL = '${safePath}'; $player.settings.volume = 100; $player.controls.play(); Start-Sleep -Seconds 5;`;
        playCommand = `powershell -WindowStyle Hidden -Command "${psScript}"`;
    } else if (process.platform === 'darwin') {
        playCommand = `afplay "${soundFile}"`;
    } else {
        playCommand = `paplay "${soundFile}" || aplay "${soundFile}"`;
    }

    exec(playCommand, { windowsHide: true }, (error) => {
        if (error) {
            outputChannel.appendLine('Sound playback error: ' + error.message);
        }
    });
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}

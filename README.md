# Terminal Error Sound Alert 🔊

A VS Code extension that plays a sound when your terminal outputs an error.

## Features

- **Automatic error detection** — Listens to terminal output and matches configurable error keywords
- **Custom sounds** — Upload your own `.mp3`, `.wav`, or `.ogg` file
- **Bundled default** — Comes with a built-in error beep
- **Cross-platform** — Works on Windows, macOS, and Linux
- **Debounced** — Won't spam sounds for rapid error output

## Commands

| Command | Description |
|---------|-------------|
| `Terminal Sound: Upload Custom Sound` | Pick a custom audio file to use |
| `Terminal Sound: Test Sound` | Play the current sound to verify it works |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `terminalSound.enabled` | `true` | Enable/disable terminal error sounds |
| `terminalSound.customSoundPath` | `""` | Path to your custom sound file |
| `terminalSound.errorKeywords` | `["error", "command not found", ...]` | Keywords that trigger the sound |

## Quick Start

1. Press **F5** in VS Code while in this project to launch the Extension Development Host
2. Open a terminal in the new window
3. Type a bad command like `blahblahcommand` and press Enter
4. Hear the error sound! 🔊

## Customizing Error Keywords

Open **Settings** → search for `terminalSound.errorKeywords` → add or remove keywords to match your workflow.

## How It Works

The extension hooks into `vscode.window.onDidWriteTerminalData` (proposed API) which fires every time the terminal outputs text. It scans that text for configured error keywords and, when found, runs a platform-specific audio playback command.

> **Note**: This extension uses a proposed VS Code API (`terminalDataWriteEvent`). It works in the Extension Development Host and with builds that enable proposed APIs. For published extensions, you would need to adopt stable APIs once available.

## License

MIT

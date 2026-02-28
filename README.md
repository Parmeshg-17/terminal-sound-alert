# terminal-sound-alert

`terminal-sound-alert` is a lightweight VS Code extension that listens to terminal commands and task executions, and plays a meme sound whenever a command fails with an error exit code.

By default, it plays the bundled `faaah.mp3`. You can also configure a custom sound file.

## ✨ Features
- Automatically detects when a terminal command or VS Code task finishes with an error (non-zero exit code).
- Plays a bundled meme sound on failure.
- Supports custom audio files via settings.
- Configurable cooldown between sound plays to prevent spam.
- Easy enable/disable toggle.

## 📦 Installation
### From vsix (Local)
You can drag and drop the `.vsix` file into the Extensions pane in VS Code, or install it from the command line:
```bash
code --install-extension terminal-sound-alert-0.0.1.vsix
```

## 🔍 How it Works
`terminal-sound-alert` uses native VS Code Shell Integration events. Custom keyword scanning has been disabled to prevent false positives when typing characters that match error words. 

Instead of scanning all output, it triggers accurately under these conditions:
1. **VS Code Tasks**: Any task that returns a non-zero exit code.
2. **Terminal Shell Execution**: Any command typed in the integrated terminal that returns a non-zero exit code.

If a failure occurs, the sound will play (subject to cooldown settings).

## 🎮 Commands
Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- **Faaah: Select Custom Sound** — Choose a custom audio file
- **Faaah: Clear Custom Sound** — Reset to default bundled sound
- **Faaah: Play Test Sound** — Test the currently configured sound

## ⚙️ Settings
You can configure the extension in:

`Settings → Extensions → Terminal Sound Alert`

Available options:

- `terminalSound.enabled` (default: `true`)
Enable or disable the extension.

- `terminalSound.customSoundPath` (default: empty)
Path to a custom audio file.

- `terminalSound.cooldownMs` (default: `1200`)
Minimum delay (in milliseconds) between sound plays.

## 🖥 Platform Support
- **macOS** — Uses `afplay`
- **Linux** — Tries `paplay`, `aplay`, `ffplay`, `mpg123`, `mpg321`, then `play`
- **Windows** — Uses PowerShell media playback

Terminal keyword detection relies on VS Code shell integration events.

## 📝 Notes
- Shell integration must be enabled for reliable detection.
- Very rapid error output may be rate-limited by the cooldown setting.

Enjoy your terminal errors — now with sound effects.

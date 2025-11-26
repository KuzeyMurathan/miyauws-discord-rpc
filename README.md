# miyauw's simple discord rpc - Discord Rich Presence for VS Code

A lightweight Discord Rich Presence extension for Visual Studio Code with customizable features.

## Features

- 🎮 **Discord Rich Presence** - Show what you're working on in Discord
- ⏱️ **Persistent Time Tracking** - Total time never resets when changing files
- 🎨 **Custom App Icon** - Set your own icon via Discord application assets
- 🔗 **Custom Button** - Add a button with custom text and URL
- 🔄 **Auto-Updates** - Activity updates automatically when you switch files

## Setup

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Copy the **Application ID** from the application's page
4. (Optional) Upload custom images under the "Rich Presence > Art Assets" section

### 2. Configure the Extension

Open VS Code settings (`Cmd+,` or `Ctrl+,`) and search for "miyauw's simple discord rpc":

- **Application ID** (required): Paste your Discord Application ID
- **App Icon URL**: Name of the asset you uploaded (e.g., "vscode")
- **Button Text**: Text for your custom button (e.g., "View Profile")
- **Button URL**: URL for your custom button (e.g., "https://github.com/yourusername")
- **Enabled**: Toggle the extension on/off

### 3. Enable Discord Activity

Make sure "Display current activity as a status message" is enabled in your Discord settings:
1. Open Discord
2. Go to Settings > Activity Privacy
3. Enable "Display current activity as a status message"

## Usage

Once configured, the extension will automatically:
- Connect to Discord when VS Code starts
- Show your current file and workspace
- Track total time spent in VS Code
- Update when you switch files or workspaces

### Commands

- `miyauw's simple discord rpc: Enable` - Enable Discord Rich Presence
- `miyauw's simple discord rpc: Disable` - Disable Discord Rich Presence
- `miyauw's simple discord rpc: Reconnect` - Reconnect to Discord

## Configuration Example

```json
{
  "simplerpc.applicationId": "1234567890123456789",
  "simplerpc.appIconUrl": "vscode",
  "simplerpc.buttonText": "GitHub Profile",
  "simplerpc.buttonUrl": "https://github.com/yourusername",
  "simplerpc.enabled": true
}
```

## Troubleshooting

### "Please set your Discord Application ID"
- Make sure you've created a Discord application and copied the Application ID
- Paste it in the `simplerpc.applicationId` setting

### Rich Presence not showing in Discord
- Ensure Discord is running
- Check that "Display current activity as a status message" is enabled in Discord settings
- Try using the "miyauw's simple discord rpc: Reconnect" command

### Custom icon not showing
- Upload your image as an asset in your Discord application's "Rich Presence" section
- Use the asset name (not the URL) in the `simplerpc.appIconUrl` setting

### Buttons not working or causing timeout errors
- **Good news**: This extension now uses `@xhayper/discord-rpc` which has full button support!
- Button requirements:
  - Button text must be 1-32 characters
  - Button URL must start with `http://` or `https://`
  - Maximum of 2 buttons allowed (this extension supports 1)
- If buttons still don't work:
  - Check the Output panel (View → Output → "miyauw's simple discord rpc") for error messages
  - Verify your button text and URL meet the requirements above
  - Try the "miyauw's simple discord rpc: Reconnect" command
- The extension will automatically fall back to working without buttons if they fail

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

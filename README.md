# Opal Launcher Electron App

This README documents how to build the Windows installer and use the Vercel-powered update system for the `xmcl-electron-app` package.

## Build the Windows installer

1. Open a terminal in `xmcl-electron-app`.
2. Install dependencies from the workspace root if needed:
   ```powershell
   cd "c:\Users\Yuvraj Singh\Downloads\Opal Launcher\x-minecraft-launcher"
   pnpm install
   ```
3. Build the app and package installers:
   ```powershell
   cd "c:\Users\Yuvraj Singh\Downloads\Opal Launcher\x-minecraft-launcher\xmcl-electron-app"
   pnpm run build:all
   ```

## Generated installer artifacts

After `pnpm run build:all`, generated Windows artifacts are stored in:

- `build/output/opal-launcher-0.56.5-win32-x64.exe`
- `build/output/opal-launcher-0.56.5-win32-ia32.exe`
- `build/output/opal-launcher-0.56.5-win32.exe`

The `.exe` files are the NSIS installers that can be distributed to users.

## Vercel-powered update system

The app uses a lightweight update manager that checks for a remote `version.json` file on startup.

### Default update endpoint

- Base URL: `https://opal-updates.vercel.app`
- Default channel: `stable`
- Checked URL:
  - `https://opal-updates.vercel.app/stable/version.json`

### Optional channel support

You can change the channel by setting environment variables when launching the app:

- `UPDATE_URL` — remote base URL
- `UPDATE_CHANNEL` — channel name

Example:
```powershell
$env:UPDATE_URL = 'https://opal-updates.vercel.app'
$env:UPDATE_CHANNEL = 'beta'
pnpm run start
```

Then the app will check:
- `https://opal-updates.vercel.app/beta/version.json`

## Expected `version.json` format

The update manifest must be a JSON object with at least:

```json
{
  "version": "0.56.5",
  "url": "https://example.com/opal-launcher-0.56.5-win32-x64.exe",
  "required": false,
  "changelog": [
    "Added Vercel update checks",
    "Improved update modal UI",
    "Added Windows installer packaging"
  ]
}
```

### Fields

- `version` — semantic version string
- `url` — direct installer download URL
- `required` — `true` or `false`
- `changelog` — optional array of changelog lines
- `body` — optional fallback changelog text

## How the update flow works

1. App starts and waits ~2 seconds.
2. It performs a silent background check.
3. If a newer version is found:
   - `required: true` shows a forced update prompt
   - `required: false` shows an optional update prompt
4. If the user downloads the update:
   - installer is saved to the system `Downloads` folder
   - installer is launched automatically
   - app quits after launch

## Using the generated installer

- Distribute `build/output/opal-launcher-1.0.0-win32-x64.exe` for 64-bit Windows.
- Host that `.exe` publicly and use its URL in `version.json.url`.

## Example Vercel deployment layout

If you host update metadata on Vercel, use a static structure like:

- `stable/version.json`
- `beta/version.json`
- `installers/opal-launcher-1.0.0-win32-x64.exe`

Then `version.json` can point to:

```json
{
  "version": "1.0.0",
  "url": "https://opal-updates.vercel.app/installers/opal-launcher-1.0.0-win32-x64.exe",
  "required": false
}
```

You can also use the sample manifests included in this repo:

- `xmcl-electron-app/update-samples/stable/version.json`
- `xmcl-electron-app/update-samples/beta/version.json`

Deploy the corresponding file to Vercel and host the installer under `installers/`.

## Notes

- The app persists optional update prompts in `update-state.json`.
- Optional updates are only prompted once per version.
- Required updates will quit the app if the user closes the updater modal.

If you want, I can also add a second section showing a ready-to-deploy Vercel directory tree and a sample `version.json` for both `stable` and `beta`. 
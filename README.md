# Updater helper

Purpose: create GitHub releases containing 32-bit and 64-bit Windows `.exe` artifacts plus a `manifest.json` describing the release. The client can query the GitHub Releases API to show changelog and manifest.

Quick usage (local):

1. Build

```bash
cd updater
npm install
npm run build
```

2. Create a release (local run)

Set these env vars before running `npm run upload`:

- `GITHUB_TOKEN` (token with `repo` scope for the target repo)
- `TARGET_REPO` (owner/repo) — defaults to `offcsystem-dotcom/updater`
- `VERSION` (tag name, e.g. `v1.2.3`)
- `ASSET_32` path to 32-bit exe
- `ASSET_64` path to 64-bit exe
- `CHANGELOG` optional release notes

Example:

```bash
GITHUB_TOKEN=... TARGET_REPO=offcsystem-dotcom/updater VERSION=v1.0.0 \
  ASSET_32=build/arch-x86.exe ASSET_64=build/arch-x64.exe \
  CHANGELOG="Added X, fixed Y" npm run build && npm run upload
```

3. Fetch latest from client

```bash
GITHUB_TOKEN=... TARGET_REPO=offcsystem-dotcom/updater npm run build && npm run fetch
```

CI: a GitHub Actions workflow is included to run on tags and publish a release using `GITHUB_TOKEN` in the runner. You must grant the workflow permission to create releases on the target repository or run the workflow in the target repository.

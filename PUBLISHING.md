# Publishing Punch Clock to Obsidian Community Plugins

## Step-by-Step Guide

### 1. Prepare Your GitHub Repository

Make sure your repo has:
- ✅ `README.md` with good documentation
- ✅ `LICENSE` file (MIT)
- ✅ `.gitignore` that excludes `node_modules`, `main.js`, `data.json`
- ✅ All source files committed
- ✅ `manifest.json` with correct author info

### 2. Create a GitHub Release

1. Go to your GitHub repository
2. Click **"Releases"** → **"Create a new release"**
3. **Tag version**: `v1.0.0` (must match your manifest.json version)
4. **Release title**: `v1.0.0` or `Punch Clock v1.0.0`
5. **Description**: Add release notes (e.g., "Initial release of Punch Clock")
6. **Attach files**: Upload these files as release assets:
   - `main.js` (the compiled plugin)
   - `manifest.json`
   - `styles.css`
7. Click **"Publish release"**

### 3. Submit to Obsidian Community Plugins

1. **Fork the repository**: https://github.com/obsidianmd/obsidian-releases
2. **Clone your fork** locally
3. **Add your plugin** to `community-plugins.json`

Find the file and add your entry in alphabetical order:

```json
{
  "id": "punch-clock",
  "name": "Punch Clock",
  "author": "YourGitHubUsername",
  "description": "A full-featured punch clock app for Obsidian. Clock in/out of multiple tasks simultaneously, visualize your work history with beautiful calendar views, and analyze your productivity patterns.",
  "repo": "YourGitHubUsername/your-repo-name",
  "branch": "main",
  "manifest": "https://github.com/YourGitHubUsername/your-repo-name/releases/download/v1.0.0/manifest.json",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "isDesktopOnly": false
}
```

**Important fields:**
- `id`: Must match your `manifest.json` id (`punch-clock`)
- `repo`: Your GitHub username and repo name
- `branch`: Usually `main` or `master`
- `manifest`: Direct link to your manifest.json from the GitHub release
- `version`: Must match your current version

4. **Commit and push** your changes
5. **Create a Pull Request** to the main obsidian-releases repository

### 4. PR Description Template

When creating the PR, use this template:

```markdown
## Plugin Submission: Punch Clock

**Plugin Name:** Punch Clock
**Plugin ID:** punch-clock
**Author:** @YourGitHubUsername
**Version:** 1.0.0

### Description
A full-featured punch clock app for Obsidian. Clock in/out of multiple tasks simultaneously, visualize your work history with beautiful calendar views, and analyze your productivity patterns.

### Features
- Multi-task time tracking
- Beautiful calendar views (daily, weekly, monthly, yearly)
- Real-time timers
- Task color customization
- Time entry editing and deletion
- Search and filter functionality

### Repository
https://github.com/YourGitHubUsername/your-repo-name

### Release
https://github.com/YourGitHubUsername/your-repo-name/releases/tag/v1.0.0
```

### 5. Wait for Review

- The Obsidian team will review your PR
- They may request changes or ask questions
- Once approved, your plugin will be available in Community Plugins!

## Important Notes

- **Version matching**: Your `manifest.json` version, GitHub release tag, and `community-plugins.json` version must all match
- **Release assets**: Make sure `main.js`, `manifest.json`, and `styles.css` are attached to your GitHub release
- **Manifest URL**: The manifest URL in `community-plugins.json` must be a direct link to the raw file from your release
- **Updates**: For future versions, create a new release and update the version in `community-plugins.json`

## Quick Checklist

- [ ] GitHub repo is public
- [ ] README.md is complete
- [ ] LICENSE file exists
- [ ] manifest.json has correct author info
- [ ] GitHub release created with v1.0.0 tag
- [ ] Release assets (main.js, manifest.json, styles.css) uploaded
- [ ] Forked obsidian-releases repo
- [ ] Added entry to community-plugins.json
- [ ] Created Pull Request
- [ ] PR description is complete

## Getting the Manifest URL

Your manifest URL should look like:
```
https://github.com/YourGitHubUsername/your-repo-name/releases/download/v1.0.0/manifest.json
```

To get this:
1. Go to your GitHub release
2. Click on `manifest.json` in the release assets
3. Copy the URL from the browser
4. Or construct it: `https://github.com/USERNAME/REPO/releases/download/v1.0.0/manifest.json`

## Troubleshooting

**Issue**: Manifest URL not found
- Make sure the file is attached to the release
- Check the URL format matches exactly

**Issue**: Plugin doesn't appear in Community Plugins
- Wait for PR approval (can take a few days)
- Check that all versions match
- Verify the manifest.json is accessible

**Issue**: Build errors
- Make sure `main.js` is built (`npm run build`)
- Check that all dependencies are in package.json


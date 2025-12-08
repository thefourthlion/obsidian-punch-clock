# Commands to Update Everything

## Step 1: Build the Plugin

```bash
cd /Volumes/4tb/programming/obsidian-plugins/PunchClock
npm run build
```

## Step 2: Commit All Changes

```bash
cd /Volumes/4tb/programming/obsidian-plugins/PunchClock
git add .
git commit -m "Update plugin ID to time-punch-clock and name to Time Punch Clock"
git push origin main
```

## Step 3: Create New GitHub Release

**IMPORTANT: Use tag `1.0.0` (NOT `v1.0.0`)**

1. Go to: https://github.com/thefourthlion/obsidian-punch-clock/releases
2. Click "Draft a new release" or edit existing release
3. **Tag version**: `1.0.0` (no "v" prefix!)
4. **Release title**: `1.0.0` or `Time Punch Clock 1.0.0`
5. **Description**: "Initial release of Time Punch Clock"
6. **Attach files**:
   - `main.js`
   - `manifest.json`
   - `styles.css`
7. Click "Publish release"

## Step 4: Update PR Entry

Go to your PR in obsidian-releases and update the entry to:

```json
  {
    "id": "time-punch-clock",
    "name": "Time Punch Clock",
    "author": "thefourthlion",
    "description": "A full-featured punch clock app. Clock in/out of multiple tasks simultaneously, visualize your work history with beautiful calendar views, and analyze your productivity patterns.",
    "repo": "thefourthlion/obsidian-punch-clock"
  }
```

## Step 5: Update PR Description

Make sure your PR description includes the FULL description (matching manifest.json):

```markdown
# I am submitting a new Community Plugin

- [x] I attest that I have done my best to deliver a high-quality plugin, am proud of the code I have written, and would recommend it to others. I commit to maintaining the plugin and being responsive to bug reports. If I am no longer able to maintain it, I will make reasonable efforts to find a successor maintainer or withdraw the plugin from the directory.

## Repo URL

Link to my plugin: https://github.com/thefourthlion/obsidian-punch-clock

## Release Checklist

- [x] I have tested the plugin on
  - [x] Windows
  - [x] macOS
  - [x] Linux
  - [ ] Android _(if applicable)_
  - [ ] iOS _(if applicable)_

- [x] My GitHub release contains all required files (as individual files, not just in the source.zip / source.tar.gz)
  - [x] `main.js`
  - [x] `manifest.json`
  - [x] `styles.css` _(optional)_

- [x] GitHub release name matches the exact version number specified in my manifest.json (_**Note:** Use the exact version number, don't include a prefix `v`_)

- [x] The `id` in my `manifest.json` matches the `id` in the `community-plugins.json` file.

- [x] My README.md describes the plugin's purpose and provides clear usage instructions.

- [x] I have read the developer policies at https://docs.obsidian.md/Developer+policies, and have assessed my plugin's adherence to these policies.

- [x] I have read the tips in https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines and have self-reviewed my plugin to avoid these common pitfalls.

- [x] I have added a license in the LICENSE file.

- [x] My project respects and is compatible with the original license of any code from other plugins that I'm using.
      I have given proper attribution to these other projects in my `README.md`.
```

## Quick Verification

After updating, verify:
- [ ] manifest.json has `"id": "time-punch-clock"`
- [ ] manifest.json has `"name": "Time Punch Clock"`
- [ ] Description doesn't include "for Obsidian"
- [ ] GitHub release tag is `1.0.0` (not `v1.0.0`)
- [ ] PR entry matches manifest.json exactly
- [ ] PR description has full description text


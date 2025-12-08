# GitHub Actions You Need to Complete

I've updated all the code files. Now you need to complete these GitHub actions:

## ✅ Step 1: Build & Commit (Run this script)

```bash
cd /Volumes/4tb/programming/obsidian-plugins/PunchClock
chmod +x run-updates.sh
./run-updates.sh
```

Then:
```bash
git add .
git commit -m "Update plugin ID to time-punch-clock and name to Time Punch Clock"
git push origin main
```

## ✅ Step 2: Create GitHub Release

1. Go to: https://github.com/thefourthlion/obsidian-punch-clock/releases
2. **Delete the old `v1.0.0` release** (if it exists)
3. Click **"Create a new release"**
4. **Tag version**: `1.0.0` (NO "v" prefix - just `1.0.0`)
5. **Release title**: `1.0.0` or `Time Punch Clock 1.0.0`
6. **Description**: "Initial release of Time Punch Clock"
7. **Attach files** (drag and drop):
   - `main.js` (from your PunchClock folder)
   - `manifest.json` (from your PunchClock folder)
   - `styles.css` (from your PunchClock folder)
8. Click **"Publish release"**

## ✅ Step 3: Update PR Entry

1. Go to your PR: https://github.com/obsidianmd/obsidian-releases/pull/YOUR_PR_NUMBER
2. Or go to your fork: https://github.com/thefourthlion/obsidian-releases
3. Edit `community-plugins.json`
4. Find your entry and replace it with:

```json
  {
    "id": "time-punch-clock",
    "name": "Time Punch Clock",
    "author": "thefourthlion",
    "description": "A full-featured punch clock app. Clock in/out of multiple tasks simultaneously, visualize your work history with beautiful calendar views, and analyze your productivity patterns.",
    "repo": "thefourthlion/obsidian-punch-clock"
  }
```

5. Make sure it's at the END of the file (after protoavatar/obsidian-newsletters)
6. Commit the change

## ✅ Step 4: Update PR Description

1. Go to your PR
2. Click "Edit" on the description
3. Make sure it includes the FULL description text:

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

4. Save the PR description

## ✅ Step 5: Wait for Validation

After you make these changes, the GitHub Actions bot will automatically re-validate your PR. It should pass now!

## Summary of What I've Already Done

✅ Updated `manifest.json`:
- ID: `time-punch-clock`
- Name: `Time Punch Clock`
- Removed "for Obsidian" from description

✅ Updated `main.ts`:
- All display text changed to "Time Punch Clock"

✅ Updated `package.json`:
- Removed "for Obsidian" from description

✅ Updated `README.md`:
- All references changed to "Time Punch Clock"

## What You Need to Do

1. ✅ Run the build script and commit (local)
2. ⏳ Create GitHub release with tag `1.0.0` (GitHub UI)
3. ⏳ Update PR entry in obsidian-releases (GitHub UI)
4. ⏳ Update PR description (GitHub UI)

After these steps, your plugin should be accepted! 🎉


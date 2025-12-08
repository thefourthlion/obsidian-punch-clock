# Final Step: Submit Punch Clock to Obsidian Community Plugins

## Your Plugin Info
- **Repository**: thefourthlion/obsidian-punch-clock
- **Plugin ID**: punch-clock
- **Author**: thefourthlion

## ⚠️ IMPORTANT: Add Entry at the END

**Entries must be added at the END of the list, NOT alphabetically!**

The last plugin in the list is: `protoavatar/obsidian-newsletters`

## Step-by-Step Instructions

### 1. Fork the Obsidian Releases Repository

1. Go to: https://github.com/obsidianmd/obsidian-releases
2. Click the **"Fork"** button in the top right
3. This creates a copy in your GitHub account

### 2. Edit community-plugins.json

1. Go to your fork: https://github.com/thefourthlion/obsidian-releases
2. Navigate to `community-plugins.json`
3. Click the pencil icon to edit
4. **Scroll to the VERY END** of the file
5. Find the last entry (should be `protoavatar/obsidian-newsletters`)
6. Add a comma after the last entry's closing brace
7. Add your entry:

```json
  {
    "id": "punch-clock",
    "name": "Punch Clock",
    "author": "thefourthlion",
    "description": "A full-featured punch clock app for Obsidian. Clock in/out of multiple tasks simultaneously, visualize your work history with beautiful calendar views, and analyze your productivity patterns.",
    "repo": "thefourthlion/obsidian-punch-clock"
  }
```

**Important:**
- Add it at the END, after `protoavatar/obsidian-newsletters`
- Make sure there's a comma after the previous entry's `}`
- Your entry should be the LAST one (no comma after your closing `}`)

### 3. Commit Changes

1. Scroll down to "Commit changes"
2. Title: `Add Punch Clock plugin`
3. Description: `Add Punch Clock time tracking plugin`
4. Select "Create a new branch" and name it `add-punch-clock`
5. Click "Propose changes"

### 4. Create Pull Request

1. After committing, click **"Compare & pull request"**
2. **IMPORTANT: Fill out the PR template completely!**

**Title:**
```
Add Punch Clock plugin
```

**Description (fill out the template):**
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

3. Click **"Create pull request"**

### 5. Wait for Review

- The Obsidian team will review your PR
- They may request changes or ask questions
- Once approved, your plugin will be available in Community Plugins!

## Common Mistakes to Avoid

❌ **Don't add alphabetically** - Add at the END
❌ **Don't skip the PR template** - Fill it out completely
❌ **Don't forget the comma** - Add comma after previous entry
❌ **Don't add comma after your entry** - You're the last one

## Verification Checklist

Before submitting, verify:
- [ ] Entry is at the END of the file (after protoavatar/obsidian-newsletters)
- [ ] Comma after previous entry's closing brace
- [ ] No comma after your closing brace
- [ ] JSON is valid (no syntax errors)
- [ ] Repository name is correct: `thefourthlion/obsidian-punch-clock`
- [ ] Plugin ID matches your manifest.json: `punch-clock`
- [ ] PR template is completely filled out with checkboxes

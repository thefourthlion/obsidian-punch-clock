#!/bin/bash

# Script to update and prepare plugin for submission

cd /Volumes/4tb/programming/obsidian-plugins/PunchClock

echo "🔨 Building plugin..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📦 Checking files..."
if [ -f "main.js" ] && [ -f "manifest.json" ] && [ -f "styles.css" ]; then
    echo "✅ All required files exist"
    ls -lh main.js manifest.json styles.css
else
    echo "❌ Missing required files!"
    exit 1
fi

echo ""
echo "📝 Git status:"
git status

echo ""
echo "✅ Ready to commit and push!"
echo ""
echo "Next steps:"
echo "1. Run: git add ."
echo "2. Run: git commit -m 'Update plugin ID to time-punch-clock and name to Time Punch Clock'"
echo "3. Run: git push origin main"
echo ""
echo "Then go to GitHub to:"
echo "4. Create release with tag '1.0.0' (no v prefix)"
echo "5. Upload main.js, manifest.json, styles.css"
echo "6. Update PR entry in obsidian-releases"


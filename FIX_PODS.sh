#!/bin/bash
# Script to fix CocoaPods and install dependencies

echo "🔧 Fixing CocoaPods issues..."

cd "$(dirname "$0")/ios/App"

# Fix CocoaPods cache permissions
echo "📁 Fixing cache permissions..."
mkdir -p ~/Library/Caches/CocoaPods
chmod 755 ~/Library/Caches/CocoaPods 2>/dev/null || true

# Clean CocoaPods cache if needed
echo "🧹 Cleaning old Pods..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Caches/CocoaPods/Pods 2>/dev/null || true

# Install pods
echo "📦 Installing CocoaPods dependencies..."
pod install --repo-update

echo ""
echo "✅ CocoaPods installation complete!"
echo ""
echo "Next: Open Xcode and build the project (Cmd + B)"

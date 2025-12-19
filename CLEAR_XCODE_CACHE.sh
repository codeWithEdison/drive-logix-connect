#!/bin/bash
# Script to completely clear Xcode cache and rebuild

echo "🧹 Clearing Xcode cache and derived data..."

# Clear Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clear iOS build folder
cd "$(dirname "$0")"
rm -rf ios/App/build

# Clear module cache
rm -rf ~/Library/Caches/CocoaPods
rm -rf ios/App/Pods

echo "✅ Cache cleared!"
echo ""
echo "Next steps in Xcode:"
echo "1. Product → Clean Build Folder (Cmd + Shift + K)"
echo "2. Close Xcode completely"
echo "3. Reopen Xcode"
echo "4. Product → Build (Cmd + B)"
echo "5. Product → Run (Cmd + R)"

#!/bin/bash

# Script to update brand colors across the application
# Usage: ./scripts/update-brand-colors.sh

echo "🎨 Tatlist Brand Color Updater"
echo "================================"
echo ""

# Prompt for brand colors
read -p "Enter your PRIMARY brand color (e.g., #FFB347): " PRIMARY_COLOR
read -p "Enter your SECONDARY brand color (e.g., #000000): " SECONDARY_COLOR
read -p "Enter your ACCENT color (e.g., #FFFFFF): " ACCENT_COLOR

# Validate hex color format (basic check)
if [[ ! $PRIMARY_COLOR =~ ^#[0-9A-Fa-f]{6}$ ]]; then
    echo "❌ Invalid PRIMARY_COLOR format. Use #RRGGBB format."
    exit 1
fi

echo ""
echo "📋 Summary of changes:"
echo "  Primary Color: $PRIMARY_COLOR"
echo "  Secondary Color: $SECONDARY_COLOR"
echo "  Accent Color: $ACCENT_COLOR"
echo ""
read -p "Proceed with update? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Update cancelled."
    exit 1
fi

# Update manifest.webmanifest
echo "🔄 Updating manifest.webmanifest..."
sed -i '' "s/\"theme_color\": \"#[0-9A-Fa-f]\{6\}\"/\"theme_color\": \"$PRIMARY_COLOR\"/" \
    public/manifest.webmanifest

# Update app/layout.tsx
echo "🔄 Updating app/layout.tsx..."
sed -i '' "s/themeColor: '#[0-9A-Fa-f]\{6\}'/themeColor: '$PRIMARY_COLOR'/" \
    app/layout.tsx

# Create backup of globals.css
echo "🔄 Creating backup of globals.css..."
cp app/globals.css app/globals.css.backup

echo ""
echo "⚠️  Manual update required for app/globals.css"
echo "   Please update the following sections with your brand colors:"
echo "   1. Custom orange gradient (lines 138-152)"
echo "   2. CSS variables (if needed)"
echo ""
echo "   A backup has been created: app/globals.css.backup"
echo ""
echo "✅ Brand colors updated!"
echo "🔄 Restart your dev server to see changes: bun dev"

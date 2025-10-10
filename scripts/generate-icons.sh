#!/bin/bash

# Script to generate all required app icons for PWA
# This creates icons in various sizes for different platforms

PUBLIC_DIR="/Users/jbwashington/Developer/projects/tatlist-app/public"
SOURCE_ICON="$PUBLIC_DIR/icon-source.png"

echo "🎨 Generating app icons for Tatlist PWA..."

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: Source icon not found at $SOURCE_ICON"
    echo "📝 Please save your icon design as 'icon-source.png' in the public directory"
    echo "💡 Tip: The source icon should be at least 512x512px for best quality"
    exit 1
fi

# Get original dimensions
original_dimensions=$(sips -g pixelWidth -g pixelHeight "$SOURCE_ICON" | grep -E "pixelWidth|pixelHeight" | awk '{print $2}')
echo "📏 Source icon dimensions: $(echo $original_dimensions | tr '\n' 'x')px"

# Array of icon sizes needed
declare -a sizes=(
    "192:android-chrome-192x192.png"
    "192:icon-192x192.png"
    "512:android-chrome-512x512.png"
    "512:icon-512x512.png"
    "180:apple-touch-icon.png"
    "16:favicon-16x16.png"
    "32:favicon-32x32.png"
)

# Generate each icon size
for size_config in "${sizes[@]}"; do
    IFS=: read -r size filename <<< "$size_config"
    output_path="$PUBLIC_DIR/$filename"

    echo "🔄 Generating ${size}x${size} - $filename..."
    sips -z "$size" "$size" "$SOURCE_ICON" --out "$output_path" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        file_size=$(du -h "$output_path" | cut -f1)
        echo "  ✅ Created $filename ($file_size)"
    else
        echo "  ❌ Failed to create $filename"
    fi
done

# Generate favicon.ico (requires special handling)
if command -v convert &> /dev/null; then
    echo "🔄 Generating favicon.ico..."
    convert "$PUBLIC_DIR/favicon-16x16.png" "$PUBLIC_DIR/favicon-32x32.png" "$PUBLIC_DIR/favicon.ico" > /dev/null 2>&1
    echo "  ✅ Created favicon.ico"
else
    echo "⚠️  ImageMagick not found - skipping favicon.ico generation"
    echo "💡 Install with: brew install imagemagick"
fi

echo ""
echo "✨ Icon generation complete!"
echo "📦 Generated icons:"
ls -lh "$PUBLIC_DIR"/*.png "$PUBLIC_DIR"/favicon.ico 2>/dev/null | grep -E "(icon|favicon|android|apple)" | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "🎉 All icons are ready for your PWA!"

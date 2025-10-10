#!/bin/bash

# Script to optimize the Tatlist logo for web use
# This script resizes and optimizes the logo to reduce file size

PUBLIC_DIR="/Users/jbwashington/Developer/projects/tatlist-app/public"
INPUT_FILE="$PUBLIC_DIR/tatlist-logo.png"
OUTPUT_FILE="$PUBLIC_DIR/tatlist-logo.webp"

echo "🎨 Optimizing Tatlist logo..."

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: Input file not found at $INPUT_FILE"
    echo "📝 Please save the logo as 'tatlist-logo.png' in the public directory"
    exit 1
fi

# Get original file size
original_size=$(du -h "$INPUT_FILE" | cut -f1)
echo "📏 Original size: $original_size"

# Resize to max width of 600px (maintains aspect ratio)
echo "🔄 Resizing to max width of 600px..."
sips -Z 600 "$INPUT_FILE" --out "$PUBLIC_DIR/tatlist-logo-resized.png" > /dev/null 2>&1

# Convert to WebP for better compression
if command -v cwebp &> /dev/null; then
    echo "📦 Converting to WebP format..."
    cwebp -q 85 "$PUBLIC_DIR/tatlist-logo-resized.png" -o "$OUTPUT_FILE" > /dev/null 2>&1
    rm "$PUBLIC_DIR/tatlist-logo-resized.png"
else
    echo "⚠️  cwebp not found, using PNG format instead"
    mv "$PUBLIC_DIR/tatlist-logo-resized.png" "$OUTPUT_FILE"
fi

# Get optimized file size
optimized_size=$(du -h "$OUTPUT_FILE" | cut -f1)
echo "✅ Optimized size: $optimized_size"
echo "🎉 Logo saved to: $OUTPUT_FILE"

# Clean up old logo.webp if it exists
if [ -f "$PUBLIC_DIR/logo.webp" ]; then
    echo "🗑️  Removing old logo.webp"
    rm "$PUBLIC_DIR/logo.webp"
fi

echo "✨ Done! Logo is ready to use."

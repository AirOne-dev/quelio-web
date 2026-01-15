#!/bin/bash

echo "🏗️  Building application for production..."

# Nettoyer le dossier dist s'il existe
if [ -d "dist" ]; then
    echo "🗑️  Cleaning existing dist directory..."
    rm -rf dist
fi

# Build Vite
echo "📦 Building frontend with Vite..."
pnpm exec vue-tsc && pnpm exec vite build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Copier l'API dans dist (avec exclusions)
echo "📋 Copying API to dist..."

# Check if .buildignore exists
if [ -f ".buildignore" ]; then
    echo "   Using .buildignore for exclusions..."

    # Create rsync exclude-from file from .buildignore
    # Remove comments and empty lines, convert patterns to rsync format
    EXCLUDE_FILE=$(mktemp)
    grep -v '^#' .buildignore | grep -v '^[[:space:]]*$' | sed 's|^api/||' > "$EXCLUDE_FILE"

    # Use rsync with exclusions
    rsync -a --exclude-from="$EXCLUDE_FILE" api/ dist/api/

    # Clean up temp file
    rm "$EXCLUDE_FILE"

    echo "   ✓ API copied with exclusions applied"
else
    echo "   ⚠️  No .buildignore found, copying all API files..."
    cp -r api dist/api
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 Files are in the 'dist' directory"
echo ""
echo "To preview the production build locally:"
echo "  pnpm preview"
echo ""
echo "To deploy, upload the contents of 'dist' to your web server."

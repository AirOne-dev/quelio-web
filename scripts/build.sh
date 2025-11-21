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

# Copier l'API dans dist
echo "📋 Copying API to dist..."
cp -r api dist/api

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 Files are in the 'dist' directory"
echo ""
echo "To preview the production build locally:"
echo "  pnpm preview"
echo ""
echo "To deploy, upload the contents of 'dist' to your web server."

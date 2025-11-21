#!/bin/bash

echo "🚀 Starting production preview..."

# Vérifier que dist existe
if [ ! -d "dist" ]; then
    echo "❌ 'dist' directory not found!"
    echo "Please run 'pnpm build' first."
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null
docker-compose down 2>/dev/null

# Build l'image Docker
echo "🏗️  Building Docker image..."
docker-compose -f docker-compose.prod.yml build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Démarrer le conteneur de production
echo "🐳 Starting production container..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Production preview started!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Application: http://localhost:9876"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 This is a production build running in Docker"
echo ""
echo "To stop: docker-compose -f docker-compose.prod.yml down"
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"

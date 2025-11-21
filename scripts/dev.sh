#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement..."

# Vérifier si pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé. Veuillez l'installer avec: npm install -g pnpm"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    pnpm install
fi

# Arrêter les conteneurs existants
echo "🐳 Démarrage de l'API PHP..."
docker-compose down
docker-compose up -d

# Attendre que l'API soit prête
echo "⏳ Attente du démarrage de l'API..."
sleep 3

# Démarrer Vite en mode dev
echo "🔥 Démarrage du serveur Vite..."
echo ""
echo "✅ Services démarrés !"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 OUVREZ CETTE URL DANS VOTRE NAVIGATEUR:"
echo ""
echo "   👉  http://localhost:9876  👈"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔌 API PHP: http://localhost:8080 (proxied via /api)"
echo "💡 Le Hot Module Replacement (HMR) est activé"
echo ""
echo "⚠️  N'UTILISEZ PAS http://localhost:8080 - c'est l'API uniquement!"
echo ""
echo "Pour arrêter: Ctrl+C puis docker-compose down"
echo ""

# Démarrer Vite directement
pnpm exec vite
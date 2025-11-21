#!/bin/bash

# Fonction pour nettoyer et arrêter Docker à la sortie
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    docker compose down
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer les signaux de sortie (Ctrl+C, kill, etc.)
trap cleanup SIGINT SIGTERM EXIT

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
docker compose down
docker compose --profile dev up -d

# Attendre que l'API soit prête
echo "⏳ Attente du démarrage de l'API..."
MAX_ATTEMPTS=50
ATTEMPT=0
API_URL="http://localhost:8080"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null)
    if [ -n "$HTTP_CODE" ] && [ "$HTTP_CODE" != "000" ]; then
        echo "✅ L'API est prête!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "⚠️  Timeout: L'API n'a pas répondu après 10 secondes"
        echo "   Le serveur Vite va quand même démarrer..."
    else
        printf "\r   Tentative %d/%d..." "$ATTEMPT" "$MAX_ATTEMPTS"
        sleep 0.2
    fi
done
echo ""  # Nouvelle ligne après les tentatives

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
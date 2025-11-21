#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement..."

# Arrêter les conteneurs existants
docker-compose down

# Construire et démarrer les services
docker-compose up -d

echo "✅ Services démarrés !"
echo ""
echo "📱 Application: http://localhost:9876"
echo ""
echo "💡 Vos fichiers sont synchronisés automatiquement avec le bind mount"
echo ""
echo "Pour arrêter: docker-compose down"
# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.1] - 2025-11-21

### Changé
- ♻️ Suppression de la génération du `.htaccess` racine inutile
- ♻️ L'API conserve ses propres configurations (`.htaccess`, `nginx.conf`)

### Ajouté
- 📦 Dockerfile optimisé pour la production
- 📦 `.dockerignore` pour optimiser le build
- 📚 Documentation Docker complète (`DOCKER.md`)

### Amélioré
- 🚀 Image Docker de production propre et reproductible (782MB)
- ⚡ Démarrage instantané avec image pré-configurée
- 🔧 Scripts bash simplifiés (plus de dépendances npm intermédiaires)

---

## [2.0.0] - 2025-11-21

### 🎉 Refactorisation majeure - Migration vers Vue.js + Vite

#### Ajouté
- ✨ Architecture Vue.js 3 avec Composition API et TypeScript
- ✨ Build system moderne avec Vite
- ✨ Hot Module Replacement (HMR) pour un développement fluide
- ✨ Tailwind CSS v4 intégré via @tailwindcss/vite
- ✨ Scripts automatisés dans le dossier `scripts/`
- ✨ Support TypeScript avec typage strict
- ✨ Composables réutilisables (useTimeCalculations)
- ✨ Docker Compose pour production avec `docker-compose.prod.yml`
- ✨ Build de production incluant automatiquement l'API
- ✨ Documentation complète (README.md, scripts/README.md)

#### Changé
- ♻️ Transformation du monolithe HTML (970 lignes) en 6 composants Vue modulaires
- ♻️ Migration de Vue.js CDN vers Vue.js ESM
- ♻️ Remplacement du dossier `api/` par un submodule Git
- ♻️ Réorganisation des styles (main.css, scrollbar.css)
- ♻️ Amélioration de la structure des dossiers
- ♻️ Séparation des environnements dev/prod

#### Structure du projet
```
quel-io/
├── src/                    # Code source Vue.js
│   ├── components/         # 6 composants Vue
│   ├── composables/        # Logique réutilisable
│   ├── styles/             # CSS organisé
│   ├── types/              # Types TypeScript
│   ├── App.vue
│   └── main.ts
├── scripts/                # Scripts de build et dev
│   ├── dev.sh
│   ├── build.sh
│   └── start-prod.sh
├── api/                    # API PHP (submodule)
├── dist/                   # Build de production
└── Configuration files
```

#### Commandes npm
- `pnpm dev` - Lance l'environnement de développement complet
- `pnpm build` - Build pour la production (inclut l'API)
- `pnpm start:prod` - Lance la version de production en local
- `pnpm preview` - Preview du build

#### Améliorations techniques
- 🚀 Performance : Bundle optimisé avec tree-shaking
- 🔒 Type safety : TypeScript strict mode
- 📦 Module system : ESM natif
- 🔥 DX : Hot Module Replacement
- 🎨 Styling : Tailwind CSS v4 avec tree-shaking
- 🐳 Docker : Environnements dev et prod séparés

#### Préservé
- ✅ Toutes les fonctionnalités de l'application originale
- ✅ Design glass-morphism identique
- ✅ Animations et transitions
- ✅ Logique métier (calculs, suggestions, etc.)
- ✅ Comportement utilisateur
- ✅ API PHP inchangée

---

## [1.0.0] - Avant refactorisation

### Version originale
- Single-page application en HTML monolithique
- Vue.js 3 chargé via CDN
- Tailwind CSS via CDN
- Moment.js pour les dates
- API PHP avec Docker
- Fichier unique de 970 lignes

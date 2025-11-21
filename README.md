# Quel io ?

Application de suivi des horaires de travail intégrée avec Kelio.

## 🚀 Technologies

- **Vue 3** avec Composition API
- **TypeScript** pour la sécurité des types
- **Vite** pour le bundling et le HMR (Hot Module Replacement)
- **Tailwind CSS v4** pour le styling
- **Moment.js** pour la gestion des dates (locale française)
- **Docker** pour l'API PHP

## 📦 Structure du projet

```
quel-io/
├── src/
│   ├── components/       # Composants Vue
│   │   ├── DayCard.vue
│   │   ├── Dashboard.vue
│   │   ├── Loader.vue
│   │   ├── LoginScreen.vue
│   │   ├── PresenceModal.vue
│   │   └── SettingsModal.vue
│   ├── composables/      # Logique réutilisable
│   │   └── useTimeCalculations.ts
│   ├── styles/           # Fichiers CSS
│   │   ├── main.css
│   │   └── scrollbar.css
│   ├── types/            # Types TypeScript
│   │   └── index.ts
│   ├── App.vue           # Composant racine
│   └── main.ts           # Point d'entrée
├── api/                  # API PHP (submodule git)
├── index.html            # Template HTML
├── vite.config.ts        # Configuration Vite
├── tsconfig.json         # Configuration TypeScript
└── package.json          # Dépendances npm
```

## 🛠️ Installation

```bash
# Installer les dépendances
pnpm install
```

## 🔧 Développement

Pour lancer l'environnement de développement complet (API PHP + Vite dev server) :

```bash
pnpm dev
```

Cela va :
1. Démarrer l'API PHP via Docker sur le port 8080
2. Démarrer Vite en mode dev sur le port 9876 avec HMR
3. Configurer le proxy pour l'API

L'application sera accessible sur **http://localhost:9876**

### Commandes disponibles

```bash
# Développement (API + Frontend avec HMR)
pnpm dev

# Build de production
pnpm build

# Preview du build de production
pnpm preview

# Démarrer la version de production (build + run)
pnpm start:prod
```

### Scripts dans le dossier `scripts/`

- `dev.sh` : Lance l'environnement de développement complet
- `build.sh` : Build l'application et copie l'API dans dist/
- `start-prod.sh` : Lance la version de production avec Docker

## 🏗️ Build de production

```bash
pnpm build
```

Ce script va :
1. Compiler le frontend avec Vite (TypeScript + optimisations)
2. Copier l'API PHP dans `dist/api/` (avec ses propres configurations)

Les fichiers compilés seront dans le dossier `dist/` avec la structure suivante :
```
dist/
├── index.html          # Page principale
├── assets/             # JS et CSS optimisés
└── api/                # API PHP (avec ses .htaccess)
    ├── index.php
    ├── config.php
    └── .htaccess       # Configuration de l'API
```

## 🚀 Déploiement

### Preview locale (avec Docker)

```bash
pnpm preview
```

Cela va :
1. Builder l'image Docker depuis le `Dockerfile`
2. Démarrer un conteneur avec l'application complète sur http://localhost:9876

L'image Docker contient :
- ✅ Apache + PHP 8.2 configuré
- ✅ Extension cURL installée
- ✅ Frontend compilé et optimisé
- ✅ API PHP intégrée (avec sa propre configuration)

### Sur un serveur

**Option 1 : Avec Docker (recommandé)**

```bash
# Sur le serveur
pnpm install
pnpm build
docker-compose -f docker-compose.prod.yml up -d --build
```

**Option 2 : Upload manuel**

1. Build l'application : `pnpm build`
2. Uploadez le contenu du dossier `dist/` sur votre serveur web
3. Assurez-vous que :
   - PHP 8.2+ est installé avec l'extension cURL
   - Apache a `mod_rewrite` activé
   - Le fichier `api/config.php` est configuré avec vos credentials Kelio

**Pour plus de détails sur Docker, consultez [DOCKER.md](./DOCKER.md)**

## 📝 Fonctionnalités

- ✅ Authentification avec credentials sauvegardés
- ✅ Affichage des horaires de la semaine
- ✅ Calcul automatique du temps restant
- ✅ Suggestions intelligentes de plages horaires
- ✅ Marquage des absences (journée, demi-journée)
- ✅ Personnalisation des objectifs hebdomadaires
- ✅ Mode debug avec console intégrée
- ✅ Support du mode offline
- ✅ Hot Module Replacement pour un développement fluide

## 🎨 Style

Le projet utilise :
- Glass-morphism design
- Gradients indigo
- Animations CSS personnalisées
- Scrollbar customisée
- Mode sombre par défaut

## 🔒 Sécurité

- Les credentials sont stockés en cookies sécurisés (httpOnly, Secure, SameSite)
- Les préférences sont sauvegardées dans le localStorage
- L'API PHP est isolée dans un conteneur Docker

## 📄 Licence

ISC

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

# Preview du build de production avec Docker
pnpm preview
```

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

### Preview locale

```bash
pnpm preview
```

Cela va builder l'image Docker et démarrer l'application complète sur http://localhost:9876

### Sur un serveur

**Avec Docker :**

```bash
pnpm install
pnpm build
docker compose --profile prod up -d --build
```

**Sans Docker :**

1. Build : `pnpm build`
2. Uploadez `dist/` sur votre serveur
3. Configurez Apache/Nginx pour servir le dossier

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

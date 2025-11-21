# Quel io ?

Application de suivi des horaires de travail intégrée avec Kelio.

## 🚀 Technologies

- **Vue 3** avec Composition API
- **TypeScript** pour la sécurité des types
- **Vite** pour le bundling et le HMR (Hot Module Replacement)
- **Tailwind CSS v4** pour le styling
- **Moment.js** pour la gestion des dates (locale française)
- **Docker** pour l'API PHP


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

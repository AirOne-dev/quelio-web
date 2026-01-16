# Build System Documentation

## Overview

Le système de build utilise `.buildignore` pour exclure certains fichiers du build de production.

## Usage

### Build pour production

```bash
pnpm build
```

Cette commande :
1. Nettoie le dossier `dist/` existant
2. Compile le frontend avec Vite (TypeScript + Vue)
3. Copie l'API dans `dist/api/` en excluant les fichiers listés dans `.buildignore`

### Fichier .buildignore

Le fichier `.buildignore` à la racine du projet liste les fichiers/dossiers à exclure.

**Format** :
- Une ligne par pattern
- Les lignes commençant par `#` sont des commentaires
- Les lignes vides sont ignorées
- Patterns relatifs au dossier `api/`
- Support des wildcards : `*` (caractères) et `**` (répertoires récursifs)

**Exemple** :
```
# Documentation
api/README.md
api/CLAUDE.md

# Tests
api/tests/
api/test_*.php

# Configuration d'exemple
api/config.example.php

# Données de développement
api/data.json
```

## Fichiers exclus par défaut

Les fichiers suivants sont exclus du build :

### Documentation
- `api/README.md`
- `api/CLAUDE.md`
- `api/config.example.php`

### Tests
- `api/tests/` (tout le dossier)
- `api/tests.sh`
- `api/test_*.php`
- `api/analyze_*.php`

### Git et métadonnées
- `api/.git/`
- `api/.gitignore`

### Données de développement
- `api/data.json`

### Fichiers temporaires et systèmes
- `api/.DS_Store`, `api/Thumbs.db`
- `api/.vscode/`, `api/.idea/`
- `api/*.log`, `api/logs/`
- `api/tmp/`, `api/temp/`

## Fichiers inclus dans le build

Tous les fichiers essentiels sont conservés :
- `api/index.php` - Point d'entrée
- `api/config.php` - Configuration production
- `api/src/` - Code source (controllers, services, middleware)
- `api/.htaccess` - Configuration Apache
- `api/nginx.conf` - Configuration Nginx

## Déploiement

Une fois le build terminé :

```bash
# Preview local (optionnel)
pnpm preview

# Déployer sur FTP
# Upload le contenu du dossier 'dist/' vers votre serveur
```

## Ajout de nouvelles exclusions

Pour exclure d'autres fichiers :

1. Éditer `.buildignore`
2. Ajouter les patterns relatifs à `api/`
3. Rebuild : `pnpm build`
4. Vérifier : `ls -la dist/api/`

## Vérification

Pour vérifier que les exclusions fonctionnent :

```bash
# Build
pnpm build

# Vérifier les fichiers exclus
ls -la dist/api/ | grep -E "(README|test|example)"

# Doit être vide si les exclusions fonctionnent
```

## Troubleshooting

### Les fichiers ne sont pas exclus

1. Vérifier que `.buildignore` existe à la racine
2. Vérifier que `rsync` est installé : `which rsync`
3. Vérifier les patterns (doivent commencer par `api/`)

### Build échoue

Si le build échoue :
- Vérifier que TypeScript compile : `pnpm exec vue-tsc`
- Vérifier que Vite build fonctionne : `pnpm exec vite build`
- Logs complets disponibles dans la console

## Notes techniques

Le script `scripts/build.sh` :
1. Parse `.buildignore` en retirant les commentaires et lignes vides
2. Convertit les patterns pour `rsync` (retire le préfixe `api/`)
3. Utilise `rsync -a --exclude-from` pour copier avec exclusions
4. Nettoie le fichier temporaire après copie

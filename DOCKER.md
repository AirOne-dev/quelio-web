# Docker - Guide complet

Ce document explique comment utiliser Docker pour développer et déployer l'application Quel.io.

## 📋 Table des matières

- [Images Docker](#images-docker)
- [Développement](#développement)
- [Production](#production)
- [Commandes utiles](#commandes-utiles)

---

## 🐳 Images Docker

### Image de développement

**Service :** `api` (définie dans `docker-compose.yml`)
- **Base :** `php:8.2-apache`
- **Port :** 8080
- **Utilisation :** API PHP uniquement
- **Volume :** Monte le dossier `./api` en lecture/écriture

### Image de production

**Service :** `web` (définie dans `docker-compose.prod.yml`)
- **Base :** `php:8.2-apache` (via Dockerfile)
- **Image construite :** `quel-io:latest`
- **Port :** 9876
- **Contenu :** Frontend compilé + API PHP intégrée

---

## 🔧 Développement

### Démarrage

```bash
pnpm dev
```

Ce script va :
1. Démarrer l'API PHP avec Docker Compose (port 8080)
2. Lancer Vite en mode dev (port 9876)
3. Configurer le proxy `/api` → `http://localhost:8080`

### Configuration

**Fichier :** `docker-compose.yml`

```yaml
services:
  api:
    image: php:8.2-apache
    ports:
      - "8080:80"
    volumes:
      - ./api:/var/www/html  # Modifiable à chaud
      - kelio_data:/tmp
```

**Avantages :**
- ✅ Modifications de l'API instantanées (volume monté)
- ✅ HMR pour le frontend
- ✅ Pas besoin de rebuild

### Arrêter le dev

```bash
# Arrêter Vite : Ctrl+C dans le terminal

# Arrêter l'API Docker
docker-compose down
```

---

## 🚀 Production

### Build complet

```bash
pnpm build
```

Crée le dossier `dist/` avec :
- Frontend compilé (optimisé)
- API PHP copiée (avec ses propres configurations)

### Lancer la preview locale

```bash
pnpm preview
```

Ce script va :
1. Vérifier que `dist/` existe
2. Builder l'image Docker depuis le Dockerfile
3. Démarrer un conteneur avec le build de production

### Configuration

**Fichier :** `docker-compose.prod.yml`

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: quel-io:latest
    container_name: quel-io-prod
    ports:
      - "9876:80"
```

**Fichier :** `Dockerfile`

Optimisations :
- ✅ Extensions PHP (cURL) préinstallées
- ✅ Apache mod_rewrite activé
- ✅ Configuration PHP pour la production
- ✅ Permissions correctes (www-data)
- ✅ Application copiée dans l'image (pas de volume)

### Arrêter la production

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## 🔍 Commandes utiles

### Voir les logs

```bash
# Logs du dev (API uniquement, Vite est dans le terminal)
docker-compose logs -f api

# Logs de la production
docker-compose -f docker-compose.prod.yml logs -f web
```

### Inspecter les conteneurs

```bash
# Liste des conteneurs actifs
docker ps

# Entrer dans le conteneur de dev
docker exec -it quelio-api-1 bash

# Entrer dans le conteneur de prod
docker exec -it quel-io-prod bash
```

### Rebuild l'image de production

```bash
# Rebuild sans cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Rebuild et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build
```

### Nettoyer les images

```bash
# Supprimer l'image de production
docker rmi quel-io:latest

# Nettoyer toutes les images non utilisées
docker image prune -a

# Nettoyer tout Docker (⚠️ supprime TOUT)
docker system prune -a --volumes
```

---

## 📦 Déploiement en production

### Option 1 : Docker (recommandé)

1. **Sur le serveur**, clonez le projet
2. Build l'application :
   ```bash
   pnpm install
   pnpm build
   ```
3. Construisez et lancez l'image Docker :
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### Option 2 : Upload manuel

1. **En local**, build l'application :
   ```bash
   pnpm build
   ```
2. Uploadez le contenu de `dist/` sur votre serveur
3. Configurez Apache pour pointer vers ce dossier

---

## 🛠️ Personnalisation

### Changer les ports

**Dev :**
- Modifier `docker-compose.yml` ligne `ports: - "8080:80"`
- Modifier `vite.config.ts` ligne `target: 'http://127.0.0.1:8080'`

**Prod :**
- Modifier `docker-compose.prod.yml` ligne `ports: - "9876:80"`

### Ajouter des extensions PHP

Modifiez le `Dockerfile` :

```dockerfile
RUN apt-get install -y \
    libcurl4-openssl-dev \
    libpq-dev \  # Pour PostgreSQL
    && \
docker-php-ext-install curl pdo pdo_pgsql
```

### Variables d'environnement

Ajoutez dans `docker-compose.prod.yml` :

```yaml
services:
  web:
    environment:
      - APP_ENV=production
      - API_KEY=your-secret-key
```

---

## 🐛 Troubleshooting

### L'API ne répond pas

```bash
# Vérifier que le conteneur tourne
docker ps

# Voir les logs
docker logs quelio-api-1

# Redémarrer
docker-compose restart api
```

### L'image de prod ne se build pas

```bash
# Vérifier que dist/ existe
ls -la dist/

# Rebuild sans cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :9876

# Le tuer
kill -9 <PID>
```

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [PHP Docker Official Images](https://hub.docker.com/_/php)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

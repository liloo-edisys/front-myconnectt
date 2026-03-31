# Déploiement et Environnements MyConnectt

## 🌍 Environnements Disponibles

L'application MyConnectt est déployée sur **Microsoft Azure App Service** avec 5 environnements distincts pour supporter le cycle de développement complet.

### Vue d'Ensemble des Environnements

| Environnement | Usage | Stabilité | Accès |
|---------------|-------|-----------|-------|
| **DEV** | Développement actif | Instable | Développeurs uniquement |
| **Integration (INT)** | Tests d'intégration | Modérée | QA + Développeurs |
| **Staging (UAT)** | User Acceptance Testing | Stable | Clients + QA |
| **PreProd** | Validation finale pré-production | Très stable | Clients sélectionnés |
| **Production (PROD)** | Utilisateurs finaux | Stable | Tous les utilisateurs |

## 📋 Configuration des Environnements

### 1. Development (DEV)

**Fichier**: `.env.dev`

```bash
# URL de l'API backend
REACT_APP_WEBAPI_URL=https://myconnectt-dev-api-goczcjexd8gyesg4.northeurope-01.azurewebsites.net/

# URL publique de l'application
PUBLIC_URL=http://localhost:3000/

# Tenant ID
REACT_APP_TENANT_ID=1

# Mode de déploiement
REACT_APP_DEPLOY_URL=DEV
```

**Commandes**:
```bash
# Démarrage local
npm start

# Build
npm run build:dev

# Sortie: /dev
```

**Docker**: `Dockerfile.DEV`

---

### 2. Integration (INT)

**Fichier**: `.env.integration`

```bash
REACT_APP_WEBAPI_URL=https://myconnectt-back-int.azurewebsites.net/
PUBLIC_URL=https://myconnectt-front-int.azurewebsites.net/
REACT_APP_TENANT_ID=1
REACT_APP_DEPLOY_URL=INT
```

**Commandes**:
```bash
npm run build:int
# Sortie: /int
```

**URL**: https://myconnectt-front-int.azurewebsites.net/

---

### 3. Staging (UAT)

**Fichier**: `.env.staging`

```bash
REACT_APP_WEBAPI_URL=https://myconnectt-back-uat.azurewebsites.net/
PUBLIC_URL=https://myconnectt-front-uat.azurewebsites.net/
REACT_APP_TENANT_ID=1
REACT_APP_DEPLOY_URL=UAT
```

**Commandes**:
```bash
npm run build:staging
# Sortie: /uat
```

**URL**: https://myconnectt-front-uat.azurewebsites.net/

---

### 4. PreProd

**Fichier**: `.env.preprod`

```bash
REACT_APP_WEBAPI_URL=https://myconnectt-back-preprod.azurewebsites.net/
PUBLIC_URL=https://myconnectt-front-preprod.azurewebsites.net/
REACT_APP_TENANT_ID=1
REACT_APP_DEPLOY_URL=PREPROD
```

**Commandes**:
```bash
npm run build:preprod
# Sortie: /preprod
```

**Docker**: `Dockerfile.PREPROD`

---

### 5. Production (PROD)

**Fichier**: `.env.production`

```bash
REACT_APP_WEBAPI_URL=https://myconnectt-apiback-prod.azurewebsites.net/
PUBLIC_URL=https://portail.myconnectt.fr/
REACT_APP_TENANT_ID=1
REACT_APP_DEPLOY_URL=PROD
```

**Commandes**:
```bash
npm run build
# Sortie: /prod
```

**Docker**: `Dockerfile.PROD`

**URL Production**: https://portail.myconnectt.fr/

---

## 🐳 Configuration Docker

### Architecture Multi-Stage

Tous les Dockerfiles utilisent une architecture **multi-stage build** pour optimiser la taille des images:

1. **Stage 1: Build** - Compilation de l'application React
2. **Stage 2: Runtime** - Image légère avec uniquement les fichiers statiques

### Dockerfile.DEV

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM node:16.20.2-alpine3.18 AS build

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Copie du code source
COPY . .

# Build de l'application (environnement DEV)
RUN npm run build:dev

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:16.20.2-alpine3.18

# Copie des fichiers buildés depuis le stage précédent
COPY --from=build /app/dev myconnectt

# Exposition du port
EXPOSE 3000

# Commande de démarrage (serve statique)
CMD ["npx", "serve", "-s", "myconnectt"]
```

**Caractéristiques**:
- Image de base: `node:16.20.2-alpine3.18` (légère)
- Flag: `--legacy-peer-deps` (résout conflits de dépendances)
- Port: 3000
- Serveur statique: `serve`

---

### Dockerfile.PREPROD

```dockerfile
FROM node:16.20.2 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build:preprod

FROM node:16.20.2
COPY --from=build /app/preprod preprod
EXPOSE 3000
CMD ["npx", "serve", "-s", "preprod"]
```

**Différences avec DEV**:
- Image de base: `node:16.20.2` (standard, pas Alpine)
- Build: `build:preprod` au lieu de `build:dev`
- Dossier de sortie: `/app/preprod`

---

### Dockerfile.PROD

```dockerfile
FROM node:16.20.2 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:16.20.2
COPY --from=build /app/prod prod
EXPOSE 3000
CMD ["npx", "serve", "-s", "prod"]
```

**Caractéristiques Production**:
- Build: script par défaut `npm run build`
- Dossier: `/app/prod`
- Configuration optimisée pour la production

---

## 📦 Scripts de Build

### Package.json Scripts

```json
{
  "scripts": {
    // Développement local
    "start": "react-app-rewired start -o",
    
    // Builds par environnement
    "build:dev": "env-cmd -f .env.dev react-app-rewired build && mv build dev",
    "build:int": "env-cmd -f .env.integration react-app-rewired build && mv build int",
    "build:staging": "env-cmd -f .env.staging react-app-rewired build && mv build uat",
    "build:preprod": "env-cmd -f .env.preprod react-app-rewired build && mv build preprod",
    "build": "react-app-rewired build && mv build prod",
    
    // Qualité de code
    "lint": "eslint src",
    "lint:fix": "eslint --fix src",
    "format": "prettier --write \"src/**/*.{js,css,scss,html}\"",
    
    // Tests
    "test": "react-app-rewired test"
  }
}
```

### Explication des Scripts de Build

**Structure d'un script de build**:

```bash
env-cmd -f .env.{environment} react-app-rewired build && mv build {output-folder}
```

**Composants**:

1. **`env-cmd -f .env.{environment}`**
   - Charge les variables d'environnement depuis le fichier `.env` spécifique
   - Package: `env-cmd`

2. **`react-app-rewired build`**
   - Lance le build Create React App avec config overrides
   - Package: `react-app-rewired`
   - Génère un dossier `/build` optimisé

3. **`&& mv build {output-folder}`**
   - Renomme le dossier `build` selon l'environnement
   - Permet de garder plusieurs builds en parallèle

**Exemple de flux**:

```bash
npm run build:int
  ↓
env-cmd charge .env.integration
  ↓
react-app-rewired lit REACT_APP_WEBAPI_URL, etc.
  ↓
Webpack compile avec ces variables
  ↓
Sortie dans /build
  ↓
Dossier renommé en /int
```

---

## 🔧 Configuration React App Rewired

### config-overrides.js

**Fichier**: `/config-overrides.js`

```javascript
module.exports = function override(config, env) {
  // Customisations webpack sans eject
  // Utilisé pour modifier la configuration par défaut de CRA
  
  return config;
}
```

**Avantages**:
- Pas besoin d'éjecter Create React App
- Garde les avantages de CRA (mises à jour, simplicité)
- Permet des customisations ciblées

### webpack.config.js (RTL Support)

**Fichier**: `/webpack.config.js`

```javascript
const WebpackRTLPlugin = require('webpack-rtl-plugin');

module.exports = {
  plugins: [
    new WebpackRTLPlugin()
  ]
};
```

**Usage**: Support des langues Right-to-Left (Arabe, Hébreu, etc.)

---

## 🚀 Processus de Déploiement

### Workflow de Déploiement Type

```
┌──────────────────────────────────────────────────────────────┐
│ 1. DÉVELOPPEMENT LOCAL                                       │
└──────────────────────────────────────────────────────────────┘
    npm start (localhost:3000)
    Modifications et tests en local
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. COMMIT & PUSH                                             │
└──────────────────────────────────────────────────────────────┘
    git add .
    git commit -m "Feature: ..."
    git push origin develop
    ↓ (Husky pre-commit hooks: lint + format)
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. BUILD DOCKER IMAGE (CI/CD)                                │
└──────────────────────────────────────────────────────────────┘
    docker build -f Dockerfile.DEV -t myconnectt-dev .
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. PUSH TO AZURE CONTAINER REGISTRY                          │
└──────────────────────────────────────────────────────────────┘
    docker push <registry>/myconnectt-dev:latest
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. DEPLOY TO AZURE APP SERVICE (DEV)                         │
└──────────────────────────────────────────────────────────────┘
    Azure Web App pulls image
    Container started on App Service
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. TESTS QA (Integration)                                    │
└──────────────────────────────────────────────────────────────┘
    Merge to integration branch
    Build & Deploy to INT environment
    QA testing
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. UAT (Staging)                                             │
└──────────────────────────────────────────────────────────────┘
    Merge to staging branch
    Build & Deploy to UAT environment
    Client acceptance testing
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 8. PREPROD VALIDATION                                        │
└──────────────────────────────────────────────────────────────┘
    Merge to preprod branch
    Final validation with production-like config
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 9. PRODUCTION DEPLOYMENT                                     │
└──────────────────────────────────────────────────────────────┘
    Merge to main/master branch
    Build & Deploy to PROD
    https://portail.myconnectt.fr/ LIVE
```

---

## 🔐 Azure App Service Configuration

### Configuration Recommandée

**App Service Plan**:
- Tier: Standard ou Premium
- OS: Linux
- Runtime: Docker Container

**Application Settings** (Variables d'environnement):

```bash
WEBSITES_PORT=3000
DOCKER_REGISTRY_SERVER_URL=https://<your-registry>.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME=<username>
DOCKER_REGISTRY_SERVER_PASSWORD=<password>
```

**Deployment Center**:
- Source: Azure Container Registry
- Continuous deployment: Enabled
- Webhook: Configured for auto-deploy on image push

**Custom Domain** (Production):
- Domain: `portail.myconnectt.fr`
- SSL: Managed Certificate (Let's Encrypt ou Azure)
- HTTPS Only: Enabled

---

## 🧪 Validation des Builds

### Checklist Avant Déploiement

```bash
# 1. Lint
npm run lint

# 2. Format
npm run format

# 3. Tests (si disponibles)
npm test

# 4. Build local test
npm run build:dev

# 5. Test du build local
npx serve -s dev

# 6. Vérification des variables d'environnement
# S'assurer que les .env contiennent les bonnes URLs

# 7. Build Docker local
docker build -f Dockerfile.DEV -t myconnectt-test .

# 8. Test du container Docker
docker run -p 3000:3000 myconnectt-test
# Vérifier sur http://localhost:3000
```

---

## 📊 Monitoring et Logs

### Azure Application Insights (Recommandé)

**Configuration**:

```javascript
// Dans index.js
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.REACT_APP_APPINSIGHTS_KEY,
    enableAutoRouteTracking: true
  }
})

appInsights.loadAppInsights()
appInsights.trackPageView()
```

**Métriques Trackées**:
- Page views
- Temps de chargement
- Erreurs JavaScript
- Performances API
- Custom events

### Logs Docker

```bash
# Logs en temps réel
docker logs -f <container-id>

# Logs Azure App Service
az webapp log tail --name myconnectt-front-prod --resource-group <rg-name>
```

---

## 🔄 Rollback Strategy

### En cas de problème en Production

**Option 1: Rollback via Azure Portal**

```
Azure Portal
  → App Service
  → Deployment Center
  → Previous Deployments
  → Select stable version
  → Redeploy
```

**Option 2: Rollback Git + Redeploy**

```bash
# Identifier le dernier commit stable
git log --oneline

# Revert au commit stable
git revert <bad-commit-hash>

# Push
git push origin main

# CI/CD redéploie automatiquement
```

**Option 3: Déploiement manuel d'une ancienne image**

```bash
# Pull l'ancienne image stable
docker pull <registry>/myconnectt-prod:<stable-tag>

# Re-tag comme latest
docker tag <registry>/myconnectt-prod:<stable-tag> <registry>/myconnectt-prod:latest

# Push
docker push <registry>/myconnectt-prod:latest

# Azure App Service redémarre automatiquement
```

---

## 📈 Optimisations de Build

### Réduction de la Taille du Bundle

**1. Code Splitting (déjà implémenté)**:
```javascript
// React.lazy pour les routes
const Dashboard = React.lazy(() => import('./Dashboard'))
```

**2. Analyse du Bundle**:
```bash
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

**3. Compression Gzip/Brotli** (Azure App Service):
- Activé automatiquement sur Azure
- Réduit la taille de transfert de ~70%

**4. CDN pour Assets Statiques**:
- Images, fonts → Azure CDN
- Réduit la latence

### Variables d'Optimisation

```bash
# Production build optimisé
GENERATE_SOURCEMAP=false  # Pas de sourcemaps en prod
INLINE_RUNTIME_CHUNK=false
IMAGE_INLINE_SIZE_LIMIT=0  # Pas d'inlining d'images
```

---

## 🎯 Checklist de Déploiement

### Avant Chaque Déploiement

- [ ] Code review approuvé
- [ ] Tests passent
- [ ] Lint + Format OK
- [ ] Variables d'environnement vérifiées
- [ ] Build local testé
- [ ] Docker image buildée et testée
- [ ] Backup BDD effectué (backend)
- [ ] Rollback plan préparé
- [ ] Équipe notifiée
- [ ] Fenêtre de maintenance communiquée (si nécessaire)

### Après Déploiement

- [ ] Vérification des logs (pas d'erreurs)
- [ ] Tests smoke sur l'environnement
- [ ] Fonctionnalités critiques testées
- [ ] Performance vérifiée (temps de chargement)
- [ ] Monitoring activé
- [ ] Documentation mise à jour
- [ ] Équipe notifiée du succès

---

## 🆘 Troubleshooting

### Problèmes Courants

**1. Build échoue avec erreur de mémoire**

```bash
# Augmenter la mémoire Node.js
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

**2. Docker image trop volumineuse**

```dockerfile
# Utiliser Alpine Linux
FROM node:16.20.2-alpine3.18

# Nettoyer le cache npm
RUN npm cache clean --force
```

**3. Variables d'environnement non chargées**

```javascript
// Vérifier le préfixe REACT_APP_
console.log(process.env.REACT_APP_WEBAPI_URL)

// Rebuild nécessaire après changement .env
npm run build
```

**4. Port 3000 déjà utilisé**

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

**5. Container ne démarre pas sur Azure**

```bash
# Vérifier les logs
az webapp log tail --name <app-name> --resource-group <rg>

# Vérifier le port exposé
EXPOSE 3000  # Dans Dockerfile
WEBSITES_PORT=3000  # Dans App Service Settings
```

---

**Prochaines étapes**: Voir [API_INTEGRATION.md](./API_INTEGRATION.md) pour l'intégration API

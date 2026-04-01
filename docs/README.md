# MyConnectt - Documentation Technique

Bienvenue dans la documentation technique de **MyConnectt**, une application React de gestion de missions et d'intérimaires.

## 📚 Table des Matières

1. [Architecture de l'Application](./ARCHITECTURE.md)
   - Structure du projet
   - Technologies utilisées
   - Gestion d'état avec Redux
   - Organisation des composants

2. [Système d'Authentification](./AUTHENTICATION.md)
   - Mécanisme JWT
   - Flux de connexion/déconnexion
   - Protection des routes
   - Gestion des tokens

3. [Authentification OTP BackOffice](./OTP_AUTHENTICATION.md) ⭐ **NOUVEAU**
   - Authentification à deux facteurs (2FA)
   - Page de demande de code OTP (email)
   - Page de vérification du code à 6 chiffres
   - Intégration Redux complète
   - Sécurité et bonnes pratiques

4. [Flux d'Authentification par Cookies](./COOKIE_AUTHENTICATION_FLOW.md) 🔐 **NOUVEAU**
   - Explication détaillée des cookies HTTP-Only
   - Où et comment les cookies sont vérifiés
   - Flux complet d'authentification
   - Refresh automatique des tokens
   - Guide de débogage

4a. [✅ Configuration Backend Confirmée](./BACKEND_CONFIRMED_CONFIG.md) 🎯 **IMPORTANT**
   - Backend ASP.NET Core correctement configuré
   - Durées réelles: Access Token 5 min, Refresh Token 7 jours
   - Configuration testée et fonctionnelle
   - Comparaison avec documentation initiale
   - Action corrective appliquée (refresh timer 4 min)

5. [Dépannage - Cookies Non Définis](./TROUBLESHOOTING_COOKIES.md) 🔧 **NOUVEAU**
   - Diagnostic: Cookies accessToken/refreshToken absents
   - Configuration backend requise (ASP.NET Core, Node.js)
   - Configuration CORS avec AllowCredentials
   - Tests avec cURL et Postman
   - Solutions par environnement (Dev, Azure, Prod)

5a. [🔧 Dépannage - Redirection Après Login](./TROUBLESHOOTING_LOGIN_REDIRECT.md) 🆘 **IMPORTANT**
   - Diagnostic: Redirection immédiate vers /auth/login après login
   - Cookies qui disparaissent après authentification
   - Guide de débogage complet avec logs
   - Solutions pour problèmes backend/CORS/Secure
   - Checklist complète frontend + backend

5b. [🐛 Débogage - isAuthenticated=true mais user=null](./DEBUG_OTP_USER_NULL.md) 🔥 **NOUVEAU**
   - Diagnostic: isAuthenticated est true mais user est null après OTP
   - Logs de débogage détaillés ajoutés
   - 5 scénarios de problèmes avec solutions
   - Tests manuels pour identifier la cause
   - Checklist de diagnostic complète

6. [Environnements et Déploiement](./DEPLOYMENT.md)
   - Environnements disponibles
   - Configuration Docker
   - Scripts de build
   - Déploiement Azure

7. [API et Intégration Backend](./API_INTEGRATION.md)
   - Configuration Axios
   - Endpoints principaux
   - Intercepteurs de requêtes
   - Gestion des erreurs

## 🎯 Objectif de cette Documentation

Cette documentation est destinée aux:
- **Développeurs** rejoignant le projet
- **Agents IA** nécessitant une compréhension du contexte
- **Équipes DevOps** gérant le déploiement
- **Architectes** évaluant les choix techniques

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm start

# Build pour production
npm run build
```

## 📦 Technologies Principales

- **Frontend**: React 16.12.0
- **State Management**: Redux + Redux Saga
- **UI Framework**: Material-UI v4
- **HTTP Client**: Axios
- **Routing**: React Router DOM v5
- **Forms**: Formik + Yup
- **Build**: Create React App + react-app-rewired

## 🔐 Rôles Utilisateurs

L'application supporte trois types d'utilisateurs:
- **Interimaire** (userType = 0): Travailleurs temporaires
- **Client** (userType = 1): Entreprises clientes
- **BackOffice** (userType = 2): Administrateurs

## 📝 Conventions de Développement

- Code formaté avec **Prettier**
- Linting avec **ESLint**
- Hooks Git avec **Husky** (pre-commit)
- Structure Redux avec pattern Actions/Reducers/Sagas

## 🔗 Ressources Externes

- [React Documentation](https://reactjs.org/)
- [Redux Documentation](https://redux.js.org/)
- [Material-UI Documentation](https://v4.mui.com/)
- [Create React App](https://create-react-app.dev/)

---

**Version**: 7.1.0  
**Dernière mise à jour**: Mars 2026

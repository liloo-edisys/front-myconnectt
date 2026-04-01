# Résumé: Correction de l'en-tête Authorization

## Problème Identifié

Vous avez signalé que lors des appels API, les en-têtes étaient vides. L'application utilisait `withCredentials: true` pour envoyer automatiquement les cookies, mais le backend attend en réalité :

- **Access token** dans l'en-tête `Authorization: Bearer <token>` pour les appels API
- **Refresh token** dans les cookies (uniquement pour le endpoint de refresh)

## Solution Implémentée

### Architecture Actuelle

```
┌─────────────────────────────────────────────────────┐
│ Connexion OTP                                       │
│ ↓                                                   │
│ Backend renvoie:                                    │
│ - Données utilisateur                               │
│ - accessToken (dans le body de la réponse)         │
│ - refreshToken (dans un cookie HTTP-Only)          │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Frontend stocke:                                    │
│ - user → Redux (persisté dans localStorage)        │
│ - accessToken → Redux (NON persisté pour sécurité) │
│ - refreshToken → Cookie (automatique)              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│ Appel API:                                          │
│ Headers:                                            │
│   Authorization: Bearer <accessToken>               │
│   X-Client-Type: webapp                             │
│   X-Api-Version: 2                                  │
│ Cookies: refreshToken (envoyé automatiquement)     │
└─────────────────────────────────────────────────────┘
```

### Flux de Refresh Token

```
┌─────────────────────────────────────────────────────┐
│ Appel API renvoie 401                               │
│ ↓                                                   │
│ POST /api/user/RefreshToken                        │
│ - Cookie: refreshToken (envoyé automatiquement)    │
│ ↓                                                   │
│ Backend renvoie:                                    │
│ - Nouveau accessToken (dans le body)               │
│ - Nouveau refreshToken (dans cookie)               │
│ ↓                                                   │
│ Frontend met à jour Redux avec nouveau accessToken │
│ ↓                                                   │
│ Réessaie la requête échouée avec nouveau token     │
└─────────────────────────────────────────────────────┘
```

## Modifications Apportées

### 1. `AuthReducers.js`
- ✅ Ajout de `accessToken` dans le state Redux
- ✅ Extraction de `accessToken` lors de l'action `CLIENT_USER__SUCCESS`
- ✅ Ajout du handler `UPDATE_ACCESS_TOKEN` pour le refresh

### 2. `OTPAuthSagas.js`
- ✅ Extraction de `accessToken` de la réponse d'authentification
- ✅ Dispatch de l'accessToken avec les données utilisateur

### 3. `OTPAuthActions.js`
- ✅ Nouvelle action `UPDATE_ACCESS_TOKEN`
- ✅ Action creator `updateAccessToken(accessToken)`

### 4. `setupAxios.js`
- ✅ Lecture de `accessToken` depuis Redux (`state.auth.accessToken`)
- ✅ Ajout de `Authorization: Bearer ${accessToken}` à toutes les requêtes
- ✅ Extraction du nouvel access token après refresh
- ✅ Mise à jour de Redux avec le nouveau token
- ✅ Refresh proactif toutes les 4 minutes

## Comment Tester

### 1. Vérifier l'en-tête Authorization après connexion

**DevTools du navigateur → Onglet Network:**

1. Se connecter avec OTP
2. Naviguer vers le dashboard
3. Trouver un appel API (ex: `getDashboardData`)
4. Cliquer sur la requête → Onglet Headers
5. Vérifier la présence de:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2. Vérifier le token dans Redux

**Console du navigateur:**

```javascript
// Après connexion, vérifier l'état Redux
window.store.getState().auth

// Devrait afficher:
{
  user: { userID: 123, ... },
  accessToken: "eyJhbGc...",  // Présent
  loading: false
}
```

### 3. Vérifier que le token n'est PAS dans localStorage

**DevTools → Application → Local Storage:**

- Vérifier la clé `persist:myconnectt-auth`
- Doit contenir les données `user`
- Ne doit PAS contenir `accessToken` (sécurité)

### 4. Simuler un refresh de token

**Console du navigateur:**

```javascript
// Surveiller les changements de token
let prevToken = null;
setInterval(() => {
  const currentToken = window.store.getState().auth?.accessToken;
  if (currentToken !== prevToken) {
    console.log('Access token a changé!');
    console.log('Ancien:', prevToken?.substring(0, 20) + '...');
    console.log('Nouveau:', currentToken?.substring(0, 20) + '...');
    prevToken = currentToken;
  }
}, 1000);
```

Attendre 4-5 minutes, vous devriez voir le token changer.

## Sécurité

### ✅ Bonnes Pratiques Implémentées

1. **Access Token NON Persisté**
   - Stocké dans Redux (mémoire uniquement)
   - Perdu lors du rafraîchissement de page
   - Empêche le vol de token depuis localStorage

2. **Refresh Token dans Cookie HTTP-Only**
   - Non accessible en JavaScript
   - Protégé contre les attaques XSS
   - Envoyé automatiquement par le navigateur

3. **Access Token de Courte Durée**
   - Expire en 5 minutes
   - Limite les dégâts en cas de vol
   - Refresh proactif à 4 minutes

4. **Refresh Token de Longue Durée**
   - Validité de 7 jours
   - Utilisé uniquement pour /RefreshToken
   - Peut être révoqué côté serveur

## Exigences Backend

Pour que cette implémentation fonctionne, le backend doit:

### 1. Endpoint d'Authentification (`/api/user/Authenticate`)

Retourner dans le body de la réponse:
```json
{
  "userID": 123,
  "userName": "John Doe",
  "email": "john@example.com",
  "tenantID": 1,
  "userType": 1,
  "accessToken": "eyJhbGc..."  // ← Requis
}
```
+ Set-Cookie: refreshToken (HTTP-Only)

### 2. Endpoint de Refresh (`/api/user/RefreshToken`)

- Attend: cookie refreshToken
- Retourne:
```json
{
  "accessToken": "eyJhbGc..."  // ← Nouveau token
}
```
+ Set-Cookie: refreshToken (nouveau)

### 3. Endpoints API (tous les autres)

- Attendent: en-tête `Authorization: Bearer <accessToken>`
- Valident le token
- Retournent 401 si invalide/expiré

### 4. Endpoint de Révocation (`/api/user/RevokeToken`)

- Attend: cookie refreshToken
- Invalide le token côté serveur
- Efface le cookie

## Dépannage

### Problème: En-tête Authorization vide

**Vérifier:**
```javascript
// L'état Redux a-t-il le accessToken?
console.log(window.store.getState().auth.accessToken);
```

**Si null après connexion:**
- Vérifier la console pour les logs OTPAuthSaga
- Chercher "Access token extracted: present/missing"
- Le backend n'envoie peut-être pas l'accessToken dans la réponse

**Solution:**
- Vérifier que le backend retourne `accessToken` dans le body
- Vérifier le nom du champ (peut être `AccessToken` avec majuscule)

### Problème: Token non mis à jour après refresh

**Vérifier:**
1. Onglet Network → Réponse de RefreshToken
2. Le body de la réponse doit contenir `accessToken`
3. Vérifier la console pour "[setupAxios] New access token received"

**Solution:**
- Vérifier que le backend retourne le nouveau token
- Vérifier la casse du nom de champ

## Documentation Complète

Voir `docs/ACCESS_TOKEN_AUTHORIZATION_HEADER.md` pour:
- Diagrammes d'architecture détaillés
- Procédures de test étape par étape
- Guide de dépannage complet
- Considérations de sécurité
- Exigences backend détaillées

## Résumé des Changements

| Fichier | Modification |
|---------|-------------|
| `src/business/reducers/share/AuthReducers.js` | Stockage de accessToken dans Redux |
| `src/business/sagas/shared/OTPAuthSagas.js` | Extraction de accessToken de la réponse |
| `src/business/actions/shared/OTPAuthActions.js` | Nouvelle action UPDATE_ACCESS_TOKEN |
| `src/business/setupAxios.js` | Ajout de l'en-tête Authorization |
| `docs/ACCESS_TOKEN_AUTHORIZATION_HEADER.md` | Guide complet (NOUVEAU) |

---

**Statut**: ✅ Implémenté et Prêt pour Test  
**Date**: 2026-04-01  
**Commit**: f2444c7

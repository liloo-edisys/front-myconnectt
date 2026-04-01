# Comparaison visuelle : Next.js vs React App

## Architecture identique : Token dans Authorization header

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS + NEXT-AUTH                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Login → Backend                                                 │
│     POST /api/auth/callback                                         │
│     Response:                                                       │
│       Body: { user: {...}, accessToken: "eyJ..." }                  │
│       Cookie: refreshToken=xyz; HttpOnly                            │
│                                                                     │
│  2. next-auth stocke                                                │
│     ├─ accessToken → cookie serveur (ou JWT session)                │
│     └─ refreshToken → cookie HTTP-Only                              │
│                                                                     │
│  3. Requête API → pages/api/data.js                                 │
│     Browser → Next.js Server → Backend API                          │
│     ├─ getToken() lit le token                                      │
│     └─ Next.js ajoute: Authorization: Bearer <token>                │
│                                                                     │
│  4. Résultat dans Backend                                           │
│     Headers: { Authorization: "Bearer eyJ..." }   ✅                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   REACT APP ACTUELLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Login → Backend                                                 │
│     POST /api/user/Authenticate                                     │
│     Response:                                                       │
│       Body: { userID, userName, accessToken: "eyJ..." }             │
│       Cookie: refreshToken=xyz; HttpOnly                            │
│                                                                     │
│  2. OTPAuthSagas.js extrait                                         │
│     ├─ accessToken → Redux state.auth.accessToken (mémoire)         │
│     └─ refreshToken → cookie HTTP-Only (automatique)                │
│                                                                     │
│  3. Requête API → setupAxios.js interceptor                         │
│     Browser → Backend API (direct)                                  │
│     ├─ Lit accessToken de Redux                                     │
│     └─ Ajoute: Authorization: Bearer <token>                        │
│                                                                     │
│  4. Résultat dans Backend                                           │
│     Headers: { Authorization: "Bearer eyJ..." }   ✅                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Même résultat : Authorization header avec token

Les deux envoient **exactement** le même header au backend :

```http
GET /api/user/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
Cookie: refreshToken=xyz123...
X-Client-Type: webapp
```

## Différence clé : Où le token est ajouté

### Next.js : Serveur Next.js ajoute le token

```
User → Browser → Next.js Server → Backend API
                      │
                      └─> Ajoute Authorization header ici
```

**Code Next.js** :
```javascript
// pages/api/users/profile.js
import { getToken } from "next-auth/jwt"

export default async function handler(req, res) {
  const token = await getToken({ req })
  
  const response = await fetch('https://backend-api.com/user/profile', {
    headers: {
      'Authorization': `Bearer ${token.accessToken}`  // ← Ajouté par Next.js
    }
  });
  
  res.json(await response.json());
}
```

### React : Browser ajoute le token

```
User → Browser → Backend API
         │
         └─> Ajoute Authorization header ici
```

**Code React** :
```javascript
// src/business/setupAxios.js
axios.interceptors.request.use(config => {
  const accessToken = store.getState().auth?.accessToken;
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;  // ← Ajouté par Browser
  }
  
  return config;
});
```

## Avantages et inconvénients

| Aspect | Next.js (serveur) | React (client) |
|--------|-------------------|----------------|
| **Sécurité du token** | ✅ Token inaccessible au JS client | ⚠️ Token en mémoire (perdu au refresh) |
| **Performance** | ⚠️ Requête passe par serveur Next.js | ✅ Requête directe au backend |
| **Simplicité** | ⚠️ Nécessite API routes Next.js | ✅ Intercepteur axios simple |
| **Scalabilité** | ⚠️ Serveur Next.js doit gérer toutes les requêtes | ✅ Pas de serveur intermédiaire |
| **Protection XSS** | ✅ Token dans cookie HTTP-Only serveur | ✅ Token en mémoire, pas persisté |
| **Refresh de page** | ✅ Token persiste (cookie serveur) | ⚠️ Token perdu, doit refresh (mais automatique) |

## Sécurité : Les deux approches sont sûres

### Next.js : Token dans cookie serveur
```javascript
// Token stocké dans un cookie HTTP-Only côté serveur
// JavaScript malveillant ne peut PAS y accéder
// ✅ Protégé contre XSS

// Mais le serveur Next.js peut être une cible
```

### React : Token en mémoire (Redux)
```javascript
// Token dans Redux state (RAM du browser)
// JavaScript malveillant POURRAIT y accéder pendant la session
// Mais perdu au refresh de page
// ✅ Pas de persistence = pas de vol à long terme

// Token JAMAIS sauvegardé sur disque
// (voir AuthReducers.js ligne 10: accessToken n'est pas dans whitelist)
```

## Flux de refresh automatique

### Next.js
```
Token expiré → Browser appelle Next.js API route
            → Next.js lit refreshToken du cookie
            → Next.js appelle Backend /refresh
            → Next.js reçoit nouveau accessToken
            → Next.js met à jour cookie serveur
            → Requête originale relancée
```

### React App
```
Token expiré (401) → setupAxios interceptor détecte
                   → Appelle Backend /RefreshToken (avec cookie)
                   → Backend lit refreshToken du cookie HTTP-Only
                   → Backend retourne nouveau accessToken dans body
                   → Frontend met à jour Redux state
                   → Requête originale relancée
```

**Résultat identique** : Token refreshed automatiquement ✅

## Proactive Refresh (React uniquement)

La React app a un **avantage supplémentaire** :

```javascript
// src/business/setupAxios.js ligne 26
const PROACTIVE_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes

// Refresh le token AVANT qu'il expire (5 min)
setInterval(async () => {
  const response = await axios.post('/api/user/RefreshToken');
  const newAccessToken = response.data?.accessToken;
  store.dispatch(updateAccessToken(newAccessToken));
}, PROACTIVE_REFRESH_INTERVAL);
```

✅ **Avantage** : L'utilisateur ne voit jamais de 401 pendant qu'il utilise l'app !

## Exemple de validation dans DevTools

### 1. Vérifiez le token dans Redux (React)

```javascript
// Chrome DevTools → Console
const state = window.store.getState();
console.log({
  hasAccessToken: !!state.auth.accessToken,
  tokenPreview: state.auth.accessToken?.substring(0, 20) + "...",
  user: state.auth.user?.userName,
  isAuthenticated: !!state.auth.user
});

// Output:
// {
//   hasAccessToken: true,
//   tokenPreview: "eyJhbGciOiJIUzI1NiIs...",
//   user: "John Doe",
//   isAuthenticated: true
// }
```

### 2. Vérifiez le header Authorization

```javascript
// Chrome DevTools → Network tab
// Filtrer par "XHR" ou "Fetch"
// Cliquer sur une requête API
// Regarder "Request Headers"

// Vous verrez:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: refreshToken=xyz...
X-Client-Type: webapp
X-Api-Version: 2
```

### 3. Testez le refresh automatique

```javascript
// Simuler un token expiré
const state = window.store.getState();
window.store.dispatch({
  type: 'UPDATE_ACCESS_TOKEN',
  payload: { accessToken: 'invalid-token' }
});

// Faire une requête
await axios.get('/api/user/profile');
// → Verra 401
// → Refresh automatique
// → Requête relancée avec nouveau token
// → Succès ✅
```

## Conclusion

### ✅ Les deux approches font la même chose :

1. **Extraient** l'accessToken du response
2. **Stockent** le token de manière sécurisée
3. **Ajoutent** `Authorization: ****** à chaque requête
4. **Refreshent** automatiquement quand expiré

### 🎯 Différence principale :

- **Next.js** : Serveur intermédiaire ajoute le header
- **React** : Browser ajoute le header directement

### 🏆 Résultat identique :

```http
Authorization: Bearer eyJhbGci...
```

**Votre backend ASP.NET Core reçoit exactement le même header dans les deux cas !**

---

**📚 Voir aussi** :
- `/docs/NEXTJS_COMPATIBILITY.md` - Documentation complète
- `/docs/ARCHITECTURE_COMPARISON.md` - Comparaison des architectures
- `src/business/setupAxios.js` - Code de l'intercepteur
- `src/business/sagas/shared/OTPAuthSagas.js` - Code d'extraction du token

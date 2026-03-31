# Flux d'Authentification par Cookies HTTP-Only

Ce document explique en détail comment fonctionne l'authentification basée sur les cookies HTTP-Only dans MyConnectt, et où/comment le système vérifie si un utilisateur est connecté.

## 🔑 Principe de Base

**Les tokens d'authentification NE SONT JAMAIS stockés dans le code JavaScript ou Redux.**

- ✅ Les tokens (`accessToken`, `refreshToken`) sont stockés dans des **cookies HTTP-Only** par le serveur
- ✅ Le navigateur envoie automatiquement ces cookies avec chaque requête HTTP
- ✅ Redux stocke UNIQUEMENT les **données utilisateur** (UserID, UserName, UserType, etc.)
- ❌ Les tokens ne sont JAMAIS accessibles au code JavaScript (protection XSS)

## 📍 Où sont les Cookies ? Comment sont-ils vérifiés ?

### 1️⃣ Configuration Axios - `withCredentials: true`

**Fichier:** `src/business/setupAxios.js` (ligne 68)

```javascript
axios.interceptors.request.use(
  config => {
    // ⭐ Cette ligne active l'envoi automatique des cookies
    config.withCredentials = true;
    
    // Les cookies sont automatiquement envoyés avec chaque requête
    return config;
  }
);
```

**Explication:**
- `withCredentials: true` indique à Axios d'inclure les cookies dans TOUTES les requêtes HTTP
- Le navigateur envoie automatiquement les cookies `accessToken` et `refreshToken` au serveur
- Le serveur vérifie le cookie `accessToken` pour chaque requête API
- Vous ne voyez PAS le code qui "lit" les cookies car c'est le **navigateur** qui le fait automatiquement

### 2️⃣ Authentification OTP - Réception des Cookies

**Fichier:** `src/business/api/shared/AuthApi.js` (ligne 213-223)

```javascript
export function authenticateWithOtp(data) {
  const tenantID = TENANTID;
  const { email, otp } = data;
  return axios.post(
    AUTHENTICATE_OTP_URL,
    { tenantID, email, otp },
    {
      withCredentials: true  // ⭐ Active la réception des cookies
    }
  );
}
```

**Explication:**
- Quand l'utilisateur entre son code OTP, l'API vérifie le code
- Si le code est valide, l'API **définit** les cookies dans la réponse HTTP:
  ```
  Set-Cookie: accessToken=xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=900
  Set-Cookie: refreshToken=yyy; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
  ```
- Le navigateur stocke automatiquement ces cookies
- JavaScript ne peut PAS lire ces cookies (HttpOnly)

### 3️⃣ Vérification de l'Authentification - Redux State

**Fichier:** `src/ui/Routes.js` (ligne 43)

```javascript
let { isAuthorized, isInterimaire, isBackOffice, isCustomer } = useSelector(
  ({ auth, user }) => ({
    isAuthorized: auth.user != null,  // ⭐ Vérifie si user existe
    isInterimaire: auth.user != null ? auth.user.userType === 0 : false,
    isCustomer: auth.user != null ? auth.user.userType === 1 : false,
    isBackOffice: auth.user != null ? auth.user.userType === 2 : false,
    user: user.user
  }),
  shallowEqual
);
```

**Explication:**
- On ne vérifie PAS les cookies directement (impossible en JavaScript)
- On vérifie si `auth.user` existe dans Redux
- Si `auth.user != null` → l'utilisateur est connecté
- Si `auth.user == null` → l'utilisateur n'est pas connecté

### 4️⃣ Stockage des Données Utilisateur - Saga

**Fichier:** `src/business/sagas/shared/OTPAuthSagas.js` (ligne 51-59)

```javascript
export function* authenticateOtpSaga({ payload }) {
  try {
    // ⭐ Appelle l'API (les cookies sont automatiquement envoyés)
    const response = yield call(authenticateWithOtpApi, payload);
    
    // ⭐ Stocke les DONNÉES utilisateur dans Redux (PAS les tokens!)
    yield put(authenticateOtpSuccess(response.data));
    
    // ⭐ Met à jour le reducer principal pour activer l'autorisation
    yield put(requestUser.success(response.data));
    
    toastr.success("Authentification réussie", "Vous êtes maintenant connecté");
  } catch (error) {
    yield put(authenticateOtpFailure(error.response?.data || error.message));
  }
}
```

**Explication:**
- L'API retourne les **données utilisateur** dans `response.data`:
  ```json
  {
    "UserID": 123,
    "UserName": "john.doe@example.com",
    "UserType": 2,
    "TenantID": 1,
    "CompanyName": "MyCompany"
  }
  ```
- Les **tokens sont dans les cookies** (Set-Cookie), pas dans le body
- Redux stocke uniquement les données utilisateur
- `Routes.js` peut maintenant voir `auth.user != null`

### 5️⃣ Refresh Automatique des Tokens

**Fichier:** `src/business/setupAxios.js` (ligne 91-164)

```javascript
axios.interceptors.response.use(
  response => response,
  async error => {
    // ⭐ Si on reçoit un 401 (token expiré)
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    
    try {
      // ⭐ Tente de rafraîchir le token
      await axios.post(
        REFRESH_TOKEN_ENDPOINT,
        {},
        { withCredentials: true }  // Envoie le refreshToken (cookie)
      );
      
      // ⭐ Le serveur renvoie un nouveau accessToken (cookie)
      // ⭐ Réessaye la requête originale avec le nouveau token
      return axios(originalRequest);
    } catch (refreshError) {
      // ⭐ Si le refresh échoue, déconnexion
      store.dispatch({ type: "REVOKE_TOKEN_SUCCESS" });
      window.location.href = "/auth/login";
    }
  }
);
```

**Explication:**
- Quand une requête échoue avec 401 (token expiré):
  1. L'interceptor appelle `/api/user/RefreshToken`
  2. Le navigateur envoie automatiquement le cookie `refreshToken`
  3. Le serveur vérifie le `refreshToken`
  4. Si valide, le serveur envoie un nouveau `accessToken` (cookie)
  5. La requête originale est relancée avec le nouveau token
- Si le `refreshToken` est aussi expiré:
  1. L'utilisateur est déconnecté
  2. Redirection vers `/auth/login`

### 6️⃣ Refresh Proactif (toutes les 10 minutes)

**Fichier:** `src/business/setupAxios.js` (ligne 26-49)

```javascript
const startProactiveRefresh = axios => {
  refreshTimer = setInterval(async () => {
    try {
      console.log("Proactive token refresh triggered (10 minutes elapsed)");
      await axios.post(
        REFRESH_TOKEN_ENDPOINT,
        {},
        { withCredentials: true }  // ⭐ Envoie refreshToken (cookie)
      );
      console.log("Proactive token refresh successful");
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
    }
  }, PROACTIVE_REFRESH_INTERVAL); // 10 minutes
};
```

**Explication:**
- Timer qui rafraîchit le token toutes les 10 minutes
- Évite l'expiration du token (15 minutes) pendant l'utilisation
- Le navigateur envoie automatiquement le cookie `refreshToken`
- Le serveur renvoie un nouveau `accessToken` (cookie)

## 🔄 Flux Complet d'Authentification

### Connexion (Login)

```
1. Utilisateur entre son email
   ↓
2. [OTPRequest.js] Dispatch sendOtpRequest(email)
   ↓
3. [OTPAuthSagas.js] Appelle sendOtpApi(email)
   ↓
4. [AuthApi.js] POST /api/user/SendOtp avec withCredentials:true
   ↓
5. Serveur envoie l'OTP par email
   ↓
6. Utilisateur entre le code OTP
   ↓
7. [OTPVerify.js] Dispatch authenticateOtpRequest({email, otp})
   ↓
8. [OTPAuthSagas.js] Appelle authenticateWithOtpApi({email, otp})
   ↓
9. [AuthApi.js] POST /api/user/Authenticate avec withCredentials:true
   ↓
10. Serveur vérifie le code OTP
    ↓
11. Si valide, serveur envoie:
    - Response body: {UserID, UserName, UserType, ...}
    - Set-Cookie: accessToken=xxx (15 min)
    - Set-Cookie: refreshToken=yyy (7 jours)
    ↓
12. [OTPAuthSagas.js] Stocke les données user dans Redux
    - yield put(authenticateOtpSuccess(response.data))
    - yield put(requestUser.success(response.data))
    ↓
13. [AuthReducers.js] Met à jour state.auth.user
    ↓
14. [Routes.js] Détecte auth.user != null → isAuthorized = true
    ↓
15. [OTPVerify.js] Redirige selon userType:
    - userType 1 → /dashboard
    - userType 2 → /backoffice-dashboard
```

### Requête API Authentifiée

```
1. Component dispatch une action API
   ↓
2. [setupAxios.js] Request interceptor
   - Ajoute withCredentials: true
   - Le navigateur ajoute automatiquement le cookie accessToken
   ↓
3. Serveur reçoit la requête avec le cookie
   ↓
4. Serveur vérifie le accessToken (cookie)
   ↓
5. Si valide → Traite la requête → Retourne les données
   ↓
6. Si expiré (401) → Response interceptor
   - Appelle /api/user/RefreshToken (avec refreshToken cookie)
   - Reçoit nouveau accessToken (cookie)
   - Relance la requête originale
```

### Vérification "Est-ce que l'utilisateur est connecté?"

```javascript
// ❌ MAUVAISE MÉTHODE (impossible avec HTTP-Only cookies)
if (document.cookie.includes('accessToken')) { ... }  // Ne fonctionne PAS

// ✅ BONNE MÉTHODE
const { auth } = useSelector(state => state);
if (auth.user != null) {
  // L'utilisateur est connecté
  console.log("User:", auth.user.UserName);
  console.log("UserType:", auth.user.userType);
} else {
  // L'utilisateur n'est pas connecté
}
```

## 🛡️ Sécurité

### Pourquoi HTTP-Only ?

1. **Protection XSS**: JavaScript ne peut pas lire les cookies HTTP-Only
2. **Tokens invisibles**: Même si un script malveillant s'exécute, il ne peut pas voler les tokens
3. **Transmission automatique**: Le navigateur gère les cookies de manière sécurisée

### Attributs des Cookies

```
Set-Cookie: accessToken=xxx; 
  HttpOnly;           // ⭐ JavaScript ne peut pas lire
  Secure;             // ⭐ Envoyé uniquement en HTTPS
  SameSite=Strict;    // ⭐ Protection CSRF
  Max-Age=900         // ⭐ Expire après 15 minutes
```

## 📋 Résumé - Où sont les Vérifications?

| Vérification | Fichier | Ligne | Description |
|-------------|---------|-------|-------------|
| **Envoi automatique des cookies** | `setupAxios.js` | 68 | `withCredentials: true` |
| **État de connexion** | `Routes.js` | 43 | `auth.user != null` |
| **Token expiré (401)** | `setupAxios.js` | 91-164 | Response interceptor |
| **Refresh proactif** | `setupAxios.js` | 26-49 | Timer 10 minutes |
| **Stockage données user** | `OTPAuthSagas.js` | 54-59 | Redux dispatch |
| **Réception cookies** | `AuthApi.js` | 220 | `withCredentials: true` |

## 💡 Points Clés

1. **Vous ne verrez JAMAIS le code qui "lit" les cookies** car le navigateur le fait automatiquement
2. **Vérifiez l'authentification via Redux** (`auth.user != null`), pas via les cookies
3. **Les cookies sont envoyés automatiquement** avec chaque requête (grâce à `withCredentials`)
4. **Le serveur vérifie les tokens** dans les cookies, pas le frontend
5. **Refresh automatique** transparent pour l'utilisateur

## 🔍 Comment Débugger?

### Voir les Cookies dans le Navigateur

1. Ouvrir DevTools (F12)
2. Onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Section "Cookies"
4. Sélectionner `http://localhost:3000`
5. Voir `accessToken` et `refreshToken`

### Voir les Requêtes HTTP

1. Ouvrir DevTools (F12)
2. Onglet "Network"
3. Filtrer "Fetch/XHR"
4. Cliquer sur une requête
5. Onglet "Headers" → "Request Headers"
6. Voir `Cookie: accessToken=xxx; refreshToken=yyy`

### Voir l'État Redux

1. Installer Redux DevTools Extension
2. Ouvrir DevTools (F12)
3. Onglet "Redux"
4. Voir `state.auth.user`

## 📚 Fichiers Principaux

- `src/business/setupAxios.js` - Configuration Axios et interceptors
- `src/business/api/shared/AuthApi.js` - Appels API d'authentification
- `src/business/sagas/shared/OTPAuthSagas.js` - Logique d'authentification
- `src/business/reducers/share/AuthReducers.js` - Stockage état utilisateur
- `src/ui/Routes.js` - Vérification d'autorisation
- `src/ui/components/client/auth/OTPVerify.js` - Redirection post-login

# Guide de Dépannage - Cookies d'Authentification Non Définis

## ⚠️ Problème: Les Cookies `accessToken` et `refreshToken` ne Sont Pas Visibles dans le Navigateur

### 🔍 Symptômes

- Après authentification OTP réussie, vous ne voyez pas `accessToken` et `refreshToken` dans les cookies du navigateur
- DevTools → Application → Cookies → votre domaine → **aucun cookie lié à l'authentification**
- L'utilisateur est redirigé vers le dashboard mais les cookies sont absents

### 🎯 Cause Racine

**IMPORTANT**: Les cookies d'authentification sont définis par le **BACKEND (serveur API)**, PAS par le frontend!

Le frontend ne fait que:
1. Envoyer la requête d'authentification avec `withCredentials: true`
2. Recevoir les cookies que le backend envoie dans les headers `Set-Cookie`
3. Le navigateur stocke automatiquement ces cookies

Si les cookies ne sont pas visibles, c'est que **le backend ne les envoie pas correctement**.

---

## 🔧 Diagnostic Étape par Étape

### Étape 1: Vérifier la Réponse de l'API d'Authentification

1. **Ouvrir DevTools** (F12)
2. **Onglet Network**
3. **Se connecter** avec l'OTP
4. **Trouver la requête** `POST /api/user/Authenticate`
5. **Cliquer sur la requête** → Onglet "Headers"

#### ✅ Ce Que Vous DEVEZ Voir dans les Response Headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3000
Set-Cookie: accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/user/RefreshToken
```

#### ❌ Problème 1: Headers `Set-Cookie` Absents

**Si vous ne voyez PAS les headers `Set-Cookie`:**

➡️ **Le backend ne définit pas les cookies!**

**Solutions Backend Requises:**

```csharp
// ASP.NET Core - Dans votre contrôleur d'authentification
[HttpPost("Authenticate")]
public IActionResult Authenticate([FromBody] AuthRequest request)
{
    // Valider OTP...
    
    // Générer les tokens JWT
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // ⭐ DÉFINIR LES COOKIES dans la réponse HTTP
    var cookieOptions = new CookieOptions
    {
        HttpOnly = true,      // Protection XSS
        Secure = true,        // HTTPS uniquement (désactiver en dev si HTTP)
        SameSite = SameSiteMode.Strict,  // Protection CSRF
        Path = "/"            // Disponible sur tout le domaine
    };
    
    Response.Cookies.Append("accessToken", accessToken, new CookieOptions
    {
        ...cookieOptions,
        MaxAge = TimeSpan.FromMinutes(15)  // 15 minutes
    });
    
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        ...cookieOptions,
        MaxAge = TimeSpan.FromDays(7),     // 7 jours
        Path = "/api/user/RefreshToken"    // Plus restrictif
    });
    
    // Retourner les données utilisateur (PAS les tokens!)
    return Ok(new {
        UserID = user.UserID,
        UserName = user.UserName,
        UserType = user.UserType,
        TenantID = user.TenantID
    });
}
```

```javascript
// Node.js/Express - Dans votre route d'authentification
app.post('/api/user/Authenticate', async (req, res) => {
  const { tenantID, email, otp } = req.body;
  
  // Valider OTP...
  
  // Générer les tokens JWT
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // ⭐ DÉFINIR LES COOKIES dans la réponse HTTP
  res.cookie('accessToken', accessToken, {
    httpOnly: true,      // Protection XSS
    secure: true,        // HTTPS uniquement (false en dev si HTTP)
    sameSite: 'strict',  // Protection CSRF
    maxAge: 15 * 60 * 1000,  // 15 minutes en millisecondes
    path: '/'
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 jours en millisecondes
    path: '/api/user/RefreshToken'
  });
  
  // Retourner les données utilisateur (PAS les tokens!)
  res.json({
    UserID: user.UserID,
    UserName: user.UserName,
    UserType: user.UserType,
    TenantID: user.TenantID
  });
});
```

#### ❌ Problème 2: Configuration CORS Incorrecte

**Si vous voyez les headers `Set-Cookie` dans la réponse mais les cookies ne sont PAS stockés:**

➡️ **Problème de CORS!** Le backend doit autoriser les credentials.

**Solutions Backend Requises:**

```csharp
// ASP.NET Core - Dans Startup.cs ou Program.cs
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:3000",           // Dev
                "https://votre-domaine.com"        // Prod
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // ⭐ ESSENTIEL pour les cookies!
    });
});
```

```javascript
// Node.js/Express - Configuration CORS
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',           // Dev
    'https://votre-domaine.com'        // Prod
  ],
  credentials: true,  // ⭐ ESSENTIEL pour les cookies!
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type', 'X-Api-Version']
}));
```

**⚠️ IMPORTANT**: 
- Quand `AllowCredentials` est activé, vous **NE POUVEZ PAS** utiliser `AllowAnyOrigin()`
- Vous **DEVEZ** spécifier les origines exactes

### Étape 2: Vérifier l'Attribut `Secure`

#### ❌ Problème 3: Attribute `Secure` en HTTP (Non-HTTPS)

Les cookies avec l'attribut `Secure` ne peuvent être envoyés qu'en HTTPS.

**En environnement de développement (HTTP):**

```csharp
// ASP.NET Core
var cookieOptions = new CookieOptions
{
    HttpOnly = true,
    Secure = false,  // ⭐ Désactiver Secure en dev HTTP
    SameSite = SameSiteMode.Lax,  // Lax au lieu de Strict en dev
    // ...
};
```

```javascript
// Node.js/Express
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // ⭐ Secure uniquement en prod
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  // ...
});
```

**En production (HTTPS):**
- `Secure: true` ✅
- `SameSite: Strict` ✅

### Étape 3: Vérifier le Domaine et le Path

#### ❌ Problème 4: Domaine/Path Incorrects

Les cookies doivent être définis pour le bon domaine et path.

**Exemples de Configurations Correctes:**

| Environnement | Frontend URL | Backend API URL | Cookie Domain | Cookie Path |
|---------------|--------------|-----------------|---------------|-------------|
| Dev Local | `http://localhost:3000` | `http://localhost:5000` | (none) | `/` |
| Dev Azure | `https://dev.myconnectt.com` | `https://api-dev.myconnectt.com` | `.myconnectt.com` | `/` |
| Prod | `https://myconnectt.com` | `https://api.myconnectt.com` | `.myconnectt.com` | `/` |

**⚠️ Problème Courant**: Frontend et Backend sur des domaines différents

Si frontend = `localhost:3000` et backend = `localhost:5000`:
- Les cookies DOIVENT être définis **sans attribut `Domain`**
- Les cookies seront limités au domaine qui les a définis
- Avec `withCredentials: true`, le navigateur les enverra quand même aux requêtes cross-origin

Si frontend = `app.example.com` et backend = `api.example.com`:
- Les cookies DOIVENT avoir `Domain=.example.com` (avec le point)
- Cela permet au frontend et au backend de partager les cookies

```csharp
// ASP.NET Core - Avec domaine
var cookieOptions = new CookieOptions
{
    Domain = ".myconnectt.com",  // ⭐ Partage entre sous-domaines
    // ...
};
```

```javascript
// Node.js/Express - Avec domaine
res.cookie('accessToken', accessToken, {
  domain: '.myconnectt.com',  // ⭐ Partage entre sous-domaines
  // ...
});
```

---

## 🧪 Tests de Diagnostic

### Test 1: Vérifier que le Backend Envoie les Cookies

**Avec cURL:**

```bash
curl -X POST http://localhost:5000/api/user/Authenticate \
  -H "Content-Type: application/json" \
  -d '{"tenantID": 1, "email": "test@example.com", "otp": "123456"}' \
  -v

# Cherchez dans la sortie:
# < Set-Cookie: accessToken=...
# < Set-Cookie: refreshToken=...
```

**Avec Postman:**
1. POST `http://localhost:5000/api/user/Authenticate`
2. Body: `{ "tenantID": 1, "email": "test@example.com", "otp": "123456" }`
3. Envoyer
4. Onglet "Cookies" → Vous devriez voir `accessToken` et `refreshToken`

### Test 2: Vérifier la Configuration Frontend

**Fichier: `src/business/api/shared/AuthApi.js`**

Vérifier que `withCredentials: true` est bien présent:

```javascript
export function authenticateWithOtp(data) {
  const tenantID = TENANTID;
  const { email, otp } = data;
  return axios.post(
    AUTHENTICATE_OTP_URL,
    { tenantID, email, otp },
    {
      withCredentials: true  // ✅ Doit être présent!
    }
  );
}
```

**Fichier: `src/business/setupAxios.js`**

Vérifier que tous les interceptors ont `withCredentials`:

```javascript
axios.interceptors.request.use(config => {
  config.withCredentials = true;  // ✅ Doit être présent!
  return config;
});
```

---

## 📋 Checklist de Vérification Backend

Avant de déployer, assurez-vous que votre backend:

### Configuration des Cookies

- [ ] **Définit les cookies** dans les headers `Set-Cookie` lors de l'authentification
- [ ] **`HttpOnly: true`** - Protection XSS
- [ ] **`Secure: true`** en production (HTTPS) / `false` en dev (HTTP)
- [ ] **`SameSite: Strict`** en production / `Lax` en dev
- [ ] **`Path: /`** pour accessToken (disponible partout)
- [ ] **`Path: /api/user/RefreshToken`** pour refreshToken (plus restrictif)
- [ ] **`MaxAge`** approprié (900s pour access, 604800s pour refresh)
- [ ] **`Domain`** correct si frontend/backend sur sous-domaines différents

### Configuration CORS

- [ ] **`AllowCredentials: true`** dans la config CORS
- [ ] **Origins spécifiques** (pas `AllowAnyOrigin()` avec credentials)
- [ ] **Headers autorisés** incluent `X-Client-Type` et `X-Api-Version`
- [ ] **Méthodes autorisées** incluent GET, POST, PUT, DELETE

### Endpoints API

- [ ] **`POST /api/user/SendOtp`** - Envoie le code OTP par email
- [ ] **`POST /api/user/Authenticate`** - Vérifie OTP et **définit les cookies**
- [ ] **`POST /api/user/RefreshToken`** - Rafraîchit les tokens et **redéfinit les cookies**
- [ ] **`POST /api/user/RevokeToken`** - Invalide les tokens et **supprime les cookies**

### Gestion des Tokens

- [ ] **AccessToken** expire après 15 minutes
- [ ] **RefreshToken** expire après 7 jours
- [ ] **Rotation des refresh tokens** (nouveau refreshToken à chaque refresh)
- [ ] **Stockage des refresh tokens** (Redis ou base de données)
- [ ] **Révocation possible** (liste noire ou base de données)

---

## 🔍 Comment Voir les Cookies dans le Navigateur

### Chrome/Edge

1. **F12** → **Application** → **Cookies** → Sélectionner votre domaine
2. Chercher `accessToken` et `refreshToken`
3. Vérifier les attributs:
   - `HttpOnly`: ✓ (doit être coché)
   - `Secure`: ✓ (en HTTPS) ou vide (en HTTP)
   - `SameSite`: `Strict` ou `Lax`
   - `Path`: `/` pour accessToken
   - `Expires`: Date future

### Firefox

1. **F12** → **Storage** → **Cookies** → Sélectionner votre domaine
2. Chercher `accessToken` et `refreshToken`
3. Vérifier les mêmes attributs

### Safari

1. **Développement** → **Web Inspector** → **Storage** → **Cookies**
2. Sélectionner votre domaine
3. Chercher les cookies

---

## 💡 Solutions Rapides par Scénario

### Scénario 1: Dev en Local (HTTP)

**Frontend**: `http://localhost:3000`  
**Backend**: `http://localhost:5000`

**Backend Config:**
```csharp
// Cookies
Secure = false,
SameSite = SameSiteMode.Lax,
Domain = null  // Pas de domaine spécifié

// CORS
.WithOrigins("http://localhost:3000")
.AllowCredentials()
```

### Scénario 2: Dev Azure (HTTPS)

**Frontend**: `https://dev-myconnectt.azurewebsites.net`  
**Backend**: `https://api-dev-myconnectt.azurewebsites.net`

**Backend Config:**
```csharp
// Cookies
Secure = true,
SameSite = SameSiteMode.Strict,
Domain = ".azurewebsites.net"  // Partage entre sous-domaines

// CORS
.WithOrigins("https://dev-myconnectt.azurewebsites.net")
.AllowCredentials()
```

### Scénario 3: Production (HTTPS)

**Frontend**: `https://myconnectt.com`  
**Backend**: `https://api.myconnectt.com`

**Backend Config:**
```csharp
// Cookies
Secure = true,
SameSite = SameSiteMode.Strict,
Domain = ".myconnectt.com"  // Partage entre domaine et api

// CORS
.WithOrigins("https://myconnectt.com")
.AllowCredentials()
```

---

## 🚨 Erreurs Courantes et Solutions

### Erreur: "Cross-Origin Request Blocked"

**Cause**: Configuration CORS incorrecte  
**Solution**: Activer `AllowCredentials` et spécifier l'origine exacte

### Erreur: Cookies Présents dans Response mais Non Stockés

**Cause**: `SameSite=Strict` avec cross-site request  
**Solution**: Utiliser `SameSite=Lax` en développement ou même domaine en production

### Erreur: Cookies Envoyés par POST mais pas par GET

**Cause**: Path incorrect ou expiration  
**Solution**: Vérifier `Path=/` et `MaxAge` approprié

### Erreur: Cookies Visibles mais Requêtes API Échouent (401)

**Cause**: Backend ne lit pas correctement les cookies  
**Solution**: Backend doit lire `Request.Cookies["accessToken"]` et valider le JWT

---

## 📞 Checklist de Débogage Complète

Si les cookies ne fonctionnent toujours pas après avoir suivi ce guide:

1. [ ] J'ai vérifié les Response Headers de `/api/user/Authenticate` et je vois `Set-Cookie`
2. [ ] J'ai vérifié la config CORS du backend avec `AllowCredentials: true`
3. [ ] J'ai vérifié que `Secure` est désactivé en dev HTTP
4. [ ] J'ai vérifié que le `Domain` est correct (ou absent en localhost)
5. [ ] J'ai vérifié que le `Path` est `/` pour accessToken
6. [ ] J'ai testé avec cURL ou Postman et ça fonctionne
7. [ ] J'ai vérifié que le frontend a `withCredentials: true` partout
8. [ ] J'ai regardé la console et Network tab pour des erreurs CORS
9. [ ] J'ai vérifié que je suis en HTTPS si `Secure: true`
10. [ ] J'ai effacé tous les cookies et réessayé

---

## 🔗 Ressources Additionnelles

- [Documentation Cookie Authentication Flow](./COOKIE_AUTHENTICATION_FLOW.md)
- [Documentation OTP Authentication](./OTP_AUTHENTICATION.md)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Dernière mise à jour**: Mars 2026

# 🎯 RÉSUMÉ : Comment Mettre le Token dans le Header (Pattern Next.js)

## 📌 Votre Question

> "Avec Next.js, j'ai pu mettre le token dans le header même s'il est dans les cookies"

## ✅ La Réponse Simple

**Le secret** : Avec Next.js/next-auth, le backend retourne l'`accessToken` dans **2 endroits** :

1. ✅ Dans le **response body** → Le frontend peut l'extraire
2. ✅ Dans un **cookie HTTP-Only** → (Optionnel, pour d'autres usages)

Le **refreshToken** lui, est UNIQUEMENT dans un cookie HTTP-Only (sécurité).

## 🔑 Pourquoi ?

**Les cookies HTTP-Only ne sont PAS accessibles au JavaScript !**

```javascript
// ❌ IMPOSSIBLE - Les cookies HTTP-Only sont protégés
document.cookie // Ne montre PAS les cookies HttpOnly
```

Donc **SI** votre backend ne retourne le token QUE dans un cookie HTTP-Only, votre JavaScript **NE PEUT PAS** le lire pour le mettre dans le header `Authorization`.

## 💡 La Solution (Next.js Pattern)

### Backend ASP.NET Core

```csharp
[HttpPost("Authenticate")]
public IActionResult Authenticate([FromBody] OtpAuthRequest request)
{
    var user = ValidateOtp(request.Email, request.Otp);
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // 1. refreshToken → Cookie HTTP-Only (sécurité)
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7)
    });
    
    // 2. (Optionnel) accessToken → Cookie
    Response.Cookies.Append("accessToken", accessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromMinutes(5)
    });
    
    // 3. ⭐ IMPORTANT : accessToken → Response Body
    //    C'EST CE QUI PERMET au frontend de l'extraire !
    return Ok(new
    {
        UserID = user.UserID,
        UserName = user.UserName,
        AccessToken = accessToken  // ⭐ LE FRONTEND LIT CECI !
    });
}
```

### Frontend React (Déjà Implémenté ✅)

```javascript
// 1. Extrait l'accessToken du response body
// src/business/sagas/shared/OTPAuthSagas.js ligne 66
const accessToken = response.data.accessToken || response.data.AccessToken;

// 2. Le stocke dans Redux (mémoire uniquement)
yield put(requestUser.success({ ...response.data, accessToken }));

// 3. L'ajoute au header Authorization pour chaque requête
// src/business/setupAxios.js ligne 84
const accessToken = state.auth?.accessToken;
if (accessToken) {
  config.headers.Authorization = `Bearer ${accessToken}`;
}
```

## 📊 Comparaison : Ce qui est ENVOYÉ vs ce qui est UTILISÉ

### Option 1 : Cookie Seulement (❌ Ne Fonctionne Pas)

```
Backend → Cookie: accessToken=eyJ... (HttpOnly)
          Body: { userID, userName }  ❌ Pas de token

Frontend → ❌ NE PEUT PAS lire le cookie
        → ❌ NE PEUT PAS ajouter au header Authorization
```

### Option 2 : Body Seulement (✅ Fonctionne, mais moins sécurisé)

```
Backend → Cookie: (rien)
          Body: { userID, userName, accessToken: "eyJ..." }  ✅

Frontend → ✅ Extrait du body
        → ✅ Ajoute au header Authorization: Bearer eyJ...
```

### Option 3 : Cookie + Body (✅✅ MEILLEUR - Next.js Pattern)

```
Backend → Cookie: refreshToken=eyJ... (HttpOnly)  ✅ Sécurisé
          Cookie: accessToken=eyJ... (HttpOnly, optionnel)
          Body: { userID, userName, accessToken: "eyJ..." }  ✅

Frontend → ✅ Extrait l'accessToken du body
        → ✅ Ajoute au header Authorization: Bearer eyJ...
        → ✅ Cookie refreshToken envoyé automatiquement
```

## 🎯 Ce que Votre Backend DOIT Faire

### Endpoint `/api/user/Authenticate`

✅ Retourner dans le **response body** :
```json
{
  "userID": 123,
  "userName": "John Doe",
  "email": "john@example.com",
  "accessToken": "eyJhbGci..."  ← ⭐ REQUIS !
}
```

✅ Définir dans les **cookies** :
```http
Set-Cookie: refreshToken=xyz...; HttpOnly; SameSite=Strict; Max-Age=604800
Set-Cookie: accessToken=eyJ...; HttpOnly; SameSite=Strict; Max-Age=300 (optionnel)
```

### Endpoint `/api/user/RefreshToken`

✅ Retourner dans le **response body** :
```json
{
  "accessToken": "eyJhbGci..."  ← ⭐ Nouveau token !
}
```

✅ Mettre à jour les **cookies** :
```http
Set-Cookie: refreshToken=abc...; HttpOnly; ...
Set-Cookie: accessToken=eyJ...; HttpOnly; ... (optionnel)
```

## 🧪 Comment Vérifier que Ça Fonctionne

### 1. Vérifier le Backend (cURL)

```bash
curl -X POST http://localhost:5000/api/user/Authenticate \
  -H "Content-Type: application/json" \
  -d '{"tenantID": 1, "email": "test@example.com", "otp": "123456"}' \
  -v

# Cherchez dans la sortie :
# ✅ < Set-Cookie: refreshToken=...
# ✅ {"accessToken":"eyJ..."}  ← Dans le body !
```

### 2. Vérifier le Frontend (DevTools)

**Après le login OTP :**

1. **F12** → **Network** → Trouvez `POST /api/user/Authenticate`
2. **Response** tab → Vérifiez le body :
   ```json
   {
     "userID": 123,
     "userName": "...",
     "accessToken": "eyJ..."  ✅
   }
   ```
3. **Headers** tab → Vérifiez :
   ```http
   Set-Cookie: refreshToken=...; HttpOnly  ✅
   ```

**Lors d'une requête API :**

1. **Network** → Trouvez n'importe quelle requête API
2. **Headers** tab → Request Headers :
   ```http
   Authorization: Bearer eyJhbGci...  ✅
   Cookie: refreshToken=...          ✅
   ```

### 3. Vérifier dans la Console

```javascript
// Vérifier que le token est dans Redux
window.store.getState().auth.accessToken
// Output: "eyJhbGci..." ✅
```

## 🔄 Flux Complet (Next.js Pattern)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LOGIN (OTP)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND Response:                                               │
│ • Body: { accessToken: "eyJ..." }        ← Frontend lit ça     │
│ • Cookie: refreshToken (HttpOnly)        ← Auto-envoyé         │
│ • Cookie: accessToken (HttpOnly, opt.)   ← Pas utilisé ici    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND Extrait:                                               │
│ • accessToken → Redux state.auth.accessToken (mémoire)         │
│ • refreshToken → Cookie (automatique par le navigateur)        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ CHAQUE REQUÊTE API:                                             │
│ • Header: Authorization: Bearer {accessToken}  ← Ajouté auto   │
│ • Cookie: refreshToken=xyz                     ← Envoyé auto   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND Valide:                                                 │
│ • Lit le header Authorization                                   │
│ • Vérifie le token JWT                                          │
│ • Retourne les données ✅                                       │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ FAQ

### Q1 : Pourquoi mettre le token dans le cookie ET le body ?

**R** : 
- **Cookie** : Pour que le navigateur l'envoie automatiquement (pratique)
- **Body** : Pour que le JavaScript puisse le lire et l'ajouter au header (requis)

### Q2 : C'est pas redondant ?

**R** : Le cookie `accessToken` est **optionnel**. Seuls sont vraiment nécessaires :
- ✅ `accessToken` dans le **body** (pour le header Authorization)
- ✅ `refreshToken` dans le **cookie** (pour le refresh automatique)

### Q3 : Mon Next.js fonctionne, pourquoi pas React ?

**R** : Votre Next.js fonctionne **parce que** votre backend retourne le token dans le body ! Vérifiez avec DevTools.

### Q4 : Et si je ne veux que des cookies ?

**R** : Impossible ! Les cookies HTTP-Only ne sont pas accessibles au JavaScript. Vous **DEVEZ** retourner le token dans le body si vous voulez l'utiliser dans un header.

## 📝 Checklist Validation

### Backend
- [ ] Endpoint `/api/user/Authenticate` retourne `accessToken` dans le body
- [ ] Endpoint `/api/user/Authenticate` définit `refreshToken` dans un cookie HttpOnly
- [ ] Endpoint `/api/user/RefreshToken` retourne nouveau `accessToken` dans le body
- [ ] CORS configuré avec `AllowCredentials: true`

### Frontend (Déjà Fait ✅)
- [x] Code extrait `accessToken` du response body (OTPAuthSagas.js)
- [x] Code ajoute token au header `Authorization` (setupAxios.js)
- [x] Code envoie `withCredentials: true` (cookies automatiques)

### Validation
- [ ] cURL montre `accessToken` dans le body JSON
- [ ] DevTools Network montre `Set-Cookie: refreshToken`
- [ ] DevTools Network montre `Authorization: Bearer` dans les requêtes
- [ ] Console montre `state.auth.accessToken` rempli

## 🎉 Conclusion

Votre application React **fonctionne déjà** avec le pattern Next.js !

**Il suffit que votre backend ASP.NET Core** :
1. ✅ Retourne l'`accessToken` dans le response body
2. ✅ Définisse le `refreshToken` dans un cookie HTTP-Only

C'est exactement ce que fait Next.js/next-auth. 🚀

---

**Créé** : 2026-04-01  
**Auteur** : Copilot Agent  
**Voir aussi** : [BACKEND_TOKEN_IN_COOKIE_AND_BODY.md](./BACKEND_TOKEN_IN_COOKIE_AND_BODY.md)

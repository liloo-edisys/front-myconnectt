# Configuration Backend : Token dans Cookie ET Body

## 🎯 Objectif

Adapter l'application React pour fonctionner avec un backend ASP.NET Core qui :
1. **Envoie les tokens dans des cookies HTTP-Only** (sécurité)
2. **Retourne également l'accessToken dans le body** (pour le header Authorization)

C'est exactement le pattern utilisé par Next.js/next-auth.

## 📋 Problème Actuel

**Situation** : Votre backend ASP.NET Core a été modifié pour n'envoyer les tokens QUE dans les cookies.

**Impact** : Le frontend React ne peut plus extraire l'accessToken car :
- Les cookies HTTP-Only ne sont PAS accessibles au JavaScript
- Le code actuel essaie d'extraire `response.data.accessToken` qui est maintenant `undefined`

## ✅ Solution : Pattern Next.js/next-auth

La solution est d'avoir le backend ASP.NET Core envoyer l'accessToken dans **2 endroits** :

1. ✅ **Dans un cookie** (optionnel, pour les requêtes qui veulent utiliser automatiquement le cookie)
2. ✅ **Dans le response body** (REQUIS - pour que le frontend puisse l'extraire et l'ajouter au header Authorization)

C'est **exactement** ce que fait Next.js/next-auth.

## 🔧 Configuration Backend ASP.NET Core

### 1️⃣ Endpoint Authenticate (Login OTP)

```csharp
[HttpPost("Authenticate")]
public IActionResult Authenticate([FromBody] OtpAuthRequest request)
{
    // 1. Valider l'OTP
    var user = ValidateOtp(request.Email, request.Otp);
    if (user == null)
    {
        return Unauthorized("Invalid OTP");
    }
    
    // 2. Générer les tokens
    var accessToken = GenerateAccessToken(user);   // JWT, expire dans 5 minutes
    var refreshToken = GenerateRefreshToken(user); // JWT, expire dans 7 jours
    
    // 3. Définir le refreshToken dans un cookie HTTP-Only (OBLIGATOIRE)
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,                           // ⭐ Protection XSS
        Secure = !_isDevelopment,                  // true en prod (HTTPS), false en dev (HTTP)
        SameSite = SameSiteMode.Strict,            // Protection CSRF
        MaxAge = TimeSpan.FromDays(7),
        Path = "/",                                 // Disponible pour toutes les routes
        IsEssential = true
    });
    
    // 4. (Optionnel) Définir l'accessToken dans un cookie
    //    Note: Ceci est optionnel car le frontend utilisera le header Authorization
    Response.Cookies.Append("accessToken", accessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = !_isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromMinutes(5),
        Path = "/",
        IsEssential = true
    });
    
    // 5. ⭐ IMPORTANT : Retourner l'accessToken dans le response body
    //    C'est CE QUI PERMET au frontend de l'extraire et le mettre dans Authorization header
    return Ok(new
    {
        UserID = user.UserID,
        UserName = user.UserName,
        UserType = user.UserType,
        TenantID = user.TenantID,
        Email = user.Email,
        AccessToken = accessToken,  // ⭐ LE FRONTEND A BESOIN DE CECI !
        // Note: Ne PAS retourner refreshToken dans le body (sécurité)
    });
}
```

### 2️⃣ Endpoint RefreshToken

```csharp
[HttpPost("RefreshToken")]
public IActionResult RefreshToken()
{
    // 1. Lire le refreshToken depuis le cookie
    if (!Request.Cookies.TryGetValue("refreshToken", out var oldRefreshToken))
    {
        return Unauthorized("Refresh token missing");
    }
    
    // 2. Valider le refresh token
    var user = ValidateRefreshToken(oldRefreshToken);
    if (user == null)
    {
        return Unauthorized("Invalid refresh token");
    }
    
    // 3. Générer de nouveaux tokens (rotation des tokens)
    var newAccessToken = GenerateAccessToken(user);
    var newRefreshToken = GenerateRefreshToken(user);
    
    // 4. Mettre à jour le cookie refreshToken
    Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = !_isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7),
        Path = "/",
        IsEssential = true
    });
    
    // 5. (Optionnel) Mettre à jour le cookie accessToken
    Response.Cookies.Append("accessToken", newAccessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = !_isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromMinutes(5),
        Path = "/",
        IsEssential = true
    });
    
    // 6. ⭐ IMPORTANT : Retourner le nouveau accessToken dans le body
    return Ok(new
    {
        AccessToken = newAccessToken  // ⭐ LE FRONTEND A BESOIN DE CECI !
    });
}
```

### 3️⃣ Endpoint RevokeToken (Logout)

```csharp
[HttpPost("RevokeToken")]
public IActionResult RevokeToken()
{
    // 1. Lire et invalider le refreshToken
    if (Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
    {
        InvalidateRefreshToken(refreshToken); // Blacklist ou marquer comme révoqué en DB
    }
    
    // 2. Supprimer les cookies
    Response.Cookies.Delete("accessToken");
    Response.Cookies.Delete("refreshToken");
    
    return Ok(new { message = "Logged out successfully" });
}
```

### 4️⃣ Configuration CORS (Startup.cs ou Program.cs)

```csharp
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:3000",                          // Dev local
                "https://dev-myconnectt.azurewebsites.net",      // Azure Dev
                "https://myconnectt.com"                          // Production
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // ⭐ ESSENTIEL pour les cookies !
    });
});

// Dans Configure() ou le pipeline:
app.UseCors();  // Avant UseAuthentication !
app.UseAuthentication();
app.UseAuthorization();
```

## 🔍 Validation Backend

### Test avec cURL

```bash
# 1. Login OTP
curl -X POST http://localhost:5000/api/user/Authenticate \
  -H "Content-Type: application/json" \
  -d '{"tenantID": 1, "email": "test@example.com", "otp": "123456"}' \
  -c cookies.txt \
  -v

# Vérifier dans la sortie:
# ✅ < Set-Cookie: refreshToken=...
# ✅ < Set-Cookie: accessToken=...
# ✅ Body contient: {"accessToken": "eyJ..."}
```

### Test avec Postman

1. **POST** `http://localhost:5000/api/user/Authenticate`
2. **Body** (JSON):
   ```json
   {
     "tenantID": 1,
     "email": "test@example.com",
     "otp": "123456"
   }
   ```
3. **Send**
4. **Vérifier** :
   - ✅ Response Body contient `"accessToken": "eyJ..."`
   - ✅ Cookies tab montre `accessToken` et `refreshToken`

## 📱 Code Frontend React (Déjà Implémenté)

Le code frontend actuel **fonctionne déjà** avec cette configuration backend !

### Extraction du Token (OTPAuthSagas.js)

```javascript
// src/business/sagas/shared/OTPAuthSagas.js ligne 66
const accessToken = response.data.accessToken || response.data.AccessToken;
```

✅ Extrait l'accessToken du response body

### Ajout au Header Authorization (setupAxios.js)

```javascript
// src/business/setupAxios.js ligne 84
const accessToken = state.auth?.accessToken;
if (accessToken) {
  config.headers.Authorization = `Bearer ${accessToken}`;
}
```

✅ Ajoute l'accessToken au header Authorization

### Cookies Automatiques

```javascript
// src/business/setupAxios.js ligne 76
config.withCredentials = true;
```

✅ Le navigateur envoie automatiquement le cookie refreshToken avec chaque requête

## 🎯 Pattern Complet : Next.js vs React

### Next.js/next-auth

```
1. Backend → Response:
   - Body: { accessToken: "eyJ..." }
   - Cookie: refreshToken (HTTP-Only)

2. Next.js → Extrait accessToken du body
3. Next.js → Ajoute au header: Authorization: Bearer eyJ...
4. Backend → Valide le header Authorization
```

### React App (Cette Application)

```
1. Backend → Response:
   - Body: { accessToken: "eyJ..." }  ✅ MÊME CHOSE
   - Cookie: refreshToken (HTTP-Only) ✅ MÊME CHOSE

2. React → Extrait accessToken du body  ✅ MÊME CHOSE
3. React → Ajoute au header: Authorization: Bearer eyJ...  ✅ MÊME CHOSE
4. Backend → Valide le header Authorization  ✅ MÊME CHOSE
```

**Résultat : IDENTIQUE !** 🎉

## ⚠️ Ce qu'il NE FAUT PAS Faire

### ❌ ERREUR : Ne retourner le token QUE dans le cookie

```csharp
// ❌ MAUVAIS - Ne fonctionne PAS avec React/Next.js
[HttpPost("Authenticate")]
public IActionResult Authenticate([FromBody] OtpAuthRequest request)
{
    var accessToken = GenerateAccessToken(user);
    
    Response.Cookies.Append("accessToken", accessToken, ...);
    
    // ❌ ERREUR : Pas d'accessToken dans le body !
    return Ok(new
    {
        UserID = user.UserID,
        UserName = user.UserName,
        // ❌ Manque : AccessToken = accessToken
    });
}
```

**Problème** : Le frontend ne peut pas accéder au cookie HTTP-Only avec JavaScript !

### ✅ CORRECT : Retourner dans cookie ET body

```csharp
// ✅ BON - Fonctionne avec React/Next.js
[HttpPost("Authenticate")]
public IActionResult Authenticate([FromBody] OtpAuthRequest request)
{
    var accessToken = GenerateAccessToken(user);
    
    Response.Cookies.Append("accessToken", accessToken, ...);  // Optionnel
    
    // ✅ CORRECT : accessToken dans le body !
    return Ok(new
    {
        UserID = user.UserID,
        UserName = user.UserName,
        AccessToken = accessToken  // ⭐ REQUIS !
    });
}
```

## 🔐 Sécurité

### Pourquoi Mettre le Token dans le Body ET le Cookie ?

**Q** : N'est-ce pas redondant ?

**R** : Non, chaque emplacement a un rôle :

1. **Cookie (accessToken)** - Optionnel :
   - Pour les clients qui ne peuvent pas gérer les headers
   - Backend peut lire automatiquement
   - Pas nécessaire pour cette app React

2. **Body (accessToken)** - REQUIS :
   - Frontend l'extrait et le met dans `Authorization` header
   - Standard OAuth 2.0
   - Permet un contrôle granulaire

3. **Cookie (refreshToken)** - REQUIS :
   - HTTP-Only : Protection XSS
   - Utilisé uniquement pour `/RefreshToken`
   - Jamais exposé au JavaScript

### Sécurité du Pattern

✅ **Sécurisé** car :
- accessToken a une courte durée de vie (5 min)
- refreshToken en HTTP-Only (inaccessible au JS)
- refreshToken utilisé uniquement pour refresh
- Tokens rotationnés à chaque refresh
- SameSite protection contre CSRF

## 📚 Résumé

### Backend DOIT :
1. ✅ Retourner `accessToken` dans le **response body** (REQUIS)
2. ✅ Définir `refreshToken` dans un **cookie HTTP-Only** (REQUIS)
3. ✅ (Optionnel) Définir `accessToken` dans un **cookie HTTP-Only**
4. ✅ Configurer CORS avec `AllowCredentials: true`

### Frontend (Déjà Fait) :
1. ✅ Extrait `accessToken` du response body
2. ✅ Stocke dans Redux `state.auth.accessToken` (mémoire uniquement)
3. ✅ Ajoute au header `Authorization: Bearer {accessToken}`
4. ✅ Envoie `withCredentials: true` (cookies automatiques)

## 🔗 Documentation Connexe

- [ACCESS_TOKEN_AUTHORIZATION_HEADER.md](./ACCESS_TOKEN_AUTHORIZATION_HEADER.md) - Détails sur le header Authorization
- [NEXTJS_COMPATIBILITY.md](./NEXTJS_COMPATIBILITY.md) - Comparaison avec Next.js
- [COOKIE_AUTHENTICATION_FLOW.md](./COOKIE_AUTHENTICATION_FLOW.md) - Flux complet

---

**Créé** : 2026-04-01  
**Auteur** : Copilot Agent  
**Status** : ✅ Documentation de la Solution

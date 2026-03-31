# ⚠️ URGENT - Configuration Backend Requise pour l'Authentification par Cookies

## 🚨 Problème Actuel

Les cookies d'authentification **ne sont PAS définis** après une connexion OTP réussie.

**Symptôme**: DevTools → Application → Cookies → **Aucun `accessToken` ou `refreshToken`**

## 🎯 Cause

Le **BACKEND ne définit pas les cookies** dans les headers HTTP `Set-Cookie`.

Le frontend envoie correctement `withCredentials: true`, mais le backend ne répond pas avec les cookies.

---

## ✅ Solution Requise (Backend)

### 1️⃣ Définir les Cookies dans la Réponse d'Authentification

**Endpoint**: `POST /api/user/Authenticate`

#### ASP.NET Core (C#)

```csharp
[HttpPost("Authenticate")]
public IActionResult Authenticate([FromBody] AuthRequest request)
{
    // Valider l'OTP...
    var user = ValidateOtp(request.Email, request.Otp);
    
    // Générer les tokens JWT
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // ⭐ DÉFINIR LES COOKIES
    Response.Cookies.Append("accessToken", accessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = false,  // false en dev HTTP, true en prod HTTPS
        SameSite = SameSiteMode.Lax,  // Lax en dev, Strict en prod
        MaxAge = TimeSpan.FromMinutes(15),
        Path = "/"
    });
    
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = false,
        SameSite = SameSiteMode.Lax,
        MaxAge = TimeSpan.FromDays(7),
        Path = "/api/user/RefreshToken"
    });
    
    // Retourner les DONNÉES utilisateur (pas les tokens)
    return Ok(new
    {
        UserID = user.UserID,
        UserName = user.UserName,
        UserType = user.UserType,
        TenantID = user.TenantID
    });
}
```

#### Node.js/Express (JavaScript)

```javascript
app.post('/api/user/Authenticate', async (req, res) => {
    const { tenantID, email, otp } = req.body;
    
    // Valider l'OTP...
    const user = await validateOtp(email, otp);
    
    // Générer les tokens JWT
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // ⭐ DÉFINIR LES COOKIES
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,  // false en dev HTTP, true en prod HTTPS
        sameSite: 'lax',  // lax en dev, strict en prod
        maxAge: 15 * 60 * 1000,  // 15 minutes
        path: '/'
    });
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 jours
        path: '/api/user/RefreshToken'
    });
    
    // Retourner les DONNÉES utilisateur (pas les tokens)
    res.json({
        UserID: user.UserID,
        UserName: user.UserName,
        UserType: user.UserType,
        TenantID: user.TenantID
    });
});
```

---

### 2️⃣ Configurer CORS pour Accepter les Credentials

#### ASP.NET Core (Startup.cs ou Program.cs)

```csharp
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:3000",              // Dev
                "https://dev-myconnectt.azurewebsites.net",  // Azure Dev
                "https://myconnectt.com"              // Prod
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // ⭐ ESSENTIEL!
    });
});

// Dans Configure():
app.UseCors();  // Avant UseAuthentication/UseAuthorization
app.UseAuthentication();
app.UseAuthorization();
```

#### Node.js/Express

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:3000',                          // Dev
        'https://dev-myconnectt.azurewebsites.net',      // Azure Dev
        'https://myconnectt.com'                          // Prod
    ],
    credentials: true,  // ⭐ ESSENTIEL!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type', 'X-Api-Version']
}));
```

**⚠️ IMPORTANT**: 
- Avec `AllowCredentials: true`, vous **NE POUVEZ PAS** utiliser `AllowAnyOrigin()`
- Vous **DEVEZ** spécifier les origines exactes

---

### 3️⃣ Implémenter l'Endpoint de Refresh Token

**Endpoint**: `POST /api/user/RefreshToken`

#### ASP.NET Core

```csharp
[HttpPost("RefreshToken")]
public IActionResult RefreshToken()
{
    // Lire le refreshToken depuis les cookies
    if (!Request.Cookies.TryGetValue("refreshToken", out var oldRefreshToken))
    {
        return Unauthorized("Refresh token missing");
    }
    
    // Valider le refresh token
    var user = ValidateRefreshToken(oldRefreshToken);
    if (user == null)
    {
        return Unauthorized("Invalid refresh token");
    }
    
    // Générer de nouveaux tokens (rotation)
    var newAccessToken = GenerateAccessToken(user);
    var newRefreshToken = GenerateRefreshToken(user);
    
    // ⭐ REDÉFINIR LES COOKIES
    Response.Cookies.Append("accessToken", newAccessToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = false,
        SameSite = SameSiteMode.Lax,
        MaxAge = TimeSpan.FromMinutes(15),
        Path = "/"
    });
    
    Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = false,
        SameSite = SameSiteMode.Lax,
        MaxAge = TimeSpan.FromDays(7),
        Path = "/api/user/RefreshToken"
    });
    
    return Ok(new { message = "Token refreshed successfully" });
}
```

---

### 4️⃣ Vérifier avec DevTools

Après avoir implémenté les changements:

1. **Frontend**: Se connecter avec OTP
2. **Ouvrir DevTools** (F12) → **Network**
3. **Trouver**: `POST /api/user/Authenticate`
4. **Vérifier Response Headers**:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3000
Set-Cookie: accessToken=eyJhbGc...; HttpOnly; SameSite=Lax; Max-Age=900; Path=/
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/api/user/RefreshToken
```

✅ Si vous voyez ces deux lignes `Set-Cookie`, **c'est bon!**

5. **Aller dans**: DevTools → **Application** → **Cookies** → votre domaine
6. **Vérifier**: Vous devez voir `accessToken` et `refreshToken`

---

## 📋 Checklist de Validation Backend

### Configuration des Cookies

- [ ] `POST /api/user/Authenticate` définit `accessToken` cookie (15 min)
- [ ] `POST /api/user/Authenticate` définit `refreshToken` cookie (7 jours)
- [ ] `POST /api/user/RefreshToken` rafraîchit les deux cookies
- [ ] `POST /api/user/RevokeToken` supprime les cookies (Max-Age=0)
- [ ] Attribut `HttpOnly: true` (protection XSS)
- [ ] Attribut `Secure: false` en dev / `true` en prod
- [ ] Attribut `SameSite: Lax` en dev / `Strict` en prod
- [ ] Path `/` pour accessToken
- [ ] Path `/api/user/RefreshToken` pour refreshToken

### Configuration CORS

- [ ] `AllowCredentials: true` activé
- [ ] Origins spécifiques listées (pas `AllowAnyOrigin`)
- [ ] Frontend URL incluse dans les origins
- [ ] Headers `X-Client-Type` et `X-Api-Version` autorisés

### Endpoints API

- [ ] `POST /api/user/SendOtp` - Envoie code OTP
- [ ] `POST /api/user/Authenticate` - Vérifie OTP + **définit cookies**
- [ ] `POST /api/user/RefreshToken` - **Rafraîchit cookies**
- [ ] `POST /api/user/RevokeToken` - **Supprime cookies**

---

## 🧪 Tests Rapides

### Test avec cURL

```bash
curl -X POST http://localhost:5000/api/user/Authenticate \
  -H "Content-Type: application/json" \
  -d '{"tenantID": 1, "email": "test@example.com", "otp": "123456"}' \
  -v

# Cherchez dans la sortie:
# < Set-Cookie: accessToken=...
# < Set-Cookie: refreshToken=...
```

### Test avec Postman

1. **Request**: `POST http://localhost:5000/api/user/Authenticate`
2. **Body**: 
   ```json
   {
     "tenantID": 1,
     "email": "test@example.com",
     "otp": "123456"
   }
   ```
3. **Send**
4. **Vérifier**: Onglet "Cookies" → voir `accessToken` et `refreshToken`

---

## 🔗 Documentation Complète

Pour plus de détails, consultez:

- **[Guide de Dépannage Complet](./TROUBLESHOOTING_COOKIES.md)**
- **[Flux d'Authentification](./COOKIE_AUTHENTICATION_FLOW.md)**
- **[Documentation OTP](./OTP_AUTHENTICATION.md)**

---

## 🚀 Prochaines Étapes

1. ✅ Implémenter la configuration des cookies dans le backend
2. ✅ Configurer CORS avec `AllowCredentials`
3. ✅ Tester avec cURL ou Postman
4. ✅ Vérifier dans DevTools que les cookies sont présents
5. ✅ Tester le flux complet d'authentification OTP

---

**Dernière mise à jour**: Mars 2026

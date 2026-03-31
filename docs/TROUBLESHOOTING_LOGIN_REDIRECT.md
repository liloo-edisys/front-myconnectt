# 🔧 Dépannage - Redirection Après Login BackOffice

## 🚨 Problème

Après le login OTP, vous accédez à `/backoffice-dashboard` mais êtes immédiatement redirigé vers `/auth/login`, et les cookies disparaissent.

---

## ✅ Correction Appliquée

Le problème d'incohérence Redux a été corrigé dans le commit `5605d82`:
- `AuthReducers.js` gère maintenant `REVOKE_TOKEN_SUCCESS`
- `setupAxios.js` détecte correctement l'authentification via `auth.user`
- Logs de débogage ajoutés

**Si le problème persiste après cette correction**, suivez ce guide de dépannage.

---

## 🔍 Diagnostic Étape par Étape

### Étape 1: Vérifier les Logs Console

Lors du login, la console devrait afficher:

```
[OTPAuthSaga] Authenticating with OTP, payload: { email: "...", otp: "..." }
[OTPAuthSaga] Authentication successful, response: { UserID: ..., UserName: "...", UserType: 2, ... }
[OTPAuthSaga] Updating main auth reducer with user data
[setupAxios] Auth state changed to authenticated, starting proactive refresh
Proactive token refresh triggered (4 minutes elapsed)
```

**Si ces logs n'apparaissent PAS** → Problème Redux/Saga

**Si "[setupAxios] Attempting to refresh token due to 401 error" apparaît immédiatement** → Cookies non définis par backend

---

### Étape 2: Vérifier les Cookies dans DevTools

1. **Ouvrir DevTools** (F12)
2. **Onglet Application** → **Cookies** → Sélectionner votre domaine
3. **Après le login**, vérifier la présence de:

| Nom | Valeur | HttpOnly | Secure | SameSite | Expires |
|-----|--------|----------|--------|----------|---------|
| `accessToken` | (JWT) | ✓ | ✓ (prod) | Strict | ~5 min |
| `refreshToken` | (JWT) | ✓ | ✓ (prod) | Strict | 7 jours |

**Si les cookies ne sont PAS présents** → Le backend ne les définit pas

**Si les cookies sont présents mais disparaissent immédiatement** → Problème de domaine/path/secure

---

### Étape 3: Vérifier les Headers HTTP

Dans **DevTools** → **Network**:

#### A. Requête d'Authentification OTP

1. Trouver la requête `POST /api/user/Authentificate`
2. Cliquer dessus → **Headers** → **Response Headers**
3. Vérifier la présence de:

```http
Set-Cookie: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=300; Path=/
Set-Cookie: refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3000
```

**Si `Set-Cookie` est absent** → **PROBLÈME BACKEND** (voir section Backend)

**Si `Access-Control-Allow-Credentials: true` est absent** → **PROBLÈME CORS**

#### B. Requête Suivante (après login)

1. Trouver la première requête API après le login
2. **Headers** → **Request Headers**
3. Vérifier la présence de:

```http
Cookie: accessToken=eyJhbG...; refreshToken=eyJhbG...
```

**Si `Cookie` est absent** → Le navigateur ne renvoie pas les cookies (prob. domaine/SameSite)

---

## 🛠️ Solutions par Problème

### Problème 1: Backend ne définit PAS les cookies

**Symptômes**:
- Pas de `Set-Cookie` dans Response Headers
- Cookies absents dans Application/Cookies

**Solution Backend (ASP.NET Core)**:

Vérifier que le backend définit bien les cookies après authentification:

```csharp
// Dans le contrôleur d'authentification OTP
public async Task<IActionResult> Authenticate([FromBody] OtpAuthRequest request)
{
    // ... validation OTP ...
    
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // ⭐ ESSENTIEL: Définir les cookies
    Response.Cookies.Append("accessToken", accessToken, new CookieOptions 
    {
        HttpOnly = true,
        Secure = !_env.IsDevelopment(),  // false en dev, true en prod
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddMinutes(5),
        Path = "/",
        IsEssential = true
    });
    
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions 
    {
        HttpOnly = true,
        Secure = !_env.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
        Path = "/",
        IsEssential = true
    });
    
    // Retourner les données utilisateur (PAS les tokens)
    return Ok(new { 
        UserID = user.Id, 
        UserName = user.Name, 
        UserType = user.Type,
        // ... autres données ...
    });
}
```

**Points critiques**:
- ✅ `Secure = !_env.IsDevelopment()` → `false` en dev HTTP, `true` en prod HTTPS
- ✅ `Path = "/"` → Cookies disponibles partout
- ✅ Ne PAS retourner les tokens dans le body de la réponse

---

### Problème 2: CORS mal configuré

**Symptômes**:
- Cookies définis dans Response mais pas envoyés par le navigateur
- Erreur CORS dans la console

**Solution Backend (ASP.NET Core)**:

```csharp
// Dans Startup.cs ou Program.cs
services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:3000",              // Dev local
                "https://votre-domaine.com"           // Prod
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // ⭐ ESSENTIEL pour les cookies
    });
});

// Dans Configure (Startup.cs) ou app (Program.cs)
app.UseCors();  // Avant UseAuthorization()
app.UseAuthorization();
```

**Point critique**: `AllowCredentials()` est **obligatoire** pour que les cookies fonctionnent.

---

### Problème 3: Attribut `Secure` en dev HTTP

**Symptômes**:
- Cookies définis dans Response
- Mais disparaissent immédiatement
- Application en dev sur `http://localhost`

**Solution**:

Le backend doit détecter l'environnement:

```csharp
Secure = !_env.IsDevelopment()  // ✅ false en dev, true en prod
```

**Pourquoi**: Les cookies avec `Secure=true` ne sont envoyés que sur HTTPS. En dev local (HTTP), ils sont ignorés.

---

### Problème 4: Domaine ou Path incorrect

**Symptômes**:
- Cookies définis mais pas envoyés avec les requêtes suivantes

**Vérifications**:

1. **Domaine des cookies** doit correspondre au domaine de l'application:
   - Si app sur `localhost:3000`, cookies doivent être sur `localhost`
   - Pas de sous-domaine ou domaine différent

2. **Path** doit être `/`:
   ```csharp
   Path = "/"  // ✅ Disponible partout
   ```

3. **SameSite** doit être compatible:
   - `Strict`: OK si frontend et backend sur même domaine
   - `None`: Nécessite `Secure=true` (HTTPS)

---

## 📊 Checklist Complète

### Frontend (React)

- [x] `setupAxios.js` inclut `withCredentials: true`
- [x] `AuthReducers.js` gère `REVOKE_TOKEN_SUCCESS`
- [x] `Routes.js` vérifie `auth.user != null`
- [x] Logs de débogage actifs

### Backend (ASP.NET Core)

- [ ] Cookies définis dans réponse d'authentification
- [ ] `HttpOnly: true` activé
- [ ] `Secure` basé sur environnement (`!IsDevelopment()`)
- [ ] `SameSite: Strict` défini
- [ ] `Path: "/"` défini
- [ ] CORS avec `AllowCredentials: true`
- [ ] CORS avec origines spécifiques (pas `*`)

### Réseau & Environnement

- [ ] Frontend et backend sur même domaine OU CORS configuré
- [ ] Dev local: backend sur HTTP (ou frontend aussi sur HTTP)
- [ ] Prod: backend ET frontend sur HTTPS
- [ ] Pas de proxy inverse qui supprime les cookies

---

## 🧪 Test Manuel

### 1. Login et Vérification Immédiate

```javascript
// Dans DevTools Console, après login
console.log("Redux auth.user:", store.getState().auth.user);
console.log("Redux otpAuth:", store.getState().otpAuth);
console.log("Cookies:", document.cookie); // ⚠️ Vide si HttpOnly (normal)
```

**Attendu**:
- `auth.user`: objet avec UserID, UserName, UserType, etc.
- `otpAuth.isAuthenticated`: `true`
- `document.cookie`: vide (car HttpOnly - c'est normal ✅)

### 2. Vérifier Application/Cookies

Dans DevTools → Application → Cookies, vous devez voir:
- `accessToken` avec valeur JWT
- `refreshToken` avec valeur JWT

### 3. Faire une Requête API

```javascript
// Dans Console
axios.get('/api/user/me', { withCredentials: true })
  .then(r => console.log("API Response:", r.data))
  .catch(e => console.error("API Error:", e));
```

**Si erreur 401** → Les cookies ne sont pas envoyés

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. **Collecter les informations**:
   - Screenshot des cookies dans Application
   - Screenshot des headers HTTP (Request + Response)
   - Copie des logs console
   - Configuration backend (CORS, cookies)

2. **Vérifier la documentation**:
   - [COOKIE_AUTHENTICATION_FLOW.md](./COOKIE_AUTHENTICATION_FLOW.md)
   - [BACKEND_CONFIRMED_CONFIG.md](./BACKEND_CONFIRMED_CONFIG.md)
   - [TROUBLESHOOTING_COOKIES.md](./TROUBLESHOOTING_COOKIES.md)

3. **Points à vérifier en priorité**:
   - Backend définit-il bien les cookies? (Set-Cookie present)
   - CORS AllowCredentials activé?
   - Secure basé sur environnement?

---

**Dernière mise à jour**: Mars 2026  
**Commit de correction**: 5605d82

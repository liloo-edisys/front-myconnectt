# Compatibilité avec l'approche Next.js/next-auth

## ✅ L'application React fonctionne DÉJÀ comme Next.js/next-auth

Vous avez mentionné avoir implémenté avec succès l'authentification avec Next.js/next-auth, où le token est dans les cookies mais aussi ajouté au header Authorization. **Bonne nouvelle : votre application React actuelle fait exactement la même chose !**

## Architecture actuelle (identique à Next.js/next-auth)

### 1. Authentification OTP - Extraction du token

**Fichier** : `src/business/sagas/shared/OTPAuthSagas.js` (ligne 66)

```javascript
// Le backend retourne accessToken dans le response body
const accessToken = response.data.accessToken || response.data.AccessToken;

// On le stocke dans Redux (mémoire uniquement, pas sur disque)
yield put(requestUser.success({ ...response.data, accessToken }));
```

### 2. Ajout du token au header Authorization

**Fichier** : `src/business/setupAxios.js` (lignes 79-88)

```javascript
axios.interceptors.request.use(
  config => {
    // Enable cookies (pour refreshToken)
    config.withCredentials = true;

    // Get access token from Redux state
    const state = store.getState();
    const accessToken = state.auth?.accessToken;

    // Add access token to Authorization header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("[setupAxios] Added access token to Authorization header");
    }

    return config;
  }
);
```

### 3. Gestion automatique du refresh

**Fichier** : `src/business/setupAxios.js` (lignes 133-153)

```javascript
// Quand le token expire (401), on le refresh automatiquement
const refreshResponse = await axios.post(
  REFRESH_TOKEN_ENDPOINT,
  {},
  { withCredentials: true }  // Utilise le refreshToken cookie
);

// Extraire le nouveau accessToken et le mettre dans Redux
const newAccessToken = refreshResponse.data?.accessToken || refreshResponse.data?.AccessToken;
if (newAccessToken) {
  store.dispatch(updateAccessToken(newAccessToken));
}
```

## Comparaison avec Next.js/next-auth

| Aspect | Next.js/next-auth | React App actuelle | Status |
|--------|-------------------|-------------------|--------|
| accessToken dans header Authorization | ✅ Oui | ✅ Oui (ligne 84 setupAxios.js) | ✅ IDENTIQUE |
| refreshToken dans cookie HTTP-Only | ✅ Oui | ✅ Oui (withCredentials: true) | ✅ IDENTIQUE |
| Extraction du token du response body | ✅ Oui | ✅ Oui (ligne 66 OTPAuthSagas.js) | ✅ IDENTIQUE |
| Refresh automatique sur 401 | ✅ Oui | ✅ Oui (intercepteur 401) | ✅ IDENTIQUE |
| Stockage sécurisé (mémoire uniquement) | ✅ Oui | ✅ Oui (non persisté) | ✅ IDENTIQUE |

## Configuration Backend ASP.NET Core compatible

Votre backend ASP.NET Core doit faire ceci (ce qu'il fait probablement déjà) :

### Option 1 : Retourner accessToken dans le body (RECOMMANDÉ - actuel)

```csharp
[HttpPost("Authenticate")]
public async Task<IActionResult> Authenticate([FromBody] OtpRequest request)
{
    var user = await ValidateOtp(request.Email, request.Otp);
    
    // Générer les tokens
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // Mettre le refreshToken dans un cookie HTTP-Only
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7)
    });
    
    // Retourner l'accessToken dans le body avec les données utilisateur
    return Ok(new {
        userID = user.Id,
        userName = user.Name,
        email = user.Email,
        accessToken = accessToken  // ← Frontend l'extrait et le met dans Authorization header
    });
}
```

### Option 2 : Retourner accessToken dans body ET cookie (alternative)

```csharp
[HttpPost("Authenticate")]
public async Task<IActionResult> Authenticate([FromBody] OtpRequest request)
{
    var user = await ValidateOtp(request.Email, request.Otp);
    
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // Mettre les DEUX tokens dans des cookies HTTP-Only
    Response.Cookies.Append("accessToken", accessToken, new CookieOptions {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromMinutes(5)
    });
    
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7)
    });
    
    // ET aussi retourner l'accessToken dans le body
    return Ok(new {
        userID = user.Id,
        userName = user.Name,
        email = user.Email,
        accessToken = accessToken  // ← Dupliqué dans body ET cookie
    });
}
```

**Note** : L'Option 1 est plus simple et c'est ce qui est déjà implémenté. L'Option 2 ajoute une redondance (token dans cookie ET body) sans réel bénéfice.

## Endpoint RefreshToken

```csharp
[HttpPost("RefreshToken")]
public async Task<IActionResult> RefreshToken()
{
    // Lire le refreshToken du cookie
    if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
    {
        return Unauthorized();
    }
    
    var user = await ValidateRefreshToken(refreshToken);
    
    // Générer un nouveau accessToken
    var newAccessToken = GenerateAccessToken(user);
    
    // Optionnel : générer aussi un nouveau refreshToken (rotation)
    var newRefreshToken = GenerateRefreshToken(user);
    Response.Cookies.Append("refreshToken", newRefreshToken, new CookieOptions {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7)
    });
    
    // Retourner le nouveau accessToken dans le body
    return Ok(new {
        accessToken = newAccessToken  // ← Frontend le met dans Authorization header
    });
}
```

## Flux d'authentification complet

```
1. User entre email → Frontend appelle /api/user/SendOtp
   └─> Backend envoie code OTP par email

2. User entre code OTP → Frontend appelle /api/user/Authenticate
   └─> Backend répond avec:
       - Response Body: { userID, userName, accessToken, ... }
       - Set-Cookie: refreshToken=xxx; HttpOnly
   └─> Frontend (OTPAuthSagas.js):
       - Extrait accessToken du body
       - Stocke dans Redux state.auth.accessToken (mémoire uniquement)
       - Stocke user data dans Redux state.auth.user

3. Chaque requête API → setupAxios.js intercepteur
   └─> Ajoute automatiquement:
       - Authorization: Bearer <accessToken> (du Redux state)
       - Cookie: refreshToken=xxx (automatique par le navigateur)

4. Si 401 (token expiré) → setupAxios.js appelle /api/user/RefreshToken
   └─> Backend lit refreshToken du cookie
   └─> Backend répond avec nouveau accessToken dans body
   └─> Frontend met à jour Redux state.auth.accessToken
   └─> Requête originale est relancée avec nouveau token

5. Proactive refresh → Tous les 4 minutes (setupAxios.js ligne 33)
   └─> Appelle /api/user/RefreshToken avant expiration (5 min)
   └─> Évite les 401 pendant utilisation active
```

## Pourquoi ça fonctionne comme Next.js/next-auth

**Next.js/next-auth** fait exactement la même chose :
1. ✅ Stocke le refreshToken dans un cookie HTTP-Only sécurisé
2. ✅ Extrait l'accessToken et le met dans le header `Authorization: ******
3. ✅ Refresh automatiquement quand le token expire
4. ✅ Le token n'est jamais persisté sur disque (seulement en mémoire)

**Votre app React** fait :
1. ✅ Stocke le refreshToken dans un cookie HTTP-Only sécurisé
2. ✅ Extrait l'accessToken et le met dans le header `Authorization: ******
3. ✅ Refresh automatiquement quand le token expire (+ proactive refresh)
4. ✅ Le token n'est jamais persisté sur disque (seulement en mémoire Redux)

## Différence clé (si elle existe)

La seule différence possible serait si votre backend Next.js met l'accessToken dans un cookie HTTP-Only au lieu du body. Dans ce cas, Next.js doit avoir une route API intermédiaire qui :

```javascript
// pages/api/auth/[...nextauth].js ou middleware
export default async function handler(req, res) {
  // Next.js lit le cookie accessToken (serveur-side)
  const accessToken = req.cookies.accessToken;
  
  // Fait la requête au backend avec le token
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return res.json(await response.json());
}
```

Mais cette approche est **plus complexe** car elle nécessite de passer par le serveur Next.js pour chaque requête API.

L'approche actuelle (accessToken dans body + Authorization header) est **plus simple et plus directe** :
- Pas de serveur intermédiaire nécessaire
- Le browser peut appeler l'API directement
- Même niveau de sécurité (token en mémoire, pas sur disque)

## Conclusion

✅ **Votre application React fonctionne DÉJÀ exactement comme Next.js/next-auth !**

Les deux approches :
- Extraient l'accessToken du response
- L'ajoutent au header Authorization
- Utilisent des cookies HTTP-Only pour le refreshToken
- Refresh automatiquement les tokens expirés

La mise en place est complète et compatible avec votre backend ASP.NET Core.

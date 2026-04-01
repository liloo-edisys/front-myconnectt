# ⚡ RÉPONSE RAPIDE : Token dans Header malgré les Cookies

## 🎯 Votre Question

> "L'API ASP.NET ne retourne plus l'access token dans le body mais seulement dans cookies.  
> Avec Next.js, j'ai pu envoyer l'access token dans le header même s'il est dans les cookies."

## ✅ La Réponse en 30 Secondes

**Les cookies HTTP-Only ne sont PAS accessibles au JavaScript !**

Pour que votre frontend React (ou Next.js) puisse extraire le token et le mettre dans le header `Authorization`, votre backend **DOIT** retourner l'`accessToken` dans le **response body**.

C'est exactement ce que fait votre backend Next.js (vérifiez avec DevTools).

## 🔧 Solution : Modifiez Votre Backend ASP.NET

```csharp
[HttpPost("api/user/Authenticate")]
public IActionResult Authenticate([FromBody] OtpAuthRequest request)
{
    var user = ValidateOtp(request.Email, request.Otp);
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // ✅ refreshToken → Cookie HTTP-Only (sécurité)
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    {
        HttpOnly = true,
        Secure = !isDevelopment,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7)
    });
    
    // ✅ accessToken → Response Body (REQUIS pour que JS puisse le lire)
    return Ok(new
    {
        UserID = user.UserID,
        UserName = user.UserName,
        Email = user.Email,
        AccessToken = accessToken  // ⭐ AJOUTEZ CECI !
    });
}
```

## 🎯 Pourquoi ?

```javascript
// ❌ IMPOSSIBLE - HTTP-Only cookies sont protégés
document.cookie // Ne montre PAS les cookies HttpOnly

// ✅ POSSIBLE - Response body accessible
response.data.accessToken // ✅ Le frontend peut le lire !
```

## ✅ Votre Frontend React Fonctionne Déjà !

Le code React extrait déjà le token du body :

```javascript
// src/business/sagas/shared/OTPAuthSagas.js ligne 66
const accessToken = response.data.accessToken || response.data.AccessToken;

// src/business/setupAxios.js ligne 84
config.headers.Authorization = `Bearer ${accessToken}`;
```

**Tout est prêt côté frontend !** Il faut juste que le backend retourne le token dans le body.

## 🧪 Comment Vérifier

### Backend (cURL)

```bash
curl -X POST http://localhost:5000/api/user/Authenticate \
  -H "Content-Type: application/json" \
  -d '{"tenantID": 1, "email": "test@example.com", "otp": "123456"}' \
  -v

# ✅ Cherchez dans la sortie :
# {"userID":123,"userName":"...","accessToken":"eyJ..."}
```

### Frontend (DevTools)

1. **F12** → **Network**
2. Login avec OTP
3. Trouvez `POST /api/user/Authenticate`
4. **Response** tab :
   ```json
   {
     "userID": 123,
     "userName": "...",
     "accessToken": "eyJ..."  ✅ Doit être présent !
   }
   ```

## 📚 Documentation Complète

Pour plus de détails, consultez :
- [RÉSUMÉ_TOKEN_HEADER_NEXTJS.md](./RÉSUMÉ_TOKEN_HEADER_NEXTJS.md) - Guide complet en français
- [BACKEND_TOKEN_IN_COOKIE_AND_BODY.md](./BACKEND_TOKEN_IN_COOKIE_AND_BODY.md) - Code détaillé C#

---

**En résumé** : Modifiez votre endpoint `Authenticate` pour retourner `AccessToken` dans le response body. C'est tout ! 🎉

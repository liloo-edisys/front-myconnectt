# ✅ Configuration Backend Confirmée - ASP.NET Core

## 🎉 Statut: BACKEND CORRECTEMENT CONFIGURÉ

Le backend ASP.NET Core est **déjà correctement configuré** avec les cookies HTTP-Only et **fonctionne avec Next.js**.

---

## 📝 Configuration Actuelle du Backend

### Cookies Définis par le Backend

Le backend définit deux cookies HTTP-Only lors de l'authentification:

```csharp
// Access Token - Court (5 minutes)
context.Response.Cookies.Append(ACCESS_TOKEN_COOKIE, accessToken, new CookieOptions 
{
    HttpOnly = true,                        // ✅ Protection XSS
    Secure = !env.IsDevelopment(),          // ✅ false en dev, true en prod
    SameSite = SameSiteMode.Strict,         // ✅ Protection CSRF
    Expires = DateTimeOffset.UtcNow.AddMinutes(5),  // ✅ 5 minutes
    Path = "/",                             // ✅ Disponible partout
    IsEssential = true                      // ✅ Cookie essentiel
});

// Refresh Token - Long (7 jours)
context.Response.Cookies.Append(REFRESH_TOKEN_COOKIE, refreshToken, new CookieOptions 
{
    HttpOnly = true,                        // ✅ Protection XSS
    Secure = !env.IsDevelopment(),          // ✅ false en dev, true en prod
    SameSite = SameSiteMode.Strict,         // ✅ Protection CSRF
    Expires = DateTimeOffset.UtcNow.AddDays(7),     // ✅ 7 jours
    Path = "/",                             // ✅ Même path que accessToken
    IsEssential = true                      // ✅ Cookie essentiel
});
```

---

## 🔑 Caractéristiques Clés

### Access Token (accessToken)

| Propriété | Valeur | Description |
|-----------|--------|-------------|
| **Durée** | 5 minutes | Token de courte durée pour les requêtes API |
| **HttpOnly** | `true` | JavaScript ne peut pas lire (protection XSS) |
| **Secure** | `true` en prod | Envoyé uniquement en HTTPS (production) |
| **SameSite** | `Strict` | Protection CSRF maximale |
| **Path** | `/` | Disponible sur tout le site |
| **IsEssential** | `true` | Cookie nécessaire au fonctionnement |

### Refresh Token (refreshToken)

| Propriété | Valeur | Description |
|-----------|--------|-------------|
| **Durée** | 7 jours | Token longue durée pour renouveler l'access token |
| **HttpOnly** | `true` | JavaScript ne peut pas lire (protection XSS) |
| **Secure** | `true` en prod | Envoyé uniquement en HTTPS (production) |
| **SameSite** | `Strict` | Protection CSRF maximale |
| **Path** | `/` | Disponible sur tout le site (pas restrictif) |
| **IsEssential** | `true` | Cookie nécessaire au fonctionnement |

---

## 📊 Comparaison avec la Documentation Initiale

### Différences Notables

| Aspect | Documentation Initiale | Configuration Réelle |
|--------|----------------------|---------------------|
| **Durée Access Token** | 15 minutes | **5 minutes** ⚠️ |
| **Path Refresh Token** | `/api/user/RefreshToken` | `/` ✅ |
| **IsEssential** | Non mentionné | `true` ✅ |

**⚠️ Note Importante**: 
- Le **Access Token expire après 5 minutes** (pas 15)
- Le frontend doit rafraîchir les tokens **toutes les 5 minutes maximum**
- Le **Refresh Token** est disponible sur tout le site (`Path = "/"`) au lieu d'être restreint à `/api/user/RefreshToken`

---

## ✅ Vérification de la Configuration CORS

Pour que les cookies fonctionnent, le backend doit aussi avoir:

```csharp
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
```

**Statut**: ✅ **Confirmé fonctionnel** (fonctionne avec Next.js)

---

## 🔧 Configuration Frontend Requise

### 1️⃣ Axios doit avoir `withCredentials: true`

**Fichier**: `src/business/setupAxios.js`

```javascript
axios.interceptors.request.use(config => {
  config.withCredentials = true;  // ✅ Envoie automatiquement les cookies
  return config;
});
```

**Statut**: ✅ **Déjà configuré**

### 2️⃣ Endpoints API avec `withCredentials`

**Fichier**: `src/business/api/shared/AuthApi.js`

```javascript
export function authenticateWithOtp(data) {
  return axios.post(
    AUTHENTICATE_OTP_URL,
    { tenantID, email, otp },
    {
      withCredentials: true  // ✅ Reçoit les cookies du backend
    }
  );
}
```

**Statut**: ✅ **Déjà configuré**

---

## 🧪 Test de Vérification

### Comment Vérifier que les Cookies Sont Présents

1. **Se connecter** avec OTP dans l'application React
2. **Ouvrir DevTools** (F12) → **Application** → **Cookies**
3. **Sélectionner** votre domaine
4. **Vérifier** la présence de:
   - `accessToken` (expire dans 5 minutes)
   - `refreshToken` (expire dans 7 jours)

### Headers de Réponse Attendus

Lors de l'authentification, la réponse HTTP doit contenir:

```http
HTTP/1.1 200 OK
Set-Cookie: accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=300; Path=/
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3000
```

---

## ⏱️ Timing du Refresh Token

### Configuration Actuelle

**Access Token**: 5 minutes  
**Refresh proactif**: Toutes les 10 minutes (configuré dans `setupAxios.js`)

**⚠️ PROBLÈME POTENTIEL DÉTECTÉ**:

Le frontend est configuré pour rafraîchir **toutes les 10 minutes**, mais l'access token expire après **5 minutes**!

### Solution Recommandée

Le timer de refresh proactif dans `setupAxios.js` doit être ajusté:

```javascript
// Actuellement (INCORRECT):
const REFRESH_INTERVAL = 10 * 60 * 1000;  // 10 minutes

// Devrait être (CORRECT):
const REFRESH_INTERVAL = 4 * 60 * 1000;   // 4 minutes (avant expiration de 5 min)
```

**Action Requise**: Ajuster le timer de refresh dans le frontend pour qu'il soit < 5 minutes

---

## 📋 Checklist de Validation

### Backend (ASP.NET Core)
- [x] Cookies définis dans les headers `Set-Cookie`
- [x] `HttpOnly: true` activé
- [x] `Secure` configuré par environnement
- [x] `SameSite: Strict` activé
- [x] `IsEssential: true` défini
- [x] CORS avec `AllowCredentials: true`
- [x] Configuration testée et fonctionnelle avec Next.js

### Frontend (React)
- [x] `withCredentials: true` dans setupAxios.js
- [x] `withCredentials: true` dans les appels API
- [ ] Timer de refresh ajusté à < 5 minutes ⚠️

---

## 🎯 Action Immédiate Recommandée

**Problème**: Le refresh proactif se déclenche **après** l'expiration de l'access token

**Solution**: Mettre à jour `src/business/setupAxios.js`:

```javascript
// Ligne à modifier (environ ligne 28)
const REFRESH_INTERVAL = 4 * 60 * 1000;  // 4 minutes au lieu de 10
```

Cela garantit que le refresh se produit **avant** que l'access token n'expire (5 minutes).

---

## 📚 Documents Associés

- [Cookie Authentication Flow](./COOKIE_AUTHENTICATION_FLOW.md) - Flux complet d'authentification
- [Troubleshooting Cookies](./TROUBLESHOOTING_COOKIES.md) - Guide de dépannage
- [Backend Cookie Setup Required](./BACKEND_COOKIE_SETUP_REQUIRED.md) - Configuration backend (pour référence)
- [OTP Authentication](./OTP_AUTHENTICATION.md) - Système d'authentification OTP

---

## 🎉 Conclusion

Le backend est **correctement configuré** et **fonctionne**. La seule modification recommandée est:

1. ✅ **Backend**: Aucune modification nécessaire - configuration parfaite
2. ⚠️ **Frontend**: Ajuster le timer de refresh de 10 minutes à 4 minutes

**Dernière mise à jour**: Mars 2026

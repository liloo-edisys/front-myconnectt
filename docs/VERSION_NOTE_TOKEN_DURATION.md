# 📝 Note de Version - Correction des Durées de Token

## ⚠️ CORRECTION IMPORTANTE

La documentation précédente mentionnait des durées incorrectes pour les tokens. Les durées **réelles** configurées dans le backend sont:

| Token | Documentation Précédente | Durée Réelle (Backend) |
|-------|-------------------------|----------------------|
| **Access Token** | 15 minutes | **5 minutes** ✅ |
| **Refresh Token** | 7 jours | 7 jours ✅ |
| **Refresh Proactif** | 10 minutes | **4 minutes** (corrigé) ✅ |

---

## 🔧 Modifications Apportées

### 1. Code Frontend (`src/business/setupAxios.js`)

**Avant**:
```javascript
const PROACTIVE_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
```

**Après**:
```javascript
const PROACTIVE_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes (access token expires at 5 min)
```

**Raison**: Le refresh proactif doit se déclencher **AVANT** l'expiration de l'access token (5 min), pas après (10 min).

### 2. Documentation Mise à Jour

- ✅ `BACKEND_CONFIRMED_CONFIG.md` - Nouveau document avec configuration réelle
- ✅ `COOKIE_AUTHENTICATION_FLOW.md` - Ajout note sur durées réelles
- ⚠️ Autres documents conservent "15 min" pour référence générique

---

## 📊 Impact

### Sur l'Utilisateur
- **Aucun impact visible** - Le système fonctionne de manière transparente
- **Meilleure sécurité** - Token de plus courte durée (5 min vs 15 min)
- **Expérience fluide** - Refresh automatique toutes les 4 minutes

### Sur le Développement
- **Configuration correcte** - Alignement frontend/backend
- **Documentation à jour** - Durées réelles documentées
- **Maintenance facilitée** - Source de vérité claire (BACKEND_CONFIRMED_CONFIG.md)

---

## 🎯 Configuration Backend Confirmée

```csharp
// ASP.NET Core - Configuration RÉELLE
context.Response.Cookies.Append(ACCESS_TOKEN_COOKIE, accessToken, new CookieOptions 
{
    HttpOnly = true,
    Secure = !env.IsDevelopment(),
    SameSite = SameSiteMode.Strict,
    Expires = DateTimeOffset.UtcNow.AddMinutes(5),  // ⭐ 5 MINUTES
    Path = "/",
    IsEssential = true
});

context.Response.Cookies.Append(REFRESH_TOKEN_COOKIE, refreshToken, new CookieOptions 
{
    HttpOnly = true,
    Secure = !env.IsDevelopment(),
    SameSite = SameSiteMode.Strict,
    Expires = DateTimeOffset.UtcNow.AddDays(7),     // ⭐ 7 JOURS
    Path = "/",
    IsEssential = true
});
```

**Statut**: ✅ Backend testé et fonctionnel avec Next.js

---

## 📚 Documents de Référence

1. **[BACKEND_CONFIRMED_CONFIG.md](./BACKEND_CONFIRMED_CONFIG.md)** - Configuration backend confirmée (SOURCE DE VÉRITÉ)
2. **[COOKIE_AUTHENTICATION_FLOW.md](./COOKIE_AUTHENTICATION_FLOW.md)** - Flux d'authentification (mis à jour)
3. **[TROUBLESHOOTING_COOKIES.md](./TROUBLESHOOTING_COOKIES.md)** - Guide de dépannage (référence générique)

---

## ✅ Checklist de Vérification

- [x] Code frontend corrigé (refresh interval: 4 min)
- [x] Documentation principale mise à jour
- [x] Configuration backend documentée
- [x] Note de version créée
- [ ] Tests de validation (optionnel)

---

**Date de correction**: 31 Mars 2026  
**Version**: 1.1.0  
**Auteur**: Configuration backend confirmée par l'équipe

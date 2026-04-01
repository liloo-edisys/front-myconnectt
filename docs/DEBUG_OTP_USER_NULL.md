# 🐛 Débogage: isAuthenticated = true mais user = null

## 📋 Description du Problème

Après l'authentification OTP:
- ✅ `otpAuth.isAuthenticated` est `true`
- ✅ `otpAuth.email` contient l'email
- ❌ `auth.user` est `null` ou `undefined`
- ❌ Impossible de rediriger vers le dashboard

## 🔍 Diagnostic avec Logs de Débogage

### Étape 1: Tester le Login OTP

1. Aller sur `/auth/login`
2. Entrer votre email
3. Recevoir le code OTP (vérifier vos emails)
4. Entrer le code OTP à 6 chiffres
5. **OUVRIR LA CONSOLE** (F12) **AVANT** de cliquer sur "Vérifier"

### Étape 2: Analyser les Logs

Les logs apparaîtront dans cet ordre:

#### A. Logs du Saga OTP (authenticateOtpSaga)

```
[OTPAuthSaga] Authenticating with OTP, payload: { email: "...", otp: "123456" }
[OTPAuthSaga] Authentication successful, full response: { data: {...}, status: 200, ... }
[OTPAuthSaga] Response data: { UserID: 123, UserName: "...", UserType: 2, ... }
[OTPAuthSaga] Response data type: "object"
[OTPAuthSaga] Response data keys: ["UserID", "UserName", "UserType", "TenantID", ...]
[OTPAuthSaga] Dispatched authenticateOtpSuccess
[OTPAuthSaga] About to dispatch requestUser.success with: { UserID: 123, ... }
[OTPAuthSaga] Dispatched requestUser.success
```

**Points à vérifier**:
- ✅ `Response data` contient bien les données utilisateur
- ✅ `Response data keys` liste les champs attendus (UserID, UserName, UserType, etc.)
- ✅ Les données sont-elles à la racine de `response.data` ou dans un sous-objet?

#### B. Logs du Reducer Auth

```
[AuthReducer] CLIENT_USER__SUCCESS received, action: { type: "...", payload: {...} }
[AuthReducer] action.payload: { user: { UserID: 123, ... } }
[AuthReducer] action.payload.user: { UserID: 123, UserName: "...", ... }
[AuthReducer] Extracted user: { UserID: 123, UserName: "...", ... }
```

**Points à vérifier**:
- ✅ `action.payload.user` contient bien les données utilisateur
- ⚠️ Si `action.payload.user` est `undefined` → **PROBLÈME IDENTIFIÉ**

#### C. Logs du Composant OTPVerify

```
[OTPVerify] State changed:
  - isAuthenticated: true
  - user: { UserID: 123, UserName: "...", UserType: 2, ... }
  - email: "user@example.com"
  - loading: false
```

**Points à vérifier**:
- ✅ `user` devrait contenir les données utilisateur
- ❌ Si `user: null` → **PROBLÈME CONFIRMÉ**

---

## 🛠️ Solutions par Scénario

### Scénario 1: `response.data` est vide ou mal structuré

**Symptômes**:
```
[OTPAuthSaga] Response data: null
[OTPAuthSaga] Response data keys: []
```

**Cause**: Le backend ne retourne pas les données utilisateur dans la réponse

**Solution Backend (ASP.NET Core)**:

```csharp
public async Task<IActionResult> Authenticate([FromBody] OtpAuthRequest request)
{
    // ... validation OTP ...
    
    // ⚠️ IMPORTANT: Retourner les données utilisateur
    return Ok(new 
    { 
        UserID = user.Id, 
        UserName = user.Name, 
        UserType = user.Type,  // 0: Interimaire, 1: Client, 2: BackOffice
        TenantID = user.TenantId,
        Email = user.Email,
        // ... autres champs nécessaires ...
    });
}
```

---

### Scénario 2: Les données sont imbriquées dans `response.data.user`

**Symptômes**:
```
[OTPAuthSaga] Response data: { user: { UserID: 123, ... }, success: true }
[OTPAuthSaga] Response data keys: ["user", "success"]
[AuthReducer] action.payload.user: undefined
```

**Cause**: Les données utilisateur sont dans `response.data.user` au lieu de `response.data` directement

**Solution Frontend**:

Modifier `src/business/sagas/shared/OTPAuthSagas.js`:

```javascript
export function* authenticateOtpSaga({ payload }) {
  try {
    const response = yield call(authenticateWithOtpApi, payload);
    
    // ✅ CORRECTION: Extraire les données utilisateur si elles sont imbriquées
    const userData = response.data.user || response.data;
    
    console.log("[OTPAuthSaga] User data extracted:", userData);
    
    yield put(authenticateOtpSuccess(userData));
    yield put(requestUser.success(userData));
    
    toastr.success("Authentification réussie", "Vous êtes maintenant connecté");
  } catch (error) {
    // ... gestion d'erreur ...
  }
}
```

---

### Scénario 3: `action.payload.user` est `undefined`

**Symptômes**:
```
[AuthReducer] action.payload: { UserID: 123, ... }  // Pas de clé "user"
[AuthReducer] action.payload.user: undefined
[AuthReducer] Extracted user: undefined
```

**Cause**: Les données sont passées directement sans wrapper `{user: ...}`

**Explication**:

L'action `requestUser.success(data)` devrait créer:
```javascript
{
  type: "CLIENT_USER__SUCCESS",
  payload: { user: data }  // ✅ Wrapper automatique
}
```

Si les données arrivent comme `payload: data` au lieu de `payload: {user: data}`, vérifier `src/business/actions/shared/AuthActions.js`:

```javascript
export const requestUser = {
  success: user => ({
    type: actionTypes.CLIENT_USER__SUCCESS,
    payload: { user }  // ✅ Doit wrapper dans { user }
  })
};
```

---

### Scénario 4: Les données arrivent mais `user` est toujours `null` dans le composant

**Symptômes**:
```
[AuthReducer] Extracted user: { UserID: 123, ... }  // ✅ OK
[OTPVerify] State changed:
  - user: null  // ❌ Problème
```

**Cause**: Le selector Redux ne pointe pas vers le bon état

**Solution**:

Vérifier dans `src/ui/components/client/auth/OTPVerify.js`:

```javascript
const { user } = useSelector(
  state => ({
    user: state.auth?.user || null  // ✅ Doit pointer vers state.auth
  }),
  shallowEqual
);
```

Vérifier également la structure de l'état Redux dans la console:
```javascript
// Dans la console
store.getState().auth
// Devrait afficher: { user: { UserID: 123, ... }, loading: false }
```

---

### Scénario 5: Problème de persistance Redux

**Symptômes**:
- Les données sont correctes dans les logs
- Mais disparaissent après un refresh de page
- Ou ne sont pas persistées dans localStorage

**Vérification**:

Dans `src/business/reducers/share/AuthReducers.js`:

```javascript
export const clientAuthReducer = persistReducer(
  { 
    storage, 
    key: "myconnectt-auth", 
    whitelist: ["user"]  // ✅ "user" doit être dans la whitelist
  },
  (state = initialAuthState, action) => {
    // ...
  }
);
```

Vérifier dans **DevTools** → **Application** → **Local Storage**:
- Clé: `persist:myconnectt-auth`
- Valeur devrait contenir: `{"user":{...}}`

---

## 🧪 Tests Manuels

### Test 1: Vérifier la Réponse API Brute

Dans la console, après avoir entré le code OTP:

```javascript
// Intercepter la réponse
// (déjà fait avec les logs ajoutés)
```

Ou utiliser **DevTools** → **Network** → Cliquer sur la requête `Authentificate`:

1. **Response** tab → Voir le JSON retourné
2. Vérifier que le JSON contient:
   ```json
   {
     "UserID": 123,
     "UserName": "...",
     "UserType": 2,
     "TenantID": 1,
     "Email": "user@example.com"
   }
   ```

### Test 2: Vérifier l'État Redux

Dans la console:

```javascript
// Accéder au store Redux
store.getState()

// Vérifier otpAuth
store.getState().otpAuth
// Devrait afficher: { user: {...}, isAuthenticated: true, email: "...", ... }

// Vérifier auth
store.getState().auth
// Devrait afficher: { user: {...}, loading: false }

// Vérifier que les deux ont le même user
store.getState().otpAuth.user === store.getState().auth.user
// Devrait être false (objets différents) mais avec les mêmes données
```

---

## 📊 Checklist de Diagnostic

- [ ] Les logs `[OTPAuthSaga]` s'affichent dans la console
- [ ] `Response data` contient les données utilisateur
- [ ] `Response data keys` liste tous les champs attendus
- [ ] Les logs `[AuthReducer]` s'affichent
- [ ] `action.payload.user` n'est PAS `undefined`
- [ ] `Extracted user` contient les données
- [ ] Les logs `[OTPVerify]` s'affichent
- [ ] `user` dans `[OTPVerify]` n'est PAS `null`
- [ ] `isAuthenticated` est `true`
- [ ] La redirection vers `/backoffice-dashboard` fonctionne

---

## 🚀 Après Correction

Une fois le problème identifié et corrigé:

1. **Retirer les logs de débogage** (optionnel, ou les laisser pour le support futur)
2. **Tester le flow complet**:
   - Login OTP
   - Vérification du code
   - Redirection vers dashboard
   - Refresh de page (persistence)
   - Logout
   - Re-login

3. **Documenter la solution** si elle n'est pas déjà couverte dans ce guide

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. **Collecter les informations**:
   - Copie complète des logs console
   - Screenshot de l'état Redux (`store.getState()`)
   - Réponse API brute (Network tab)
   - Version du backend utilisée

2. **Vérifier les documents connexes**:
   - [TROUBLESHOOTING_LOGIN_REDIRECT.md](./TROUBLESHOOTING_LOGIN_REDIRECT.md)
   - [COOKIE_AUTHENTICATION_FLOW.md](./COOKIE_AUTHENTICATION_FLOW.md)
   - [BACKEND_CONFIRMED_CONFIG.md](./BACKEND_CONFIRMED_CONFIG.md)

3. **Créer un issue GitHub** avec toutes les informations collectées

---

**Dernière mise à jour**: Mars 2026  
**Commit**: 65a4c4f

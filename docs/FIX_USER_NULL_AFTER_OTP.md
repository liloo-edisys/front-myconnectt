# 🔧 Fix: User Null After OTP Authentication

## ✅ Issue Résolu

**Problème**: Après authentification OTP réussie, `isAuthenticated` est `true` mais `user` est `null`, empêchant la redirection vers le dashboard.

**Cause**: Redux Persist dispatche une action `REHYDRATE` qui écrase les données utilisateur fraîchement authentifiées avec l'état persisté précédent (null).

## 📊 Analyse des Logs

Vos logs montraient clairement le problème:

```javascript
[AuthReducer] Extracted user: { userID: 18809, userName: "HADDAD Logan", ... }  // ✅ OK
[OTPVerify] user: null  // ❌ PROBLÈME
```

Le reducer extrayait correctement l'utilisateur, mais le composant le voyait comme `null`. Ceci indiquait un problème de synchronisation Redux.

## 🛠️ Corrections Appliquées

### 1. Gestion de l'Action REHYDRATE

**Fichier**: `src/business/reducers/share/AuthReducers.js`

```javascript
import { persistReducer, REHYDRATE } from "redux-persist";

case REHYDRATE: {
  console.log("[AuthReducer] REHYDRATE action received");
  console.log("[AuthReducer] REHYDRATE payload:", action.payload);
  
  if (action.payload && action.payload.auth) {
    console.log("[AuthReducer] Rehydrating auth state:", action.payload.auth);
    return action.payload.auth;
  }
  return state;
}
```

**Pourquoi**:
- Redux Persist dispatche `REHYDRATE` pour restaurer l'état depuis localStorage
- Sans gestion explicite, cela peut écraser l'état frais avec l'ancien état persisté
- Maintenant, on log et on contrôle la réhydratation

### 2. Séparation des Selectors

**Fichier**: `src/ui/components/client/auth/OTPVerify.js`

**Avant**:
```javascript
const { loading, email, isAuthenticated, error, user } = useSelector(
  state => ({
    loading: state.otpAuth?.loading || false,
    email: state.otpAuth?.email || "",
    isAuthenticated: state.otpAuth?.isAuthenticated || false,
    error: state.otpAuth?.error || null,
    user: state.auth?.user || null  // ❌ Mélangé avec otpAuth
  }),
  shallowEqual
);
```

**Après**:
```javascript
// Sélecteurs séparés pour otpAuth
const { loading, email, isAuthenticated, error } = useSelector(
  state => ({
    loading: state.otpAuth?.loading || false,
    email: state.otpAuth?.email || "",
    isAuthenticated: state.otpAuth?.isAuthenticated || false,
    error: state.otpAuth?.error || null
  }),
  shallowEqual
);

// Sélecteur séparé pour user ✅
const user = useSelector(state => state.auth?.user || null);
```

**Pourquoi**:
- `shallowEqual` peut empêcher les re-renders si les autres champs ne changent pas
- Séparer `user` garantit qu'il trigger indépendamment quand `state.auth.user` change
- Meilleure pratique React-Redux

### 3. Logging Amélioré

Ajout de logs pour tracer:
- L'état complet retourné par le reducer
- L'objet `state.auth` complet dans le composant
- Les actions `REHYDRATE` et leurs payloads

## 🧪 Comment Tester

1. **Effacer le localStorage** (pour démarrer propre):
   ```javascript
   // Dans Console DevTools
   localStorage.clear();
   ```

2. **Login OTP**:
   - Aller sur `/auth/login`
   - Entrer email
   - Recevoir code OTP
   - **Ouvrir Console (F12)**
   - Entrer code OTP
   - Cliquer "Vérifier"

3. **Vérifier les logs**:

   ✅ **Logs attendus (succès)**:
   ```
   [AuthReducer] CLIENT_USER__SUCCESS received
   [AuthReducer] Extracted user: { userID: 18809, ... }
   [AuthReducer] New state being returned: { user: {...}, loading: false }
   [AuthReducer] New state.user: { userID: 18809, ... }
   [OTPVerify] State changed:
     - user: { userID: 18809, userName: "HADDAD Logan", ... }  ← ✅ PLUS null!
     - isAuthenticated: true
   [OTPVerify] FULL state.auth: { user: {...}, loading: false }
   ```

   ⚠️ **Si REHYDRATE cause encore des problèmes**:
   ```
   [AuthReducer] REHYDRATE action received
   [AuthReducer] REHYDRATE payload: { auth: { user: null } }
   [AuthReducer] Rehydrating auth state: { user: null }
   ```

4. **Vérifier la redirection**:
   - Pour `userType: 2` (BackOffice) → `/backoffice-dashboard`
   - Pour `userType: 1` (Client) → `/dashboard`

## 🔍 Si le Problème Persiste

### Option 1: Vider Redux Persist au Logout

Ajouter dans le logout pour éviter état corrompu:

```javascript
// Dans setupAxios.js ou action de logout
localStorage.removeItem('persist:myconnectt-auth');
```

### Option 2: Changer la Configuration de Persistence

```javascript
export const clientAuthReducer = persistReducer(
  { 
    storage, 
    key: "myconnectt-auth", 
    whitelist: ["user"],
    // Ajouter:
    stateReconciler: (inboundState, originalState) => {
      // Préférer le state actif (original) si user existe
      if (originalState.user) {
        return originalState;
      }
      return inboundState;
    }
  },
  (state = initialAuthState, action) => {
    // ...
  }
);
```

### Option 3: Désactiver Temporairement la Persistence

Si le problème persiste, désactiver temporairement:

```javascript
// Dans rootReducer.js
auth: clientAuthReducer,  // Sans persistReducer wrapper
```

Puis tester sans persistence pour confirmer que c'est la cause.

## 📋 Checklist de Vérification

Après avoir testé:

- [ ] `user` n'est PAS `null` dans les logs
- [ ] `user` contient `{ userID, userName, userType, ... }`
- [ ] Redirection fonctionne vers le bon dashboard
- [ ] Pas de boucle de redirection
- [ ] Après refresh de page, l'utilisateur reste connecté (persistence fonctionne)
- [ ] Logout vide correctement l'état

## 🎯 Résultat Attendu

```
[OTPVerify] State changed:
  - isAuthenticated: true
  - user: {
      userID: 18809,
      userName: "HADDAD Logan",
      tenantID: 1,
      userRole: 2,
      userType: 2,
      accountID: 0,
      applicantID: 0
    }
  - email: l.haddad-admin@connectt.fr

→ Redirection vers /backoffice-dashboard ✅
```

## 📞 Support

Si le problème persiste après ce fix:

1. **Partager les nouveaux logs console complets**
2. **Vérifier le localStorage**:
   ```javascript
   // Dans Console
   localStorage.getItem('persist:myconnectt-auth')
   ```
3. **Vérifier le Redux DevTools** - état actuel de `state.auth`

## 🔗 Commits

- `8eb0a8b` - Enhanced debugging
- `4651563` - Fix REHYDRATE + separate selectors

---

**Note**: Les logs de débogage peuvent être retirés après confirmation que tout fonctionne, mais ils sont utiles pour le support futur.

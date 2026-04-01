# Exemple pratique : Token dans header Authorization

## Vérification que le token est bien dans le header

### 1. Ouvrez Chrome DevTools

Après vous être connecté avec OTP :

1. Appuyez sur **F12** pour ouvrir DevTools
2. Allez dans l'onglet **Network** (Réseau)
3. Faites une action qui appelle l'API (par exemple, chargez le dashboard)
4. Cliquez sur une requête API
5. Regardez dans **Request Headers**

Vous devriez voir :

```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Cookie: refreshToken=xyz...
  X-Client-Type: webapp
  X-Api-Version: 2
```

✅ Le token est bien dans `Authorization: ******

### 2. Vérifiez dans la Console

Ouvrez la console et tapez :

```javascript
// Vérifier le token dans Redux
const state = window.store.getState();
console.log("Access Token:", state.auth.accessToken ? "Présent ✅" : "Absent ❌");
console.log("User:", state.auth.user);
```

### 3. Suivez le flux dans les logs

Les logs automatiques montrent le processus :

```
[OTPAuthSaga] Authentication successful
[OTPAuthSaga] Access token extracted: present
[OTPAuthSaga] Dispatched requestUser.success with access token
[setupAxios] Added access token to Authorization header
```

## Comment ça fonctionne (sous le capot)

### Étape 1 : Login avec OTP

```javascript
// src/business/sagas/shared/OTPAuthSagas.js ligne 51-88
export function* authenticateOtpSaga({ payload }) {
  // Appel API
  const response = yield call(authenticateWithOtpApi, payload);
  
  // Response du backend :
  // {
  //   userID: 123,
  //   userName: "John Doe",
  //   email: "john@example.com",
  //   accessToken: "eyJhbGci..."  ← On extrait ça
  // }
  
  // Extraction du token
  const accessToken = response.data.accessToken || response.data.AccessToken;
  
  // Stockage dans Redux (mémoire uniquement)
  yield put(requestUser.success({ 
    ...response.data, 
    accessToken  // ← Stocké dans state.auth.accessToken
  }));
}
```

### Étape 2 : Chaque requête API ajoute le token

```javascript
// src/business/setupAxios.js ligne 73-97
axios.interceptors.request.use(
  config => {
    // Récupérer le token de Redux
    const state = store.getState();
    const accessToken = state.auth?.accessToken;  // ← On le récupère ici

    // L'ajouter au header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;  // ← Ajouté ici
      console.log("[setupAxios] Added access token to Authorization header");
    }

    return config;
  }
);
```

### Étape 3 : Refresh automatique si expiré

```javascript
// src/business/setupAxios.js ligne 102-181
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expiré ! On le refresh
      const refreshResponse = await axios.post('/api/user/RefreshToken');
      
      // Nouveau token reçu
      const newAccessToken = refreshResponse.data?.accessToken;
      
      // On met à jour Redux
      store.dispatch(updateAccessToken(newAccessToken));  // ← Nouveau token en Redux
      
      // La prochaine requête utilisera le nouveau token ✅
      return axios(originalRequest);
    }
  }
);
```

## Comparaison côte à côte

### Next.js avec next-auth

```javascript
// pages/api/data.js
import { getToken } from "next-auth/jwt"

export default async function handler(req, res) {
  // next-auth extrait le token du cookie
  const token = await getToken({ req })
  
  // Appel API avec le token dans le header
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${token.accessToken}`  // ← Token dans header
    }
  });
  
  res.json(await response.json());
}
```

### React app actuelle

```javascript
// src/business/setupAxios.js
axios.interceptors.request.use(config => {
  // On extrait le token de Redux
  const accessToken = store.getState().auth?.accessToken;
  
  // Appel API avec le token dans le header
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;  // ← Token dans header
  }
  
  return config;
});
```

**Résultat identique** : Dans les deux cas, le token est dans le header `Authorization: ******

## Différences mineures (architecture)

| Aspect | Next.js/next-auth | React app actuelle |
|--------|-------------------|-------------------|
| Où est stocké l'accessToken ? | Cookie HTTP-Only côté serveur | Redux state (mémoire) |
| Qui ajoute le token au header ? | Serveur Next.js (API route) | Navigateur (axios interceptor) |
| Appels API passent par où ? | Serveur Next.js → Backend | Navigateur → Backend directement |
| Sécurité du token | ✅ Inaccessible au JS client | ✅ En mémoire, perdu au refresh |

**Les deux approches sont sécurisées** :
- Next.js : Token dans cookie serveur (inaccessible au JS malveillant)
- React : Token en mémoire (perdu au refresh de page, pas volable par XSS persistant)

## Test pratique

### Backend de test (simulation)

```csharp
// Votre backend ASP.NET Core
[HttpPost("api/user/Authenticate")]
public IActionResult Authenticate([FromBody] OtpRequest request)
{
    // Validation OTP...
    
    var accessToken = GenerateJWT(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // refreshToken → Cookie HTTP-Only
    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(7)
    });
    
    // accessToken → Response body (Frontend va l'extraire et le mettre dans Authorization header)
    return Ok(new {
        userID = user.Id,
        userName = user.Name,
        email = user.Email,
        accessToken = accessToken  // ← React extrait ça et le met dans Authorization
    });
}
```

### Test dans DevTools Console

```javascript
// 1. Se connecter via OTP
// 2. Ouvrir Console
// 3. Vérifier que le token est présent

const state = window.store.getState();
console.log("✅ Access Token:", state.auth.accessToken?.substring(0, 20) + "...");
console.log("✅ User:", state.auth.user?.userName);

// 4. Faire une requête test
fetch('/api/some-endpoint', {
  headers: {
    'Authorization': 'Bearer ' + state.auth.accessToken
  }
}).then(r => console.log("✅ Requête avec token réussie"));
```

## Conclusion

✅ **Votre application React fait EXACTEMENT la même chose que Next.js/next-auth** :

1. ✅ Token extrait du response
2. ✅ Token stocké en mémoire sécurisée
3. ✅ Token ajouté automatiquement au header `Authorization: ******
4. ✅ Refresh automatique quand expiré
5. ✅ Cookie HTTP-Only pour le refreshToken

**La différence principale** : 
- Next.js : Serveur Next.js intermédiaire qui ajoute le token
- React : Navigateur qui ajoute le token directement

**Même résultat** : `Authorization: ****** header sur chaque requête ! ✅

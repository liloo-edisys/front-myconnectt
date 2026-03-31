# Système d'Authentification MyConnectt

## 🔐 Vue d'Ensemble

MyConnectt utilise un système d'authentification **JWT (JSON Web Token)** avec stockage persistant dans Redux et localStorage. L'application supporte trois types d'utilisateurs avec des portails d'authentification séparés.

## 👥 Types d'Utilisateurs (Rôles)

| Type | userType | Description | Portail d'Auth |
|------|----------|-------------|----------------|
| **Client** | 1 | Entreprises clientes | `/auth` |
| **Interimaire** | 0 | Travailleurs temporaires | `/auth-interimaire` |
| **BackOffice** | 2 | Administrateurs système | `/auth-backoffice` |

## 🔑 Mécanisme d'Authentification JWT

### Endpoints d'Authentification

```javascript
// Configuration API
const BASE_URL = process.env.REACT_APP_WEBAPI_URL

// Endpoints principaux
LOGIN_CLIENT:      `${BASE_URL}/api/User/Authenticate`
LOGIN_INTERIMAIRE: `${BASE_URL}/api/applicant/Authenticate`
REGISTER_ACCOUNT:  `${BASE_URL}/api/Account/Subscribe`
FORGOT_PASSWORD:   `${BASE_URL}/api/User/ForgotPassword`
UPDATE_PASSWORD:   `${BASE_URL}/api/User/UpdatePassword`
CONFIRM_EMAIL:     `${BASE_URL}/api/User/RegisterConfirm`
```

### Format du Token JWT

```javascript
// Response de l'API après login
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": 1,  // 0=Interimaire, 1=Client, 2=BackOffice
    "companyId": 456,
    // ... autres données utilisateur
  }
}
```

## 🔄 Flux d'Authentification Complet

### 1. Connexion (Login Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 1: User submits login form                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    Component: <Login /> (Formik form)
    onChange → Formik validation (Yup schema)
    onSubmit → dispatch(loginActions.request({ email, password }))
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 2: Redux Action dispatched                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    Action Type: LOGIN_REQUEST
    Payload: { email: "...", password: "..." }
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 3: Saga intercepts action                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    File: /src/business/sagas/shared/AuthSagas.js
    
    export function* login({ payload: { datas } }) {
      try {
        // API call
        const response = yield call(loginApi, datas)
        
        // Dispatch success
        yield put(loginActions.success(response))
        
      } catch (error) {
        // Dispatch failure
        yield put(loginActions.failure(error))
      }
    }
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 4: API call via Axios                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    File: /src/business/api/shared/AuthApi.js
    
    export function loginApi(credentials) {
      return axios.post(
        `${WEBAPI_URL}/api/User/Authenticate`,
        credentials
      )
    }
    
    HTTP POST → Backend
    Request Body: { email, password }
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 5: Backend validates credentials                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    Backend returns:
    {
      "authToken": "eyJhbGc...",
      "user": { id, email, userType, ... }
    }
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 6: Saga dispatches SUCCESS action                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    Action Type: LOGIN_SUCCESS
    Payload: { authToken, user }
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 7: Reducer updates state                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    File: /src/business/reducers/shared/AuthReducers.js
    
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        authToken: action.payload.authToken
      }
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 8: Redux Persist saves to localStorage                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    localStorage.setItem('persist:myconnectt-auth', {
      user: { ... },
      authToken: "eyJhbGc..."
    })
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 9: React Router redirects user                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    Routes.js checks: isAuthorized = !!auth.user
    
    if (userType === 0) → /interimaire/dashboard
    if (userType === 1) → /client/dashboard
    if (userType === 2) → /backoffice/dashboard
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAPE 10: Subsequent requests include JWT token                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
    File: /src/business/setupAxios.js
    
    axios.interceptors.request.use(config => {
      const { auth: { authToken } } = store.getState()
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`
      }
      return config
    })
```

### 2. Déconnexion (Logout Flow)

```
User clicks "Logout"
    ↓
dispatch(logoutActions.request())
    ↓
Saga intercepts LOGOUT_REQUEST
    ↓
Saga: yield put(logoutActions.success())
    ↓
Reducer: LOGOUT_SUCCESS
    return {
      user: undefined,
      authToken: undefined
    }
    ↓
Redux Persist clears localStorage
    ↓
Root Reducer: Reset ALL state on LOGOUT
    (voir persistConfig dans store.js)
    ↓
React Router redirects to /auth
```

## 💾 Stockage du Token

### Redux State (In-Memory)

**Location**: `store.getState().auth`

```javascript
{
  auth: {
    user: {
      id: 123,
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      userType: 1,
      companyId: 456,
      // ... autres propriétés
    },
    authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### LocalStorage (Persistent)

**Key**: `persist:myconnectt-auth`

**Configuration** (`/src/business/store.js`):

```javascript
const persistConfig = {
  key: 'myconnectt-auth',
  storage,
  whitelist: ['auth'],  // Seul 'auth' est persisté
}

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'authToken']  // Seulement ces champs
}
```

**Contenu localStorage**:

```json
{
  "_persist": {
    "version": -1,
    "rehydrated": true
  },
  "user": {
    "id": 123,
    "email": "user@example.com",
    ...
  },
  "authToken": "eyJhbGc..."
}
```

## 🔒 Injection du Token dans les Requêtes

### Axios Request Interceptor

**Fichier**: `/src/business/setupAxios.js`

```javascript
export default function setupAxios(axios, store) {
  axios.interceptors.request.use(
    config => {
      // Récupération du token depuis le Redux store
      const {
        auth: { authToken }
      } = store.getState()

      // Injection dans les headers si présent
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`
      }

      return config
    },
    err => Promise.reject(err)
  )
}
```

### Headers HTTP Résultants

```http
GET /api/Companies HTTP/1.1
Host: myconnectt-apiback-prod.azurewebsites.net
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## 🛡️ Protection des Routes

### Higher-Order Component (PrivateRoute)

**Fichier**: `/src/ui/Routes.js`

```javascript
function Routes() {
  const { isAuthorized, userType } = useSelector(
    ({ auth }) => ({
      isAuthorized: auth.user != null,
      userType: auth.user?.userType
    }),
    shallowEqual
  )

  return (
    <Switch>
      {/* Routes publiques */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth-interimaire" component={AuthInterimaire} />
      <Route path="/auth-backoffice" component={AuthBackOffice} />
      
      {/* Routes protégées */}
      <Route path="/">
        {!isAuthorized ? (
          // Redirection selon le contexte
          <Redirect to={getLoginRoute()} />
        ) : (
          // Affichage selon le rôle
          <Layout>
            {userType === 0 && <BaseInterimairePage />}
            {userType === 1 && <BasePage />}
            {userType === 2 && <BaseBackOfficePage />}
          </Layout>
        )}
      </Route>
    </Switch>
  )
}
```

### Logique de Redirection

```javascript
// Fonction utilitaire de redirection
function getLoginRoute() {
  const path = window.location.pathname
  
  if (path.includes('/interimaire')) {
    return '/auth-interimaire/login'
  }
  if (path.includes('/backoffice')) {
    return '/auth-backoffice/login'
  }
  return '/auth/login'
}
```

## 🔐 Validation et Sécurité

### Validation des Formulaires (Yup Schema)

**Exemple**: Login Form Validation

```javascript
import * as Yup from 'yup'

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Minimum 6 caractères')
    .required('Mot de passe requis')
})
```

### Gestion des Erreurs d'Authentification

```javascript
// Saga: AuthSagas.js
export function* login({ payload: { datas } }) {
  try {
    const response = yield call(loginApi, datas)
    yield put(loginActions.success(response))
    
  } catch (error) {
    // Dispatch error action
    yield put(loginActions.failure(error))
    
    // Display user-friendly error
    if (error.response?.status === 401) {
      yield put(showError("Email ou mot de passe incorrect"))
    } else if (error.response?.status === 403) {
      yield put(showError("Compte non activé"))
    } else {
      yield put(showError("Erreur de connexion"))
    }
  }
}
```

### Expiration du Token

```javascript
// TODO: Implémenter la vérification d'expiration
// Le token JWT contient un claim 'exp' (expiration timestamp)

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

// Axios Response Interceptor (à implémenter)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expiré → force logout
      store.dispatch(logoutActions.request())
    }
    return Promise.reject(error)
  }
)
```

## 📋 Composants d'Authentification

### Structure des Composants Auth

```
/src/ui/components/
├── client/auth/
│   ├── Login.js          # Formulaire de connexion client
│   ├── Register.js       # Inscription entreprise
│   ├── ForgotPassword.js # Récupération mot de passe
│   └── ResetPassword.js  # Réinitialisation
│
├── interimaire/auth/
│   ├── Login.js          # Connexion intérimaire
│   └── Register.js       # Inscription intérimaire
│
└── backoffice/auth/
    └── Login.js          # Connexion administrateur
```

### Exemple: Composant Login

```javascript
import { Formik } from 'formik'
import { useDispatch } from 'react-redux'
import { loginActions } from 'business/actions/shared/AuthActions'

function Login() {
  const dispatch = useDispatch()

  const initialValues = {
    email: '',
    password: ''
  }

  const handleSubmit = (values) => {
    dispatch(loginActions.request(values))
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={LoginSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            value={values.email}
            onChange={handleChange}
          />
          {errors.email && <div>{errors.email}</div>}
          
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
          />
          {errors.password && <div>{errors.password}</div>}
          
          <button type="submit">Se connecter</button>
        </form>
      )}
    </Formik>
  )
}
```

## 🧪 Testing d'Authentification

### Mock Store pour Tests

```javascript
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('Auth Flow', () => {
  it('should dispatch LOGIN_SUCCESS on successful login', async () => {
    const expectedActions = [
      { type: 'LOGIN_REQUEST' },
      { type: 'LOGIN_SUCCESS', payload: { user, authToken } }
    ]
    
    const store = mockStore({ auth: {} })
    
    await store.dispatch(loginActions.request(credentials))
    
    expect(store.getActions()).toEqual(expectedActions)
  })
})
```

## 🔄 Refresh Token (À Implémenter)

**Note**: Le système actuel n'implémente pas de refresh token. Voici une approche recommandée:

```javascript
// À ajouter dans setupAxios.js
let isRefreshing = false
let failedQueue = []

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Attendre le refresh en cours
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token
          return axios(originalRequest)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        // Appel API refresh token
        const { data } = await axios.post('/api/auth/refresh')
        store.dispatch(updateToken(data.authToken))
        
        // Retry les requêtes en attente
        failedQueue.forEach(req => req.resolve(data.authToken))
        failedQueue = []
        
        return axios(originalRequest)
      } catch (err) {
        // Refresh failed → logout
        store.dispatch(logoutActions.request())
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)
```

## 📊 Diagramme de Séquence

```
┌────────┐   ┌──────────┐   ┌───────┐   ┌──────┐   ┌─────────┐   ┌───────────┐
│ User   │   │Component │   │ Redux │   │ Saga │   │   API   │   │ Backend   │
└────────┘   └──────────┘   └───────┘   └──────┘   └─────────┘   └───────────┘
     │             │              │          │            │              │
     │  Submit     │              │          │            │              │
     │────────────>│              │          │            │              │
     │             │ dispatch     │          │            │              │
     │             │─────────────>│          │            │              │
     │             │              │ saga     │            │              │
     │             │              │─────────>│            │              │
     │             │              │          │  API call  │              │
     │             │              │          │───────────>│              │
     │             │              │          │            │ HTTP POST    │
     │             │              │          │            │─────────────>│
     │             │              │          │            │              │
     │             │              │          │            │  Response    │
     │             │              │          │            │<─────────────│
     │             │              │          │  Success   │              │
     │             │              │<─────────│            │              │
     │             │   Update     │          │            │              │
     │             │<─────────────│          │            │              │
     │  Redirect   │              │          │            │              │
     │<────────────│              │          │            │              │
```

## 🎯 Checklist de Sécurité

- [x] Tokens stockés côté client (localStorage + Redux)
- [x] Tokens envoyés dans Authorization header (Bearer)
- [x] Validation des formulaires avec Yup
- [x] Protection des routes avec React Router
- [x] Séparation des portails par rôle
- [ ] Expiration des tokens vérifiée
- [ ] Refresh token implémenté
- [ ] HTTPS obligatoire (géré par Azure)
- [ ] CSRF protection (à vérifier côté backend)
- [ ] Rate limiting sur endpoints d'auth (côté backend)
- [ ] 2FA / MFA (non implémenté)

---

**Prochaines étapes**: Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les environnements et le déploiement

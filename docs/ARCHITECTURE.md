# Architecture de l'Application MyConnectt

## 📋 Vue d'Ensemble

MyConnectt est une application React mono-page (SPA) construite avec Create React App et enrichie avec le template Metronic. L'application utilise une architecture Redux pour la gestion d'état centralisée avec Redux Saga pour les effets asynchrones.

## 🏗️ Structure du Projet

```
/src
├── _metronic/              # Framework UI Metronic
│   ├── layout/            # Composants de mise en page
│   ├── i18n/              # Internationalisation
│   └── _assets/           # Assets du template
│
├── app/                    # Pages de base
│   ├── BasePage.js        # Page client
│   ├── BaseInterimairePage.js
│   └── BaseBackOfficePage.js
│
├── business/               # Couche métier et données
│   ├── actions/           # Actions Redux par domaine
│   ├── api/               # Clients API HTTP
│   ├── reducers/          # Reducers Redux
│   ├── sagas/             # Sagas Redux
│   ├── store.js           # Configuration du store
│   └── setupAxios.js      # Configuration Axios
│
├── constants/              # Constantes Redux action types
│
├── ui/                     # Composants UI et containers
│   ├── components/        # Composants réutilisables
│   │   ├── client/        # Composants spécifiques clients
│   │   ├── interimaire/   # Composants spécifiques intérimaires
│   │   └── backoffice/    # Composants spécifiques backoffice
│   ├── containers/        # Containers connectés à Redux
│   └── Routes.js          # Configuration du routage
│
├── utils/                  # Fonctions utilitaires
│
├── index.js               # Point d'entrée principal
└── index.scss             # Styles globaux
```

## 🔄 Flux de Données (Redux Architecture)

### Configuration du Store

**Fichier**: `/src/business/store.js`

```javascript
Store Configuration:
- Middleware: Redux Saga
- Enhancer: Redux Batch (batching d'actions)
- Persistence: Redux Persist (localStorage)
- DevTools: Redux DevTools Extension (development only)
```

### Structure du State Global

```javascript
{
  // === PERSISTÉ (Redux Persist) ===
  auth: {
    user: Object,           // Informations utilisateur
    authToken: String       // JWT Token
  },
  
  // === CLIENT STATE ===
  companies: { ... },        // Gestion des entreprises
  contacts: { ... },         // Contacts clients
  user: { ... },            // Profil utilisateur client
  dashboard: { ... },        // Tableau de bord client
  vacancies: { ... },        // Offres d'emploi
  missions: { ... },         // Missions
  applicants: { ... },       // Candidats
  
  // === INTERIMAIRE STATE ===
  interimaire: { ... },      // Profil intérimaire
  interimaireDashboard: { ... },
  interimaireMissions: { ... },
  
  // === BACKOFFICE STATE ===
  backOffice: { ... },       // Gestion backoffice
  recruiters: { ... },       // Recruteurs
  commercialAgreements: { ... },
  accounts: { ... },         // Comptes
  mailTemplates: { ... },    // Templates d'emails
  
  // === SHARED STATE ===
  lists: { ... },            // Listes partagées (métadonnées)
  errors: { ... },           // Gestion des erreurs
  toastr: { ... }            // Notifications
}
```

## 🎯 Pattern Actions/Reducers/Sagas

### 1. Actions (Constants + Action Creators)

**Fichier**: `/src/constants/*.js` + `/src/business/actions/**/*.js`

```javascript
// Pattern: {ENTITY}_{ACTION}_{STATUS}
export const LOGIN_REQUEST = "LOGIN_REQUEST"
export const LOGIN_SUCCESS = "LOGIN_SUCCESS"
export const LOGIN_FAILURE = "LOGIN_FAILURE"

// Action Creators
export const loginActions = {
  request: (datas) => ({ type: LOGIN_REQUEST, payload: { datas } }),
  success: (response) => ({ type: LOGIN_SUCCESS, payload: response }),
  failure: (error) => ({ type: LOGIN_FAILURE, payload: error })
}
```

### 2. API Layer

**Fichier**: `/src/business/api/**/*.js`

```javascript
// Pattern: Fonctions asynchrones retournant des Promises Axios
const BASE_URL = process.env.REACT_APP_WEBAPI_URL + "api/Entity"

export function getList() {
  return axios.get(BASE_URL)
}

export function create(data) {
  return axios.post(BASE_URL, data)
}
```

### 3. Sagas (Side Effects)

**Fichier**: `/src/business/sagas/**/*.js`

```javascript
// Pattern: Generator functions avec try/catch
export function* entitySaga({ payload: { datas } }) {
  try {
    const response = yield call(apiFunction, datas)
    yield put(actions.success(response))
  } catch (error) {
    yield put(actions.failure(error))
  }
}

// Watcher
export function* watchEntityActions() {
  yield takeLatest(ENTITY_REQUEST, entitySaga)
}
```

### 4. Reducers (State Updates)

**Fichier**: `/src/business/reducers/**/*.js`

```javascript
// Pattern: Immutable state updates
const initialState = {
  data: [],
  loading: false,
  error: null
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case ENTITY_REQUEST:
      return { ...state, loading: true, error: null }
    case ENTITY_SUCCESS:
      return { ...state, loading: false, data: action.payload }
    case ENTITY_FAILURE:
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}
```

## 🖥️ Point d'Entrée et Initialisation

**Fichier**: `/src/index.js`

### Séquence d'Initialisation

```javascript
1. Configuration Axios
   └─> setupAxios(axios, store)
       └─> Injection du token JWT dans les headers

2. Création du Store Redux
   └─> configureStore()
       ├─> Middleware: Redux Saga
       ├─> Enhancer: Redux Batch
       └─> Redux Persist (localStorage)

3. Initialisation des Sagas
   └─> sagaMiddleware.run(rootSaga)

4. Création du Persistor
   └─> persistStore(store)
       └─> Récupération du state depuis localStorage

5. Render de l'Application
   └─> ReactDOM.render()
       └─> <Provider store={store}>
           └─> <PersistGate persistor={persistor}>
               └─> <I18nProvider>
                   └─> <LayoutSplashScreen>
                       └─> <MetronicLayoutProvider>
                           └─> <Routes />
```

## 🎨 Framework UI et Composants

### Technologies UI

| Technologie | Version | Usage |
|-------------|---------|-------|
| Material-UI | 4.9.14 | Composants UI principaux |
| Metronic | Custom | Template et layout |
| React Bootstrap | 1.0.1 | Composants Bootstrap |
| Bootstrap | 4.5.0 | Styles de base |

### Organisation des Composants

```
/src/ui/components/
├── client/              # Composants métier clients
│   ├── auth/           # Authentification
│   ├── companies/      # Gestion entreprises
│   ├── contacts/       # Gestion contacts
│   ├── dashboard/      # Tableaux de bord
│   ├── missions/       # Missions
│   └── vacancies/      # Offres d'emploi
│
├── interimaire/         # Composants métier intérimaires
│   ├── auth/
│   ├── dashboard/
│   ├── profile/
│   └── missions/
│
└── backoffice/          # Composants métier backoffice
    ├── auth/
    ├── dashboard/
    ├── recruiters/
    └── accounts/
```

### Composants Partagés

- **Layout Components**: Header, Sidebar, Footer (Metronic)
- **Form Components**: Input, Select, DatePicker (Material-UI + Formik)
- **Table Components**: React Bootstrap Table Next
- **Chart Components**: ApexCharts + Victory
- **Notification Components**: React Redux Toastr

## 🌐 Routing et Navigation

**Fichier**: `/src/ui/Routes.js`

### Stratégie de Routing

```javascript
// Routes principales par rôle
<Switch>
  {/* Routes publiques */}
  <Route path="/auth" component={AuthPage} />
  <Route path="/auth-interimaire" component={AuthInterimaire} />
  <Route path="/auth-backoffice" component={AuthBackOffice} />
  
  {/* Routes protégées - Client */}
  <PrivateRoute path="/client/*" component={BasePage} />
  
  {/* Routes protégées - Interimaire */}
  <PrivateRoute path="/interimaire/*" component={BaseInterimairePage} />
  
  {/* Routes protégées - BackOffice */}
  <PrivateRoute path="/backoffice/*" component={BaseBackOfficePage} />
</Switch>
```

### Protection des Routes

```javascript
// Logique de protection
if (!isAuthorized) {
  // Redirection vers page de login appropriée
  if (isInterimaire) return <Redirect to="/auth-interimaire" />
  if (isBackOffice) return <Redirect to="/auth-backoffice" />
  return <Redirect to="/auth" />
} else {
  // Autorisation basée sur le rôle
  if (userType === 0) return <InterimaireDashboard />
  if (userType === 1) return <ClientDashboard />
  if (userType === 2) return <BackOfficeDashboard />
}
```

## 📦 Gestion des Dépendances

### Dépendances Principales

```json
{
  "react": "16.12.0",
  "react-dom": "16.12.0",
  "react-router-dom": "5.1.2",
  "redux": "4.0.5",
  "react-redux": "7.1.3",
  "redux-saga": "1.1.3",
  "redux-persist": "6.0.0",
  "@reduxjs/toolkit": "1.3.6",
  "@material-ui/core": "4.9.14",
  "axios": "0.19.2",
  "formik": "2.1.4",
  "yup": "0.29.0"
}
```

## 🔧 Configuration et Overrides

### Webpack Configuration

**Fichier**: `/config-overrides.js`

```javascript
// React App Rewired
// Permet de surcharger la configuration webpack sans ejection
module.exports = function override(config, env) {
  // Customisations webpack ici
  return config;
}
```

### Build Configuration

**Fichier**: `webpack.config.js` (pour RTL support)

```javascript
// Support RTL (Right-to-Left)
const rtlPlugin = new WebpackRTLPlugin();
```

## 📊 Performance et Optimisations

### Code Splitting

- React.lazy() pour le lazy loading des routes
- Suspense pour le fallback de chargement
- Chunks séparés par route/feature

### State Persistence

- Redux Persist avec localStorage
- Whitelist: uniquement `auth.user` et `auth.authToken`
- Rehydration automatique au chargement

### Memoization

- React.memo() pour les composants purs
- useMemo() et useCallback() dans les hooks
- Reselect pour les selectors Redux complexes

## 🧪 Tests

### Configuration de Test

```json
"scripts": {
  "test": "react-app-rewired test"
}
```

### Framework de Test

- Jest (inclus avec Create React App)
- React Testing Library
- Mode watch interactif

## 📈 Monitoring et Debugging

### Redux DevTools

- Extension navigateur activée en développement
- Inspection du state en temps réel
- Time-travel debugging
- Action replay

### Logging

- Console.log désactivé en production
- Redux Logger (optionnel en dev)

## 🔄 Cycle de Vie d'une Requête

```
User Action (onClick)
    ↓
dispatch(action.request(data))
    ↓
Redux Store → Saga Middleware
    ↓
Saga détecte l'action (takeLatest)
    ↓
Saga appelle l'API (call)
    ↓
Axios Interceptor → Ajout JWT Token
    ↓
HTTP Request → Backend API
    ↓
HTTP Response
    ↓
Saga: dispatch(action.success(response))
    ↓
Reducer: Update State
    ↓
React Component re-render (via useSelector)
    ↓
UI Update
```

## 🎯 Bonnes Pratiques Architecturales

1. **Separation of Concerns**
   - Business logic dans `/business`
   - UI components dans `/ui`
   - Utilities dans `/utils`

2. **Immutability**
   - Toujours retourner un nouveau state dans les reducers
   - Utiliser spread operator `{ ...state }`

3. **Single Source of Truth**
   - Redux store comme unique source de vérité
   - Éviter les states locaux dupliqués

4. **Async avec Sagas**
   - Tous les effets asynchrones dans les sagas
   - Pas d'appels API directs dans les composants

5. **Type Safety**
   - Constants pour les action types
   - Éviter les magic strings

6. **Component Composition**
   - Composants petits et réutilisables
   - Props drilling évité avec Redux connect

---

**Prochaines étapes**: Voir [AUTHENTICATION.md](./AUTHENTICATION.md) pour le système d'authentification

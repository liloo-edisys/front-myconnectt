# Intégration API et Communication Backend

## 🌐 Vue d'Ensemble

MyConnectt utilise **Axios** comme client HTTP pour communiquer avec l'API REST backend. L'architecture API suit une organisation par rôle et par domaine métier avec une couche d'abstraction claire.

## 📡 Configuration Axios

### Setup Principal

**Fichier**: `/src/business/setupAxios.js`

```javascript
/**
 * Configure Axios pour injecter automatiquement le JWT token
 * dans tous les headers de requêtes HTTP
 */
export default function setupAxios(axios, store) {
  axios.interceptors.request.use(
    config => {
      // Récupération du token depuis Redux store
      const {
        auth: { authToken }
      } = store.getState()

      // Injection du token Bearer si présent
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`
      }

      return config
    },
    err => Promise.reject(err)
  )
}
```

**Initialisation** (dans `/src/index.js`):

```javascript
import axios from 'axios'
import setupAxios from './business/setupAxios'
import store from './business/store'

// Configuration globale Axios
setupAxios(axios, store)
```

### Configuration de Base URL

**Via Variables d'Environnement**:

```javascript
// Chaque fichier API utilise cette pattern:
const BASE_URL = process.env.REACT_APP_WEBAPI_URL + "api/EntityName"
```

**URLs par Environnement**:

| Environnement | REACT_APP_WEBAPI_URL |
|---------------|---------------------|
| **DEV** | `https://myconnectt-dev-api-*.northeurope-01.azurewebsites.net/` |
| **INT** | `https://myconnectt-back-int.azurewebsites.net/` |
| **UAT** | `https://myconnectt-back-uat.azurewebsites.net/` |
| **PREPROD** | `https://myconnectt-back-preprod.azurewebsites.net/` |
| **PROD** | `https://myconnectt-apiback-prod.azurewebsites.net/` |

---

## 🏗️ Architecture API

### Organisation des Fichiers

```
/src/business/api/
├── shared/              # APIs partagées entre rôles
│   ├── AuthApi.js      # Authentification
│   └── ListsApi.js     # Listes de référence
│
├── client/              # APIs pour le rôle Client
│   ├── CompaniesApi.js
│   ├── ContactsApi.js
│   ├── DashboardApi.js
│   ├── MissionsApi.js
│   ├── VacanciesApi.js
│   ├── ApplicantsApi.js
│   ├── UserApi.js
│   └── EmailApi.js
│
├── interimaire/         # APIs pour le rôle Intérimaire
│   ├── InterimairesApi.js
│   └── DashboardApi.js
│
└── backoffice/          # APIs pour le rôle BackOffice
    ├── RecruiterApi.js
    ├── DashboardApi.js
    ├── CommercialAgreementsApi.js
    ├── AccountsApi.js
    └── MailTemplatesApi.js
```

### Pattern de Fichier API

Chaque fichier API suit cette structure:

```javascript
import axios from "axios"

// Configuration de l'URL de base
const BASE_URL = process.env.REACT_APP_WEBAPI_URL + "api/Entity"

// GET - Récupération de liste
export function getEntityList() {
  return axios.get(BASE_URL)
}

// GET - Récupération par ID
export function getEntityById(id) {
  return axios.get(`${BASE_URL}/${id}`)
}

// POST - Création
export function createEntity(data) {
  return axios.post(BASE_URL, data)
}

// PUT - Mise à jour
export function updateEntity(id, data) {
  return axios.put(`${BASE_URL}/${id}`, data)
}

// DELETE - Suppression
export function deleteEntity(id) {
  return axios.delete(`${BASE_URL}/${id}`)
}

// GET - Avec paramètres de query
export function searchEntity(filters) {
  return axios.get(BASE_URL, { params: filters })
}

// POST - Upload de fichier
export function uploadFile(formData) {
  return axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
```

---

## 📋 Exemples d'APIs par Domaine

### 1. Authentication API

**Fichier**: `/src/business/api/shared/AuthApi.js`

```javascript
const WEBAPI_URL = process.env.REACT_APP_WEBAPI_URL

// Login Client/BackOffice
export function loginApi(credentials) {
  return axios.post(
    `${WEBAPI_URL}/api/User/Authenticate`,
    credentials
  )
}

// Login Intérimaire
export function loginInterimaire(credentials) {
  return axios.post(
    `${WEBAPI_URL}/api/applicant/Authenticate`,
    credentials
  )
}

// Inscription
export function registerAccount(data) {
  return axios.post(
    `${WEBAPI_URL}/api/Account/Subscribe`,
    data
  )
}

// Mot de passe oublié
export function forgotPassword(email) {
  return axios.post(
    `${WEBAPI_URL}/api/User/ForgotPassword`,
    { email }
  )
}

// Mise à jour mot de passe
export function updatePassword(data) {
  return axios.post(
    `${WEBAPI_URL}/api/User/UpdatePassword`,
    data
  )
}

// Confirmation d'inscription
export function confirmRegistration(token) {
  return axios.get(
    `${WEBAPI_URL}/api/User/RegisterConfirm?token=${token}`
  )
}
```

---

### 2. Companies API (Client)

**Fichier**: `/src/business/api/client/CompaniesApi.js`

```javascript
const COMPANIES_URL = process.env.REACT_APP_WEBAPI_URL + "api/Account"

// Liste des entreprises
export function getCompaniesList() {
  return axios.get(COMPANIES_URL)
}

// Détails d'une entreprise
export function getCompanyById(id) {
  return axios.get(`${COMPANIES_URL}/${id}`)
}

// Création entreprise
export function createCompany(companyData) {
  return axios.post(COMPANIES_URL, companyData)
}

// Mise à jour entreprise
export function updateCompany(id, companyData) {
  return axios.put(`${COMPANIES_URL}/${id}`, companyData)
}

// Suppression entreprise
export function deleteCompany(id) {
  return axios.delete(`${COMPANIES_URL}/${id}`)
}

// Upload logo entreprise
export function uploadCompanyLogo(companyId, formData) {
  return axios.post(
    `${COMPANIES_URL}/${companyId}/logo`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
}
```

---

### 3. Missions API (Client)

**Fichier**: `/src/business/api/client/MissionsApi.js`

```javascript
const MISSIONS_URL = process.env.REACT_APP_WEBAPI_URL + "api/Missions"

// Liste des missions
export function getMissionsList(filters) {
  return axios.get(MISSIONS_URL, { params: filters })
}

// Détails mission
export function getMissionById(id) {
  return axios.get(`${MISSIONS_URL}/${id}`)
}

// Créer mission
export function createMission(missionData) {
  return axios.post(MISSIONS_URL, missionData)
}

// Mettre à jour mission
export function updateMission(id, missionData) {
  return axios.put(`${MISSIONS_URL}/${id}`, missionData)
}

// Publier mission
export function publishMission(id) {
  return axios.post(`${MISSIONS_URL}/${id}/publish`)
}

// Clôturer mission
export function closeMission(id) {
  return axios.post(`${MISSIONS_URL}/${id}/close`)
}

// Candidats pour une mission
export function getMissionApplicants(missionId) {
  return axios.get(`${MISSIONS_URL}/${missionId}/applicants`)
}
```

---

### 4. Dashboard API

**Fichier**: `/src/business/api/client/DashboardApi.js`

```javascript
const DASHBOARD_URL = process.env.REACT_APP_WEBAPI_URL + "api/Dashboard"

// Statistiques générales
export function getDashboardStats() {
  return axios.get(`${DASHBOARD_URL}/stats`)
}

// Missions actives
export function getActiveMissions() {
  return axios.get(`${DASHBOARD_URL}/missions/active`)
}

// Graphiques et métriques
export function getMetrics(period) {
  return axios.get(`${DASHBOARD_URL}/metrics`, {
    params: { period }
  })
}

// Activités récentes
export function getRecentActivities() {
  return axios.get(`${DASHBOARD_URL}/activities`)
}
```

---

### 5. Lists API (Shared)

**Fichier**: `/src/business/api/shared/ListsApi.js`

```javascript
const LISTS_URL = process.env.REACT_APP_WEBAPI_URL + "api/Lists"

// Listes de référence (métadonnées)
export function getCountries() {
  return axios.get(`${LISTS_URL}/countries`)
}

export function getCities() {
  return axios.get(`${LISTS_URL}/cities`)
}

export function getJobCategories() {
  return axios.get(`${LISTS_URL}/job-categories`)
}

export function getSkills() {
  return axios.get(`${LISTS_URL}/skills`)
}

export function getContractTypes() {
  return axios.get(`${LISTS_URL}/contract-types`)
}
```

---

## 🔄 Intégration Redux Saga

### Pattern d'Appel API avec Saga

**1. Action Creators**

```javascript
// /src/business/actions/client/CompaniesActions.js
export const GET_COMPANIES_REQUEST = "GET_COMPANIES_REQUEST"
export const GET_COMPANIES_SUCCESS = "GET_COMPANIES_SUCCESS"
export const GET_COMPANIES_FAILURE = "GET_COMPANIES_FAILURE"

export const getCompaniesActions = {
  request: () => ({ type: GET_COMPANIES_REQUEST }),
  success: (data) => ({ type: GET_COMPANIES_SUCCESS, payload: data }),
  failure: (error) => ({ type: GET_COMPANIES_FAILURE, payload: error })
}
```

**2. Saga**

```javascript
// /src/business/sagas/client/CompaniesSagas.js
import { call, put, takeLatest } from 'redux-saga/effects'
import * as api from '../../api/client/CompaniesApi'
import { getCompaniesActions, GET_COMPANIES_REQUEST } from '../../actions/client/CompaniesActions'

export function* getCompaniesSaga() {
  try {
    // Appel API
    const response = yield call(api.getCompaniesList)
    
    // Dispatch success
    yield put(getCompaniesActions.success(response.data))
    
  } catch (error) {
    // Dispatch failure
    yield put(getCompaniesActions.failure(error.message))
    
    // Notification d'erreur
    yield put(showErrorNotification("Erreur lors du chargement des entreprises"))
  }
}

// Watcher
export function* watchCompaniesActions() {
  yield takeLatest(GET_COMPANIES_REQUEST, getCompaniesSaga)
}
```

**3. Reducer**

```javascript
// /src/business/reducers/client/CompaniesReducers.js
const initialState = {
  list: [],
  loading: false,
  error: null
}

export function companiesReducer(state = initialState, action) {
  switch (action.type) {
    case GET_COMPANIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      }
      
    case GET_COMPANIES_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload
      }
      
    case GET_COMPANIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      }
      
    default:
      return state
  }
}
```

**4. Component Usage**

```javascript
// Component
import { useDispatch, useSelector } from 'react-redux'
import { getCompaniesActions } from 'business/actions/client/CompaniesActions'

function CompaniesListComponent() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector(state => state.companies)
  
  useEffect(() => {
    // Dispatch request action
    dispatch(getCompaniesActions.request())
  }, [dispatch])
  
  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error} />
  
  return (
    <div>
      {list.map(company => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  )
}
```

---

## 🔒 Intercepteurs et Middlewares

### Request Interceptor (Déjà Implémenté)

```javascript
// Ajoute JWT token automatiquement
axios.interceptors.request.use(
  config => {
    const { auth: { authToken } } = store.getState()
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  }
)
```

### Response Interceptor (Recommandé à Implémenter)

```javascript
// /src/business/setupAxios.js - À ajouter
axios.interceptors.response.use(
  // Success case
  response => response,
  
  // Error case
  error => {
    // Token expiré
    if (error.response?.status === 401) {
      store.dispatch(logoutActions.request())
      window.location.href = '/auth/login'
    }
    
    // Erreur serveur
    if (error.response?.status >= 500) {
      store.dispatch(showErrorNotification(
        "Erreur serveur, veuillez réessayer plus tard"
      ))
    }
    
    // Erreur réseau
    if (!error.response) {
      store.dispatch(showErrorNotification(
        "Erreur de connexion, vérifiez votre réseau"
      ))
    }
    
    return Promise.reject(error)
  }
)
```

---

## 📊 Gestion des Erreurs

### Structure d'Erreur API

**Format typique de réponse d'erreur**:

```javascript
{
  status: 400,
  data: {
    message: "Validation error",
    errors: {
      email: ["Email is required"],
      password: ["Password must be at least 6 characters"]
    }
  }
}
```

### Gestion dans les Sagas

```javascript
export function* createCompanySaga({ payload: { data } }) {
  try {
    const response = yield call(api.createCompany, data)
    yield put(createCompanyActions.success(response.data))
    yield put(showSuccessNotification("Entreprise créée avec succès"))
    
  } catch (error) {
    // Erreur de validation
    if (error.response?.status === 400) {
      const validationErrors = error.response.data.errors
      yield put(createCompanyActions.failure(validationErrors))
      
      // Afficher chaque erreur
      Object.values(validationErrors).forEach(errorMessages => {
        errorMessages.forEach(msg => {
          yield put(showErrorNotification(msg))
        })
      })
    }
    
    // Erreur générique
    else {
      yield put(createCompanyActions.failure(error.message))
      yield put(showErrorNotification("Erreur lors de la création"))
    }
  }
}
```

### Error Reducer (Global)

```javascript
// /src/business/reducers/shared/ErrorReducers.js
const initialState = {
  apiErrors: {},
  networkError: null
}

export function errorReducers(state = initialState, action) {
  // Capture toutes les actions FAILURE
  if (action.type.endsWith('_FAILURE')) {
    return {
      ...state,
      apiErrors: {
        ...state.apiErrors,
        [action.type]: action.payload
      }
    }
  }
  
  // Reset errors
  if (action.type === 'CLEAR_ERRORS') {
    return initialState
  }
  
  return state
}
```

---

## 📤 Upload de Fichiers

### Upload Simple

```javascript
// API
export function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return axios.post(
    `${BASE_URL}/documents/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

// Component
function FileUploadComponent() {
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    dispatch(uploadDocumentActions.request(file))
  }
  
  return (
    <input type="file" onChange={handleFileChange} />
  )
}
```

### Upload avec Progress Bar

```javascript
// API avec callback de progression
export function uploadDocumentWithProgress(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  
  return axios.post(
    `${BASE_URL}/documents/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    }
  )
}

// Saga
export function* uploadDocumentSaga({ payload: { file } }) {
  try {
    const response = yield call(
      uploadDocumentWithProgress,
      file,
      (progress) => {
        // Update progress in Redux
        store.dispatch(updateUploadProgress(progress))
      }
    )
    
    yield put(uploadDocumentActions.success(response.data))
  } catch (error) {
    yield put(uploadDocumentActions.failure(error))
  }
}
```

---

## 🔄 Pagination et Filtres

### API avec Pagination

```javascript
// API
export function getMissionsList(page = 1, perPage = 10, filters = {}) {
  return axios.get(`${MISSIONS_URL}`, {
    params: {
      page,
      perPage,
      ...filters
    }
  })
}

// Saga
export function* getMissionsSaga({ payload: { page, filters } }) {
  try {
    const response = yield call(api.getMissionsList, page, 10, filters)
    
    yield put(getMissionsActions.success({
      data: response.data.items,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      totalItems: response.data.totalItems
    }))
  } catch (error) {
    yield put(getMissionsActions.failure(error))
  }
}

// Component
function MissionsList() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})
  
  const { data, totalPages, loading } = useSelector(state => state.missions)
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(getMissionsActions.request({ page, filters }))
  }, [page, filters])
  
  return (
    <>
      <FilterBar onFilterChange={setFilters} />
      <MissionsTable data={data} />
      <Pagination 
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  )
}
```

---

## 🧪 Testing des APIs

### Mock Axios pour Tests

```javascript
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('CompaniesApi', () => {
  let mock
  
  beforeEach(() => {
    mock = new MockAdapter(axios)
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should fetch companies list', async () => {
    const mockData = [
      { id: 1, name: 'Company A' },
      { id: 2, name: 'Company B' }
    ]
    
    mock.onGet(`${BASE_URL}/api/Account`).reply(200, mockData)
    
    const response = await getCompaniesList()
    expect(response.data).toEqual(mockData)
  })
  
  it('should handle API errors', async () => {
    mock.onGet(`${BASE_URL}/api/Account`).reply(500)
    
    await expect(getCompaniesList()).rejects.toThrow()
  })
})
```

---

## 📈 Performance et Optimisations

### Debouncing des Recherches

```javascript
import debounce from 'lodash/debounce'

// Saga avec debounce
import { debounce as sagaDebounce } from 'redux-saga/effects'

export function* watchSearchActions() {
  yield sagaDebounce(
    500, // 500ms debounce
    SEARCH_REQUEST,
    searchSaga
  )
}
```

### Caching avec Redux

```javascript
// Reducer avec cache
const initialState = {
  cache: {},
  loading: false
}

export function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_ENTITY_SUCCESS:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.id]: action.payload
        }
      }
    default:
      return state
  }
}

// Saga vérifie le cache avant l'appel API
export function* getEntitySaga({ payload: { id } }) {
  const cached = yield select(state => state.entities.cache[id])
  
  if (cached) {
    // Utiliser le cache
    yield put(getEntityActions.success(cached))
  } else {
    // Faire l'appel API
    const response = yield call(api.getEntity, id)
    yield put(getEntityActions.success(response.data))
  }
}
```

---

## 🎯 Bonnes Pratiques

1. **Centralisation**: Toutes les APIs dans `/src/business/api/`
2. **Typage**: Utiliser TypeScript ou JSDoc pour typer les fonctions API
3. **Error Handling**: Toujours gérer les erreurs dans les sagas
4. **Loading States**: Tracker les états de chargement dans Redux
5. **Timeouts**: Configurer des timeouts Axios appropriés
6. **Retry Logic**: Implémenter des retry pour les requêtes critiques
7. **Caching**: Cacher les données statiques (listes de référence)
8. **Optimistic Updates**: Pour une meilleure UX
9. **Request Cancellation**: Annuler les requêtes obsolètes

---

**Voir aussi**: 
- [ARCHITECTURE.md](./ARCHITECTURE.md) pour l'architecture Redux
- [AUTHENTICATION.md](./AUTHENTICATION.md) pour les détails JWT

# Authentification OTP pour BackOffice

## 📋 Vue d'Ensemble

Ce document décrit l'implémentation d'un système d'authentification **OTP (One-Time Password)** pour le portail BackOffice de MyConnectt. L'OTP ajoute une couche de sécurité supplémentaire en nécessitant un code à 6 chiffres envoyé par email.

## 🎯 Objectifs

- Renforcer la sécurité des comptes administrateurs (BackOffice)
- Implémenter une authentification en deux étapes (2FA)
- Fournir un flux d'authentification moderne et sécurisé

## 🏗️ Architecture du Flux OTP

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX D'AUTHENTIFICATION OTP                   │
└─────────────────────────────────────────────────────────────────┘

1. ÉTAPE 1: Saisie de l'Email
   ┌────────────────────────────────────────┐
   │  Page: /auth/otp-request               │
   │  ┌──────────────────────────────────┐  │
   │  │  Email: [__________________]     │  │
   │  │                                  │  │
   │  │  [Envoyer le Code OTP]          │  │
   │  └──────────────────────────────────┘  │
   └────────────────────────────────────────┘
                    ↓
   POST /api/user/SendOtp
   Request: { tenantID: 1, email }
                    ↓
   Backend génère code OTP à 6 chiffres
   Backend envoie email avec le code
   Backend stocke le code (validité: 5 minutes)
                    ↓
2. ÉTAPE 2: Vérification du Code OTP
   ┌────────────────────────────────────────┐
   │  Page: /auth/otp-verify                │
   │  ┌──────────────────────────────────┐  │
   │  │  Code OTP:                       │  │
   │  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │  │
   │  │  │__│ │__│ │__│ │__│ │__│ │__│ │  │
   │  │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ │  │
   │  │                                  │  │
   │  │  [Vérifier]  [Renvoyer le code] │  │
   │  │                                  │  │
   │  │  Expire dans: 04:32              │  │
   │  └──────────────────────────────────┘  │
   └────────────────────────────────────────┘
                    ↓
   POST /api/user/Authentificate
   Request: { tenantID: 1, email, otp }
                    ↓
   Backend vérifie le code OTP
   Backend définit les cookies HTTP-Only:
     → accessToken (15 min)
     → refreshToken (7 jours)
                    ↓
3. AUTHENTIFICATION RÉUSSIE
   Redirection vers /dashboard
   
4. RAFRAÎCHISSEMENT AUTOMATIQUE (toutes les 10 minutes)
   ┌────────────────────────────────────────┐
   │  Axios Interceptor + Proactive Refresh │
   │  ┌──────────────────────────────────┐  │
   │  │  Timer: 10 minutes écoulées      │  │
   │  │  ↓                               │  │
   │  │  POST /api/user/RefreshToken     │  │
   │  │  ↓                               │  │
   │  │  Nouveaux cookies reçus          │  │
   │  │  ↓                               │  │
   │  │  Reset timer pour 10 minutes     │  │
   │  │                                  │  │
   │  │  OU: Requête API échoue (401)    │  │
   │  │  ↓                               │  │
   │  │  POST /api/user/RefreshToken     │  │
   │  │  ↓                               │  │
   │  │  Réessayer la requête initiale   │  │
   │  └──────────────────────────────────┘  │
   └────────────────────────────────────────┘
```

---

## 🔄 Système de Refresh Token avec Cookies

### Architecture Cookie-Based Authentication

Le système utilise des **HTTP-Only Cookies** pour stocker les tokens au lieu du localStorage, offrant une meilleure protection contre les attaques XSS.

#### Avantages des Cookies HTTP-Only

✅ **Sécurité renforcée**: Les cookies HttpOnly ne sont pas accessibles via JavaScript  
✅ **Protection XSS**: Impossible de voler les tokens via injection de scripts  
✅ **Gestion automatique**: Les cookies sont envoyés automatiquement avec chaque requête  
✅ **Refresh transparent**: Le renouvellement des tokens est géré côté serveur  

#### Types de Tokens

| Token | Durée de vie | Stockage | Utilisation |
|-------|--------------|----------|-------------|
| **Access Token** | 15 minutes | Cookie HttpOnly | Authentifier toutes les requêtes API |
| **Refresh Token** | 7 jours | Cookie HttpOnly | Renouveler l'access_token expiré |

#### Flux de Rafraîchissement Automatique

```
┌────────────────────────────────────────────────────────────────┐
│              REFRESH TOKEN FLOW (AUTOMATIC)                     │
└────────────────────────────────────────────────────────────────┘

1. User fait une requête API
   GET /api/BackOffice/Users
   Cookie: access_token=expired_token...
                    ↓
2. Backend détecte token expiré
   Response: 401 Unauthorized
                    ↓
3. Axios Interceptor (frontend) intercepte le 401
   Détecte: response.status === 401
                    ↓
4. Frontend appelle automatiquement RefreshToken
   POST /api/Auth/RefreshToken
   Cookie: refresh_token=valid_refresh...
                    ↓
5. Backend valide le refresh_token
   Génère nouveaux tokens
   Set-Cookie: access_token=new_token...
   Set-Cookie: refresh_token=new_refresh...
   Response: 200 OK
                    ↓
6. Frontend réessaie la requête originale
   GET /api/BackOffice/Users
   Cookie: access_token=new_token...
                    ↓
7. Requête réussit avec nouveau token
   Response: 200 OK + données
                    ↓
   User ne remarque aucune interruption
```

---

## 📡 Endpoints API Backend

### Configuration Tenant par Défaut

**TenantID par défaut**: `1`

Tous les appels API utilisent le tenantID = 1 sauf indication contraire.

---

### 1. Envoi du Code OTP

**Endpoint**: `POST /api/user/SendOtp`

**Request Body**:
```json
{
  "tenantID": 1,
  "email": "user@myconnectt.fr"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Code OTP envoyé avec succès",
  "expiresIn": 300
}
```

**Error Responses**:

```json
// 404 - Utilisateur non trouvé
{
  "success": false,
  "message": "Aucun compte BackOffice trouvé avec cet email"
}

// 429 - Trop de tentatives
{
  "success": false,
  "message": "Trop de tentatives. Veuillez réessayer dans 10 minutes"
}

// 403 - Compte non autorisé
{
  "success": false,
  "message": "Ce compte n'est pas un compte BackOffice"
}
```

---

### 2. Authentification avec Code OTP

**Endpoint**: `POST /api/user/Authentificate`

**Request Body**:
```json
{
  "tenantID": 1,
  "email": "user@myconnectt.fr",
  "otp": "123456"
}
```

**Success Response** (200 OK):

⚠️ **Important**: Les tokens sont retournés via **HTTP-Only Cookies** pour une sécurité optimale.

**Response Body** (contient uniquement les données utilisateur, **PAS** de tokens):
```json
{
  "UserID": 42,
  "UserName": "admin@myconnectt.fr",
  "TenantID": 1,
  "UserRole": "BackOffice",
  "UserType": 2,
  "AccountID": 123,
  "ApplicantID": null
}
```

⚠️ **Note**: Les champs `AccessToken`, `RefreshToken`, et `MobileAccessToken` ne sont **PAS** inclus dans le body de la réponse. Les tokens sont uniquement dans les cookies HTTP-Only.

**HTTP Response Headers (Cookies)**:
```http
Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/user/RefreshToken
```

**Cookies Détails**:
| Cookie | Durée | Utilisation | Path |
|--------|-------|-------------|------|
| `accessToken` | 15 minutes (900s) | Authentifier les requêtes API | `/` |
| `refreshToken` | 7 jours (604800s) | Renouveler l'accessToken | `/api/user/RefreshToken` |

⚠️ **Note Importante**: Le système effectue une rotation proactive du token toutes les **10 minutes** pour éviter l'expiration à 15 minutes.

**Error Responses**:

```json
// 401 - Code invalide
{
  "success": false,
  "message": "Code OTP invalide"
}

// 410 - Code expiré
{
  "success": false,
  "message": "Code OTP expiré. Veuillez demander un nouveau code"
}

// 429 - Trop de tentatives
{
  "success": false,
  "message": "Trop de tentatives incorrectes. Compte temporairement bloqué"
}
```

---

### 3. Rafraîchissement du Token (Refresh Token)

**Endpoint**: `POST /api/user/RefreshToken`

**Description**: Permet de renouveler l'`accessToken` expiré en utilisant le `refreshToken` stocké dans les cookies.

**Rotation Proactive**: Le système effectue automatiquement une rotation toutes les **10 minutes** pour éviter l'expiration à 15 minutes.

**Request**: 
- Pas de body requis
- Le `refreshToken` est automatiquement envoyé via les cookies HTTP-Only

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Token rafraîchi avec succès"
}
```

**HTTP Response Headers (Nouveaux Cookies)**:
```http
Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/user/RefreshToken
```

**Error Responses**:

```json
// 401 - Refresh token invalide ou expiré
{
  "success": false,
  "message": "Refresh token invalide ou expiré. Reconnexion requise"
}

// 403 - Refresh token révoqué
{
  "success": false,
  "message": "Session révoquée. Veuillez vous reconnecter"
}
```

**Comportement Frontend**:
- Si le refresh échoue (401/403), rediriger vers la page de login
- Effacer les données utilisateur du Redux store
- Afficher un message "Session expirée"

---

### 4. Révocation du Token (Logout)

**Endpoint**: `POST /api/user/RevokeToken`

**Description**: Révoque les tokens de l'utilisateur courant, terminant ainsi la session.

**Request**: 
- Pas de body requis
- Le `refreshToken` est automatiquement envoyé via les cookies HTTP-Only

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Token révoqué avec succès"
}
```

**HTTP Response Headers (Suppression des Cookies)**:
```http
Set-Cookie: accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/api/user/RefreshToken
```

**Error Responses**:

```json
// 401 - Pas de token valide
{
  "success": false,
  "message": "Aucune session active à révoquer"
}
```

**Comportement Frontend**:
- Appeler cet endpoint lors du logout utilisateur
- Effacer les données Redux
- Rediriger vers la page de login

---

## 🎨 Implémentation Frontend

### Structure des Fichiers

```
/src/ui/components/backoffice/auth/
├── AuthBackOffice.js           # Container principal
├── Login.js                    # Login classique (existant)
├── OTPRequest.js               # ✨ NOUVEAU: Page demande OTP
├── OTPVerify.js                # ✨ NOUVEAU: Page vérification OTP
├── ForgotPassword.js           # Mot de passe oublié
├── ResetPassword.js            # Réinitialisation
└── index.js                    # Exports

/src/business/
├── actions/shared/
│   └── OTPAuthActions.js       # ✨ NOUVEAU: Actions OTP
├── api/shared/
│   └── OTPAuthApi.js           # ✨ NOUVEAU: API OTP
├── sagas/shared/
│   └── OTPAuthSagas.js         # ✨ NOUVEAU: Sagas OTP
├── reducers/shared/
│   └── OTPAuthReducers.js      # ✨ NOUVEAU: Reducer OTP
└── setupAxios.js               # 🔄 MISE À JOUR: Interceptor refresh token
```

---

## 📄 Page 1: Demande de Code OTP

### Composant: `OTPRequest.js`

**Chemin**: `/src/ui/components/backoffice/auth/OTPRequest.js`

```jsx
import React, { useState } from "react";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { sendOTP } from "actions/shared/OTPAuthActions";

const initialValues = {
  email: ""
};

function OTPRequest(props) {
  const { intl } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  
  const { loading, error } = useSelector(
    state => ({
      loading: state.otpAuth.loading,
      error: state.otpAuth.error
    }),
    shallowEqual
  );

  const OTPRequestSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  const getInputClasses = fieldname => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return "is-invalid";
    }
    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return "is-valid";
    }
    return "";
  };

  const formik = useFormik({
    initialValues,
    validationSchema: OTPRequestSchema,
    onSubmit: values => {
      dispatch(sendOTP.request(values));
    }
  });

  return (
    <div className="login-form login-signin pb-11">
      {/* Header */}
      <div className="text-center pb-8">
        <h2 className="font-size-h1 pageTitle">
          <FormattedMessage id="AUTH.OTP.REQUEST.TITLE" />
        </h2>
        <p className="text-muted font-weight-bold">
          <FormattedMessage id="AUTH.OTP.REQUEST.DESC" />
        </p>
      </div>

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="form">
        
        {/* Error Message */}
        {error && (
          <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
            <div className="alert-text font-weight-bold">{error}</div>
          </div>
        )}

        {/* Email Input */}
        <div className="row d-flex justify-content-center">
          <div className="form-group fv-plugins-icon-container col-lg-10">
            <label className="font-weight-bold">
              <FormattedMessage id="AUTH.OTP.EMAIL.LABEL" />
            </label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-envelope text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({ 
                  id: "AUTH.OTP.EMAIL.PLACEHOLDER" 
                })}
                type="email"
                className={`form-control h-auto py-5 px-6 ${getInputClasses("email")}`}
                name="email"
                autoComplete="email"
                {...formik.getFieldProps("email")}
              />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.email}</div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Info Message */}
        <div className="row d-flex justify-content-center">
          <div className="col-lg-10">
            <div className="alert alert-custom alert-light-info">
              <div className="alert-icon">
                <i className="flaticon-information"></i>
              </div>
              <div className="alert-text">
                <FormattedMessage id="AUTH.OTP.REQUEST.INFO" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-group d-flex flex-wrap justify-content-center">
          <button
            id="otp_request_submit"
            type="submit"
            disabled={!(formik.isValid && formik.dirty) || loading}
            className="btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow"
          >
            <span>
              <FormattedMessage id="AUTH.OTP.SEND_CODE" />
            </span>
            {loading && <span className="ml-3 spinner spinner-white"></span>}
          </button>
        </div>

        {/* Back to Login */}
        <div className="form-group d-flex flex-wrap justify-content-center">
          <button
            type="button"
            onClick={() => history.push("/auth-backoffice/login")}
            className="btn btn-light-primary font-weight-bold px-9 py-4"
          >
            <FormattedMessage id="AUTH.OTP.BACK_TO_LOGIN" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default injectIntl(OTPRequest);
```

---

## 📄 Page 2: Vérification du Code OTP

### Composant: `OTPVerify.js`

**Chemin**: `/src/ui/components/backoffice/auth/OTPVerify.js`

```jsx
import React, { useState, useEffect, useRef } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { verifyOTP, resendOTP } from "actions/shared/OTPAuthActions";

function OTPVerify(props) {
  const { intl } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email || "";
  
  // OTP Code State (6 digits)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  
  // Timer State (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { loading, error, verificationSuccess } = useSelector(
    state => ({
      loading: state.otpAuth.loading,
      error: state.otpAuth.error,
      verificationSuccess: state.otpAuth.verificationSuccess
    }),
    shallowEqual
  );

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      history.push("/auth-backoffice/otp-request");
    }
  }, [email, history]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format time left (MM:SS)
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value.slice(-1); // Only take last character
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (index === 5 && value && newOtpCode.every(digit => digit !== "")) {
      handleVerify(newOtpCode.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = e => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtpCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtpCode(newOtpCode);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = (code = otpCode.join("")) => {
    if (code.length !== 6) return;
    
    dispatch(verifyOTP.request({
      email,
      otpCode: code
    }));
  };

  // Resend OTP
  const handleResend = () => {
    if (resendCooldown > 0) return;

    dispatch(resendOTP.request({ email }));
    
    // Reset timer
    setTimeLeft(300);
    setCanResend(false);
    setResendCooldown(60); // 60 seconds cooldown
    
    // Clear inputs
    setOtpCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="login-form login-signin pb-11">
      {/* Header */}
      <div className="text-center pb-8">
        <h2 className="font-size-h1 pageTitle">
          <FormattedMessage id="AUTH.OTP.VERIFY.TITLE" />
        </h2>
        <p className="text-muted font-weight-bold">
          <FormattedMessage 
            id="AUTH.OTP.VERIFY.DESC" 
            values={{ email: <strong>{email}</strong> }}
          />
        </p>
      </div>

      {/* Form */}
      <div className="form">
        
        {/* Error Message */}
        {error && (
          <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
            <div className="alert-text font-weight-bold">{error}</div>
          </div>
        )}

        {/* Success Message */}
        {verificationSuccess && (
          <div className="mb-10 alert alert-custom alert-light-success">
            <div className="alert-text font-weight-bold">
              <FormattedMessage id="AUTH.OTP.VERIFY.SUCCESS" />
            </div>
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="row d-flex justify-content-center mb-10">
          <div className="col-lg-10">
            <label className="font-weight-bold text-center d-block mb-5">
              <FormattedMessage id="AUTH.OTP.CODE.LABEL" />
            </label>
            <div className="otp-input-container d-flex justify-content-center">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={el => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="form-control otp-input text-center font-weight-boldest font-size-h1"
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="row d-flex justify-content-center mb-5">
          <div className="col-lg-10 text-center">
            {timeLeft > 0 ? (
              <div className="text-muted">
                <i className="far fa-clock mr-2"></i>
                <FormattedMessage 
                  id="AUTH.OTP.EXPIRES_IN" 
                  values={{ time: formatTime(timeLeft) }}
                />
              </div>
            ) : (
              <div className="text-danger font-weight-bold">
                <i className="far fa-times-circle mr-2"></i>
                <FormattedMessage id="AUTH.OTP.EXPIRED" />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="form-group d-flex flex-wrap justify-content-center">
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={
              otpCode.some(digit => digit === "") || 
              loading || 
              timeLeft <= 0
            }
            className="btn btn-primary font-weight-bold px-9 py-4 my-3 mr-3 btn-shadow"
          >
            <span>
              <FormattedMessage id="AUTH.OTP.VERIFY_BUTTON" />
            </span>
            {loading && <span className="ml-3 spinner spinner-white"></span>}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            className="btn btn-light-primary font-weight-bold px-9 py-4 my-3"
          >
            <span>
              <FormattedMessage id="AUTH.OTP.RESEND_CODE" />
              {resendCooldown > 0 && ` (${resendCooldown}s)`}
            </span>
          </button>
        </div>

        {/* Back Button */}
        <div className="form-group d-flex flex-wrap justify-content-center">
          <button
            type="button"
            onClick={() => history.push("/auth-backoffice/otp-request")}
            className="btn btn-light font-weight-bold px-9 py-4"
          >
            <FormattedMessage id="AUTH.OTP.CHANGE_EMAIL" />
          </button>
        </div>
      </div>

      {/* Styles pour les inputs OTP */}
      <style jsx>{`
        .otp-input-container {
          gap: 10px;
        }
        .otp-input {
          width: 50px;
          height: 60px;
          font-size: 24px;
          border: 2px solid #e4e6ef;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .otp-input:focus {
          border-color: #3699ff;
          box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
        }
        .otp-input:disabled {
          background-color: #f3f6f9;
        }
      `}</style>
    </div>
  );
}

export default injectIntl(OTPVerify);
```

---

## 🔄 Redux Integration

### 1. Actions - `OTPAuthActions.js`

**Chemin**: `/src/business/actions/shared/OTPAuthActions.js`

```javascript
// Action Types
export const SEND_OTP_REQUEST = "SEND_OTP_REQUEST";
export const SEND_OTP_SUCCESS = "SEND_OTP_SUCCESS";
export const SEND_OTP_FAILURE = "SEND_OTP_FAILURE";

export const VERIFY_OTP_REQUEST = "VERIFY_OTP_REQUEST";
export const VERIFY_OTP_SUCCESS = "VERIFY_OTP_SUCCESS";
export const VERIFY_OTP_FAILURE = "VERIFY_OTP_FAILURE";

export const RESEND_OTP_REQUEST = "RESEND_OTP_REQUEST";
export const RESEND_OTP_SUCCESS = "RESEND_OTP_SUCCESS";
export const RESEND_OTP_FAILURE = "RESEND_OTP_FAILURE";

export const CLEAR_OTP_STATE = "CLEAR_OTP_STATE";

// Action Creators
export const sendOTP = {
  request: (data) => ({
    type: SEND_OTP_REQUEST,
    payload: data
  }),
  success: (response) => ({
    type: SEND_OTP_SUCCESS,
    payload: response
  }),
  failure: (error) => ({
    type: SEND_OTP_FAILURE,
    payload: error
  })
};

export const verifyOTP = {
  request: (data) => ({
    type: VERIFY_OTP_REQUEST,
    payload: data
  }),
  success: (response) => ({
    type: VERIFY_OTP_SUCCESS,
    payload: response
  }),
  failure: (error) => ({
    type: VERIFY_OTP_FAILURE,
    payload: error
  })
};

export const resendOTP = {
  request: (data) => ({
    type: RESEND_OTP_REQUEST,
    payload: data
  }),
  success: (response) => ({
    type: RESEND_OTP_SUCCESS,
    payload: response
  }),
  failure: (error) => ({
    type: RESEND_OTP_FAILURE,
    payload: error
  })
};

export const clearOTPState = () => ({
  type: CLEAR_OTP_STATE
});
```

---

### 2. API - `OTPAuthApi.js`

**Chemin**: `/src/business/api/shared/OTPAuthApi.js`

```javascript
import axios from "axios";

const BASE_URL = process.env.REACT_APP_WEBAPI_URL;
const TENANT_ID = +process.env.REACT_APP_TENANT_ID;

// Send OTP Code
export function sendOTPApi(data) {
  const { email } = data;
  return axios.post(`${BASE_URL}/api/Auth/SendOTP`, {
    email,
    tenantId: TENANT_ID
  });
}

// Verify OTP Code
export function verifyOTPApi(data) {
  const { email, otpCode } = data;
  return axios.post(`${BASE_URL}/api/Auth/VerifyOTP`, {
    email,
    otpCode,
    tenantId: TENANT_ID
  });
}

// Resend OTP Code
export function resendOTPApi(data) {
  const { email } = data;
  return axios.post(`${BASE_URL}/api/Auth/ResendOTP`, {
    email,
    tenantId: TENANT_ID
  });
}
```

---

### 3. Sagas - `OTPAuthSagas.js`

**Chemin**: `/src/business/sagas/shared/OTPAuthSagas.js`

```javascript
import { call, put, takeLatest } from "redux-saga/effects";
import { toastr } from "react-redux-toastr";
import * as actions from "../../actions/shared/OTPAuthActions";
import * as api from "../../api/shared/OTPAuthApi";
import {
  SEND_OTP_REQUEST,
  VERIFY_OTP_REQUEST,
  RESEND_OTP_REQUEST
} from "../../actions/shared/OTPAuthActions";

// Send OTP Saga
export function* sendOTPSaga({ payload }) {
  try {
    const response = yield call(api.sendOTPApi, payload);
    
    yield put(actions.sendOTP.success(response.data));
    
    toastr.success(
      "Code OTP envoyé",
      `Un code à 6 chiffres a été envoyé à ${payload.email}`
    );
    
    // Redirect to verify page
    window.location.href = `/auth-backoffice/otp-verify?email=${encodeURIComponent(payload.email)}`;
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
      "Erreur lors de l'envoi du code OTP";
    
    yield put(actions.sendOTP.failure(errorMessage));
    
    toastr.error("Erreur", errorMessage);
  }
}

// Verify OTP Saga
export function* verifyOTPSaga({ payload }) {
  try {
    const response = yield call(api.verifyOTPApi, payload);
    
    // Response contains authToken and user data
    yield put(actions.verifyOTP.success(response.data));
    
    // Update auth state (similar to regular login)
    yield put({
      type: "LOGIN_SUCCESS",
      payload: response.data
    });
    
    toastr.success(
      "Authentification réussie",
      "Bienvenue dans l'espace BackOffice"
    );
    
  } catch (error) {
    let errorMessage = "Code OTP invalide";
    
    if (error.response?.status === 410) {
      errorMessage = "Code OTP expiré. Veuillez demander un nouveau code";
    } else if (error.response?.status === 429) {
      errorMessage = "Trop de tentatives. Compte temporairement bloqué";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    yield put(actions.verifyOTP.failure(errorMessage));
    
    toastr.error("Erreur de vérification", errorMessage);
  }
}

// Resend OTP Saga
export function* resendOTPSaga({ payload }) {
  try {
    const response = yield call(api.resendOTPApi, payload);
    
    yield put(actions.resendOTP.success(response.data));
    
    toastr.success(
      "Nouveau code envoyé",
      "Un nouveau code OTP a été envoyé à votre email"
    );
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
      "Erreur lors du renvoi du code";
    
    yield put(actions.resendOTP.failure(errorMessage));
    
    if (error.response?.status === 429) {
      const retryAfter = error.response.data.retryAfter || 60;
      toastr.warning(
        "Trop de tentatives",
        `Veuillez attendre ${retryAfter} secondes`
      );
    } else {
      toastr.error("Erreur", errorMessage);
    }
  }
}

// Root Saga Watcher
export function* watchOTPAuthActions() {
  yield takeLatest(SEND_OTP_REQUEST, sendOTPSaga);
  yield takeLatest(VERIFY_OTP_REQUEST, verifyOTPSaga);
  yield takeLatest(RESEND_OTP_REQUEST, resendOTPSaga);
}
```

---

### 4. Reducer - `OTPAuthReducers.js`

**Chemin**: `/src/business/reducers/shared/OTPAuthReducers.js`

```javascript
import {
  SEND_OTP_REQUEST,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
  RESEND_OTP_REQUEST,
  RESEND_OTP_SUCCESS,
  RESEND_OTP_FAILURE,
  CLEAR_OTP_STATE
} from "../../actions/shared/OTPAuthActions";

const initialState = {
  loading: false,
  error: null,
  otpSent: false,
  verificationSuccess: false,
  email: null,
  expiresIn: 300
};

export function otpAuthReducer(state = initialState, action) {
  switch (action.type) {
    // Send OTP
    case SEND_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        otpSent: false
      };
      
    case SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        otpSent: true,
        expiresIn: action.payload.expiresIn || 300
      };
      
    case SEND_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        otpSent: false
      };

    // Verify OTP
    case VERIFY_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        verificationSuccess: false
      };
      
    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        verificationSuccess: true
      };
      
    case VERIFY_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        verificationSuccess: false
      };

    // Resend OTP
    case RESEND_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case RESEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        expiresIn: action.payload.expiresIn || 300
      };
      
    case RESEND_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    // Clear State
    case CLEAR_OTP_STATE:
      return initialState;

    default:
      return state;
  }
}
```

---

### 5. Configuration Axios - `setupAxios.js` 🔄 MISE À JOUR

**Chemin**: `/src/business/setupAxios.js`

**Description**: Configuration de l'intercepteur Axios pour gérer automatiquement le rafraîchissement des tokens via cookies.

```javascript
import axios from "axios";
import { toastr } from "react-redux-toastr";

const REFRESH_TOKEN_ENDPOINT = "/api/Auth/RefreshToken";
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export default function setupAxios(axiosInstance, store) {
  
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    config => {
      // Les cookies sont automatiquement envoyés avec withCredentials
      config.withCredentials = true;
      
      // Optionnel: Ajouter le token depuis Redux si disponible (rétrocompatibilité)
      const { auth: { authToken } } = store.getState();
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      
      return config;
    },
    err => Promise.reject(err)
  );

  // Response Interceptor - Gestion du refresh token
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // Si l'erreur n'est pas 401, ou c'est déjà une tentative de refresh, rejeter
      if (
        error.response?.status !== 401 || 
        originalRequest.url === REFRESH_TOKEN_ENDPOINT ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      // Si un refresh est déjà en cours, mettre en queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Marquer la requête comme "retry"
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Appeler l'endpoint de refresh
        // Le refresh_token est automatiquement envoyé via cookies
        await axiosInstance.post(REFRESH_TOKEN_ENDPOINT, {}, {
          withCredentials: true
        });

        // Nouveaux tokens reçus via Set-Cookie headers
        // Les cookies sont automatiquement stockés par le navigateur
        
        // Traiter la queue des requêtes en attente
        processQueue(null);
        
        // Réessayer la requête originale
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Le refresh a échoué - déconnecter l'utilisateur
        processQueue(refreshError, null);
        
        // Nettoyer le state Redux
        store.dispatch({ type: "CLIENT_LOGOUT_REQUEST" });
        
        // Rediriger vers login
        window.location.href = "/auth-backoffice/login";
        
        // Afficher message
        toastr.error(
          "Session expirée",
          "Veuillez vous reconnecter"
        );
        
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }
  );
}
```

**Points Clés**:

1. **`withCredentials: true`**: Essentiel pour que les cookies soient envoyés avec chaque requête
2. **Queue de requêtes**: Pendant le refresh, les requêtes sont mises en file d'attente
3. **Éviter les boucles infinies**: `_retry` flag et check sur `REFRESH_TOKEN_ENDPOINT`
4. **Déconnexion automatique**: Si le refresh échoue, l'utilisateur est redirigé vers login
5. **Rétrocompatibilité**: Supporte aussi le Bearer token depuis Redux (pour migration progressive)

---

### 6. Configuration Axios dans l'Application

**Chemin**: `/src/index.js` ou `/src/App.js`

```javascript
import axios from "axios";
import setupAxios from "./business/setupAxios";
import store from "./business/store";

// Configurer Axios avec le store Redux
setupAxios(axios, store);

// Définir l'URL de base
axios.defaults.baseURL = process.env.REACT_APP_WEBAPI_URL;

// Activer les cookies pour toutes les requêtes
axios.defaults.withCredentials = true;
```

---

## 🛣️ Configuration des Routes

### Mise à jour de `Routes.js`

```javascript
// Dans /src/ui/Routes.js
import OTPRequest from "./components/backoffice/auth/OTPRequest";
import OTPVerify from "./components/backoffice/auth/OTPVerify";

// Ajouter ces routes dans le routing BackOffice
<Route path="/auth-backoffice/otp-request" component={OTPRequest} />
<Route path="/auth-backoffice/otp-verify" component={OTPVerify} />
```

---

## 🔒 Sécurité et Bonnes Pratiques

### 1. Protection Backend

**Rate Limiting**:
```csharp
// Backend: Limiter les tentatives
// - Max 3 demandes OTP par email toutes les 10 minutes
// - Max 5 tentatives de vérification avant blocage 15 minutes
```

**Expiration du Code**:
```csharp
// Code OTP valide pendant 5 minutes uniquement
// Après expiration, demander un nouveau code
```

**Génération Sécurisée**:
```csharp
// Utiliser un générateur cryptographiquement sûr
// Code OTP: 6 chiffres aléatoires (100,000 à 999,999)
using System.Security.Cryptography;

public string GenerateOTP()
{
    using (var rng = RandomNumberGenerator.Create())
    {
        byte[] bytes = new byte[4];
        rng.GetBytes(bytes);
        int value = Math.Abs(BitConverter.ToInt32(bytes, 0));
        return (value % 900000 + 100000).ToString();
    }
}
```

---

### 2. Protection Frontend

**Validation Côté Client**:
```javascript
// Valider le format avant envoi
const isValidOTP = (code) => {
  return /^\d{6}$/.test(code);
};
```

**Timeout Visuel**:
```javascript
// Afficher un timer de compte à rebours
// Désactiver les inputs après expiration
```

**Anti-Brute Force**:
```javascript
// Limiter les tentatives côté client également
// Bloquer temporairement après X échecs
```

---

### 3. Sécurité des Cookies (Refresh Token System) 🔐

#### Configuration des Cookies HTTP-Only

**Backend (C# / ASP.NET Core)**:

```csharp
using Microsoft.AspNetCore.Http;

public class TokenService
{
    public void SetAuthCookies(HttpResponse response, string accessToken, string refreshToken)
    {
        // Cookie Access Token (15 minutes)
        var accessCookieOptions = new CookieOptions
        {
            HttpOnly = true,        // Inaccessible via JavaScript (Protection XSS)
            Secure = true,          // HTTPS uniquement
            SameSite = SameSiteMode.Strict,  // Protection CSRF
            Path = "/",             // Accessible sur tout le site
            MaxAge = TimeSpan.FromMinutes(15),
            Domain = ".myconnectt.fr"  // Sous-domaines si nécessaire
        };
        response.Cookies.Append("access_token", accessToken, accessCookieOptions);

        // Cookie Refresh Token (7 jours)
        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/Auth/RefreshToken",  // Limité au endpoint refresh
            MaxAge = TimeSpan.FromDays(7),
            Domain = ".myconnectt.fr"
        };
        response.Cookies.Append("refresh_token", refreshToken, refreshCookieOptions);
    }

    public void ClearAuthCookies(HttpResponse response)
    {
        response.Cookies.Delete("access_token");
        response.Cookies.Delete("refresh_token");
    }
}
```

#### Validation des Tokens Côté Backend

```csharp
[Authorize]
public class AuthController : ControllerBase
{
    private readonly ITokenService _tokenService;
    
    [HttpPost("RefreshToken")]
    public async Task<IActionResult> RefreshToken()
    {
        // Lire le refresh_token depuis les cookies
        var refreshToken = Request.Cookies["refresh_token"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token manquant" });
        }

        try
        {
            // Valider le refresh token
            var principal = _tokenService.ValidateRefreshToken(refreshToken);
            
            // Vérifier si le token n'est pas révoqué (Redis/DB)
            var isRevoked = await _tokenService.IsTokenRevoked(refreshToken);
            if (isRevoked)
            {
                return Forbid(); // 403
            }

            // Générer nouveaux tokens
            var newAccessToken = _tokenService.GenerateAccessToken(principal.Claims);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Stocker le nouveau refresh token (rotation)
            await _tokenService.StoreRefreshToken(principal.UserId, newRefreshToken);
            
            // Révoquer l'ancien refresh token
            await _tokenService.RevokeRefreshToken(refreshToken);

            // Définir les nouveaux cookies
            SetAuthCookies(Response, newAccessToken, newRefreshToken);

            return Ok(new { success = true, message = "Token rafraîchi avec succès" });
        }
        catch (SecurityTokenException)
        {
            return Unauthorized(new { message = "Refresh token invalide ou expiré" });
        }
    }
}
```

#### Bonnes Pratiques de Sécurité

✅ **HttpOnly**: Empêche JavaScript d'accéder aux cookies (protection XSS)  
✅ **Secure**: Cookies transmis uniquement via HTTPS  
✅ **SameSite=Strict**: Protection contre les attaques CSRF  
✅ **Path restreint**: Le refresh_token n'est envoyé qu'au endpoint `/api/Auth/RefreshToken`  
✅ **Rotation des tokens**: À chaque refresh, nouveau refresh_token généré et ancien révoqué  
✅ **Révocation**: Possibilité de révoquer tous les refresh tokens d'un utilisateur  
✅ **Durée courte**: Access token expire en 15 minutes (minimise l'exposition)  

#### Stockage des Refresh Tokens (Backend)

**Option 1: Redis (Recommandé pour production)**
```csharp
public class RedisTokenStore
{
    private readonly IConnectionMultiplexer _redis;
    
    public async Task StoreRefreshToken(int userId, string refreshToken, TimeSpan expiry)
    {
        var db = _redis.GetDatabase();
        var key = $"refresh_token:{userId}:{refreshToken}";
        await db.StringSetAsync(key, "valid", expiry);
    }
    
    public async Task<bool> IsTokenRevoked(string refreshToken)
    {
        var db = _redis.GetDatabase();
        // Rechercher dans toutes les clés refresh_token
        var exists = await db.KeyExistsAsync($"refresh_token:*:{refreshToken}");
        return !exists; // Si n'existe pas = révoqué
    }
    
    public async Task RevokeRefreshToken(string refreshToken)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync($"refresh_token:*:{refreshToken}");
    }
    
    public async Task RevokeAllUserTokens(int userId)
    {
        var db = _redis.GetDatabase();
        var keys = _redis.GetServer("localhost", 6379)
            .Keys(pattern: $"refresh_token:{userId}:*");
        
        foreach (var key in keys)
        {
            await db.KeyDeleteAsync(key);
        }
    }
}
```

**Option 2: Base de données SQL**
```sql
CREATE TABLE RefreshTokens (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    RevokedAt DATETIME NULL,
    IsRevoked BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
```

#### Protection CORS

**Backend Configuration**:
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("MyConnecttPolicy", builder =>
        {
            builder
                .WithOrigins(
                    "https://portail.myconnectt.fr",
                    "https://dev.myconnectt.fr"
                )
                .AllowCredentials()  // Essentiel pour les cookies
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
    });
}

public void Configure(IApplicationBuilder app)
{
    app.UseCors("MyConnecttPolicy");
    app.UseAuthentication();
    app.UseAuthorization();
}
```

---

### 4. Email Template

**Template HTML pour Email OTP**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Code OTP MyConnectt</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 30px; border-radius: 10px;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://portail.myconnectt.fr/logo.png" alt="MyConnectt" style="height: 50px;">
    </div>
    
    <h1 style="color: #3699ff; text-align: center;">Code de Vérification</h1>
    
    <p>Bonjour,</p>
    
    <p>Vous avez demandé un code OTP pour accéder à l'espace BackOffice MyConnectt.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <p style="color: #888; margin-bottom: 10px;">Votre code OTP est :</p>
      <h2 style="color: #3699ff; font-size: 36px; letter-spacing: 10px; margin: 0;">
        {{OTP_CODE}}
      </h2>
    </div>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        <strong>⚠️ Important :</strong><br>
        • Ce code est valide pendant <strong>5 minutes</strong><br>
        • Ne partagez jamais ce code avec qui que ce soit<br>
        • Si vous n'avez pas demandé ce code, ignorez cet email
      </p>
    </div>
    
    <p style="margin-top: 30px; color: #888; font-size: 12px; text-align: center;">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
      © 2026 MyConnectt - Tous droits réservés
    </p>
  </div>
</body>
</html>
```

---

## 📝 Textes d'Internationalisation (i18n)

### Ajout dans les fichiers de traduction

**Fichier**: `/src/_metronic/i18n/messages/fr.json`

```json
{
  "AUTH.OTP.REQUEST.TITLE": "Authentification OTP",
  "AUTH.OTP.REQUEST.DESC": "Entrez votre email pour recevoir un code OTP",
  "AUTH.OTP.EMAIL.LABEL": "Adresse Email BackOffice",
  "AUTH.OTP.EMAIL.PLACEHOLDER": "admin@myconnectt.fr",
  "AUTH.OTP.SEND_CODE": "Envoyer le Code OTP",
  "AUTH.OTP.BACK_TO_LOGIN": "Retour à la connexion",
  "AUTH.OTP.REQUEST.INFO": "Un code à 6 chiffres sera envoyé à votre adresse email. Ce code sera valide pendant 5 minutes.",
  
  "AUTH.OTP.VERIFY.TITLE": "Vérification OTP",
  "AUTH.OTP.VERIFY.DESC": "Entrez le code OTP envoyé à {email}",
  "AUTH.OTP.CODE.LABEL": "Code de Vérification",
  "AUTH.OTP.VERIFY_BUTTON": "Vérifier le Code",
  "AUTH.OTP.RESEND_CODE": "Renvoyer le Code",
  "AUTH.OTP.CHANGE_EMAIL": "Changer d'Email",
  "AUTH.OTP.EXPIRES_IN": "Expire dans : {time}",
  "AUTH.OTP.EXPIRED": "Code expiré",
  "AUTH.OTP.VERIFY.SUCCESS": "Code vérifié avec succès ! Redirection...",
  
  "AUTH.OTP.ERROR.INVALID_CODE": "Code OTP invalide",
  "AUTH.OTP.ERROR.EXPIRED": "Code OTP expiré",
  "AUTH.OTP.ERROR.TOO_MANY_ATTEMPTS": "Trop de tentatives. Compte temporairement bloqué",
  "AUTH.OTP.ERROR.USER_NOT_FOUND": "Aucun compte BackOffice trouvé",
  "AUTH.OTP.ERROR.NOT_BACKOFFICE": "Ce compte n'est pas un compte BackOffice"
}
```

---

## 🎨 Styles CSS Additionnels

### Fichier: `/src/ui/components/backoffice/auth/OTPStyles.scss`

```scss
// OTP Input Styles
.otp-input-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  
  @media (max-width: 576px) {
    gap: 5px;
  }
}

.otp-input {
  width: 50px;
  height: 60px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  border: 2px solid #e4e6ef;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  @media (max-width: 576px) {
    width: 40px;
    height: 50px;
    font-size: 20px;
  }
  
  &:focus {
    outline: none;
    border-color: #3699ff;
    box-shadow: 0 0 0 0.2rem rgba(54, 153, 255, 0.25);
  }
  
  &:disabled {
    background-color: #f3f6f9;
    cursor: not-allowed;
  }
  
  &.is-invalid {
    border-color: #f64e60;
    
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(246, 78, 96, 0.25);
    }
  }
  
  &.is-valid {
    border-color: #1bc5bd;
    
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(27, 197, 189, 0.25);
    }
  }
}

// Timer Styles
.otp-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &.expired {
    color: #f64e60;
    font-weight: 600;
  }
  
  &.warning {
    color: #ffa800;
    font-weight: 600;
  }
}

// Animation for code input
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.otp-input.shake {
  animation: shake 0.5s;
}
```

---

## 🧪 Tests

### Test Saga - `OTPAuthSagas.test.js`

```javascript
import { call, put } from "redux-saga/effects";
import { sendOTPSaga, verifyOTPSaga } from "./OTPAuthSagas";
import * as actions from "../../actions/shared/OTPAuthActions";
import * as api from "../../api/shared/OTPAuthApi";

describe("OTP Auth Sagas", () => {
  
  describe("sendOTPSaga", () => {
    it("should send OTP successfully", () => {
      const payload = { email: "admin@test.com" };
      const gen = sendOTPSaga({ payload });
      
      // Call API
      expect(gen.next().value).toEqual(
        call(api.sendOTPApi, payload)
      );
      
      // Success response
      const response = { data: { success: true, expiresIn: 300 } };
      expect(gen.next(response).value).toEqual(
        put(actions.sendOTP.success(response.data))
      );
      
      expect(gen.next().done).toBe(true);
    });
    
    it("should handle send OTP error", () => {
      const payload = { email: "admin@test.com" };
      const gen = sendOTPSaga({ payload });
      
      gen.next();
      
      const error = { response: { data: { message: "User not found" } } };
      expect(gen.throw(error).value).toEqual(
        put(actions.sendOTP.failure("User not found"))
      );
    });
  });
  
  describe("verifyOTPSaga", () => {
    it("should verify OTP successfully", () => {
      const payload = { email: "admin@test.com", otpCode: "123456" };
      const gen = verifyOTPSaga({ payload });
      
      // Call API
      expect(gen.next().value).toEqual(
        call(api.verifyOTPApi, payload)
      );
      
      // Success response with JWT
      const response = { 
        data: { 
          authToken: "jwt-token",
          user: { id: 1, email: "admin@test.com", userType: 2 }
        } 
      };
      
      expect(gen.next(response).value).toEqual(
        put(actions.verifyOTP.success(response.data))
      );
      
      expect(gen.next().value).toEqual(
        put({ type: "LOGIN_SUCCESS", payload: response.data })
      );
    });
  });
});
```

---

## 📊 Diagramme de Séquence Complet

```
┌──────┐   ┌────────┐   ┌───────┐   ┌──────┐   ┌─────────┐   ┌──────────┐
│ User │   │ React  │   │ Redux │   │ Saga │   │   API   │   │ Backend  │
└──────┘   └────────┘   └───────┘   └──────┘   └─────────┘   └──────────┘
    │           │            │          │            │              │
    │ Enter email                                                   │
    │──────────>│                                                   │
    │           │ dispatch(                                         │
    │           │  sendOTP.                                         │
    │           │  request)  │                                      │
    │           │───────────>│                                      │
    │           │            │ saga      │                          │
    │           │            │ intercepts│                          │
    │           │            │──────────>│                          │
    │           │            │           │  POST /SendOTP           │
    │           │            │           │───────────>│             │
    │           │            │           │            │ Generate    │
    │           │            │           │            │ OTP code    │
    │           │            │           │            │────────────>│
    │           │            │           │            │ Store code  │
    │           │            │           │            │ Send email  │
    │           │            │           │            │<────────────│
    │           │            │           │   200 OK   │             │
    │           │            │           │<───────────│             │
    │           │            │  success  │                          │
    │           │            │<──────────│                          │
    │           │ Update     │                                      │
    │           │ state      │                                      │
    │           │<───────────│                                      │
    │  Show OTP verify page                                         │
    │<──────────│                                                   │
    │           │                                                   │
    │ Enter OTP code                                                │
    │──────────>│                                                   │
    │           │ dispatch(                                         │
    │           │  verifyOTP.                                       │
    │           │  request)  │                                      │
    │           │───────────>│                                      │
    │           │            │ saga      │                          │
    │           │            │──────────>│                          │
    │           │            │           │ POST /VerifyOTP          │
    │           │            │           │───────────>│             │
    │           │            │           │            │ Verify code │
    │           │            │           │            │────────────>│
    │           │            │           │            │ Generate JWT│
    │           │            │           │            │<────────────│
    │           │            │           │ 200 + JWT  │             │
    │           │            │           │<───────────│             │
    │           │            │  success  │                          │
    │           │            │<──────────│                          │
    │           │ Update     │                                      │
    │           │ auth state │                                      │
    │           │<───────────│                                      │
    │  Redirect to dashboard                                        │
    │<──────────│                                                   │
```

---

## ✅ Checklist d'Implémentation

### Backend (API)

- [ ] Créer endpoint `POST /api/Auth/SendOTP`
  - [ ] Valider que l'email existe
  - [ ] Vérifier que c'est un compte BackOffice (userType = 2)
  - [ ] Générer code OTP 6 chiffres sécurisé
  - [ ] Stocker le code avec timestamp (Redis ou DB)
  - [ ] Envoyer email avec template HTML
  - [ ] Implémenter rate limiting (3 max / 10 min)
  - [ ] Logger les tentatives

- [ ] Créer endpoint `POST /api/Auth/VerifyOTP`
  - [ ] Valider format du code (6 chiffres)
  - [ ] Vérifier que le code existe et est valide
  - [ ] Vérifier que le code n'a pas expiré (5 min)
  - [ ] Compter les tentatives (max 5)
  - [ ] Générer Access Token et Refresh Token
  - [ ] Définir les cookies HTTP-Only (access_token, refresh_token)
  - [ ] Invalider le code après usage
  - [ ] Logger succès/échecs

- [ ] Créer endpoint `POST /api/Auth/ResendOTP`
  - [ ] Invalider l'ancien code
  - [ ] Générer nouveau code
  - [ ] Implémenter cooldown (60 secondes)
  - [ ] Envoyer nouveau email

- [ ] Créer endpoint `POST /api/Auth/RefreshToken` ⭐ NOUVEAU
  - [ ] Lire refresh_token depuis les cookies
  - [ ] Valider le refresh token (JWT signature)
  - [ ] Vérifier que le token n'est pas révoqué (Redis/DB)
  - [ ] Générer nouveaux access_token et refresh_token
  - [ ] Rotation: Révoquer l'ancien refresh_token
  - [ ] Stocker le nouveau refresh_token
  - [ ] Définir les nouveaux cookies HTTP-Only
  - [ ] Gérer les erreurs (401 si invalide/expiré)

- [ ] Configuration Cookies ⭐ NOUVEAU
  - [ ] Attribut HttpOnly pour sécurité XSS
  - [ ] Attribut Secure (HTTPS uniquement)
  - [ ] Attribut SameSite=Strict (protection CSRF)
  - [ ] Path="/api/Auth/RefreshToken" pour refresh_token
  - [ ] Expiration: 15 min (access), 7 jours (refresh)

- [ ] Système de Révocation des Tokens ⭐ NOUVEAU
  - [ ] Redis: Stockage des refresh tokens actifs
  - [ ] Endpoint pour révoquer tous les tokens d'un utilisateur
  - [ ] Nettoyage automatique des tokens expirés
  - [ ] Blacklist des tokens révoqués

- [ ] Configuration CORS ⭐ NOUVEAU
  - [ ] AllowCredentials = true (pour cookies)
  - [ ] Origins: Domaines autorisés uniquement
  - [ ] Headers et méthodes appropriés

- [ ] Configuration Email Service
  - [ ] Template HTML professionnel
  - [ ] Gestion des erreurs d'envoi
  - [ ] Logs des emails envoyés

### Frontend (React)

- [ ] Créer composants
  - [ ] `OTPRequest.js` - Demande code
  - [ ] `OTPVerify.js` - Vérification code
  
- [ ] Redux Setup
  - [ ] Actions: `OTPAuthActions.js`
  - [ ] API: `OTPAuthApi.js`
  - [ ] Sagas: `OTPAuthSagas.js`
  - [ ] Reducer: `OTPAuthReducers.js`
  - [ ] Ajouter reducer au store

- [ ] Configuration Axios ⭐ NOUVEAU
  - [ ] Mettre à jour `setupAxios.js` avec intercepteur refresh token
  - [ ] Ajouter `withCredentials: true` pour toutes les requêtes
  - [ ] Implémenter queue de requêtes pendant refresh
  - [ ] Gérer déconnexion automatique si refresh échoue
  - [ ] Éviter boucles infinies (_retry flag)
  - [ ] Configurer `axios.defaults.withCredentials = true`

- [ ] Routing
  - [ ] Route `/auth-backoffice/otp-request`
  - [ ] Route `/auth-backoffice/otp-verify`
  - [ ] Navigation entre les étapes

- [ ] UI/UX
  - [ ] Design inputs OTP (6 boxes)
  - [ ] Timer countdown visuel
  - [ ] Messages d'erreur clairs
  - [ ] Loading states
  - [ ] Responsive design
  - [ ] Accessibilité (ARIA labels)

- [ ] Fonctionnalités
  - [ ] Auto-focus sur inputs
  - [ ] Navigation clavier (arrows, backspace)
  - [ ] Support paste (Ctrl+V)
  - [ ] Auto-submit quand 6 chiffres
  - [ ] Bouton resend avec cooldown
  - [ ] Validation côté client

### Internationalisation

- [ ] Ajouter textes FR dans `/src/_metronic/i18n/messages/fr.json`
- [ ] Ajouter textes EN dans `/src/_metronic/i18n/messages/en.json`

### Tests

- [ ] Tests unitaires Sagas
- [ ] Tests unitaires Reducers
- [ ] Tests composants React (Jest + React Testing Library)
- [ ] Tests E2E (Cypress)

### Sécurité

- [ ] Rate limiting backend
- [ ] Validation inputs
- [ ] Protection CSRF (SameSite cookies)
- [ ] Protection XSS (HttpOnly cookies)
- [ ] Logs d'audit
- [ ] Alertes tentatives suspectes
- [ ] Rotation des refresh tokens ⭐ NOUVEAU
- [ ] Révocation des tokens compromis ⭐ NOUVEAU
- [ ] HTTPS obligatoire en production ⭐ NOUVEAU

### Documentation

- [x] Documentation technique complète
- [ ] Guide utilisateur
- [ ] Changelog
- [ ] API documentation (Swagger)

---

## 🚀 Déploiement

### Variables d'Environnement

**Frontend**: Aucune nouvelle variable requise. Utilise les variables existantes:
- `REACT_APP_WEBAPI_URL`
- `REACT_APP_TENANT_ID`

**Backend** ⭐ NOUVELLES VARIABLES:
- `JWT_ACCESS_TOKEN_SECRET`: Clé secrète pour signer l'access token
- `JWT_REFRESH_TOKEN_SECRET`: Clé secrète pour signer le refresh token (différente!)
- `ACCESS_TOKEN_EXPIRY`: Durée de vie access token (défaut: 15 minutes)
- `REFRESH_TOKEN_EXPIRY`: Durée de vie refresh token (défaut: 7 jours)
- `COOKIE_DOMAIN`: Domaine des cookies (ex: `.myconnectt.fr`)
- `REDIS_CONNECTION_STRING`: Pour stocker les refresh tokens (si Redis)

**Exemple `.env` Backend**:
```bash
JWT_ACCESS_TOKEN_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_TOKEN_SECRET=your-different-refresh-key-min-32-chars
ACCESS_TOKEN_EXPIRY=900          # 15 minutes en secondes
REFRESH_TOKEN_EXPIRY=604800      # 7 jours en secondes
COOKIE_DOMAIN=.myconnectt.fr
COOKIE_SECURE=true               # true en production (HTTPS)
REDIS_CONNECTION_STRING=localhost:6379
```

### Migration

**Base de données** (si pas Redis):
```sql
-- Créer table pour stocker les refresh tokens
CREATE TABLE RefreshTokens (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    RevokedAt DATETIME NULL,
    IsRevoked BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_ExpiresAt ON RefreshTokens(ExpiresAt);
```

**Nettoyage périodique** (Job quotidien):
```sql
-- Supprimer les refresh tokens expirés
DELETE FROM RefreshTokens 
WHERE ExpiresAt < GETDATE() OR IsRevoked = 1;
```

### Configuration HTTPS/SSL

⚠️ **IMPORTANT**: Les cookies `Secure` nécessitent HTTPS en production.

**Certificat SSL**:
- Production: Utiliser Let's Encrypt ou certificat Azure
- Dev/Test: Accepter certificat auto-signé localement

**Nginx Configuration** (si applicable):
```nginx
server {
    listen 443 ssl http2;
    server_name portail.myconnectt.fr;
    
    ssl_certificate /etc/ssl/certs/myconnectt.crt;
    ssl_certificate_key /etc/ssl/private/myconnectt.key;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Rollback Plan

Si besoin de rollback:

**Frontend**:
1. Désactiver les nouvelles routes OTP
2. Rediriger vers login classique
3. Reverter `setupAxios.js` à l'ancienne version (sans refresh interceptor)
4. Supprimer `axios.defaults.withCredentials = true`

**Backend**:
1. Désactiver les endpoints OTP
2. Revenir aux JWT tokens dans le body (au lieu de cookies)
3. Désactiver l'endpoint `/api/Auth/RefreshToken`
4. Supprimer la configuration CORS `AllowCredentials`

**Base de données** (si migration effectuée):
```sql
-- Facultatif: Conserver la table pour logs
-- DROP TABLE RefreshTokens;
```

**Vérification Post-Rollback**:
- [ ] Login classique fonctionne
- [ ] JWT token reçu dans response body
- [ ] Token stocké dans Redux/localStorage
- [ ] Pas d'erreurs CORS
- [ ] Requêtes API fonctionnent

---

## 📈 Métriques à Suivre

### Authentification OTP
1. **Taux d'utilisation OTP**: % admins utilisant OTP
2. **Taux de succès**: % codes OTP validés
3. **Temps moyen**: Temps entre demande et vérification
4. **Erreurs fréquentes**: Types d'erreurs rencontrés
5. **Tentatives échouées**: Détection patterns suspects

### Refresh Token System ⭐ NOUVEAU
6. **Taux de refresh**: Nombre de refresh tokens utilisés par jour
7. **Échecs de refresh**: % de refresh échoués (token invalide/expiré)
8. **Durée de session moyenne**: Temps avant expiration du refresh token
9. **Révocations**: Nombre de tokens révoqués manuellement
10. **Performance**: Temps de réponse de `/api/Auth/RefreshToken`
11. **Charge Redis**: Nombre de refresh tokens stockés
12. **Sessions actives**: Nombre d'utilisateurs avec refresh token valide

---

## 🔄 Migration de l'Ancien au Nouveau Système

### Comparaison: JWT Body vs HTTP-Only Cookies

| Aspect | ❌ Ancien Système (JWT Body) | ✅ Nouveau Système (Cookies) |
|--------|------------------------------|------------------------------|
| **Stockage Token** | Response body JSON | HTTP-Only Cookies |
| **Frontend Storage** | Redux + localStorage | Pas de stockage frontend (cookies auto) |
| **Envoi Token** | Header `Authorization: Bearer` | Cookies automatiques |
| **Sécurité XSS** | ⚠️ Vulnérable (localStorage accessible) | ✅ Protégé (HttpOnly inaccessible JS) |
| **Protection CSRF** | ✅ Pas de risque | ✅ Protégé (SameSite=Strict) |
| **Refresh Token** | ❌ Non implémenté | ✅ Rotation automatique |
| **Durée de vie** | Long (risque si volé) | Court (15 min access, 7j refresh) |
| **Révocation** | ❌ Difficile | ✅ Facile (blacklist Redis) |
| **Multi-onglets** | ✅ Partagé via localStorage | ✅ Partagé via cookies |
| **Logout** | Clear localStorage | Clear cookies (backend) |

### Stratégie de Migration Progressive

#### Phase 1: Support Hybride (Recommandé)

Le système supporte les deux méthodes simultanément:

**Backend**:
```csharp
[HttpPost("VerifyOTP")]
public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPRequest request)
{
    // Valider OTP...
    var user = await ValidateOTP(request.Email, request.OtpCode);
    
    var accessToken = GenerateAccessToken(user);
    var refreshToken = GenerateRefreshToken(user);
    
    // NOUVEAU: Définir les cookies
    SetAuthCookies(Response, accessToken, refreshToken);
    
    // ANCIEN: Retourner aussi dans body (rétrocompatibilité)
    return Ok(new
    {
        authToken = accessToken,  // Pour anciens clients
        user = user
    });
}
```

**Frontend `setupAxios.js`**:
```javascript
// Support hybride
axiosInstance.interceptors.request.use(config => {
  config.withCredentials = true;  // Pour cookies
  
  // Rétrocompatibilité: Bearer token si disponible
  const { auth: { authToken } } = store.getState();
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  
  return config;
});
```

#### Phase 2: Migration Complète

1. **Semaine 1-2**: Déployer support hybride
2. **Semaine 3**: Monitoring - vérifier que cookies fonctionnent
3. **Semaine 4**: Forcer déconnexion tous les utilisateurs (migration)
4. **Semaine 5**: Retirer le support JWT body
5. **Semaine 6+**: Système 100% cookies

### Code de Migration Frontend

**Avant (Ancien système)**:
```javascript
// AuthSaga.js
export function* verifyOTPSaga({ payload }) {
  const response = yield call(api.verifyOTPApi, payload);
  
  // Token dans response.data.authToken
  yield put({
    type: "LOGIN_SUCCESS",
    payload: {
      authToken: response.data.authToken,  // ❌ Stocké dans Redux
      user: response.data.user
    }
  });
}

// AuthReducer.js
case "LOGIN_SUCCESS":
  return {
    authToken: action.payload.authToken,  // ❌ Persisted to localStorage
    user: action.payload.user
  };
```

**Après (Nouveau système)**:
```javascript
// AuthSaga.js
export function* verifyOTPSaga({ payload }) {
  const response = yield call(api.verifyOTPApi, payload);
  
  // Tokens dans cookies HTTP-Only (automatique)
  // Pas besoin de les gérer
  yield put({
    type: "LOGIN_SUCCESS",
    payload: {
      user: response.data.user  // ✅ Seulement les données user
    }
  });
}

// AuthReducer.js
case "LOGIN_SUCCESS":
  return {
    // authToken: Retiré! Géré par cookies
    user: action.payload.user  // ✅ Seulement user data
  };
```

### Nettoyage Post-Migration

**Supprimer de Redux State**:
```javascript
// Avant
const initialAuthState = {
  user: undefined,
  authToken: undefined,  // ❌ À retirer
  loading: false
};

// Après
const initialAuthState = {
  user: undefined,
  // authToken retiré - géré par cookies
  loading: false
};
```

**Mettre à jour persistReducer**:
```javascript
// Avant
export const clientAuthReducer = persistReducer(
  { 
    storage, 
    key: "myconnectt-auth", 
    whitelist: ["user", "authToken"]  // ❌ authToken à retirer
  },
  reducer
);

// Après
export const clientAuthReducer = persistReducer(
  { 
    storage, 
    key: "myconnectt-auth", 
    whitelist: ["user"]  // ✅ Seulement user
  },
  reducer
);
```

**Nettoyer localStorage existant**:
```javascript
// À exécuter une fois après déploiement
if (localStorage.getItem("persist:myconnectt-auth")) {
  const stored = JSON.parse(localStorage.getItem("persist:myconnectt-auth"));
  if (stored.authToken) {
    delete stored.authToken;
    localStorage.setItem("persist:myconnectt-auth", JSON.stringify(stored));
  }
}
```

---

## 🎯 Améliorations Futures

1. **Authentification par SMS** (en plus de email)
2. **Authentification TOTP** (Google Authenticator)
3. **Biométrie** (WebAuthn)
4. **Remember Device** (éviter OTP pendant 30 jours)
5. **Backup Codes** (codes de secours imprimables)
6. **Push Notifications** (mobile app)

---

## 📚 Ressources Complémentaires

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 4226 - HOTP](https://tools.ietf.org/html/rfc4226)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [Google 2FA Best Practices](https://developers.google.com/identity/protocols/oauth2)

---

**Auteur**: Documentation créée pour MyConnectt  
**Date**: Mars 2026  
**Version**: 1.0

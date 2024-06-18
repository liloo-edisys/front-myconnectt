import axios from "axios";
import { toastr } from "react-redux-toastr";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;
export const LOGIN_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/User/Authenticate";
export const REGISTER_ACCOUNT_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Account/Subscribe";

// OLD URL WITH EMAIL
/*export const REGISTER_INTERIMAIRE_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Applicant/Subscribe";*/

export const REGISTER_INTERIMAIRE_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/applicant/Authenticate";
export const CHECK_INTERIMAIRE_SMS_CODE =
  process.env.REACT_APP_WEBAPI_URL + "api/applicant/ConfirmSms";
export const REQUEST_PASSWORD_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/User/ForgotPassword";
export const RESET_PASSWORD_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/User/UpdatePassword";
export const REGISTER_CONFIRM_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/User/RegisterConfirm";
export const RESET_CLIENT_TOKEN_URL =
  process.env.REACT_APP_URL + "auth/reset-password";
export const CONFIRM_CLIENT_TOKEN_URL =
  process.env.REACT_APP_URL + "auth/register-confirm";
export const USER_START_GUIDE_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/userstartguide";
export const RESET_BACKOFFICE_TOKEN_URL =
  process.env.REACT_APP_URL + "auth/backoffice-reset-password";

export const COUNT_MATCHING_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/vacancy/CountMatchingWithApplicant";

export const RESET_INTERIMAIRE_TOKEN_URL =
  process.env.REACT_APP_URL + "auth/int-reset-password";
export const CONFIRM_INTERIMAIRE_TOKEN_URL =
  process.env.REACT_APP_URL + "auth/int-register-confirm";

export function login(datas) {
  const tenantid = TENANTID;
  const { email, password } = datas;
  return axios.post(LOGIN_URL, { tenantid, email, password });
}

export function registerAccount(datas) {
  const tenantid = TENANTID;
  const tokenUrl = CONFIRM_CLIENT_TOKEN_URL;
  return axios
    .post(REGISTER_ACCOUNT_URL, {
      tenantid,
      ...datas,
      tokenUrl
    })
    .then(function(response) {
      if (response) {
        toastr.success(
          "Création de votre espace",
          "Nous venons de vous envoyer un lien de confirmation sur votre boite email. Merci de vérifier votre email pour confirmer votre inscription. N'hésitez pas à vérifier le dossier SPAM si vous ne voyez pas l'email dans votre boite de réception."
        );
      }
      return response;
    })
    .catch(function(error) {
      if (error.response) {
        let message;
        switch (error.response.data.message) {
          case "this siret is already in use.":
            message = "Ce numéro de SIRET est déjà utilisé.";
            break;
          case "this email is already in use.":
            message = "Cette adresse mail est déjà utilisée.";
            break;
          default:
            message = "Une erreur inattendue est survenue.";
            break;
        }
        toastr.error("Création de votre espace", message);
      }
    });
}

// OLD VERSION WITH EMAIL CONNECTION

/*export function registerInterimaire(datas) {
  const tenantid = TENANTID;
  const tokenUrl = CONFIRM_INTERIMAIRE_TOKEN_URL;
  return axios
    .post(REGISTER_INTERIMAIRE_URL, {
      tenantid,
      ...datas,
      tokenUrl
    })
    .then(function(response) {
      if (response) {
        toastr.success(
          "Création de votre espace",
          "Nous venons de vous envoyer un lien de confirmation sur votre boite email. Merci de vérifier votre email pour confirmer votre inscription. N'hésitez pas à vérifier le dossier SPAM si vous ne voyez pas l'email dans votre boite de réception."
        );
      }
      return response;
    })
    .catch(function(error) {
      if (error.response) {
        let message;
        switch (error.response.data.message) {
          case "this email is already in use.":
            message = "Cette adresse mail est déjà utilisée.";
            break;
          default:
            message = "Une erreur inattendue est survenue.";
            break;
        }
        toastr.error("Création de votre espace", message);
      }
    });
}*/

export function registerInterimaire(datas) {
  /*return axios
    .post(REGISTER_INTERIMAIRE_URL, {
      tenantid,
      ...datas,
      tokenUrl
    })
    .then(function(response) {
      if (response) {
        toastr.success(
          "Création de votre espace",
          "Nous venons de vous envoyer un lien de confirmation sur votre boite email. Merci de vérifier votre email pour confirmer votre inscription. N'hésitez pas à vérifier le dossier SPAM si vous ne voyez pas l'email dans votre boite de réception."
        );
      }
      return response;
    })
    .catch(function(error) {
      if (error.response) {
        let message;
        switch (error.response.data.message) {
          case "this email is already in use.":
            message = "Cette adresse mail est déjà utilisée.";
            break;
          default:
            message = "Une erreur inattendue est survenue.";
            break;
        }
        toastr.error("Création de votre espace", message);
      }
    });*/
}

export function requestPassword(email) {
  const tenantID = TENANTID;
  const isInterimaire = window.location.href.indexOf("int-") > 0;
  const isBackoffice = window.location.href.indexOf("backoffice-") > 0;
  const tokenUrl = isInterimaire
    ? RESET_INTERIMAIRE_TOKEN_URL
    : isBackoffice
    ? RESET_BACKOFFICE_TOKEN_URL
    : RESET_CLIENT_TOKEN_URL;
  return axios.post(REQUEST_PASSWORD_URL, { tenantID, email, tokenUrl });
}

export function resetPassword(token, NewPassword) {
  const tenantID = TENANTID;
  return axios.put(RESET_PASSWORD_URL, { tenantID, token, NewPassword });
}

export function registerConfirm(token) {
  const tenantID = TENANTID;
  return axios.put(REGISTER_CONFIRM_URL, { tenantID, token });
}

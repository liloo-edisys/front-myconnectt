import axios from "axios";

export const INTERIMAIRES_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Applicant";

export function getInterimaire() {
  return axios.get(INTERIMAIRES_URL);
}

export function deleteInterimaire(data) {
  return axios.post(INTERIMAIRES_URL + `/AskForDelete`, data);
}

export function updateInterimaire(data) {
  return axios.put(INTERIMAIRES_URL, data);
}

export function confirmSubscription(data) {
  return axios.post(INTERIMAIRES_URL + `/ConfirmSubscription`, data);
}

export function parseResume(data) {
  return axios.post(INTERIMAIRES_URL + `/ExtractApplicantCV`, data);
}

export function searchInterimaires(data) {
  return axios.post(INTERIMAIRES_URL + "/SearchInterimaires", data.data);
}

export function getInterimaireById(id) {
  return axios.get(INTERIMAIRES_URL + "/" + id);
}

export const INTERIMAIRE_CONTRACT_LIST_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/contract/searchcontracts";

export const INTERIMAIRE_DOCUMENTS_LIST_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Applicant/SearchDocuments";

export const USER_RECIEPTS_LIST_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/account/SearchDocuments";

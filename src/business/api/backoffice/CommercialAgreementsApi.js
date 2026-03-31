import axios from "axios";

export const COMMERCIAL_AGREEMENTS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/CommercialAgreement";

export function getCommercialAgreements(data) {
  return axios.post(COMMERCIAL_AGREEMENTS_URL + "/Search", data);
}

export function updateCommercialAgreement(data) {
  return axios.put(COMMERCIAL_AGREEMENTS_URL, data);
}

export function deleteCommercialAgreement(id) {
  return axios.delete(COMMERCIAL_AGREEMENTS_URL + `?id=` + id);
}

export function createCommercialAgreement(data) {
  return axios.post(COMMERCIAL_AGREEMENTS_URL, data);
}

import axios from "axios";

export const ACCOUNT_URL = process.env.REACT_APP_WEBAPI_URL + "api/Account";
export const INTERIMAIRES_LIST_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/applicant/searchapplicants";

export function getAccounts() {
  return axios.get(ACCOUNT_URL);
}

export function sendToAnael(id) {
  return axios.get(ACCOUNT_URL + "/SendCustomerToAnael/" + id);
}

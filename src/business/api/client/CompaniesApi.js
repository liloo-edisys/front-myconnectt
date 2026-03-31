import axios from "axios";

export const COMPANIES_URL = process.env.REACT_APP_WEBAPI_URL + "api/Account";

export function createCompany(data) {
  data.paymentChoiceID = +data.paymentChoiceID;
  data.InvoiceTypeID = +data.InvoiceTypeID;
  return axios.post(COMPANIES_URL, data);
}

export function updateCompany(data) {
  data.paymentChoiceID = +data.paymentChoiceID;
  data.invoiceTypeID = +data.invoiceTypeID;
  return axios.put(COMPANIES_URL, data);
}

export function getCompaniesList() {
  return axios.get(COMPANIES_URL);
}

export function getCustomersList(data) {
  return axios.post(COMPANIES_URL, data);
}

export function deleteCompany(companyID) {
  return axios.delete(COMPANIES_URL + `?id=` + companyID);
}

export function switchAccount(datas) {
  return axios.post(COMPANIES_URL + `/SwitchAccount`, datas);
}

export function checkFields() {
  return axios.get(COMPANIES_URL + `/CheckRequiredFields`);
}

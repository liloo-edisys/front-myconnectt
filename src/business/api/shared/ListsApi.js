import axios from "axios";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;
export const LISTS_URL = process.env.REACT_APP_WEBAPI_URL + "api/";

export function getTitlesTypes() {
  return axios.get(LISTS_URL + "TitleType/GetAll/" + TENANTID);
}

export function getInvoicesTypes() {
  return axios.get(LISTS_URL + "InvoiceType");
}

export function getAccountGroups() {
  return axios.get(LISTS_URL + "AccountGroup");
}

export function getPaymentChoices() {
  return axios.get(LISTS_URL + "PaymentChoice");
}

export function getJobTitles() {
  return axios.get(LISTS_URL + "JobTitle");
}

export function getTRJobTitles(id) {
  return axios.get(LISTS_URL + "JobTitle/GetTRAll/" + id);
}

export function getMissionExperiences() {
  return axios.get(LISTS_URL + "MissionExperience");
}
export function getMissionReasons() {
  return axios.get(LISTS_URL + "MissionReason");
}
export function getDriverLicences() {
  return axios.get(LISTS_URL + "DriverLicense");
}
export function getMissionRemuneration() {
  return axios.get(LISTS_URL + "MissionRemuneration");
}

export function getMissionEquipment() {
  return axios.get(LISTS_URL + "MissionEquipment");
}

export function getEducationLevels() {
  return axios.get(LISTS_URL + "EducationLevel");
}

export function getJobSkills() {
  return axios.get(LISTS_URL + "JobSkill");
}
export function createJobSkills(data) {
  const tenantID = TENANTID;

  return axios.post(LISTS_URL + "JobSkill", { tenantID, ...data });
}
export function getJobTags() {
  return axios.get(LISTS_URL + "JobTag");
}

export function createJobTags(data) {
  const tenantID = TENANTID;

  return axios.post(LISTS_URL + "JobTag", { tenantID, ...data });
}

export function getLanguages() {
  return axios.get(LISTS_URL + "Language");
}

export function getAPE() {
  return axios.get(LISTS_URL + "ApeNumber");
}

export function getContractType() {
  return axios.get(LISTS_URL + "ContractType");
}

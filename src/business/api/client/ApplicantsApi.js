import axios from "axios";

export const USER_URL = process.env.REACT_APP_WEBAPI_URL + "api/Applicant";
export const UPLOAD_DOCUMENT =
  process.env.REACT_APP_WEBAPI_URL + "api/Applicant/UploadDocument";
export const DELETE_DOCUMENT =
  process.env.REACT_APP_WEBAPI_URL + "api/Applicant/RemoveDocumentData";
export const REMOVE_ONE_DOCUMENT =
  process.env.REACT_APP_WEBAPI_URL + "api/applicant/removedocument";
export const APPLICATION_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/MissionApplication";
export function countMatching(data) {
  if (!data.vacancyApplicationCriteriaArrayComputerSkills)
    data.vacancyApplicationCriteriaArrayComputerSkills = [];

  if (!data.vacancyApplicationCriteriaArrayJobTags)
    data.vacancyApplicationCriteriaArrayJobTags = [];

  if (!data.vacancyApplicationCriteriaArrayLanguagesWithLevel)
    data.vacancyApplicationCriteriaArrayLanguagesWithLevel = [];

  if (!data.vacancyApplicationCriteriaArrayRequiredEducationLevels)
    data.vacancyApplicationCriteriaArrayRequiredEducationLevels = [];

  if (!data.missionWeeklyWorkHours) data.missionWeeklyWorkHours = 0;

  if (data.vacancyContractualProposedHourlySalary)
    data.vacancyContractualProposedHourlySalary = +data.vacancyContractualProposedHourlySalary;

  data.address = "_";

  return axios.post(USER_URL + "/CountMatchingWithVacancy", data);
}

export function getMatching(data) {
  return axios.post(USER_URL + "/GetMatchingWithVacancy", data);
}

export function declineMatching(data) {
  return axios.post(APPLICATION_URL + "/DeclineMatching", data);
}

export function approveByCustomer(data) {
  return axios.post(APPLICATION_URL + "/ApproveByCustomer", data);
}

export function getFormattedCV(data) {
  return axios.post(USER_URL + "/GetFormattedCV", data);
}

export function declineByCustomer(data) {
  return axios.post(APPLICATION_URL + "/DeclineByCustomer", data);
}

export function approveByApplicant(data) {
  return axios.post(APPLICATION_URL + "/ApproveByApplicant", data);
}

export function declineByApplicant(data) {
  return axios.post(APPLICATION_URL + "/DeclineByApplicant", data);
}

export function updateApplicant(data) {
  return axios.put(USER_URL, data);
}

export function getApplicantById(data) {
  return axios.get(USER_URL + `/` + data);
}

export function deleteApplication(data, search) {
  return axios.post(APPLICATION_URL + "/DeleteApplication", data, search);
}

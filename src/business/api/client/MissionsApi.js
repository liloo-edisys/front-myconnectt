import axios from "axios";
import {
  GET_RECIEPTS_FAILLED,
  GET_RECIEPTS_REQUEST,
  GET_RECIEPTS_SUCCESS
} from "../../types/clientTypes";
import {
  INTERIMAIRE_DOCUMENTS_LIST_URL,
  USER_RECIEPTS_LIST_URL
} from "../interimaire/interimairesApi";

export const VACANCY_URL = process.env.REACT_APP_WEBAPI_URL + "api/Vacancy";
export const HABILITATION_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Habilitation";
export const TEMPLATE_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/VacancyTemplate";
export const EXTENSIONS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/contractextension";

export function getAccountMissions(data) {
  return axios.post(VACANCY_URL + "/GetAccountMissions", data);
}

export function getUserMissions(data) {
  return axios.post(VACANCY_URL + "/GetUserMissions", data);
}

export function createMission(data) {
  return axios.post(VACANCY_URL, data);
}

export function searchMission(data) {
  return axios.post(VACANCY_URL + "/SearchMissions", data);
}

export function getMission(id) {
  return axios.get(VACANCY_URL + "/" + id);
}

export function getTemplate(id) {
  return axios.get(TEMPLATE_URL + "/" + id.data);
}

export function updateMission(data) {
  return axios.put(VACANCY_URL, data);
}

export function getAccountTemplates() {
  return axios.get(TEMPLATE_URL + "/GetAccountTemplates");
}

export function getUserTemplates() {
  return axios.get(TEMPLATE_URL + "/GetUserTemplates");
}

export function createTemplate(data) {
  return axios.post(TEMPLATE_URL, data);
}

export function getMissionSalaries(data) {
  return axios.post(VACANCY_URL + "/GetSimilarSalaries", data);
}

export function deleteMissionTemplate(id) {
  return axios.delete(TEMPLATE_URL + `?id=` + id);
}

export function deleteMission(id) {
  return axios.delete(VACANCY_URL + `?id=` + id);
}

export function searchTemplates(data) {
  return axios.post(TEMPLATE_URL + "/SearchTemplates", data.data);
}

export function updateTemplate(data) {
  data.jobTitleID = +data.jobTitleID;
  data.workSiteID = +data.workSiteID;
  data.missionExperienceID = +data.missionExperienceID;
  data.missionReasonID = +data.missionReasonID;
  data.vacancyNumberOfJobs = +data.vacancyNumberOfJobs;
  data.missionArrayHabilitations = +data.missionArrayHabilitations;

  return axios.put(TEMPLATE_URL, data);
}

export const getRecieptList = (body, dispatch) => {
  dispatch({
    type: GET_RECIEPTS_REQUEST
  });
  axios
    .post(USER_RECIEPTS_LIST_URL, body)
    .then(res => {
      dispatch({
        type: GET_RECIEPTS_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_RECIEPTS_FAILLED
      });
    });
};

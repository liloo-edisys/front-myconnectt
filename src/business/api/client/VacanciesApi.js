import axios from "axios";

export const VACANCIES_URL = process.env.REACT_APP_WEBAPI_URL + "api/Vacancy";

export function getUserVacancies(data) {
  return axios.post(VACANCIES_URL + "/GetUserMissions", data);
}

import axios from "axios";

export const USER_URL = process.env.REACT_APP_WEBAPI_URL + "api/User";

export function getUser() {
  return axios.get(USER_URL);
}

export function getUserByToken(data) {
  return axios.post(USER_URL + "/GetByToken", data);
}

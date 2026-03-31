import axios from "axios";

export const RECRUITER_URL = process.env.REACT_APP_WEBAPI_URL + "api/Recruiter";

export function getRecruiter() {
  return axios.get(RECRUITER_URL);
}

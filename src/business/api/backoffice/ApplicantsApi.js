import axios from "axios";

export const APPLICANTS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Applicant";

export function deleteApplicant(data) {
  return axios.delete(APPLICANTS_URL + `?id=` + data);
}

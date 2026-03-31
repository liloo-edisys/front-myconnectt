import axios from "axios";

export const DASHBOARD_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/ApplicantDashboard";

export function getDashboardDatas(datas) {
  return axios.post(DASHBOARD_URL, datas);
}

import axios from "axios";

/*export const DASHBOARD_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/BackOfficeDashboard";*/
export const DASHBOARD_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/BackofficeDashboard/GetDashboardData";

export function getBackOfficeDashboardDatas() {
  return axios.get(DASHBOARD_URL);
}

import axios from "axios";

export const EMAIL_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Email/SendEmailToTenant";

export function sendEmail(data) {
  return axios.post(EMAIL_URL, data);
}

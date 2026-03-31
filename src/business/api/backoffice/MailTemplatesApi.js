import axios from "axios";

export const MAIL_TEMPLATES_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/EmailTemplate/";

export function getMailTemplates(data) {
  return axios.post(MAIL_TEMPLATES_URL + "SearchEmailTemplates", data);
}

export function getMailTemplateCategories() {
  return axios.get(MAIL_TEMPLATES_URL + "GetEmailTemplateCategories");
}

export function updateMailTemplate(data) {
  return axios.put(MAIL_TEMPLATES_URL, data);
}

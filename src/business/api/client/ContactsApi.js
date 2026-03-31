import axios from "axios";

export const CONTACTS_URL = process.env.REACT_APP_WEBAPI_URL + "api/Contact";
export const TOKEN_URL = process.env.REACT_APP_URL + "auth/register-confirm";

export function getContact() {
  return axios.get(CONTACTS_URL);
}

export function getContactsList() {
  return axios.get(CONTACTS_URL + "/GetContacts");
}

export function inviteContact(data) {
  const tokenUrl = TOKEN_URL;
  const body = {
    ...data,
    tokenUrl
  };
  return axios.post(CONTACTS_URL + "/Invite", body);
}

export function updateContact(data) {
  return axios.put(CONTACTS_URL, data);
}

export function deleteContact(contactID) {
  return axios.delete(CONTACTS_URL + `?id=` + contactID);
}

export function confirmInvite(data) {
  return axios.post(CONTACTS_URL + `/ConfirmInvite`, data);
}

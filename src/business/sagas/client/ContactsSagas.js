import * as actionTypes from "constants/constants";

import {
  getContact as getContactActions,
  inviteContact as inviteContactActions,
  getContactsList as getContactsListActions,
  updateContact as updateContactActions,
  deleteContact as deleteContactActions,
  deleteMyContact as deleteMyContactActions
} from "actions/client/contactsActions";
import {
  getContact as getContactApi,
  inviteContact as inviteContactApi,
  getContactsList as getContactsListApi,
  updateContact as updateContactApi,
  deleteContact as deleteContactApi
} from "api/client/contactsApi";
import { toastr } from "react-redux-toastr";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getContact() {
  try {
    const response = yield call(getContactApi);
    yield put(getContactActions.success(response));
  } catch (error) {
    yield put(getContactActions.failure(error));
  }
}

export function* inviteContact({ payload: { data } }) {
  try {
    const response = yield call(inviteContactApi, data);
    yield put(inviteContactActions.success(response, data));
    if (response.status === 200) {
      yield put(getContactsListActions.request());
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(inviteContactActions.failure(error));
    if (error.response) {
      let message;
      switch (error.response.data.message) {
        case "email already in use.":
          message = "Cette adresse mail est déjà utilisée.";
          break;
        default:
          message = "Une erreur inattendue est survenue.";
          break;
      }
      toastr.error("Invitation contact", message);
    }
  }
}

export function* getContactsList() {
  try {
    const response = yield call(getContactsListApi);
    yield put(getContactsListActions.success(response));
  } catch (error) {
    yield put(getContactsListActions.failure(error));
  }
}

export function* updateContact({ payload: { data } }) {
  try {
    const response = yield call(updateContactApi, data);
    yield put(updateContactActions.success(response, data));
    if (response.status === 200) {
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(updateContactActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* deleteContact({ payload: { id } }) {
  try {
    const response = yield call(deleteContactApi, id);
    yield put(deleteContactActions.success(response, id));
    if (response.status === 200) {
      yield put(getContactsListActions.request());
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(deleteContactActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* deleteMyContact({ payload: { id } }) {
  try {
    const response = yield call(deleteContactApi, id);
    yield put(deleteMyContactActions.success(response, id));
    if (response.status === 200) {
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(deleteMyContactActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export default function* ContactsSagas() {
  yield all([takeLatest(actionTypes.GET_CONTACT_REQUEST, getContact)]);
  yield all([takeLatest(actionTypes.INVITE_CONTACT_REQUEST, inviteContact)]);
  yield all([takeLatest(actionTypes.GET_CONTACTS_REQUEST, getContactsList)]);
  yield all([takeLatest(actionTypes.UPDATE_CONTACT_REQUEST, updateContact)]);
  yield all([takeLatest(actionTypes.DELETE_CONTACT_REQUEST, deleteContact)]);
  yield all([
    takeLatest(actionTypes.DELETE_MY_CONTACT_REQUEST, deleteMyContact)
  ]);
}

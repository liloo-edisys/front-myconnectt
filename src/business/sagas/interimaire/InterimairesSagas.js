import * as actionTypes from "constants/constants";

import {
  getInterimaire as getInterimaireActions,
  deleteInterimaire as deleteInterimaireActions,
  updateInterimaire as updateInterimaireActions,
  parseResume as parseResumeActions,
  searchInterimaires as searchInterimairesActions,
  getInterimaireById as getInterimaireByIdActions
} from "actions/interimaire/interimairesActions";

import {
  getInterimaire as getInterimaireApi,
  updateInterimaire as updateInterimaireApi,
  deleteInterimaire as deleteInterimaireApi,
  parseResume as parseResumeApi,
  searchInterimaires as searchInterimairesApi,
  getInterimaireById as getInterimaireByIdApi
} from "api/interimaire/InterimairesApi";
import { toastr } from "react-redux-toastr";

import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getInterimaire() {
  try {
    const response = yield call(getInterimaireApi);
    yield put(getInterimaireActions.success(response));
  } catch (error) {
    yield put(getInterimaireActions.failure(error));
  }
}

export function* deleteInterimaire({ payload: { data } }) {
  try {
    const response = yield call(deleteInterimaireApi, data);
    yield put(deleteInterimaireActions.success(response, data));
    if (response.status === 200) {
      return toastr.success(
        "Succès",
        "L'opération s'est terminée avec succès."
      );
    }
  } catch (error) {
    yield put(deleteInterimaireActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* updateInterimaire({ payload: { data } }) {
  try {
    const response = yield call(updateInterimaireApi, data);
    yield put(updateInterimaireActions.success(response));
    if (response.status === 200) {
      toastr.success("Succès", "Le profil a été modifiée avec succès.");
    }
  } catch (error) {
    yield put(updateInterimaireActions.failure(error));
  }
}

export function* parseResume({ payload: { data } }) {
  try {
    const response = yield call(parseResumeApi, data);
    yield put(parseResumeActions.success(response));
    if (response.status === 200) {
      yield put(getInterimaireActions.success(response));
    }
  } catch (error) {
    yield put(parseResumeActions.failure(error));
  }
}

export function* searchInterimaires({ payload: data }) {
  try {
    const response = yield call(searchInterimairesApi, data);
    yield put(searchInterimairesActions.success(response));
  } catch (error) {
    yield put(searchInterimairesActions.failure(error));
  }
}

export function* getInterimaireById({ payload: data }) {
  try {
    const response = yield call(getInterimaireByIdApi, data.data);
    yield put(getInterimaireByIdActions.success(response));
  } catch (error) {
    yield put(getInterimaireByIdActions.failure(error));
  }
}

export default function* InterimairesSagas() {
  yield all([takeLatest(actionTypes.GET_INTERIMAIRE_REQUEST, getInterimaire)]);
  yield all([
    takeLatest(actionTypes.UPDATE_INTERIMAIRE_REQUEST, updateInterimaire)
  ]);

  yield all([takeLatest(actionTypes.PARSE_RESUME_REQUEST, parseResume)]);
  yield all([
    takeLatest(actionTypes.SEARCH_INTERIMAIRE_REQUEST, searchInterimaires)
  ]);
  yield all([
    takeLatest(actionTypes.GET_INTERIMAIRE_BYID_REQUEST, getInterimaireById)
  ]);
  yield all([
    takeLatest(actionTypes.GET_INTERIMAIRE_BYID_REQUEST, getInterimaireById)
  ]);
  yield all([
    takeLatest(actionTypes.DELETE_INTERIMAIRE_REQUEST, deleteInterimaire)
  ]);
}

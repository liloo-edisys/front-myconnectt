import * as actionTypes from "constants/constants";

import {
  login as loginActions,
  registerAccount as registerAccountActions,
  registerInterimaire as registerInterimaireActions
} from "actions/shared/authActions";

import {
  login as loginApi,
  registerAccount as registerAccountApi,
  registerInterimaire as registerInterimaireApi
} from "api/shared/AuthApi";

import { all, call, put, takeLatest } from "redux-saga/effects";

export function* login({ payload: { datas } }) {
  try {
    const response = yield call(loginApi, datas);
    yield put(loginActions.success(response));
  } catch (error) {
    yield put(loginActions.failure(error));
  }
}

export function* registerAccount(datas) {
  try {
    const response = yield call(registerAccountApi, datas);
    yield put(registerAccountActions.success(response));
  } catch (error) {
    yield put(registerAccountActions.failure(error));
  }
}

export function* registerInterimaire(datas) {
  try {
    const response = yield call(registerInterimaireApi, datas);
    yield put(registerInterimaireActions.success(response));
  } catch (error) {
    yield put(registerInterimaireActions.failure(error));
  }
}

export default function* AuthSaga() {
  yield all([takeLatest(actionTypes.CLIENT_LOGIN_REQUEST, login)]);
  yield all([takeLatest(actionTypes.CLIENT_REGISTER_REQUEST, registerAccount)]);
  yield all([
    takeLatest(actionTypes.INTERIMAIRE_REGISTER_REQUEST, registerInterimaire)
  ]);
}

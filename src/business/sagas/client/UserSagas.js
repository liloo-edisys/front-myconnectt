import * as actionTypes from "constants/constants";

import {
  getUser as getUserActions,
  getUserByToken as getUserByTokenActions
} from "actions/client/userActions";
import {
  getUser as getUserApi,
  getUserByToken as getUserByTokenApi
} from "api/client/userApi";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getUser() {
  try {
    const response = yield call(getUserApi);
    yield put(getUserActions.success(response));
  } catch (error) {
    yield put(getUserActions.failure(error));
  }
}

export function* getUserByToken({ payload: { data } }) {
  try {
    const response = yield call(getUserByTokenApi, data);
    yield put(getUserByTokenActions.success(response));
  } catch (error) {
    yield put(getUserByTokenActions.failure(error));
  }
}

export default function* UserSagas() {
  yield all([takeLatest(actionTypes.GET_USER_REQUEST, getUser)]);
  yield all([
    takeLatest(actionTypes.GET_USER_BY_TOKEN_REQUEST, getUserByToken)
  ]);
}

import * as actionTypes from "constants/constants";

import { getUserVacancies as getUserVacanciesActions } from "actions/client/vacanciesActions";
import { getUserVacancies as getUserVacanciesApi } from "api/client/vacanciesApi";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getUserVacancies({ payload: { data } }) {
  try {
    const response = yield call(getUserVacanciesApi, data);
    yield put(getUserVacanciesActions.success(response));
  } catch (error) {
    yield put(getUserVacanciesActions.failure(error));
  }
}

export default function* VacanciesSagas() {
  yield all([
    takeLatest(actionTypes.GET_USER_VACANCIES_REQUEST, getUserVacancies)
  ]);
}

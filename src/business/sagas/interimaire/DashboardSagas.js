import * as actionTypes from "constants/constants";

import { getDashboardDatas as getDashboardDatasActions } from "actions/interimaire/dashboardActions";
import { getDashboardDatas as getDashboardDatasApi } from "api/interimaire/DashboardApi";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getDashboard(datas) {
  try {
    const response = yield call(getDashboardDatasApi, datas.payload);
    yield put(getDashboardDatasActions.success(response));
  } catch (error) {
    yield put(getDashboardDatasActions.failure(error));
  }
}

export default function* DashboardInterimaireSagas() {
  yield all([
    takeLatest(actionTypes.GET_DASHBOARD_INTERIMAIRE_REQUEST, getDashboard)
  ]);
}

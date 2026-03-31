import * as actionTypes from "constants/constants";

import { getDashboardDatas as getDashboardDatasActions } from "actions/client/dashboardActions";
import { getDashboardDatas as getDashboardDatasApi } from "api/client/dashboardApi";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getDashboard(datas) {
  try {
    const response = yield call(getDashboardDatasApi, datas.payload);
    yield put(getDashboardDatasActions.success(response));
  } catch (error) {
    yield put(getDashboardDatasActions.failure(error));
  }
}

export default function* DashboardSagas() {
  yield all([takeLatest(actionTypes.GET_DASHBOARD_REQUEST, getDashboard)]);
}

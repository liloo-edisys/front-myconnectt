import * as actionTypes from "constants/constants";

import { getBackOfficeDashboardDatas as getBackOfficeDashboardDatasActions } from "actions/backoffice/DashboardActions";
import { getBackOfficeDashboardDatas as getBackOfficeDashboardDatasApi } from "api/backoffice/DashboardApi";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getBackOfficeDashboard(datas) {
  try {
    const response = yield call(getBackOfficeDashboardDatasApi, datas.payload);
    yield put(getBackOfficeDashboardDatasActions.success(response));
  } catch (error) {
    yield put(getBackOfficeDashboardDatasActions.failure(error));
  }
}

export default function* BackOfficeDashboardSagas() {
  yield all([
    takeLatest(
      actionTypes.GET_BACKOFFICE_DASHBOARD_REQUEST,
      getBackOfficeDashboard
    )
  ]);
}

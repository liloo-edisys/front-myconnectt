import * as actionTypes from "constants/constants";

import { getAccounts as getAccountsActions } from "actions/backoffice/AccountsActions";
import { sendToAnael as sendToAnaelActions } from "actions/backoffice/AccountsActions";
import { getAccounts as getAccountsApi } from "api/backoffice/AccountsApi";
import { sendToAnael as sendToAnaelApi } from "api/backoffice/AccountsApi";
import { toastr } from "react-redux-toastr";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getAccounts() {
  try {
    const response = yield call(getAccountsApi);
    yield put(getAccountsActions.success(response));
  } catch (error) {
    yield put(getAccountsActions.failure(error));
  }
}

export function* sendToAnael({ payload: data }) {
  try {
    const response = yield call(sendToAnaelApi, data.data.id);
    yield put(sendToAnaelActions.success(response));
  } catch (error) {
    yield put(sendToAnaelActions.failure(error));
  }
}

export default function* RecruiterSagas() {
  yield all([takeLatest(actionTypes.GET_ACCOUNTS_REQUEST, getAccounts)]);
  yield all([takeLatest(actionTypes.SEND_TO_ANAEL_REQUEST, sendToAnael)]);
}

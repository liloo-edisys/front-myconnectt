import * as actionTypes from "constants/constants";

import { getRecruiter as getRecruiterActions } from "actions/backoffice/RecruiterActions";
import { getRecruiter as getRecruiterApi } from "api/backoffice/RecruiterApi";
import { toastr } from "react-redux-toastr";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getRecruiter() {
  try {
    const response = yield call(getRecruiterApi);
    yield put(getRecruiterActions.success(response));
  } catch (error) {
    yield put(getRecruiterActions.failure(error));
  }
}

export default function* RecruiterSagas() {
  yield all([takeLatest(actionTypes.GET_RECRUITER_REQUEST, getRecruiter)]);
}

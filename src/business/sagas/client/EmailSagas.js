import * as actionTypes from "constants/constants";

import { sendEmail as sendEmailActions } from "actions/client/EmailActions";
import { sendEmail as sendEmailApi } from "api/client/EmailApi";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { toastr } from "react-redux-toastr";

export function* sendEmail({ payload: { data } }) {
  try {
    const response = yield call(sendEmailApi, data);
    yield put(sendEmailActions.success(response));
    if (response.status === 200) {
      toastr.success("Succès", "Message envoyé avec succès.");
    }
  } catch (error) {
    yield put(sendEmailActions.failure(error));
  }
}

export default function* EmailSagas() {
  yield all([takeLatest(actionTypes.SEND_EMAIL_REQUEST, sendEmail)]);
}

import * as actionTypes from "constants/constants";

import { deleteApplicant as deleteApplicantActions } from "actions/backoffice/applicantActions";
import { deleteApplicant as deleteApplicantApi } from "api/backoffice/ApplicantsApi";
import { toastr } from "react-redux-toastr";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* deleteApplicant(data) {
  try {
    const response = yield call(deleteApplicantApi, data.payload);
    yield put(deleteApplicantActions.success(response));
    if (response.status === 200) {
      return toastr.success(
        "Succès",
        "L'opération s'est terminée avec succès."
      );
    }
  } catch (error) {
    yield put(deleteApplicantActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export default function* ApplicantsBackofficeSagas() {
  yield all([
    takeLatest(actionTypes.DELETE_APPLICANT_REQUEST, deleteApplicant)
  ]);
}

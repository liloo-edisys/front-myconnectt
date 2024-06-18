import * as actionTypes from "constants/constants";

import { getCommercialAgreements as getCommercialAgreementsApi } from "../../api/backoffice/CommercialAgreementsApi";
import { updateCommercialAgreement as updateCommercialAgreementApi } from "../../api/backoffice/CommercialAgreementsApi";
import { createCommercialAgreement as createCommercialAgreementApi } from "../../api/backoffice/CommercialAgreementsApi";
import { deleteCommercialAgreement as deleteCommercialAgreementApi } from "../../api/backoffice/CommercialAgreementsApi";
import { getCommercialAgreements as getCommercialAgreementsActions } from "../../actions/backoffice/CommercialAgreementsActions";
import { updateCommercialAgreement as updateCommercialAgreementActions } from "../../actions/backoffice/CommercialAgreementsActions";
import { createCommercialAgreement as createCommercialAgreementActions } from "../../actions/backoffice/CommercialAgreementsActions";
import { deleteCommercialAgreement as deleteCommercialAgreementActions } from "../../actions/backoffice/CommercialAgreementsActions";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { toastr } from "react-redux-toastr";

export function* getCommercialAgreements(data) {
  try {
    const response = yield call(getCommercialAgreementsApi, data.payload);
    yield put(getCommercialAgreementsActions.success(response));
  } catch (error) {
    yield put(getCommercialAgreementsActions.failure(error));
  }
}

export function* updateCommercialAgreement(data) {
  try {
    const response = yield call(updateCommercialAgreementApi, data.payload);
    yield put(updateCommercialAgreementActions.success(response));
    if (response.status === 200) {
      toastr.success(
        "Succès",
        "La modification de l'accord commercial a été effectuée."
      );
    }
  } catch (error) {
    yield put(updateCommercialAgreementActions.failure(error));
    toastr.error(
      "Erreur",
      "Une erreur est survenue lors de la modification de l'accord commercial."
    );
  }
}

export function* createCommercialAgreement(data) {
  try {
    const response = yield call(createCommercialAgreementApi, data.payload);
    yield put(createCommercialAgreementActions.success(response));
    if (response.status === 200) {
      toastr.success(
        "Succès",
        "La création de l'accord commercial a été effectuée."
      );
    }
  } catch (error) {
    yield put(createCommercialAgreementActions.failure(error));
    toastr.error(
      "Erreur",
      "Une erreur est survenue lors de la création de l'accord commercial."
    );
  }
}

export function* deleteCommercialAgreement({ payload: { id } }) {
  try {
    const response = yield call(deleteCommercialAgreementApi, id);
    yield put(deleteCommercialAgreementActions.success(response, id));
    if (response.status === 200) {
      yield put(getCommercialAgreementsActions.request());
      toastr.success("Succès", "L'opération s'est terminée avec succès.");
    }
  } catch (error) {
    yield put(deleteCommercialAgreementActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export default function* CommercialAgreementsSagas() {
  yield all([
    takeLatest(
      actionTypes.GET_COMMERCIAL_AGREEMENTS_REQUEST,
      getCommercialAgreements
    )
  ]);
  yield all([
    takeLatest(
      actionTypes.PUT_COMMERCIAL_AGREEMENT_REQUEST,
      updateCommercialAgreement
    )
  ]);
  yield all([
    takeLatest(
      actionTypes.POST_COMMERCIAL_AGREEMENT_REQUEST,
      createCommercialAgreement
    )
  ]);
  yield all([
    takeLatest(
      actionTypes.DELETE_COMMERCIAL_AGREEMENT_REQUEST,
      deleteCommercialAgreement
    )
  ]);
}

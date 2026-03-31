import * as actionTypes from "constants/constants";

import {
  countMatching as countMatchingActions,
  getMatching as getMatchingActions,
  declineMatching as declineMatchingActions,
  approveByCustomer as approveByCustomerActions,
  getFormattedCV as getFormattedCVActions,
  declineByCustomer as declineByCustomerActions,
  approveByApplicant as approveByApplicantActions,
  updateApplicant as updateApplicantActions,
  declineByApplicant as declineByApplicantActions,
  getApplicantById as getApplicantByIdActions,
  deleteApplication as deleteApplicationActions
} from "actions/client/applicantsActions";
import { getInterimaire as getInterimaireActions } from "actions/interimaire/interimairesActions";
import {
  countMatching as countMatchingApi,
  getMatching as getMatchingApi,
  declineMatching as declineMatchingApi,
  approveByCustomer as approveByCustomerApi,
  getFormattedCV as getFormattedCVApi,
  declineByCustomer as declineByCustomerApi,
  approveByApplicant as approveByApplicantApi,
  updateApplicant as updateApplicantApi,
  declineByApplicant as declineByApplicantApi,
  getApplicantById as getApplicantByIdApi,
  deleteApplication as deleteApplicationApi
} from "api/client/applicantsApi";
import { getUser as getUserActions } from "actions/client/userActions";
import { getUser as getUserApi } from "api/client/userApi";
import { searchMission as searchMissionActions } from "actions/client/missionsActions";
import { searchMission as searchMissionApi } from "api/client/missionsApi";
import { getInterimaire as getInterimaireApi } from "api/interimaire/interimairesApi";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { toastr } from "react-redux-toastr";

export function* countMatching({ payload: { data } }) {
  try {
    const response = yield call(countMatchingApi, data);
    yield put(countMatchingActions.success(response));
  } catch (error) {
    yield put(countMatchingActions.failure(error));
  }
}

export function* getMatching({ payload: { data } }) {
  try {
    const response = yield call(getMatchingApi, data);
    yield put(getMatchingActions.success(response));
  } catch (error) {
    yield put(getMatchingActions.failure(error));
  }
}

export function* getApplicantById({ payload: { data } }) {
  try {
    const response = yield call(getApplicantByIdApi, data);
    yield put(getApplicantByIdActions.success(response));
  } catch (error) {
    yield put(getApplicantByIdActions.failure(error));
  }
}

export function* declineMatching({ payload: { data, mission } }) {
  try {
    const response = yield call(declineMatchingApi, data);
    yield put(declineMatchingActions.success(response));
    if (response.status === 200) {
      const response = yield call(getInterimaireApi);
      yield put(getInterimaireActions.success(response));
      toastr.success("Succès", "Vous avez refusé cette offre.");
    }
  } catch (error) {
    yield put(declineMatchingActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* approveByCustomer({ payload: { data, mission } }) {
  try {
    const response = yield call(approveByCustomerApi, data);
    yield put(approveByCustomerActions.success(response));
    if (response.status === 200) {
      const response = yield call(searchMissionApi, mission);
      yield put(searchMissionActions.success(response));
    }
  } catch (error) {
    yield put(approveByCustomerActions.failure(error));
  }
}

export function* approveByApplicant({ payload: { data, mission } }) {
  try {
    const response = yield call(approveByApplicantApi, data);
    yield put(approveByApplicantActions.success(response));
    if (response.status === 200) {
      const response = yield call(getInterimaireApi);
      yield put(getInterimaireActions.success(response));
      toastr.success(
        "Succès",
        "Votre candidature a bien été transmise à l'entreprise."
      );
    }
  } catch (error) {
    yield put(approveByApplicantActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* getFormattedCV({ payload: { data } }) {
  try {
    const response = yield call(getFormattedCVApi, data);
    yield put(getFormattedCVActions.success(response));
  } catch (error) {
    yield put(getFormattedCVActions.failure(error));
  }
}

export function* declineByCustomer({ payload: { data, mission } }) {
  try {
    const response = yield call(declineByCustomerApi, data);
    yield put(declineByCustomerActions.success(response));
    if (response.status === 200) {
      const response = yield call(searchMissionApi, mission);
      yield put(searchMissionActions.success(response));
    }
  } catch (error) {
    yield put(declineByCustomerActions.failure(error));
  }
}

export function* updateApplicant({ payload: { data, mission } }) {
  try {
    const response = yield call(updateApplicantApi, data);
    yield put(updateApplicantActions.success(response));
    if (response.status === 200) {
      toastr.success("Succès", "Le profil a été modifiée avec succès.");
      const user = yield call(getUserApi);
      yield put(getUserActions.success(user));
      const response = yield call(getInterimaireApi);
      yield put(getInterimaireActions.success(response));
    }
  } catch (error) {
    let message = "Un problème est survenu.";
    if (error.response.data.message) {
      message = error.response.data.message;
    }
    toastr.error("Erreur", message);
    yield put(updateApplicantActions.failure(error));
  }
}
export function* declineByApplicant({ payload: { data, mission } }) {
  try {
    const response = yield call(declineByApplicantApi, data);
    yield put(declineByApplicantActions.success(response));
    if (response.status === 200) {
      const response = yield call(getInterimaireApi);
      yield put(getInterimaireActions.success(response));
    }
  } catch (error) {
    yield put(declineByApplicantActions.failure(error));
  }
}

export function* deleteApplication({ payload: { data, mission } }) {
  try {
    const response = yield call(deleteApplicationApi, data);
    yield put(deleteApplicationActions.success(response));
    if (response.status === 200) {
      const response = yield call(searchMissionApi, mission);
      yield put(searchMissionActions.success(response));
    }
  } catch (error) {
    yield put(deleteApplicationActions.failure(error));
  }
}

export default function* ApplicantsSagas() {
  yield all([takeLatest(actionTypes.COUNT_MATCHING_REQUEST, countMatching)]);
  yield all([takeLatest(actionTypes.GET_MATCHING_REQUEST, getMatching)]);
  yield all([
    takeLatest(actionTypes.DECLINE_MATCHING_REQUEST, declineMatching)
  ]);
  yield all([
    takeLatest(actionTypes.APPROVE_BY_CUSTOMER_REQUEST, approveByCustomer)
  ]);
  yield all([takeLatest(actionTypes.GET_FORMATTED_CV_REQUEST, getFormattedCV)]);
  yield all([
    takeLatest(actionTypes.DECLINE_BY_CUSTOMER_REQUEST, declineByCustomer)
  ]);
  yield all([
    takeLatest(actionTypes.APPROVE_BY_APPLICANT_REQUEST, approveByApplicant)
  ]);
  yield all([
    takeLatest(actionTypes.UPDATE_APPLICANT_REQUEST, updateApplicant)
  ]);
  yield all([
    takeLatest(actionTypes.DECLINE_BY_APPLICANT_REQUEST, declineByApplicant)
  ]);
  yield all([
    takeLatest(actionTypes.GET_APPLICANT_ID_REQUEST, getApplicantById)
  ]);
  yield all([
    takeLatest(actionTypes.DELETE_APPLICATION_REQUEST, deleteApplication)
  ]);
}

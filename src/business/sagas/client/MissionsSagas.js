import * as actionTypes from "constants/constants";

import {
  createMission as createMissionActions,
  getAccountMissions as getAccountMissionsActions,
  getUserMissions as getUserMissionsActions,
  getAccountTemplates as getAccountTemplateActions,
  createTemplate as createTemplateActions,
  getUserTemplates as getUserTemplateActions,
  getMissionSalaries as getMissionSalariesActions,
  updateMission as updateMissionActions,
  updateTemplate as updateTemplateActions,
  validateMission as validateMissionActions,
  getMission as getMissionActions,
  getTemplate as getTemplateActions,
  deleteMissionTemplate as deleteMissionTemplateActions,
  deleteMission as deleteMissionActions,
  searchMission as searchMissionActions,
  searchTemplates as searchTemplatesActions
} from "actions/client/missionsActions";
import {
  createMission as createMissionApi,
  getAccountMissions as getAccountMissionsApi,
  getUserMissions as getUserMissionsApi,
  getAccountTemplates as getAccountTemplateApi,
  createTemplate as createTemplateApi,
  getUserTemplates as getUserTemplateApi,
  getMissionSalaries as getMissionSalariesApi,
  updateMission as updateMissionApi,
  updateTemplate as updateTemplateApi,
  getMission as getMissionApi,
  getTemplate as getTemplateApi,
  deleteMissionTemplate as deleteMissionTemplateApi,
  deleteMission as deleteMissionApi,
  searchMission as searchMissionApi,
  searchTemplates as searchTemplatesApi
} from "api/client/missionsApi";
import { toastr } from "react-redux-toastr";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getAccountMissions({ payload: data }) {
  try {
    const response = yield call(getAccountMissionsApi, data);
    yield put(getAccountMissionsActions.success(response));
  } catch (error) {
    yield put(getAccountMissionsActions.failure(error));
  }
}

export function* searchMission({ payload: data }) {
  try {
    const response = yield call(searchMissionApi, data);
    yield put(searchMissionActions.success(response));
  } catch (error) {
    yield put(searchMissionActions.failure(error));
  }
}

export function* searchTemplates({ payload: data }) {
  try {
    const response = yield call(searchTemplatesApi, data);
    yield put(searchTemplatesActions.success(response));
  } catch (error) {
    yield put(searchTemplatesActions.failure(error));
  }
}

export function* getMission({ payload: data }) {
  try {
    const response = yield call(getMissionApi, data.data);
    yield put(getMissionActions.success(response));
  } catch (error) {
    yield put(getMissionActions.failure(error));
  }
}

export function* getTemplate({ payload: data }) {
  try {
    const response = yield call(getTemplateApi, data);
    yield put(getTemplateActions.success(response));
  } catch (error) {
    yield put(getTemplateActions.failure(error));
  }
}

export function* getMissionSalaries({ payload: data }) {
  try {
    const response = yield call(getMissionSalariesApi, data);
    yield put(getMissionSalariesActions.success(response));
  } catch (error) {
    yield put(getMissionSalariesActions.failure(error));
  }
}

export function* getUserMissions({ payload: data }) {
  try {
    const response = yield call(getUserMissionsApi, data);
    yield put(getUserMissionsActions.success(response));
  } catch (error) {
    yield put(getUserMissionsActions.failure(error));
  }
}

export function* getAccountTemplates() {
  try {
    const response = yield call(getAccountTemplateApi);
    yield put(getAccountTemplateActions.success(response));
  } catch (error) {
    yield put(getAccountTemplateActions.failure(error));
  }
}

export function* getUserTemplates() {
  try {
    const response = yield call(getUserTemplateApi);
    yield put(getUserTemplateActions.success(response));
  } catch (error) {
    yield put(getUserTemplateActions.failure(error));
  }
}

export function* createMission({ payload: { data } }) {
  try {
    const response = yield call(createMissionApi, data);
    yield put(createMissionActions.success(response));
    if (response.status === 200) {
      toastr.success("Succès", "La mission a été créée avec succès.");
    }
  } catch (error) {
    yield put(createMissionActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* updateMission({ payload: { data } }) {
  try {
    const response = yield call(updateMissionApi, data);
    yield put(updateMissionActions.success(response));
    if (response.status === 200) {
      toastr.success("Succès", "La mission a été modifiée avec succès.");
    }
  } catch (error) {
    yield put(updateMissionActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* updateTemplate({ payload: { data } }) {
  try {
    const response = yield call(updateTemplateApi, data);
    yield put(updateTemplateActions.success(response, data));
    if (response.status === 200) {
      toastr.success("Succès", "Le modèle a été modifié avec succès.");
    }
  } catch (error) {
    yield put(updateTemplateActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* validateMission({ payload: { data } }) {
  try {
    const response = yield call(updateMissionApi, data);
    yield put(validateMissionActions.success(response));
    if (response.status === 200) {
      toastr.success("Succès", "La mission a été modifiée avec succès.");
    }
  } catch (error) {
    yield put(validateMissionActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* createTemplate({ payload: { data } }) {
  try {
    const response = yield call(createTemplateApi, data);
    yield put(createTemplateActions.success(response, data));
    if (response.status === 200) {
      toastr.success("Succès", "Le modèle a été créée avec succès.");
    }
  } catch (error) {
    yield put(createTemplateActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* deleteMissionTemplate({ payload: { id } }) {
  try {
    const response = yield call(deleteMissionTemplateApi, id);
    yield put(deleteMissionTemplateActions.success(response, id));

    toastr.success("Succès", "Le modèle a été supprimé avec succès.");
  } catch (error) {
    yield put(deleteMissionTemplateActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export function* deleteMission({ payload: { id } }) {
  try {
    const response = yield call(deleteMissionApi, id);
    yield put(deleteMissionActions.success(response, id));
    if (response.status === 200) {
      toastr.success("Succès", "La mission a été supprimé avec succès.");
    }
  } catch (error) {
    yield put(deleteMissionActions.failure(error));
    toastr.error("Erreur", "Une erreur s'est produite.");
  }
}

export default function* MissionsSagas() {
  yield all([takeLatest(actionTypes.CREATE_VACANCY_REQUEST, createMission)]);
  yield all([
    takeLatest(actionTypes.GET_ACCOUNT_VACANCY_REQUEST, getAccountMissions)
  ]);
  yield all([
    takeLatest(actionTypes.GET_USER_VACANCY_REQUEST, getUserMissions)
  ]);
  yield all([
    takeLatest(actionTypes.GET_ACCOUNT_TEMPLATE_REQUEST, getAccountTemplates)
  ]);
  yield all([
    takeLatest(actionTypes.GET_USER_TEMPLATE_REQUEST, getUserTemplates)
  ]);
  yield all([takeLatest(actionTypes.CREATE_TEMPLATE_REQUEST, createTemplate)]);
  yield all([
    takeLatest(actionTypes.GET_MISSION_SALARIES_REQUEST, getMissionSalaries)
  ]);
  yield all([takeLatest(actionTypes.UPDATE_VACANCY_REQUEST, updateMission)]);
  yield all([
    takeLatest(actionTypes.UPDATE_VACANCY_TEMPLATE_REQUEST, updateTemplate)
  ]);
  yield all([takeLatest(actionTypes.GET_VACANCY_REQUEST, getMission)]);
  yield all([takeLatest(actionTypes.GET_TEMPLATE_REQUEST, getTemplate)]);
  yield all([
    takeLatest(
      actionTypes.DELETE_MISSION_TEMPLATE_REQUEST,
      deleteMissionTemplate
    )
  ]);
  yield all([takeLatest(actionTypes.DELETE_MISSION_REQUEST, deleteMission)]);
  yield all([takeLatest(actionTypes.SEARCH_MISSION_REQUEST, searchMission)]);
  yield all([
    takeLatest(actionTypes.SEARCH_MISSION_TEMPLATE_REQUEST, searchTemplates)
  ]);
  yield all([
    takeLatest(actionTypes.VALIDATE_VACANCY_REQUEST, validateMission)
  ]);
}

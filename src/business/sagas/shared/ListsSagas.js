import * as actionTypes from "constants/constants";

import {
  getTitlesTypes as getTitlesTypesActions,
  getInvoicesTypes as getInvoicesTypesActions,
  getAccountGroups as getAccountGroupsActions,
  getPaymentChoices as getPaymentChoicesActions,
  getJobTitles as getJobTitlesActions,
  getTRJobTitles as getTRJobTitlesActions,
  getMissionExperiences as getMissionExperiencesActions,
  getMissionReasons as getMissionReasonsActions,
  getDriverLicences as getDriverLicencesActions,
  getMissionRemuneration as getMissionRemunerationActions,
  getEducationLevels as getEducationLevelsActions,
  getLanguages as getLanguagesActions,
  getJobSkills as getJobSkillsActions,
  getJobTags as getJobTagsActions,
  createJobTags as createJobTagsActions,
  createJobSkills as createJobSkillsActions,
  getMissionEquipment as getMissionEquipmentActions,
  getAPE as getAPEActions,
  getContractType as getContractTypeActions
} from "actions/shared/ListsActions";
import {
  getTitlesTypes as getTitlesTypesApi,
  getInvoicesTypes as getInvoicesTypesApi,
  getAccountGroups as getAccountGroupsApi,
  getPaymentChoices as getPaymentChoicesApi,
  getJobTitles as getJobTitlesApi,
  getTRJobTitles as getTRJobTitlesApi,
  getMissionExperiences as getMissionExperiencesApi,
  getMissionReasons as getMissionReasonsApi,
  getDriverLicences as getDriverLicencesApi,
  getMissionRemuneration as getMissionRemunerationApi,
  getEducationLevels as getEducationLevelsApi,
  getLanguages as getLanguagesApi,
  getJobSkills as getJobSkillsApi,
  getJobTags as getJobTagsApi,
  createJobTags as createJobTagsApi,
  createJobSkills as createJobSkillsApi,
  getMissionEquipment as getMissionEquipmentApi,
  getAPE as getAPEApi,
  getContractType as getContractTypeApi
} from "api/shared/ListsApi";
import { all, call, put, takeLatest } from "redux-saga/effects";

export function* getMissionEquipment() {
  try {
    const response = yield call(getMissionEquipmentApi);
    yield put(getMissionEquipmentActions.success(response));
  } catch (error) {
    yield put(getMissionEquipmentActions.failure(error));
  }
}

export function* getAPE() {
  try {
    const response = yield call(getAPEApi);
    yield put(getAPEActions.success(response));
  } catch (error) {
    yield put(getAPEActions.failure(error));
  }
}

export function* getTitleTypes() {
  try {
    const response = yield call(getTitlesTypesApi);
    yield put(getTitlesTypesActions.success(response));
  } catch (error) {
    yield put(getTitlesTypesActions.failure(error));
  }
}

export function* getInvoiceTypes() {
  try {
    const response = yield call(getInvoicesTypesApi);
    yield put(getInvoicesTypesActions.success(response));
  } catch (error) {
    yield put(getInvoicesTypesActions.failure(error));
  }
}

export function* getAccountGroups() {
  try {
    const response = yield call(getAccountGroupsApi);
    yield put(getAccountGroupsActions.success(response));
  } catch (error) {
    yield put(getAccountGroupsActions.failure(error));
  }
}

export function* getPaymentChoices() {
  try {
    const response = yield call(getPaymentChoicesApi);
    yield put(getPaymentChoicesActions.success(response));
  } catch (error) {
    yield put(getPaymentChoicesActions.failure(error));
  }
}

export function* getJobTitles() {
  try {
    const response = yield call(getJobTitlesApi);
    yield put(getJobTitlesActions.success(response));
  } catch (error) {
    yield put(getJobTitlesActions.failure(error));
  }
}

export function* getTRJobTitles({ payload: { id } }) {
  try {
    const response = yield call(getTRJobTitlesApi, id);
    yield put(getTRJobTitlesActions.success(response));
  } catch (error) {
    yield put(getTRJobTitlesActions.failure(error));
  }
}

export function* getMissionExperiences() {
  try {
    const response = yield call(getMissionExperiencesApi);
    yield put(getMissionExperiencesActions.success(response));
  } catch (error) {
    yield put(getMissionExperiencesActions.failure(error));
  }
}
export function* getMissionReasons() {
  try {
    const response = yield call(getMissionReasonsApi);
    yield put(getMissionReasonsActions.success(response));
  } catch (error) {
    yield put(getMissionReasonsActions.failure(error));
  }
}
export function* getDriverLicences() {
  try {
    const response = yield call(getDriverLicencesApi);
    yield put(getDriverLicencesActions.success(response));
  } catch (error) {
    yield put(getDriverLicencesActions.failure(error));
  }
}
export function* getMissionRemuneration() {
  try {
    const response = yield call(getMissionRemunerationApi);
    yield put(getMissionRemunerationActions.success(response));
  } catch (error) {
    yield put(getMissionRemunerationActions.failure(error));
  }
}

export function* getEducationLevels() {
  try {
    const response = yield call(getEducationLevelsApi);
    yield put(getEducationLevelsActions.success(response));
  } catch (error) {
    yield put(getEducationLevelsActions.failure(error));
  }
}

export function* getLanguages() {
  try {
    const response = yield call(getLanguagesApi);
    yield put(getLanguagesActions.success(response));
  } catch (error) {
    yield put(getLanguagesActions.failure(error));
  }
}

export function* getJobSkills() {
  try {
    const response = yield call(getJobSkillsApi);
    yield put(getJobSkillsActions.success(response));
  } catch (error) {
    yield put(getJobSkillsActions.failure(error));
  }
}

export function* getJobTags() {
  try {
    const response = yield call(getJobTagsApi);
    yield put(getJobTagsActions.success(response));
  } catch (error) {
    yield put(getJobTagsActions.failure(error));
  }
}

export function* getContractType() {
  try {
    const response = yield call(getContractTypeApi);
    yield put(getContractTypeActions.success(response));
  } catch (error) {
    yield put(getContractTypeActions.failure(error));
  }
}

export function* createJobSkills({ payload: { data } }) {
  try {
    const response = yield call(createJobSkillsApi, data);
    yield put(createJobSkillsActions.success(response, data));
    if (response.status === 200) {
      const response = yield call(getJobTagsApi);
      yield put(getJobSkillsActions.success(response));
    }
  } catch (error) {
    yield put(createJobSkillsActions.failure(error));
  }
}

export function* createJobTags({ payload: { data } }) {
  try {
    const response = yield call(createJobTagsApi, data);
    yield put(createJobTagsActions.success(response, data));
    if (response.status === 200) {
      const response = yield call(getJobTagsApi);
      yield put(getJobTagsActions.success(response));
    }
  } catch (error) {
    yield put(createJobTagsActions.failure(error));
  }
}

export default function* ListsSagas() {
  yield all([
    takeLatest(actionTypes.GET_TITLESTYPES_REQUEST, getTitleTypes),
    takeLatest(actionTypes.GET_INVOICESTYPES_REQUEST, getInvoiceTypes),
    takeLatest(actionTypes.GET_ACCOUNTGROUPS_REQUEST, getAccountGroups),
    takeLatest(actionTypes.GET_PAYMENTCHOICES_REQUEST, getPaymentChoices),
    takeLatest(actionTypes.GET_JOBTITLE_REQUEST, getJobTitles),
    takeLatest(actionTypes.GET_TR_JOBTITLE_REQUEST, getTRJobTitles),
    takeLatest(
      actionTypes.GET_MISSION_EXPERIENCES_REQUEST,
      getMissionExperiences
    ),
    takeLatest(actionTypes.GET_MISSION_REASONS_REQUEST, getMissionReasons),
    takeLatest(actionTypes.GET_DRIVER_LICENSE_REQUEST, getDriverLicences),
    takeLatest(
      actionTypes.GET_MISSION_REMUNERATION_REQUEST,
      getMissionRemuneration
    ),
    takeLatest(actionTypes.GET_EDUCATION_LEVEL_REQUEST, getEducationLevels),
    takeLatest(actionTypes.GET_LANGUAGES_REQUEST, getLanguages),
    takeLatest(actionTypes.GET_JOB_SKILLS_REQUEST, getJobSkills),
    takeLatest(actionTypes.GET_JOB_TAGS_REQUEST, getJobTags),
    takeLatest(actionTypes.CREATE_JOB_TAGS_REQUEST, createJobTags),
    takeLatest(actionTypes.CREATE_JOB_SKILLS_REQUEST, createJobSkills),
    takeLatest(actionTypes.GET_EQUIPMENT_REQUEST, getMissionEquipment),
    takeLatest(actionTypes.GET_APE_REQUEST, getAPE),
    takeLatest(actionTypes.GET_CONTRACT_TYPE_REQUEST, getContractType)
  ]);
}

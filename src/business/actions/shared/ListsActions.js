import * as actionTypes from "constants/constants";

export const getTitlesTypes = {
  request: () => ({ type: actionTypes.GET_TITLESTYPES_REQUEST }),
  success: list => ({
    type: actionTypes.GET_TITLESTYPES_SUCCESS,
    payload: { list }
  })
};

export const getInvoicesTypes = {
  request: () => ({ type: actionTypes.GET_INVOICESTYPES_REQUEST }),
  success: list => ({
    type: actionTypes.GET_INVOICESTYPES_SUCCESS,
    payload: { list }
  })
};

export const getAccountGroups = {
  request: () => ({ type: actionTypes.GET_ACCOUNTGROUPS_REQUEST }),
  success: list => ({
    type: actionTypes.GET_ACCOUNTGROUPS_SUCCESS,
    payload: { list }
  })
};

export const getPaymentChoices = {
  request: () => ({ type: actionTypes.GET_PAYMENTCHOICES_REQUEST }),
  success: list => ({
    type: actionTypes.GET_PAYMENTCHOICES_SUCCESS,
    payload: { list }
  })
};

export const getAccounts = {
  request: () => ({ type: actionTypes.GET_ACCOUNTS_REQUEST }),
  success: list => ({
    type: actionTypes.GET_ACCOUNTS_SUCCESS,
    payload: { list }
  })
};

export const getJobTitles = {
  request: () => ({ type: actionTypes.GET_JOBTITLE_REQUEST }),
  success: list => ({
    type: actionTypes.GET_JOBTITLE_SUCCESS,
    payload: { list }
  })
};
export const getTRJobTitles = {
  request: id => ({
    type: actionTypes.GET_TR_JOBTITLE_REQUEST,
    payload: { id }
  }),
  success: list => ({
    type: actionTypes.GET_TR_JOBTITLE_SUCCESS,
    payload: { list }
  })
};
export const getMissionExperiences = {
  request: () => ({ type: actionTypes.GET_MISSION_EXPERIENCES_REQUEST }),
  success: list => ({
    type: actionTypes.GET_MISSION_EXPERIENCES_SUCCESS,
    payload: { list }
  })
};
export const getMissionReasons = {
  request: () => ({ type: actionTypes.GET_MISSION_REASONS_REQUEST }),
  success: list => ({
    type: actionTypes.GET_MISSION_REASONS_SUCCESS,
    payload: { list }
  })
};
export const getDriverLicences = {
  request: () => ({ type: actionTypes.GET_DRIVER_LICENSE_REQUEST }),
  success: list => ({
    type: actionTypes.GET_DRIVER_LICENSE_SUCCESS,
    payload: { list }
  })
};
export const getMissionRemuneration = {
  request: () => ({ type: actionTypes.GET_MISSION_REMUNERATION_REQUEST }),
  success: list => ({
    type: actionTypes.GET_MISSION_REMUNERATION_SUCCESS,
    payload: { list }
  })
};

export const getEducationLevels = {
  request: () => ({ type: actionTypes.GET_EDUCATION_LEVEL_REQUEST }),
  success: list => ({
    type: actionTypes.GET_EDUCATION_LEVEL_SUCCESS,
    payload: { list }
  })
};

export const getLanguages = {
  request: () => ({ type: actionTypes.GET_LANGUAGES_REQUEST }),
  success: list => ({
    type: actionTypes.GET_LANGUAGES_SUCCESS,
    payload: { list }
  })
};
export const getJobSkills = {
  request: () => ({ type: actionTypes.GET_JOB_SKILLS_REQUEST }),
  success: list => ({
    type: actionTypes.GET_JOB_SKILLS_SUCCESS,
    payload: { list }
  })
};
export const getJobTags = {
  request: () => ({ type: actionTypes.GET_JOB_TAGS_REQUEST }),
  success: list => ({
    type: actionTypes.GET_JOB_TAGS_SUCCESS,
    payload: { list }
  })
};

export const getAPE = {
  request: () => ({ type: actionTypes.GET_APE_REQUEST }),
  success: list => ({
    type: actionTypes.GET_APE_SUCCESS,
    payload: { list }
  })
};

export const createJobSkills = {
  request: data => ({
    type: actionTypes.CREATE_JOB_SKILLS_REQUEST,
    payload: { data }
  }),
  success: list => ({
    type: actionTypes.CREATE_JOB_SKILLS_SUCCESS,
    payload: { list }
  })
};

export const createJobTags = {
  request: data => ({
    type: actionTypes.CREATE_JOB_TAGS_REQUEST,
    payload: { data }
  }),
  success: list => ({
    type: actionTypes.CREATE_JOB_TAGS_SUCCESS,
    payload: { list }
  })
};

export const getMissionEquipment = {
  request: () => ({ type: actionTypes.GET_EQUIPMENT_REQUEST }),
  success: list => ({
    type: actionTypes.GET_EQUIPMENT_SUCCESS,
    payload: { list }
  })
};

export const getContractType = {
  request: () => ({ type: actionTypes.GET_CONTRACT_TYPE_REQUEST }),
  success: list => ({
    type: actionTypes.GET_CONTRACT_TYPE_SUCCESS,
    payload: { list }
  })
};

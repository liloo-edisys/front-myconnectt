import * as actionTypes from "constants/constants";

export const countMatching = {
  request: data => ({
    type: actionTypes.COUNT_MATCHING_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.COUNT_MATCHING_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.COUNT_MATCHING_FAILURE,
    payload: { error }
  })
};

export const resetMatching = {
  request: data => ({
    type: actionTypes.RESET_MATCHING_REQUEST
  })
};

export const getMatching = {
  request: data => ({
    type: actionTypes.GET_MATCHING_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.GET_MATCHING_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.GET_MATCHING_FAILURE,
    payload: { error }
  })
};

export const declineMatching = {
  request: data => ({
    type: actionTypes.DECLINE_MATCHING_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.DECLINE_MATCHING_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.DECLINE_MATCHING_FAILURE,
    payload: { error }
  })
};

export const approveByCustomer = {
  request: (data, mission) => {
    return {
      type: actionTypes.APPROVE_BY_CUSTOMER_REQUEST,
      payload: { data, mission }
    };
  },
  success: user => ({
    type: actionTypes.APPROVE_BY_CUSTOMER_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.APPROVE_BY_CUSTOMER_FAILURE,
    payload: { error }
  })
};

export const getFormattedCV = {
  request: (data, mission) => ({
    type: actionTypes.GET_FORMATTED_CV_REQUEST,
    payload: { data, mission }
  }),
  success: user => ({
    type: actionTypes.GET_FORMATTED_CV_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.GET_FORMATTED_CV_FAILURE,
    payload: { error }
  })
};

export const clearFormattedCV = {
  request: (data, mission) => ({
    type: actionTypes.CLEAR_FORMATTED_CV_REQUEST,
    payload: { data, mission }
  })
};

export const declineByCustomer = {
  request: (data, mission) => ({
    type: actionTypes.DECLINE_BY_CUSTOMER_REQUEST,
    payload: { data, mission }
  }),
  success: user => ({
    type: actionTypes.DECLINE_BY_CUSTOMER_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.DECLINE_BY_CUSTOMER_FAILURE,
    payload: { error }
  })
};

export const approveByApplicant = {
  request: data => ({
    type: actionTypes.APPROVE_BY_APPLICANT_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.APPROVE_BY_APPLICANT_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.APPROVE_BY_APPLICANT_FAILURE,
    payload: { error }
  })
};

export const declineByApplicant = {
  request: data => ({
    type: actionTypes.DECLINE_BY_APPLICANT_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.DECLINE_BY_APPLICANT_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.DECLINE_BY_APPLICANT_FAILURE,
    payload: { error }
  })
};

export const updateApplicant = {
  request: data => ({
    type: actionTypes.UPDATE_APPLICANT_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.UPDATE_APPLICANT_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.UPDATE_APPLICANT_FAILURE,
    payload: { error }
  })
};

export const getApplicantById = {
  request: data => ({
    type: actionTypes.GET_APPLICANT_ID_REQUEST,
    payload: { data }
  }),
  success: user => ({
    type: actionTypes.GET_APPLICANT_ID_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.UPDATE_APPLICANT_ID_FAILURE,
    payload: { error }
  })
};

export const deleteApplication = {
  request: (data, mission) => ({
    type: actionTypes.DELETE_APPLICATION_REQUEST,
    payload: { data, mission }
  }),
  success: user => ({
    type: actionTypes.DELETE_APPLICATION_SUCCESS,
    payload: user
  }),
  failure: error => ({
    type: actionTypes.DELETE_APPLICATION_FAILURE,
    payload: { error }
  })
};

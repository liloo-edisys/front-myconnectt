import * as actionTypes from "constants/constants";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;

export const getCommercialAgreements = {
  request: data => ({
    type: actionTypes.GET_COMMERCIAL_AGREEMENTS_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.GET_COMMERCIAL_AGREEMENTS_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.GET_COMMERCIAL_AGREEMENTS_FAILURE,
    payload: { error }
  })
};

export const updateCommercialAgreement = {
  request: data => ({
    type: actionTypes.PUT_COMMERCIAL_AGREEMENT_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.PUT_COMMERCIAL_AGREEMENT_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.PUT_COMMERCIAL_AGREEMENT_FAILURE,
    payload: { error }
  })
};

export const deleteCommercialAgreement = {
  request: id => ({
    type: actionTypes.DELETE_COMMERCIAL_AGREEMENT_REQUEST,
    payload: { id }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_COMMERCIAL_AGREEMENT_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_COMMERCIAL_AGREEMENT_FAILURE,
    payload: { error }
  })
};

export const createCommercialAgreement = {
  request: data => ({
    type: actionTypes.POST_COMMERCIAL_AGREEMENT_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.POST_COMMERCIAL_AGREEMENT_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.POST_COMMERCIAL_AGREEMENT_FAILURE,
    payload: { error }
  })
};

import * as actionTypes from "constants/constants";

export const getCompanies = {
  request: authToken => ({
    type: actionTypes.GET_COMPANIES_REQUEST,
    payload: { authToken }
  }),
  success: company => ({
    type: actionTypes.GET_COMPANIES_SUCCESS,
    payload: { company }
  }),
  failure: error => ({
    type: actionTypes.GET_COMPANIES_FAILURE,
    payload: { error }
  })
};

export const getCustomers = {
  request: data => ({
    type: actionTypes.GET_CUSTOMERS_REQUEST,
    payload: { data }
  }),
  success: customers => ({
    type: actionTypes.GET_CUSTOMERS_SUCCESS,
    payload: { customers }
  }),
  failure: error => ({
    type: actionTypes.GET_CUSTOMERS_FAILURE,
    payload: { error }
  })
};

export const createCompany = {
  request: (data, getData) => ({
    type: actionTypes.CREATE_COMPANY_REQUEST,
    payload: { data, getData }
  }),
  success: (company, data) => ({
    type: actionTypes.CREATE_COMPANY_SUCCESS,
    payload: { company, data }
  }),
  failure: error => ({
    type: actionTypes.CREATE_COMPANY_FAILURE,
    payload: { error }
  })
};

export const updateCompany = {
  request: data => ({
    type: actionTypes.UPDATE_COMPANY_REQUEST,
    payload: { data }
  }),
  success: (company, data) => ({
    type: actionTypes.UPDATE_COMPANY_SUCCESS,
    payload: { company, data }
  }),
  failure: error => ({
    type: actionTypes.UPDATE_COMPANY_FAILURE,
    payload: { error }
  })
};

export const deleteCompany = {
  request: id => ({
    type: actionTypes.DELETE_COMPANY_REQUEST,
    payload: { id }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_COMPANY_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_COMPANY_FAILURE,
    payload: { error }
  })
};

export const switchAccount = {
  request: data => ({
    type: actionTypes.SWITCH_COMPANY_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.SWITCH_COMPANY_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.SWITCH_COMPANY_FAILURE,
    payload: { error }
  })
};

export const checkFields = {
  request: () => ({
    type: actionTypes.CHECK_COMPANY_REQUEST
  }),
  success: data => ({
    type: actionTypes.CHECK_COMPANY_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.CHECK_COMPANY_FAILURE,
    payload: { error }
  })
};

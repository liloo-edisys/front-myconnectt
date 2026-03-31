import * as actionTypes from "constants/constants";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;

export const getMailTemplates = {
  request: data => ({
    type: actionTypes.GET_MAIL_TEMPLATES_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.GET_MAIL_TEMPLATES_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.GET_MAIL_TEMPLATES_FAILURE,
    payload: { error }
  })
};

export const getMailTemplateCategories = {
  request: data => ({
    type: actionTypes.GET_MAIL_TEMPLATE_CATEGORIES_REQUEST
  }),
  success: data => ({
    type: actionTypes.GET_MAIL_TEMPLATE_CATEGORIES_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.GET_MAIL_TEMPLATE_CATEGORIES_FAILURE,
    payload: { error }
  })
};

export const updateMailTemplate = {
  request: data => ({
    type: actionTypes.PUT_MAIL_TEMPLATE_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.PUT_MAIL_TEMPLATE_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.PUT_MAIL_TEMPLATE_FAILURE,
    payload: { error }
  })
};

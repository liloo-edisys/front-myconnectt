import * as actionTypes from "constants/constants";
import axios from "axios";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;

export const getBackOfficeDashboardDatas = {
  request: datas => ({
    type: actionTypes.GET_BACKOFFICE_DASHBOARD_REQUEST,
    payload: datas
  }),
  success: dashboard => ({
    type: actionTypes.GET_BACKOFFICE_DASHBOARD_SUCCESS,
    payload: { dashboard }
  }),
  failure: error => ({
    type: actionTypes.GET_BACKOFFICE_DASHBOARD_FAILURE,
    payload: { error }
  })
};

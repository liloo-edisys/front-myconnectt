import * as actionTypes from "constants/constants";

export const getDashboardDatas = {
  request: datas => ({
    type: actionTypes.GET_DASHBOARD_INTERIMAIRE_REQUEST,
    payload: datas
  }),
  success: dashboard => ({
    type: actionTypes.GET_DASHBOARD_INTERIMAIRE_SUCCESS,
    payload: { dashboard }
  }),
  failure: error => ({
    type: actionTypes.GET_DASHBOARD_INTERIMAIRE_FAILURE,
    payload: { error }
  })
};

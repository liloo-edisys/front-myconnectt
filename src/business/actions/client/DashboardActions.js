import * as actionTypes from "constants/constants";
import { USER_START_GUIDE_URL } from "../../api/shared/authApi";
import axios from "axios";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;

let staticStep = 9;
let createdFirstStep = false;

export const getDashboardDatas = {
  request: datas => ({
    type: actionTypes.GET_DASHBOARD_REQUEST,
    payload: datas
  }),
  success: dashboard => ({
    type: actionTypes.GET_DASHBOARD_SUCCESS,
    payload: { dashboard }
  }),
  failure: error => ({
    type: actionTypes.GET_DASHBOARD_FAILURE,
    payload: { error }
  })
};

export const goToNextStep = (client, step, dispatch, force) => {
  if (step === staticStep || force) {
    const newStep = step + 1;
    staticStep = newStep;
    const { userID } = client;
    const body = {
      tenantid: TENANTID,
      userID: userID,
      startGuideType: newStep,
      validated: true
    };
    axios
      .post(USER_START_GUIDE_URL, body)
      .then(res => {
        dispatch({
          type: actionTypes.GET_USER_START_GUIDE,
          payload: newStep
        });
      })
      .catch(err => err);
  }
};

export const getUserStartGuide = (client, dispatch) => {
  let { userID } = client;

  axios.get(`${USER_START_GUIDE_URL}/${userID}`).then(res => {
    if (res.data.length != 0) {
      const userGuideStep = Math.max.apply(
        Math,
        res.data.map(function(o) {
          return o.startGuideType;
        })
      );
      staticStep = userGuideStep;
      dispatch({
        type: actionTypes.GET_USER_START_GUIDE,
        payload: userGuideStep
      });
    } else if (!createdFirstStep) {
      createdFirstStep = true;
      dispatch({
        type: actionTypes.GET_USER_START_GUIDE,
        payload: 9
      });
    }
  });
};

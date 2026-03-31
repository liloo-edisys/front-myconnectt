import * as actionTypes from "constants/constants";

export const sendEmail = {
  request: data => ({
    type: actionTypes.SEND_EMAIL_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.SEND_EMAIL_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.SEND_EMAIL_FAILURE,
    payload: { error }
  })
};

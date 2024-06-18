import * as actionTypes from "constants/constants";
import { INTERIMAIRE_CONTRACT_LIST_URL } from "../../api/interimaire/InterimairesApi";
import axios from "axios";

export const getRecruiter = {
  request: authToken => ({
    type: actionTypes.GET_RECRUITER_REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.GET_RECRUITER_SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.GET_RECRUITER_FAILURE,
    payload: { error }
  })
};

export const getBackOfficeContractList = (body, dispatch) => {
  dispatch({
    type: actionTypes.GET_BACKOFFICE_CONTRACT_LIST_REQUEST
  });
  axios
    .post(INTERIMAIRE_CONTRACT_LIST_URL, body)
    .then(res => {
      dispatch({
        type: actionTypes.GET_BACKOFFICE_CONTRACT_LIST_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: actionTypes.GET_BACKOFFICE_CONTRACT_LIST_FAILED
      });
    });
};

import * as actionTypes from "constants/constants";
import {
  GET_INTERIMAIRES_LIST_REQUEST,
  GET_INTERIMAIRES_LIST_SUCCESS,
  GET_INTERIMAIRES_LIST_FAILLED,
  SET_LATEST_CLIENT_EDITED,
  CLEAR_LATEST_CLIENT_EDITED
} from "../../types/backOfficeTypes";
import {
  INTERIMAIRES_LIST_URL,
  ACCOUNT_URL
} from "../../api/backoffice/accountsApi";
import axios from "axios";
import { toastr } from "react-redux-toastr";
export const TENANTID = +process.env.REACT_APP_TENANT_ID;

export const getAccounts = {
  request: authToken => ({
    type: actionTypes.GET_ACCOUNTS_REQUEST,
    payload: { authToken }
  }),
  success: accounts => ({
    type: actionTypes.GET_ACCOUNTS_SUCCESS,
    payload: { accounts }
  }),
  failure: error => ({
    type: actionTypes.GET_ACCOUNTS_FAILURE,
    payload: { error }
  })
};

export const getInterimairesList = (body, dispatch) => {
  dispatch({
    type: GET_INTERIMAIRES_LIST_REQUEST
  });
  axios
    .post(INTERIMAIRES_LIST_URL, body)
    .then(res => {
      dispatch({
        type: GET_INTERIMAIRES_LIST_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      console.log(err);
      dispatch({
        type: GET_INTERIMAIRES_LIST_FAILLED
      });
    });
};

export const companyExist = (company, setSelectedCompany) => {
  axios
    .post(ACCOUNT_URL + "/SearchAccounts", {
      tenantID: TENANTID,
      siret: company.siret
    })
    .then(res => {
      if (res.data.totalcount === 0) setSelectedCompany(company);
      else toastr.error("Erreur", "L'entreprise sélectionnée existe déjà.");
    });
};



export const setLatestClientEdited = (mission, dispatch) => {
  dispatch({
    type: SET_LATEST_CLIENT_EDITED,
    payload: mission
  });
};

export const clearLatestClientEdited = dispatch => {
  dispatch({
    type: CLEAR_LATEST_CLIENT_EDITED
  });
};

export const sendToAnael = {
  request: id => ({
    type: actionTypes.SEND_TO_ANAEL_REQUEST,
    payload: { data: id }
  }),
  success: response => ({
    type: actionTypes.SEND_TO_ANAEL_SUCCESS
  }),
  failure: error => ({
    type: actionTypes.SEND_TO_ANAEL_FAILURE,
    payload: { error }
  })
};

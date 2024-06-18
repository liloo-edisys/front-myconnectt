import * as actionTypes from "constants/constants";
import { HubConnectionBuilder } from "@microsoft/signalr";
import {
  UPDATE_NEW_ACCOUNTS,
  UPDATE_NEW_APPLICANTS,
  UPDATE_NUMBER_MONTHLY_CONTRACTS,
  UPDATE_PROFILES_RATE,
  UPDATE_NUMBER_CONTRACTS,
  UPDATE_NUMBER_SIGNED_CONTRACTS,
  UPDATE_NUMBER_DELETED_APPLICANTS,
  UPDATE_RATE_DELETED_APPLICANTS,
  UPDATE_NUMBER_DELETED_ACCOUNTS,
  UPDATE_RATE_DELETED_ACCOUNTS,
  UPDATE_RATE_LOGIN_APPLICANTS,
  UPDATE_RATE_LOGIN_ACCOUNTS,
  UPDATE_NBR_MISSIONS,
  UPDATE_NBR_EXTENSIONS,
  UPDATE_NBR_RH,
  UPDATE_NBR_APPLICANTS,
  UPDATE_NBR_APPLICANTS_TO_CONTROL,
  UPDATE_NBR_ACCOUNTS,
  UPDATE_NBR_REFUS_ACCOUNTS,
  UPDATE_NBR_REFUS_APPLICANTS,
  UPDATE_NBR_COMMERCIAL_AGREEMENTS,
  UPDATE_NBR_MSG_APPLICANTS,
  UPDATE_NBR_MSG_ACCOUNTS
} from "../../types/backOfficeTypes";

export const getUser = {
  request: authToken => ({
    type: actionTypes.GET_USER_REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.GET_USER_SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.GET_USER_FAILURE,
    payload: { error }
  })
};

export const getUserByToken = {
  request: data => ({
    type: actionTypes.GET_USER_BY_TOKEN_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.GET_USER_BY_TOKEN_SUCCESS,
    payload: data
  }),
  failure: error => ({
    type: actionTypes.GET_USER_BY_TOKEN_FAILURE,
    payload: { error }
  })
};

export const setSignalRBackoffice = (authToken, dispatch) => {
  const connection = new HubConnectionBuilder()
    .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/backoffice", {
      accessTokenFactory: () => authToken
    })
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(result => {
      connection.on("UpdateNbrMissions", value => {
        dispatch({
          type: UPDATE_NBR_MISSIONS,
          payload: value
        });
      });
      connection.on("UpdateNbrExtensions", value => {
        dispatch({
          type: UPDATE_NBR_EXTENSIONS,
          payload: value
        });
      });
      connection.on("UpdateNbrRH", value => {
        dispatch({
          type: UPDATE_NBR_RH,
          payload: value
        });
      });
      connection.on("UpdateNbrApplicants", value => {
        dispatch({
          type: UPDATE_NBR_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateNbrApplicantsToControl", value => {
        dispatch({
          type: UPDATE_NBR_APPLICANTS_TO_CONTROL,
          payload: value
        });
      });
      connection.on("UpdateNbrAccounts", value => {
        dispatch({
          type: UPDATE_NBR_ACCOUNTS,
          payload: value
        });
      });
      connection.on("UpdateNbrRefusAccounts", value => {
        dispatch({
          type: UPDATE_NBR_REFUS_ACCOUNTS,
          payload: value
        });
      });
      connection.on("UpdateNbrRefusApplicants", value => {
        dispatch({
          type: UPDATE_NBR_REFUS_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateNbrCommercialAgreements", value => {
        dispatch({
          type: UPDATE_NBR_COMMERCIAL_AGREEMENTS,
          payload: value
        });
      });
      connection.on("UpdateNbrMsgApplicants", value => {
        dispatch({
          type: UPDATE_NBR_MSG_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateNbrMsgAccounts", value => {
        dispatch({
          type: UPDATE_NBR_MSG_ACCOUNTS,
          payload: value
        });
      });

      connection.on("UpdateNewAccounts", value => {
        dispatch({
          type: UPDATE_NEW_ACCOUNTS,
          payload: value
        });
      });
      connection.on("UpdateNewApplicants", value => {
        dispatch({
          type: UPDATE_NEW_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateNbrMonthlyContracts", value => {
        dispatch({
          type: UPDATE_NUMBER_MONTHLY_CONTRACTS,
          payload: value
        });
      });
      connection.on("UpdateProfilesRate", value => {
        dispatch({
          type: UPDATE_PROFILES_RATE,
          payload: value
        });
      });
      connection.on("UpdateNbrContracts", value => {
        dispatch({
          type: UPDATE_NUMBER_CONTRACTS,
          payload: value
        });
      });
      connection.on("UpdateNbrSignedContracts", value => {
        dispatch({
          type: UPDATE_NUMBER_SIGNED_CONTRACTS,
          payload: value
        });
      });
      connection.on("UpdateNbrDeletedApplicants", value => {
        dispatch({
          type: UPDATE_NUMBER_DELETED_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateRateDeletedApplicants", value => {
        dispatch({
          type: UPDATE_RATE_DELETED_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateNbrDeletedAccounts", value => {
        dispatch({
          type: UPDATE_NUMBER_DELETED_ACCOUNTS,
          payload: value
        });
      });
      connection.on("UpdateRateDeletedAccounts", value => {
        dispatch({
          type: UPDATE_RATE_DELETED_ACCOUNTS,
          payload: value
        });
      });
      connection.on("UpdateRateLoginApplicants", value => {
        dispatch({
          type: UPDATE_RATE_LOGIN_APPLICANTS,
          payload: value
        });
      });
      connection.on("UpdateRateLoginAccounts", value => {
        dispatch({
          type: UPDATE_RATE_LOGIN_ACCOUNTS,
          payload: value
        });
      });
    })
    .catch(e => console.log("Connection failed: ", e));
};

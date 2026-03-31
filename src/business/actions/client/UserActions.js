import * as actionTypes from "constants/constants";
import { HubConnectionBuilder } from "@microsoft/signalr";

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

export const setSignalRClient = (authToken, dispatch, setSelectedNotif) => {
  const connection = new HubConnectionBuilder()
    .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/client", {
      accessTokenFactory: () => authToken
    })
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(result => {
      connection.on("SendNotification", notif => {
        dispatch({
          type: actionTypes.PUSH_NEW_NOTIF,
          payload: notif
        });
        setSelectedNotif(notif);
      });
    })
    .catch(err => {
      console.log("SignalR Connection Error: ", err);
    });
};

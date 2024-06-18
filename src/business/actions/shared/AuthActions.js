import * as actionTypes from "constants/constants";

export const login = {
  request: datas => ({
    type: actionTypes.CLIENT_LOGIN_REQUEST,
    payload: { datas }
  }),
  success: authToken => ({
    type: actionTypes.CLIENT_LOGIN_SUCCESS,
    payload: { authToken }
  }),
  failure: error => ({
    type: actionTypes.CLIENT_LOGIN_FAILURE,
    payload: { error }
  })
};

export const registerAccount = {
  request: authToken => ({
    type: actionTypes.CLIENT_REGISTER_REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.CLIENT_REGISTER_SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.CLIENT_REGISTER_FAILURE,
    payload: { error }
  })
};

export const registerInterimaire = {
  request: authToken => ({
    type: actionTypes.INTERIMAIRE_REGISTER_REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.INTERIMAIRE_REGISTER_SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.INTERIMAIRE_REGISTER_FAILURE,
    payload: { error }
  })
};

export const logout = {
  request: authToken => ({
    type: actionTypes.CLIENT_LOGOUT_REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.CLIENT_LOGOUT_SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.CLIENT_LOGOUT_FAILURE,
    payload: { error }
  })
};

export const requestUser = {
  request: authToken => ({
    type: actionTypes.CLIENT_USER__REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.CLIENT_USER__SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.CLIENT_USER__FAILURE,
    payload: { error }
  })
};

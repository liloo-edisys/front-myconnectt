import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS } from "../../types/authTypes";
import {
  SEND_OTP_REQUEST,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  AUTHENTICATE_OTP_REQUEST,
  AUTHENTICATE_OTP_SUCCESS,
  AUTHENTICATE_OTP_FAILURE,
  REVOKE_TOKEN_SUCCESS
} from "../../actions/shared/OTPAuthActions";

const initialAuthState = {
  user: undefined,
  authToken: undefined,
  loading: false,
  otpEmail: null,
  otpSent: false,
  error: null
};

export const clientAuthReducer = persistReducer(
  { storage, key: "myconnectt-auth", whitelist: [] }, // Ne rien persister - déconnexion au refresh
  (state = initialAuthState, action) => {
    switch (action.type) {
      case INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS: {
        return {
          ...state,
          user: action.payload,
          authToken: action.payload.accessToken
        };
      }
      case actionTypes.CLIENT_LOGIN_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.CLIENT_LOGIN_SUCCESS: {
        const { authToken } = action.payload;
        return {
          authToken: authToken.data.accessToken,
          user: authToken.data,
          loading: false
        };
      }
      case actionTypes.CLIENT_LOGIN_FAILURE: {
        return { ...state, loading: false };
      }
      case actionTypes.CLIENT_REGISTER_SUCCESS: {
        const { authToken } = action.payload;

        return { authToken: authToken.accessToken, user: authToken };
      }

      case actionTypes.INTERIMAIRE_REGISTER_SUCCESS: {
        const { authToken } = action.payload;

        return { authToken: authToken.accessToken, user: authToken };
      }

      case actionTypes.CLIENT_LOGOUT_REQUEST: {
        return initialAuthState;
      }
      case actionTypes.DELETE_MY_CONTACT_SUCCESS: {
        return initialAuthState;
      }
      case actionTypes.CLIENT_USER__SUCCESS: {
        const { user } = action.payload;
        return { ...state, user };
      }
      case actionTypes.SWITCH_COMPANY_SUCCESS: {
        const { data } = action.payload;
        return { ...state, authToken: data.data.accessToken, user: data.data };
      }

      // OTP Authentication
      case SEND_OTP_REQUEST: {
        return {
          ...state,
          loading: true,
          otpSent: false,
          otpEmail: action.payload.email,
          error: null
        };
      }
      case SEND_OTP_SUCCESS: {
        return {
          ...state,
          loading: false,
          otpSent: true,
          error: null
        };
      }
      case SEND_OTP_FAILURE: {
        return {
          ...state,
          loading: false,
          otpSent: false,
          error: action.payload
        };
      }
      case AUTHENTICATE_OTP_REQUEST: {
        return { ...state, loading: true, error: null };
      }
      case AUTHENTICATE_OTP_SUCCESS: {
        const userData = action.payload;
        return {
          ...state,
          authToken: userData.accessToken,
          user: userData,
          loading: false,
          otpSent: false,
          otpEmail: null,
          error: null
        };
      }
      case AUTHENTICATE_OTP_FAILURE: {
        return { ...state, loading: false, error: action.payload };
      }
      case REVOKE_TOKEN_SUCCESS: {
        return initialAuthState;
      }

      default:
        return state;
    }
  }
);

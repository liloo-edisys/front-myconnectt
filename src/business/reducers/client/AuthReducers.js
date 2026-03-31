import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS } from "../../types/authTypes";

const initialAuthState = {
  user: undefined,
  authToken: undefined,
  loading: false
};

export const clientAuthReducer = persistReducer(
  { storage, key: "myconnectt-auth", whitelist: ["user", "authToken"] },
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

      default:
        return state;
    }
  }
);

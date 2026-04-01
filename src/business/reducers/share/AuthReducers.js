import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS } from "../../types/authTypes";
import { REVOKE_TOKEN_SUCCESS } from "../../actions/shared/OTPAuthActions";

const initialAuthState = {
  user: undefined,
  loading: false
};

export const clientAuthReducer = persistReducer(
  { storage, key: "myconnectt-auth", whitelist: ["user"] },
  (state = initialAuthState, action) => {
    switch (action.type) {
      case INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS: {
        return {
          ...state,
          user: action.payload
        };
      }
      case actionTypes.CLIENT_LOGIN_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.CLIENT_LOGIN_SUCCESS: {
        const { authToken } = action.payload;
        return {
          user: authToken.data,
          loading: false
        };
      }
      case actionTypes.CLIENT_LOGIN_FAILURE: {
        return { ...state, loading: false };
      }
      case actionTypes.CLIENT_REGISTER_SUCCESS: {
        const { authToken } = action.payload;

        return { user: authToken };
      }

      case actionTypes.INTERIMAIRE_REGISTER_SUCCESS: {
        const { authToken } = action.payload;

        return { user: authToken };
      }

      case actionTypes.CLIENT_LOGOUT_REQUEST: {
        return initialAuthState;
      }
      case actionTypes.DELETE_MY_CONTACT_SUCCESS: {
        return initialAuthState;
      }
      case actionTypes.CLIENT_USER__SUCCESS: {
        console.log("[AuthReducer] CLIENT_USER__SUCCESS received, action:", action);
        console.log("[AuthReducer] action.payload:", action.payload);
        console.log("[AuthReducer] action.payload.user:", action.payload.user);
        const { user } = action.payload;
        console.log("[AuthReducer] Extracted user:", user);
        const newState = { ...state, user };
        console.log("[AuthReducer] New state being returned:", newState);
        console.log("[AuthReducer] New state.user:", newState.user);
        return newState;
      }
      case actionTypes.SWITCH_COMPANY_SUCCESS: {
        const { data } = action.payload;
        return { ...state, user: data.data };
      }
      
      // Handle REVOKE_TOKEN_SUCCESS from OTP auth (token expiry, logout)
      // This ensures auth state is cleared when cookies are invalidated
      case REVOKE_TOKEN_SUCCESS: {
        return initialAuthState;
      }

      default:
        return state;
    }
  }
);

import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  user: {},
  loading: false
};

export const clientUserReducer = persistReducer(
  { storage, key: "myconnectt-user", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_USER_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_USER_SUCCESS: {
        const {
          user: { data: user }
        } = action.payload;
        return { user: user, loading: false };
      }
      case actionTypes.GET_USER_BY_TOKEN_REQUEST: {
        return { user: {}, loading: true };
      }
      case actionTypes.GET_USER_BY_TOKEN_SUCCESS: {
        const { data } = action.payload;
        return { ...state, user: data, loading: false };
      }
      default:
        return state;
    }
  }
);

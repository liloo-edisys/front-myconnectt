import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  user: [],
  loading: false
};

export const recruiterReducer = persistReducer(
  { storage, key: "myconnectt-recruiter", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_RECRUITER_SUCCESS: {
        const {
          user: { data: user }
        } = action.payload;
        return { ...state, user: user, loading: false };
      }
      case actionTypes.GET_BACKOFFICE_CONTRACT_LIST_SUCCESS: {
        return {
          ...state,
          contractList: action.payload
        };
      }
      default:
        return state;
    }
  }
);

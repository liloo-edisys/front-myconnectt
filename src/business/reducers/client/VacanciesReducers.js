import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  vacancies: [],
  loading: false
};

export const clientVacanciesReducer = persistReducer(
  { storage, key: "myconnectt-vacancies", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_USER_VACANCIES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_USER_VACANCIES_SUCCESS: {
        const { data } = action.payload;

        return {
          ...state,
          vacancies: data,
          loading: false
        };
      }
      default:
        return state;
    }
  }
);

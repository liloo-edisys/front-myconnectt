import moment from "moment";
import * as actionTypes from "constants/constants";
import {
  SET_FILTER_COMPANY,
  SET_FILTER_STATUS,
  SET_FILTER_START_DATE,
  SET_FILTER_END_DATE,
  SET_FILTER_PAGE_SIZE,
  SET_FILTER_PAGE_NUMBER
} from "../../types/backOfficeTypes.js";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  extensions: [],
  extension: null,
  mission: null,

  selectedStartDate: new Date(moment().subtract(1, "months")),
  selectedEndDate: null,
  selectedAccount: null,
  defaultStatus: [],
  pageSize: 5,
  pageNumber: 1
};

export const missionsBackOfficeReducer = persistReducer(
  { storage, key: "myconnectt-missions", whitelist: ["user", "authToken"] },
  (state = initialState, action) => {
    switch (action.type) {
      case actionTypes.GET_EXTENSIONS_SUCCESS: {
        return {
          ...state,
          extensionList: action.payload
        };
      }
      case SET_FILTER_COMPANY: {
        return {
          ...state,
          selectedAccount: action.payload
        };
      }
      case SET_FILTER_STATUS: {
        return {
          ...state,
          defaultStatus: action.payload
        };
      }
      case SET_FILTER_START_DATE: {
        return {
          ...state,
          selectedStartDate: action.payload
        };
      }
      case SET_FILTER_END_DATE: {
        return {
          ...state,
          selectedEndDate: action.payload
        };
      }
      case SET_FILTER_PAGE_SIZE: {
        return {
          ...state,
          pageSize: action.payload
        };
      }
      case SET_FILTER_PAGE_NUMBER: {
        return {
          ...state,
          pageNumber: action.payload
        };
      }
      default:
        return state;
    }
  }
);

import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialApplicantState = {
  matches: null,
  loading: false,
  matchingCandidates: [],
  resume: null,
  currentCandidate: null,
  refreshMissionsList: false
};

export const clientApplicantsReducer = persistReducer(
  { storage, key: "myconnectt-applicants", whitelist: ["user", "authToken"] },
  (state = initialApplicantState, action) => {
    switch (action.type) {
      case actionTypes.COUNT_MATCHING_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.COUNT_MATCHING_SUCCESS: {
        const { data } = action.payload;
        return { matches: data, loading: false };
      }
      case actionTypes.RESET_MATCHING_REQUEST: {
        return { matches: null, loading: false };
      }
      case actionTypes.GET_MATCHING_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_MATCHING_SUCCESS: {
        const { data } = action.payload;
        return { matchingCandidates: data, loading: false };
      }
      case actionTypes.GET_APPLICANT_ID_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_APPLICANT_ID_SUCCESS: {
        const { data } = action.payload;
        return { currentCandidate: data, loading: false };
      }
      case actionTypes.GET_FORMATTED_CV_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_FORMATTED_CV_SUCCESS: {
        const { data } = action.payload;
        return { ...state, resume: data, loading: false };
      }
      case actionTypes.CLEAR_FORMATTED_CV_REQUEST: {
        return { ...state, resume: null, loading: false };
      }
      case actionTypes.APPROVE_BY_APPLICANT_SUCCESS: {
        return {
          ...state,
          refreshMissionsList: !state.refreshMissionsList
        };
      }
      case actionTypes.DECLINE_MATCHING_SUCCESS: {
        return {
          ...state,
          refreshMissionsList: !state.refreshMissionsList
        };
      }
      case actionTypes.DELETE_APPLICATION_SUCCESS: {
        return {
          ...state,
          refreshMissionsList: !state.refreshMissionsList
        };
      }
      case actionTypes.DECLINE_BY_APPLICANT_SUCCESS: {
        return {
          ...state,
          refreshMissionsList: !state.refreshMissionsList
        };
      }
      case actionTypes.DECLINE_BY_CUSTOMER_SUCCESS: {
        return {
          ...state,
          refreshMissionsList: !state.refreshMissionsList
        };
      }
      default:
        return state;
    }
  }
);

import * as actionTypes from "constants/constants";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  GET_HABILITATION_SUCCESS,
  GET_HABILITATION_FAILLED,
  GET_RECIEPTS_SUCCESS,
  GET_RECIEPTS_REQUEST,
  GET_RECIEPTS_FAILLED
} from "../../types/clientTypes";

const initialMissionsState = {
  missions: [],
  templates: [],
  missionSalaries: [],
  lastCreatedMission: null,
  currentTemplate: null,
  mission: [],
  template: [],
  storedMission: [],
  saveMissionSuccess: false,
  updateMissionSuccess: false,
  currentDuplicate: null,
  loading: false,
  loadingSearchMission: false,
  habilitations: [],
  recieptList: [],
  recieptListLoading: false
};

export const clientMissionReducer = persistReducer(
  { storage, key: "myconnectt-missions", whitelist: ["user", "authToken"] },
  (state = initialMissionsState, action) => {
    switch (action.type) {
      case actionTypes.CREATE_VACANCY_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.CREATE_VACANCY_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          lastCreatedMission: data.data,
          mission: data.data,
          loading: false,
          saveMissionSuccess: true,
          updateMissionSuccess: false
        };
      }
      case actionTypes.UPDATE_VACANCY_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.SET_CURRENT_TEMPLATE_REQUEST: {
        const { data } = action.payload;
        return { ...state, currentTemplate: data };
      }
      case actionTypes.SET_CURRENT_DUPLICATE_REQUEST: {
        const { data } = action.payload;
        return { ...state, currentDuplicate: data };
      }

      case actionTypes.DELETE_CURRENT_TEMPLATE_REQUEST: {
        return { ...state, currentTemplate: null };
      }
      case actionTypes.DELETE_CURRENT_DUPLICATE_REQUEST: {
        return { ...state, currentDuplicate: null };
      }
      case actionTypes.UPDATE_VACANCY_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          lastCreatedMission: data.data,
          loading: false,
          saveMissionSuccess: true,
          updateMissionSuccess: false
        };
      }
      case actionTypes.VALIDATE_VACANCY_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.VALIDATE_VACANCY_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          lastCreatedMission: data.data,
          loading: false,
          saveMissionSuccess: false,
          updateMissionSuccess: true
        };
      }
      case actionTypes.GET_ACCOUNT_TEMPLATE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_ACCOUNT_TEMPLATE_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          templates: data.data,
          loading: false
        };
      }
      case actionTypes.GET_VACANCY_REQUEST: {
        return { ...state, loadingMission: true };
      }
      case actionTypes.GET_VACANCY_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          mission: data.data,
          lastCreatedMission: data.data,
          loadingMission: false
        };
      }
      case actionTypes.GET_VACANCY_FAILURE: {
        return {
          ...state,
          loadingMission: false
        };
      }
      case actionTypes.SEARCH_MISSION_REQUEST: {
        return { ...state, loadingSearchMission: true };
      }
      case actionTypes.SEARCH_MISSION_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          missions: data.data,
          loadingSearchMission: false
        };
      }
      case actionTypes.SEARCH_MISSION_FAILURE: {
        return { ...state, loadingSearchMission: false };
      }
      case actionTypes.SEARCH_MISSION_TEMPLATE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.SEARCH_MISSION_TEMPLATE_SUCCESS: {
        const { data } = action.payload;

        return {
          ...state,
          templates: data.data,
          loading: false
        };
      }
      case actionTypes.GET_STORED_REQUEST: {
        const { data } = action.payload;
        return { ...state, storedMission: data };
      }
      case actionTypes.GET_TEMPLATE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_TEMPLATE_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          mission: data.data,
          loading: false
        };
      }
      case actionTypes.GET_VACANCY_DELETE: {
        return { ...state, mission: [] };
      }
      case actionTypes.GET_USER_TEMPLATE_REQUEST: {
        return { ...state };
      }
      case actionTypes.RESET_MISSION_INDICATOR_REQUEST: {
        return {
          ...state,
          saveMissionSuccess: false,
          updateMissionSuccess: false
        };
      }
      case actionTypes.RESET_MISSION_REQUEST: {
        return initialMissionsState;
      }
      case actionTypes.GET_USER_TEMPLATE_SUCCESS: {
        const { data } = action.payload.vacancy;
        return {
          ...state,
          templates: data,
          loading: false
        };
      }
      case actionTypes.GET_ACCOUNT_VACANCY_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_ACCOUNT_VACANCY_SUCCESS: {
        const { data } = action.payload.vacancy;
        return {
          ...state,
          missions: data,
          saveMissionSuccess: false,
          updateMissionSuccess: false,
          loading: false
        };
      }
      case actionTypes.GET_USER_VACANCY_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_USER_VACANCY_SUCCESS: {
        const { data } = action.payload.vacancy;
        return {
          ...state,
          missions: data,
          saveMissionSuccess: false,
          updateMissionSuccess: false,
          loading: false
        };
      }

      case actionTypes.GET_MISSION_SALARIES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_MISSION_SALARIES_SUCCESS: {
        const { data } = action.payload.vacancy;
        return {
          ...state,
          missionSalaries: data,
          loading: false
        };
      }
      case actionTypes.DELETE_MISSION_TEMPLATE_SUCCESS: {
        const { id } = action.payload;
        const templates = state.templates; //making a new array
        templates.list = templates.list.filter(element => element.id !== id);
        return {
          ...state,
          templates,
          loading: false
        };
      }
      case actionTypes.DELETE_MISSION_SUCCESS: {
        const { id } = action.payload;
        const missions = state.missions; //making a new array
        missions.list = missions.list.filter(element => element.id !== id);
        return {
          ...state,
          missions,
          loading: false
        };
      }
      case actionTypes.UPDATE_VACANCY_TEMPLATE_SUCCESS: {
        const { data } = action.payload;
        const newArray = state.templates; //making a new array
        const index = state.templates.list.findIndex(el => el.id === data.id);
        newArray.list[index] = data;
        return {
          ...state,
          templates: newArray,
          loading: false
        };
      }
      case GET_HABILITATION_SUCCESS: {
        return {
          ...state,
          habilitations: action.payload
        };
      }
      case actionTypes.REMOVE_FAVORITE_SUCCESS: {
        return {
          ...state,
          mission: {
            ...state.mission,
            isFavorite: false
          }
        };
      }
      case actionTypes.ADD_FAVORITE_SUCCESS: {
        return {
          ...state,
          mission: {
            ...state.mission,
            isFavorite: true
          }
        };
      }
      case GET_RECIEPTS_REQUEST:
        return {
          ...state,
          recieptListLoading: true
        };
      case GET_RECIEPTS_SUCCESS:
        return {
          ...state,
          recieptList: action.payload,
          recieptListLoading: false
        };
      case GET_RECIEPTS_FAILLED:
        return {
          ...state,
          recieptListLoading: false
        };
      default:
        return state;
    }
  }
);

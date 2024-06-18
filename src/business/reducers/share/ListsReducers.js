import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialListsState = {
  titleTypes: [],
  invoiceTypes: [],
  accountGroups: [],
  paymentChoices: [],
  jobTitles: [],
  trJobTitles: [],
  missionExperiences: [],
  missionsReasons: [],
  driverLicenses: [],
  missionRemuneration: [],
  educationLevels: [],
  languages: [],
  jobSkills: [],
  jobTags: [],
  missionEquipment: [],
  loading: false,
  apeNumber: [],
  contractType: [],
  notifs: [],
  accounts: [],
  extensions: {
    list: []
  },
  unread: 0
};

export const listsReducer = persistReducer(
  { storage, key: "myconnectt-lists", whitelist: ["user", "authToken"] },
  (state = initialListsState, action) => {
    switch (action.type) {
      case actionTypes.GET_TITLESTYPES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_TITLESTYPES_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, titleTypes: data, loading: false };
      }
      case actionTypes.GET_INVOICESTYPES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_INVOICESTYPES_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, invoiceTypes: data, loading: false };
      }
      case actionTypes.GET_ACCOUNTGROUPS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_ACCOUNTGROUPS_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, accountGroups: data, loading: false };
      }
      case actionTypes.GET_PAYMENTCHOICES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_PAYMENTCHOICES_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, paymentChoices: data, loading: false };
      }
      case actionTypes.GET_JOBTITLE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_JOBTITLE_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, jobTitles: data, loading: false };
      }
      case actionTypes.GET_TR_JOBTITLE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_TR_JOBTITLE_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, trJobTitles: data, loading: false };
      }
      case actionTypes.GET_MISSION_EXPERIENCES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_MISSION_EXPERIENCES_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, missionExperiences: data, loading: false };
      }
      case actionTypes.GET_MISSION_REASONS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_MISSION_REASONS_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, missionsReasons: data, loading: false };
      }
      case actionTypes.GET_DRIVER_LICENSE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_DRIVER_LICENSE_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, driverLicenses: data, loading: false };
      }
      case actionTypes.GET_MISSION_REMUNERATION_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_MISSION_REMUNERATION_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, missionRemuneration: data, loading: false };
      }
      case actionTypes.GET_EDUCATION_LEVEL_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_EDUCATION_LEVEL_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, educationLevels: data, loading: false };
      }
      case actionTypes.GET_LANGUAGES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_LANGUAGES_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, languages: data, loading: false };
      }
      case actionTypes.GET_CONTRACT_TYPE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_CONTRACT_TYPE_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, contractType: data, loading: false };
      }
      case actionTypes.GET_JOB_SKILLS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_JOB_SKILLS_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, jobSkills: data, loading: false };
      }
      case actionTypes.GET_JOB_TAGS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_JOB_TAGS_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, jobTags: data, loading: false };
      }
      case actionTypes.GET_APE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_APE_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, apeNumber: data, loading: false };
      }
      case actionTypes.GET_EQUIPMENT_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_EQUIPMENT_SUCCESS: {
        const {
          list: { data }
        } = action.payload;
        return { ...state, missionEquipment: data, loading: false };
      }
      case actionTypes.CREATE_JOB_TAGS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.CREATE_JOB_TAGS_SUCCESS: {
        const { data } = action.payload;
        let jobTags = [...state.jobTags];
        jobTags.push(data);
        return { ...state, jobTags, loading: false };
      }
      case actionTypes.CREATE_JOB_SKILLS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.CREATE_JOB_SKILLS_SUCCESS: {
        const { data } = action.payload;
        let jobSkills = [...state.jobSkills];
        jobSkills.push(data);
        return { ...state, jobSkills, loading: false };
      }
      case actionTypes.GET_NOTIFICATIONS: {
        return {
          ...state,
          notifs: action.payload.notifs,
          unread: action.payload.unread
        };
      }
      case actionTypes.SET_NOTIF_READ: {
        let unread = 0;
        state.notifs = state.notifs.map(notif => {
          if (notif.id == action.payload) notif.readed = true;
          if (!notif.readed) unread++;
          return notif;
        });
        return { ...state, unread: unread };
      }
      case actionTypes.PUSH_NEW_NOTIF: {
        state.notifs.unshift(action.payload);
        return { ...state };
      }
      case actionTypes.GET_ACCOUNTS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_ACCOUNTS_SUCCESS: {
        return {
          ...state,
          accounts: action.payload.accounts.data,
          loading: false
        };
      }
      case actionTypes.GET_EXTENSIONS_SUCCESS: {
        return {
          ...state,
          extensions: action.payload
        };
      }
      default:
        return state;
    }
  }
);

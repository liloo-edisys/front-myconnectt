import uuid from "react-uuid";
import * as actionTypes from "constants/constants";
import {
  GET_INTERIMAIRES_LIST_REQUEST,
  GET_INTERIMAIRES_LIST_SUCCESS,
  GET_INTERIMAIRES_LIST_FAILLED,
  GET_ACTIVE_INTERIMAIRE_REQUEST,
  GET_ACTIVE_INTERIMAIRE_FAILLED,
  GET_ACTIVE_INTERIMAIRE_SUCCESS,
  CLEAR_SELECTED_APPLICANT,
  UPDATE_SELECTED_APPLICANT,
  ADD_SELECTED_APPLICANT_EXPERIENCE,
  REMOVE_SELECTED_APPLICANT__EXPERIENCE,
  UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS,
  REMOVE_ONE_SELECTED_APPLICANT_DOCUMENT_SUCCESS,
  CLEAR_SELECTED_APPLICANT_STEP_FIVE_MODAL,
  SEARCH_SELECTED_APPLICANT_MISSIONS_REQUEST,
  SEARCH_SELECTED_APPLICANT_MISSIONS_SUCCESS,
  SEARCH_SELECTED_APPLICANT_MISSIONS_FAILLED,
  GET_SELECTED_APPLICANT_EMAILS_REQUEST,
  GET_SELECTED_APPLICANT_EMAILS_SUCCESS,
  GET_SELECTED_APPLICANT_EMAILS_FAILLED,
  SET_LATEST_CLIENT_EDITED,
  CLEAR_LATEST_CLIENT_EDITED
} from "../../types/backOfficeTypes";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { isNull } from "lodash";

const initialUserState = {
  loading: false,
  interimairesList: {
    list: [],
    totalcount: 0
  },
  contractList: {
    list: [],
    totalcount: 0
  },
  interimairesLoading: false,
  activeInterimaire: null,
  activeInterimaireLoading: false,
  stepFiveModal: null,
  selectedApplicantMissions: [],
  selectedApplicantMissionLoading: false,
  selectedApplicantEmails: [],
  selectedApplicantEmailsLoading: false,
  latestClientEdited: null
};

export const accountsReducer = persistReducer(
  { storage, key: "myconnectt-accounts", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_ACCOUNTS_SUCCESS: {
        return {
          ...state,
          contractList: action.payload
        };
      }
      case GET_INTERIMAIRES_LIST_REQUEST: {
        return {
          ...state,
          interimairesLoading: true
        };
      }
      case GET_INTERIMAIRES_LIST_SUCCESS: {
        return {
          ...state,
          interimairesList: action.payload,
          interimairesLoading: false
        };
      }
      case GET_INTERIMAIRES_LIST_FAILLED: {
        return {
          ...state,
          interimairesLoading: false
        };
      }
      case GET_ACTIVE_INTERIMAIRE_REQUEST: {
        return {
          ...state,
          activeInterimaireLoading: true
        };
      }
      case GET_ACTIVE_INTERIMAIRE_SUCCESS: {
        return {
          ...state,
          activeInterimaire: action.payload,
          activeInterimaireLoading: false
        };
      }
      case GET_ACTIVE_INTERIMAIRE_FAILLED: {
        return {
          ...state,
          activeInterimaireLoading: false
        };
      }
      case UPDATE_SELECTED_APPLICANT: {
        return {
          ...state,
          activeInterimaire: action.payload
        };
      }
      case CLEAR_SELECTED_APPLICANT: {
        return {
          ...state,
          activeInterimaire: null
        };
      }
      case ADD_SELECTED_APPLICANT_EXPERIENCE:
        let newExperience = action.payload;
        let experiencesArray = state.activeInterimaire.applicantExperiences;
        if (newExperience.id) {
          const annonceIndex = experiencesArray.findIndex(
            annonce => annonce.id === newExperience.id
          );
          experiencesArray[annonceIndex] = newExperience;
        } else if (newExperience.id_temp) {
          const annonceIndex = experiencesArray.findIndex(
            annonce => annonce.id_temp === newExperience.id_temp
          );
          experiencesArray[annonceIndex] = newExperience;
        } else {
          newExperience = {
            id_temp: uuid(),
            ...newExperience
          };
          experiencesArray.push(newExperience);
        }
        return {
          ...state,
          activeInterimaire: {
            ...state.activeInterimaire,
            applicantExperiences: experiencesArray
          }
        };

      case REMOVE_SELECTED_APPLICANT__EXPERIENCE:
        let experiencesArrayForRemove =
          state.activeInterimaire.applicantExperiences;
        const experienceId = action.payload;
        const annonceIndexForRemove = experiencesArrayForRemove.findIndex(
          annonce =>
            annonce.id === experienceId || annonce.id_temp === experienceId
        );
        experiencesArrayForRemove.splice(annonceIndexForRemove, 1);

        return {
          ...state,
          activeInterimaire: {
            ...state.activeInterimaire,
            applicantExperiences: experiencesArrayForRemove
          }
        };
      case CLEAR_SELECTED_APPLICANT_STEP_FIVE_MODAL: {
        return {
          ...state,
          stepFiveModal: null
        };
      }
      case UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS:
        return {
          ...state,
          activeInterimaire: action.payload,
          stepFiveModal: null
        };
      case REMOVE_ONE_SELECTED_APPLICANT_DOCUMENT_SUCCESS: {
        return {
          ...state,
          interimaire: action.payload.interimaire,
          loading: false,
          stepFiveModal: action.payload.step
        };
      }
      case CLEAR_SELECTED_APPLICANT_STEP_FIVE_MODAL: {
        return {
          ...state,
          stepFiveModal: null
        };
      }
      case SEARCH_SELECTED_APPLICANT_MISSIONS_REQUEST: {
        return {
          ...state,
          selectedApplicantMissionLoading: true
        };
      }
      case SEARCH_SELECTED_APPLICANT_MISSIONS_SUCCESS: {
        return {
          ...state,
          selectedApplicantMissions: action.payload,
          selectedApplicantMissionLoading: false
        };
      }
      case SEARCH_SELECTED_APPLICANT_MISSIONS_FAILLED: {
        return {
          ...state,
          selectedApplicantMissionLoading: false
        };
      }
      case GET_SELECTED_APPLICANT_EMAILS_REQUEST: {
        return {
          ...state,
          selectedApplicantEmailsLoading: true
        };
      }
      case GET_SELECTED_APPLICANT_EMAILS_SUCCESS: {
        return {
          ...state,
          selectedApplicantEmails: action.payload,
          selectedApplicantEmailsLoading: false
        };
      }
      case GET_SELECTED_APPLICANT_EMAILS_FAILLED: {
        return {
          ...state,
          selectedApplicantEmailsLoading: false
        };
      }
      case SET_LATEST_CLIENT_EDITED: {
        return {
          ...state,
          latestClientEdited: action.payload
        };
      }
      case CLEAR_LATEST_CLIENT_EDITED: {
        return {
          ...state,
          latestClientEdited: null
        };
      }
      default:
        return state;
    }
  }
);

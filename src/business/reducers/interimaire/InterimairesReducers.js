import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import uuid from "react-uuid";
import {
  ADD_EXPERIENCE,
  GET_USER_START_GUIDE,
  GO_TO_NEXT_STEP,
  USER_BY_MOBILE_SUCCESS,
  REMOVE_EXPERIENCE,
  UPDATE_INTERIMAIRE_IDENTITY_REQUEST,
  UPDATE_INTERIMAIRE_IDENTITY_SUCCESS,
  UPDATE_INTERIMAIRE_IDENTITY_FAILLED,
  CLEAR_ANIMATION_DURATION,
  SET_COUNT_MATCHING,
  INCREMENT_COUNT_APPLICATIONS,
  INCREMENT_COUNT_PROPOSITIONS,
  GET_CONTRACT_LIST_REQUEST,
  GET_CONTRACT_LIST_SUCCESS,
  GET_CONTRACT_LIST_FAILLED,
  GET_DOCUMENTS_LIST_REQUEST,
  GET_DOCUMENTS_LIST_SUCCESS,
  GET_DOCUMENTS_LIST_FAILLED,
  REMOVE_ONE_DOCUMENT_SUCCESS,
  CLEAR_STEP_FIVE_MODAL,
  SET_CONTRACTS_COUNT,
  GET_NATIONALITIES_LIST
} from "../../types/interimaireTypes";

import {
  UPDATE_APPLICANT_REQUEST,
  UPDATE_APPLICANT_SUCCESS,
  UPDATE_APPLICANT_FAILURE
} from "../../../constants/constants";

const initialUserState = {
  interimaire: null,
  loading: false,
  parsedInterimaire: null,
  hasCancelledEdit: false,
  step: null,
  updateInterimaireIdentityLoading: false,
  contractList: [],
  documentsList: [],
  animationDuration: 1000,
  stepFiveModal: null,
  nationalitiesList: [],
  updateApplicantLoading: false,
  rightMenu: [
    {
      title: "Mon matching",
      description:
        "Découvrez les offres adaptées à votre profil et vos compétences.",
      gif: "home-matching",
      color: "#6699E5",
      value: 0,
      urlLink: "/matching"
    },
    {
      title: "Mes recherches",
      description:
        "Trouvez les offres qui correspondent à vos préférences de recherche.",
      gif: "home-search",
      color: "#DCAA3E",
      value: 0,
      urlLink: "/search"
    },
    {
      title: "Mes propositions",
      description:
        "Retrouvez les offres qui vous sont directement proposées par les entreprises.",
      gif: "home-invite",
      color: "#72C2BA",
      value: 0,
      urlLink: "/propositions"
    },
    {
      title: "Mes candidatures",
      description: "Consultez toutes les offres auxquelles vous avez postulé.",
      gif: "home-application",
      color: "#CD5F6E",
      value: 0,
      urlLink: "/applications"
    },
    {
      title: "Mes documents",
      description:
        "Contrats, fiches de paie, relevés d'heures, attestations, etc...",
      gif: "home-documents",
      color: "#8157ED",
      value: 0,
      urlLink: "/contracts"
    }
  ]
};

export const InterimairesReducer = persistReducer(
  { storage, key: "myconnectt-interimaires", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case USER_BY_MOBILE_SUCCESS: {
        return { ...state, interimaire: action.payload, loading: false };
      }
      case actionTypes.GET_INTERIMAIRE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_INTERIMAIRE_SUCCESS: {
        const { interimaire } = action.payload;
        let newRightMenu = state.rightMenu;
        newRightMenu[1].value = interimaire.data.nbrSearch;
        newRightMenu[3].value = interimaire.data.applicationsCount;
        newRightMenu[2].value = interimaire.data.propositionsCount;
        return {
          ...state,
          interimaire: interimaire.data,
          rightMenu: newRightMenu,
          loading: false
        };
      }
      case actionTypes.DELETE_INTERIMAIRE_SUCCESS: {
        return {
          ...state,
          loading: false
        };
      }
      case actionTypes.UPDATE_INTERIMAIRE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.UPDATE_INTERIMAIRE_SUCCESS: {
        const { interimaire } = action.payload;
        return { ...state, interimaire: interimaire.data, loading: false };
      }
      case REMOVE_ONE_DOCUMENT_SUCCESS: {
        return {
          ...state,
          interimaire: action.payload.interimaire,
          loading: false,
          stepFiveModal: action.payload.step
        };
      }
      case CLEAR_STEP_FIVE_MODAL: {
        return {
          ...state,
          stepFiveModal: null
        };
      }
      case actionTypes.PARSE_RESUME_REQUEST: {
        return {
          ...state,
          loading: true
        };
      }
      case actionTypes.PARSE_RESUME_SUCCESS: {
        const { interimaire } = action.payload;
        return {
          ...state,
          interimaire: interimaire.data,
          loading: false
        };
      }
      case actionTypes.SEARCH_INTERIMAIRE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.SEARCH_INTERIMAIRE_SUCCESS: {
        const { data } = action.payload;

        return {
          ...state,
          interimaires: data.data,
          loading: false
        };
      }
      case actionTypes.GET_INTERIMAIRE_BYID_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_INTERIMAIRE_BYID_SUCCESS: {
        const { data } = action.payload;
        return {
          ...state,
          interimaire: data.data,
          loading: false
        };
      }
      case actionTypes.CANCEL_EDIT: {
        return { ...state, hasCancelledEdit: true };
      }
      case GO_TO_NEXT_STEP: {
        return {
          ...state,
          step: state.step + 1
        };
      }
      case GET_USER_START_GUIDE: {
        return {
          ...state,
          step: action.payload
        };
      }
      case ADD_EXPERIENCE:
        let newExperience = action.payload;
        let experiencesArray = state.interimaire.applicantExperiences;
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
          interimaire: {
            ...state.interimaire,
            applicantExperiences: experiencesArray
          }
        };

      case REMOVE_EXPERIENCE:
        let experiencesArrayForRemove = state.interimaire.applicantExperiences;
        const experienceId = action.payload;
        const annonceIndexForRemove = experiencesArrayForRemove.findIndex(
          annonce =>
            annonce.id === experienceId || annonce.id_temp === experienceId
        );
        experiencesArrayForRemove.splice(annonceIndexForRemove, 1);

        return {
          ...state,
          interimaire: {
            ...state.interimaire,
            applicantExperiences: experiencesArrayForRemove
          }
        };
      case UPDATE_INTERIMAIRE_IDENTITY_REQUEST:
        return {
          ...state,
          updateInterimaireIdentityLoading: true
        };
      case UPDATE_INTERIMAIRE_IDENTITY_SUCCESS:
        return {
          ...state,
          interimaire: action.payload,
          updateInterimaireIdentityLoading: false,
          stepFiveModal: null
        };
      case UPDATE_INTERIMAIRE_IDENTITY_FAILLED:
        return {
          ...state,
          updateInterimaireIdentityLoading: false
        };
      case CLEAR_ANIMATION_DURATION:
        return {
          ...state,
          animationDuration: 0
        };
      case SET_COUNT_MATCHING:
        let newRightMenu = state.rightMenu;
        newRightMenu[0].value = action.payload;
        return {
          ...state,
          rightMenu: newRightMenu
        };
      case INCREMENT_COUNT_APPLICATIONS:
        state.rightMenu[3].value = action.payload;
        return { ...state };
      case INCREMENT_COUNT_PROPOSITIONS:
        state.rightMenu[2].value = action.payload;
        return { ...state };
      case SET_CONTRACTS_COUNT:
        let newRightMenuForContracts = state.rightMenu;
        newRightMenuForContracts[4].value = action.payload;
        return {
          ...state,
          rightMenu: newRightMenuForContracts
        };
      case GET_CONTRACT_LIST_SUCCESS:
        return {
          ...state,
          contractList: action.payload
        };
      case GET_DOCUMENTS_LIST_SUCCESS:
        return {
          ...state,
          documentsList: action.payload
        };
      case GET_NATIONALITIES_LIST: {
        return {
          ...state,
          nationalitiesList: action.payload
        };
      }
      case UPDATE_APPLICANT_REQUEST:
        return {
          ...state,
          updateInterimaireIdentityLoading: true
        };
      case UPDATE_APPLICANT_SUCCESS:
        return {
          ...state,
          updateInterimaireIdentityLoading: false
        };
      case UPDATE_APPLICANT_FAILURE:
        return {
          ...state,
          updateInterimaireIdentityLoading: false
        };
      default:
        return state;
    }
  }
);

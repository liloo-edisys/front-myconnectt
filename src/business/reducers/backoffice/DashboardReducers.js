import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import {
  UPDATE_NEW_ACCOUNTS,
  UPDATE_NEW_APPLICANTS,
  UPDATE_NUMBER_MONTHLY_CONTRACTS,
  UPDATE_PROFILES_RATE,
  UPDATE_NUMBER_CONTRACTS,
  UPDATE_NUMBER_SIGNED_CONTRACTS,
  UPDATE_NUMBER_DELETED_APPLICANTS,
  UPDATE_RATE_DELETED_APPLICANTS,
  UPDATE_NUMBER_DELETED_ACCOUNTS,
  UPDATE_RATE_DELETED_ACCOUNTS,
  UPDATE_RATE_LOGIN_APPLICANTS,
  UPDATE_RATE_LOGIN_ACCOUNTS,
  UPDATE_NBR_MISSIONS,
  UPDATE_NBR_EXTENSIONS,
  UPDATE_NBR_RH,
  UPDATE_NBR_APPLICANTS,
  UPDATE_NBR_APPLICANTS_TO_CONTROL,
  UPDATE_NBR_ACCOUNTS,
  UPDATE_NBR_REFUS_ACCOUNTS,
  UPDATE_NBR_REFUS_APPLICANTS,
  UPDATE_NBR_COMMERCIAL_AGREEMENTS,
  UPDATE_NBR_MSG_APPLICANTS,
  UPDATE_NBR_MSG_ACCOUNTS
} from "../../types/backOfficeTypes";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  loading: false,
  statistics: {
    nbrMissions: 0,
    nbrExtensions: 0,
    nbrRH: 0,
    nbrApplicants: 0,
    nbrApplicantsToControl: 0,
    nbrAccounts: 0,
    nbrRefusAccounts: 0,
    nbrRefusApplicants: 0,
    nbrCommercialAgreements: 0,
    nbrMsgApplicants: 0,
    nbrMsgAccounts: 0,

    newAccounts: 0,
    newApplicants: 0,
    nbrMonthlyContracts: 0,
    profilesRate: 0,
    nbrContracts: 0,
    nbrSignedContracts: 0,
    nbrDeletedApplicants: 0,
    rateDeletedApplicants: 0,
    nbrDeletedAccounts: 0,
    rateDeletedAccounts: 0,
    rateLoginApplicants: 0,
    rateLoginAccounts: 0
  }
};

export const backOfficeDashboardReducer = persistReducer(
  {
    storage,
    key: "myconnectt-backofficedashboard",
    whitelist: ["user", "authToken"]
  },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_BACKOFFICE_DASHBOARD_SUCCESS: {
        const {
          dashboard: { data: dashboard }
        } = action.payload;
        return { ...state, statistics: dashboard, loading: false };
      }
      case UPDATE_NBR_MISSIONS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrMissions: action.payload
          }
        };
      }
      case UPDATE_NBR_EXTENSIONS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrExtensions: action.payload
          }
        };
      }
      case UPDATE_NBR_RH: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrRH: action.payload
          }
        };
      }
      case UPDATE_NBR_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrApplicants: action.payload
          }
        };
      }
      case UPDATE_NBR_APPLICANTS_TO_CONTROL: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrApplicantsToControl: action.payload
          }
        };
      }
      case UPDATE_NBR_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrAccounts: action.payload
          }
        };
      }
      case UPDATE_NBR_REFUS_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbr_refus_accounts: action.payload
          }
        };
      }
      case UPDATE_NBR_REFUS_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrRefusApplicants: action.payload
          }
        };
      }
      case UPDATE_NBR_COMMERCIAL_AGREEMENTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrCommercialAgreements: action.payload
          }
        };
      }
      case UPDATE_NBR_MSG_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrMsgApplicants: action.payload
          }
        };
      }
      case UPDATE_NBR_MSG_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrMsgAccounts: action.payload
          }
        };
      }

      case UPDATE_NEW_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            newAccounts: action.payload
          }
        };
      }
      case UPDATE_NEW_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            newApplicants: action.payload
          }
        };
      }
      case UPDATE_NUMBER_MONTHLY_CONTRACTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrMonthlyContracts: action.payload
          }
        };
      }
      case UPDATE_PROFILES_RATE: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            profilesRate: action.payload
          }
        };
      }
      case UPDATE_NUMBER_CONTRACTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrContracts: action.payload
          }
        };
      }
      case UPDATE_NUMBER_SIGNED_CONTRACTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrSignedContracts: action.payload
          }
        };
      }
      case UPDATE_NUMBER_DELETED_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrDeletedApplicants: action.payload
          }
        };
      }
      case UPDATE_RATE_DELETED_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            rateDeletedApplicants: action.payload
          }
        };
      }
      case UPDATE_NUMBER_DELETED_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            nbrDeletedAccounts: action.payload
          }
        };
      }
      case UPDATE_RATE_DELETED_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            rateDeletedAccounts: action.payload
          }
        };
      }
      case UPDATE_RATE_LOGIN_APPLICANTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            rateLoginApplicants: action.payload
          }
        };
      }
      case UPDATE_RATE_LOGIN_ACCOUNTS: {
        return {
          ...state,
          statistics: {
            ...state.statistics,
            rateLoginAccounts: action.payload
          }
        };
      }
      default:
        return state;
    }
  }
);

import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  commercialAgreements: {
    list: [],
    totalCount: 0
  },
  commercialAgreement: null,
  loading: false
};

export const commercialAgreementsdReducer = persistReducer(
  {
    storage,
    key: "myconnectt-mailtemplates",
    whitelist: ["user", "authToken"]
  },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_COMMERCIAL_AGREEMENTS_SUCCESS: {
        return { ...state, commercialAgreements: action.payload.data };
      }
      case actionTypes.SET_COMMERCIAL_AGREEMENT: {
        return { ...state, commercialAgreement: action.payload };
      }
      case actionTypes.DELETE_COMPANY_SUCCESS: {
        const { id } = action.payload;
        return {
          ...state,
          commercialAgreements: state.commercialAgreements.filter(
            commercialAgreement => commercialAgreement.id !== id
          ),
          loading: false
        };
      }
      default:
        return state;
    }
  }
);

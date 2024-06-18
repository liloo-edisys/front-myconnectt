import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  mailTemplates: {
    list: [],
    totalCount: 0
  },
  mailTemplate: null,
  categories: [],
  loading: false
};

export const mailTemplatesdReducer = persistReducer(
  {
    storage,
    key: "myconnectt-mailtemplates",
    whitelist: ["user", "authToken"]
  },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_MAIL_TEMPLATES_SUCCESS: {
        return { ...state, mailTemplates: action.payload.data };
      }
      case actionTypes.GET_MAIL_TEMPLATE_CATEGORIES_SUCCESS: {
        return { ...state, categories: action.payload.data };
      }
      case actionTypes.SET_MAIL_TEMPLATE: {
        return { ...state, mailTemplate: action.payload };
      }
      case actionTypes.PUT_MAIL_TEMPLATE_SUCCESS: {
        const uptodateMailTemplates = state.mailTemplates.list.map(
          mailTemplate => {
            if (mailTemplate.id === action.payload.id) return action.payload;
            return mailTemplate;
          }
        );
        return {
          ...state,
          mailTemplates: { ...state.mailTemplates, list: uptodateMailTemplates }
        };
      }
      default:
        return state;
    }
  }
);

import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialCompaniesState = {
  companies: [],
  customers: {
    list: [],
    totalCount: 0
  },
  checked: null,
  loading: false
};

export const clientCompaniesReducer = persistReducer(
  { storage, key: "myconnectt-companies", whitelist: ["user", "authToken"] },
  (state = initialCompaniesState, action) => {
    switch (action.type) {
      case actionTypes.GET_COMPANIES_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_COMPANIES_SUCCESS: {
        const {
          company: { data: companies }
        } = action.payload;
        return { ...state, companies: companies, loading: false };
      }
      case actionTypes.GET_CUSTOMERS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_CUSTOMERS_SUCCESS: {
        const {
          customers: { data: customers }
        } = action.payload;
        return { ...state, customers: customers, loading: false };
      }
      case actionTypes.CHECK_COMPANY_SUCCESS: {
        const { data } = action.payload;
        return { ...state, checked: data.data };
      }
      case actionTypes.CREATE_COMPANY_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.CREATE_COMPANY_SUCCESS: {
        const { data } = action.payload;
        let companies = [...state.companies];
        companies.push(data);
        return {
          ...state,
          companies,
          loading: false
        };
      }

      case actionTypes.UPDATE_COMPANY_SUCCESS: {
        const { data } = action.payload;
        const newArray = [...state.companies]; //making a new array
        const index = state.companies.findIndex(
          company => company.id === data.id
        );
        newArray[index] = data;
        return {
          ...state,
          companies: newArray,
          loading: false
        };
      }

      case actionTypes.SWITCH_COMPANY_SUCCESS: {
        const { data } = action.payload;
        const newArray = [...state.companies]; //making a new array
        const index = state.companies.findIndex(
          company => company.id === data.id
        );
        newArray[index] = data.data;
        return {
          ...state,
          companies: newArray,
          loading: false
        };
      }
      case actionTypes.DELETE_COMPANY_SUCCESS: {
        const { id } = action.payload;
        return {
          ...state,
          companies: state.companies.filter(company => company.id !== id),
          loading: false
        };
      }
      default:
        return state;
    }
  }
);

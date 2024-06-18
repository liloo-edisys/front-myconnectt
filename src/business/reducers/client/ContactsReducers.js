import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  contacts: [],
  user: [],
  loading: false
};

export const clientContactsReducer = persistReducer(
  { storage, key: "myconnectt-contacts", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case actionTypes.GET_CONTACT_SUCCESS: {
        const {
          user: { data: user }
        } = action.payload;
        return { ...state, user: user, loading: false };
      }
      case actionTypes.GET_CONTACTS_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_CONTACTS_SUCCESS: {
        const {
          contacts: { data: contacts }
        } = action.payload;
        return { ...state, contacts: contacts, loading: false };
      }
      case actionTypes.UPDATE_CONTACT_SUCCESS: {
        const { data } = action.payload;
        const newArray = [...state.contacts]; //making a new array
        const index = state.contacts.findIndex(
          contact => contact.id === data.id
        );
        data.isApproved = true;
        newArray[index] = data;
        return {
          ...state,
          contacts: newArray,
          user: data.id === state.user.id ? data : state.user,
          loading: false
        };
      }
      case actionTypes.DELETE_CONTACT_SUCCESS: {
        const { id } = action.payload;
        return {
          ...state,
          contacts: state.contacts.filter(contact => contact.id !== id),
          loading: false
        };
      }
      default:
        return state;
    }
  }
);

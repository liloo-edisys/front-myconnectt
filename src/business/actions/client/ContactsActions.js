import * as actionTypes from "constants/constants";

export const getContact = {
  request: authToken => ({
    type: actionTypes.GET_CONTACT_REQUEST,
    payload: { authToken }
  }),
  success: user => ({
    type: actionTypes.GET_CONTACT_SUCCESS,
    payload: { user }
  }),
  failure: error => ({
    type: actionTypes.GET_CONTACT_FAILURE,
    payload: { error }
  })
};

export const inviteContact = {
  request: data => ({
    type: actionTypes.INVITE_CONTACT_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.INVITE_CONTACT_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.INVITE_CONTACT_FAILURE,
    payload: { error }
  })
};

export const getContactsList = {
  request: authToken => ({
    type: actionTypes.GET_CONTACTS_REQUEST,
    payload: { authToken }
  }),
  success: contacts => ({
    type: actionTypes.GET_CONTACTS_SUCCESS,
    payload: { contacts }
  }),
  failure: error => ({
    type: actionTypes.GET_CONTACTS_FAILURE,
    payload: { error }
  })
};

export const updateContact = {
  request: data => ({
    type: actionTypes.UPDATE_CONTACT_REQUEST,
    payload: { data }
  }),
  success: (contact, data) => ({
    type: actionTypes.UPDATE_CONTACT_SUCCESS,
    payload: { contact, data }
  }),
  failure: error => ({
    type: actionTypes.UPDATE_CONTACT_FAILURE,
    payload: { error }
  })
};

export const deleteContact = {
  request: id => ({
    type: actionTypes.DELETE_CONTACT_REQUEST,
    payload: { id }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_CONTACT_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_CONTACT_FAILURE,
    payload: { error }
  })
};

export const deleteMyContact = {
  request: id => ({
    type: actionTypes.DELETE_MY_CONTACT_REQUEST,
    payload: { id }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_MY_CONTACT_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_MY_CONTACT_FAILURE,
    payload: { error }
  })
};

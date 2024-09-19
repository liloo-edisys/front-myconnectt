import axios from "axios";
import {
  GET_ACTIVE_INTERIMAIRE_SUCCESS,
  CLEAR_SELECTED_APPLICANT,
  UPDATE_SELECTED_APPLICANT,
  ADD_SELECTED_APPLICANT_EXPERIENCE,
  REMOVE_SELECTED_APPLICANT__EXPERIENCE,
  UPDATE_SELECTED_APPLICANT_IDENTITY_REQUEST,
  UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS,
  GET_ACTIVE_INTERIMAIRE_REQUEST,
  GET_ACTIVE_INTERIMAIRE_FAILLED,
  REMOVE_ONE_SELECTED_APPLICANT_DOCUMENT_SUCCESS,
  CLEAR_SELECTED_APPLICANT_STEP_FIVE_MODAL,
  SEARCH_SELECTED_APPLICANT_MISSIONS_REQUEST,
  SEARCH_SELECTED_APPLICANT_MISSIONS_SUCCESS,
  SEARCH_SELECTED_APPLICANT_MISSIONS_FAILLED,
  GET_SELECTED_APPLICANT_EMAILS_REQUEST,
  GET_SELECTED_APPLICANT_EMAILS_SUCCESS,
  GET_SELECTED_APPLICANT_EMAILS_FAILLED
} from "../../types/backOfficeTypes";

import {
  USER_URL,
  UPLOAD_DOCUMENT,
  DELETE_DOCUMENT,
  REMOVE_ONE_DOCUMENT
} from "../../api/client/applicantsApi";

import * as actionTypes from "constants/constants";

const INTERIMAIRES_URL = process.env.REACT_APP_WEBAPI_URL + "api/Applicant";
const VACANCY_URL = process.env.REACT_APP_WEBAPI_URL + "api/Vacancy";
const EMAILS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/Email/SearchUserEmails";

export const getSelectedApplicantById = (id, dispatch) => {
  dispatch({
    type: GET_ACTIVE_INTERIMAIRE_REQUEST
  });
  axios
    .get(`${INTERIMAIRES_URL}/${id}`)
    .then(res => {
      dispatch({
        type: GET_ACTIVE_INTERIMAIRE_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_ACTIVE_INTERIMAIRE_FAILLED
      });
    });
};

export const clearSelectedApplicant = dispatch => {
  dispatch({
    type: CLEAR_SELECTED_APPLICANT
  });
};

export const updateSelectedApplicant = (applicant, dispatch) => {
  dispatch({
    type: UPDATE_SELECTED_APPLICANT,
    payload: applicant
  });
};

export const addSelectedApplicantExperience = (experience, dispatch) => {
  dispatch({
    type: ADD_SELECTED_APPLICANT_EXPERIENCE,
    payload: experience
  });
};

export const removeSelectedApplicantExperience = (experienceId, dispatch) => {
  dispatch({
    type: REMOVE_SELECTED_APPLICANT__EXPERIENCE,
    payload: experienceId
  });
};

export const updateSelectedApplicantIdentity = (
  interimaire,
  imageArray,
  dispatch
) => {
  const body = interimaire;
  dispatch({
    type: UPDATE_SELECTED_APPLICANT_IDENTITY_REQUEST
  });
  if (imageArray) {
    for (let i = 0; i < imageArray.length; i++) {
      const body = imageArray[i];
      axios
        .post(UPLOAD_DOCUMENT, body)
        .then(res => {
          dispatch({
            type: UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS,
            payload: res.data
          });
        })
        .catch(err => console.log(err));
    }
  }
  return axios
    .put(USER_URL, body)
    .then(res => {
      dispatch({
        type: UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const addSelectedApplicantNewDocument = (imageArray, dispatch) => {
  for (let i = 0; i < imageArray.length; i++) {
    dispatch({
      type: UPDATE_SELECTED_APPLICANT_IDENTITY_REQUEST
    });
    const body = imageArray[i];
    axios
      .post(UPLOAD_DOCUMENT, body)
      .then(res => {
        dispatch({
          type: UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS,
          payload: res.data
        });
      })
      .catch(err => console.log(err.response));
  }
};

export const deleteSelectedApplicantDocumentt = (body, dispatch) => {
  dispatch({
    type: UPDATE_SELECTED_APPLICANT_IDENTITY_REQUEST
  });
  return axios
    .post(DELETE_DOCUMENT, body)
    .then(res => {
      dispatch({
        type: UPDATE_SELECTED_APPLICANT_IDENTITY_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const removeOneSelectedApplicantDocument = (body, step, dispatch) => {
  axios
    .post(REMOVE_ONE_DOCUMENT, body)
    .then(res => {
      getSelectedApplicantById(res.data.id, dispatch);
      dispatch({
        type: REMOVE_ONE_SELECTED_APPLICANT_DOCUMENT_SUCCESS,
        payload: {
          interimaire: res.data,
          step
        }
      });
    })
    .catch(err => console.log(err));
};

export const clearSelectedApplicantStepFiveModal = dispatch => {
  dispatch({
    type: CLEAR_SELECTED_APPLICANT_STEP_FIVE_MODAL
  });
};

export const searchSelectedApplicantMissions = (body, dispatch) => {
  dispatch({
    type: SEARCH_SELECTED_APPLICANT_MISSIONS_REQUEST
  });
  axios
    .post(VACANCY_URL + "/SearchMissions", body)
    .then(res => {
      dispatch({
        type: SEARCH_SELECTED_APPLICANT_MISSIONS_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: SEARCH_SELECTED_APPLICANT_MISSIONS_FAILLED
      });
    });
};

export const getSelectedApplicantEmails = (body, dispatch) => {
  dispatch({
    type: GET_SELECTED_APPLICANT_EMAILS_REQUEST
  });
  axios
    .post(EMAILS_URL, body)
    .then(res => {
      dispatch({
        type: GET_SELECTED_APPLICANT_EMAILS_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_SELECTED_APPLICANT_EMAILS_FAILLED
      });
    });
};

export const deleteApplicant = {
  request: id => ({
    type: actionTypes.DELETE_APPLICANT_REQUEST,
    payload: id
  }),
  success: dashboard => ({
    type: actionTypes.DELETE_APPLICANT_SUCCESS,
    payload: { dashboard }
  }),
  failure: error => ({
    type: actionTypes.DELETE_APPLICANT_FAILURE,
    payload: { error }
  })
};

import * as actionTypes from "constants/constants";

export const getUserVacancies = {
  request: data => ({
    type: actionTypes.GET_USER_VACANCIES_REQUEST,
    payload: data
  }),
  success: (vacancy, data) => ({
    type: actionTypes.GET_USER_VACANCIES_SUCCESS,
    payload: { vacancy, data }
  }),
  failure: error => ({
    type: actionTypes.GET_USER_VACANCIES_FAILURE,
    payload: { error }
  })
};

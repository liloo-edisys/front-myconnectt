import * as actionTypes from "constants/constants";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import {
  SET_FILTER_COMPANY,
  SET_FILTER_STATUS,
  SET_FILTER_START_DATE,
  SET_FILTER_END_DATE,
  SET_FILTER_PAGE_SIZE,
  SET_FILTER_PAGE_NUMBER
} from "../../types/backOfficeTypes.js";

export const EXTENSIONS_URL =
  process.env.REACT_APP_WEBAPI_URL + "api/contractextension";

export const getExtensions = (body, dispatch) => {
  dispatch({
    type: actionTypes.GET_EXTENSIONS_REQUEST
  });
  return axios
    .post(EXTENSIONS_URL + "/SearchExtensions", body)
    .then(res => {
      dispatch({
        type: actionTypes.GET_EXTENSIONS_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: actionTypes.GET_EXTENSIONS_FAILURE
      });
    });
};

export const putExtension = (body, getData, dispatch) => {
  dispatch({
    type: actionTypes.PUT_EXTENSIONS_REQUEST
  });
  axios
    .put(EXTENSIONS_URL, body)
    .then(res => {
      getData();
      if (body.status === 2) {
        toastr.success(
          "Validation de la demande",
          "La demande de prolongation a bien été validée."
        );
      }
      dispatch({
        type: actionTypes.PUT_EXTENSIONS_SUCCESS
      });
    })
    .catch(err => {
      dispatch({
        type: actionTypes.PUT_EXTENSIONS_FAILURE
      });
    });
};

export const setSetelectedStartDate = (value, dispatch) => {
  dispatch({
    type: SET_FILTER_START_DATE,
    payload: value
  });
};
export const setSetelectedEndDate = (value, dispatch) => {
  dispatch({
    type: SET_FILTER_END_DATE,
    payload: value
  });
};
export const setSelectedAccount = (value, dispatch) => {
  dispatch({
    type: SET_FILTER_COMPANY,
    payload: value
  });
};
export const setDefaultStatus = (value, dispatch) => {
  dispatch({
    type: SET_FILTER_STATUS,
    payload: value
  });
};
export const setPageSize = (value, dispatch) => {
  dispatch({
    type: SET_FILTER_PAGE_SIZE,
    payload: value
  });
};
export const setPageNumber = (value, dispatch) => {
  dispatch({
    type: SET_FILTER_PAGE_NUMBER,
    payload: value
  });
};

import * as actionTypes from "constants/constants";
import {
  HABILITATION_URL,
  EXTENSIONS_URL,
  VACANCY_URL
} from "../../api/client/MissionsApi";
import {
  GET_HABILITATION_REQUEST,
  GET_HABILITATION_SUCCESS,
  GET_HABILITATION_FAILLED,
  REFRESH_MISSIONS_LIST
} from "../../types/clientTypes";
import axios from "axios";
import { getDataDetail } from "@microsoft/signalr/dist/esm/Utils";
import { toastr } from "react-redux-toastr";
import { APPROVE_BY_APPLICANT_SUCCESS } from "../../../constants/constants";
export const getAccountMissions = {
  request: data => ({
    type: actionTypes.GET_ACCOUNT_VACANCY_REQUEST,
    payload: data
  }),
  success: (vacancy, data) => ({
    type: actionTypes.GET_ACCOUNT_VACANCY_SUCCESS,
    payload: { vacancy, data }
  }),
  failure: error => ({
    type: actionTypes.GET_ACCOUNT_VACANCY_FAILURE,
    payload: { error }
  })
};

export const getMission = {
  request: id => ({
    type: actionTypes.GET_VACANCY_REQUEST,
    payload: { data: id }
  }),
  success: data => ({
    type: actionTypes.GET_VACANCY_SUCCESS,
    payload: { data }
  }),
  delete: () => ({
    type: actionTypes.GET_VACANCY_DELETE
  }),
  failure: error => ({
    type: actionTypes.GET_VACANCY_FAILURE,
    payload: { error }
  })
};

export const getTemplate = {
  request: data => ({
    type: actionTypes.GET_TEMPLATE_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.GET_TEMPLATE_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.GET_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const getAccountTemplates = {
  request: data => ({
    type: actionTypes.GET_ACCOUNT_TEMPLATE_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.GET_ACCOUNT_TEMPLATE_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.GET_ACCOUNT_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const getUserTemplates = {
  request: data => ({
    type: actionTypes.GET_USER_TEMPLATE_REQUEST,
    payload: data
  }),
  success: (vacancy, data) => ({
    type: actionTypes.GET_USER_TEMPLATE_SUCCESS,
    payload: { vacancy, data }
  }),
  failure: error => ({
    type: actionTypes.GET_USER_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const getUserMissions = {
  request: data => ({
    type: actionTypes.GET_USER_VACANCY_REQUEST,
    payload: data
  }),
  success: (vacancy, data) => ({
    type: actionTypes.GET_USER_VACANCY_SUCCESS,
    payload: { vacancy, data }
  }),
  failure: error => ({
    type: actionTypes.GET_USER_VACANCY_FAILURE,
    payload: { error }
  })
};

export const createMission = {
  request: data => ({
    type: actionTypes.CREATE_VACANCY_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.CREATE_VACANCY_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.CREATE_VACANCY_FAILURE,
    payload: error
  })
};

export const updateMission = {
  request: data => ({
    type: actionTypes.UPDATE_VACANCY_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.UPDATE_VACANCY_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.UPDATE_VACANCY_FAILURE,
    payload: { error }
  })
};

export const validateMission = {
  request: data => ({
    type: actionTypes.VALIDATE_VACANCY_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.VALIDATE_VACANCY_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.VALIDATE_VACANCY_FAILURE,
    payload: { error }
  })
};

export const createTemplate = {
  request: data => ({
    type: actionTypes.CREATE_TEMPLATE_REQUEST,
    payload: { data }
  }),
  success: (vacancy, data) => ({
    type: actionTypes.CREATE_TEMPLATE_SUCCESS,
    payload: { vacancy, data }
  }),
  failure: error => ({
    type: actionTypes.CREATE_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const getMissionSalaries = {
  request: data => ({
    type: actionTypes.GET_MISSION_SALARIES_REQUEST,
    payload: data
  }),
  success: (vacancy, data) => ({
    type: actionTypes.GET_MISSION_SALARIES_SUCCESS,
    payload: { vacancy, data }
  }),
  failure: error => ({
    type: actionTypes.GET_MISSION_SALARIES_FAILURE,
    payload: { error }
  })
};

export const setCurrentTemplate = {
  request: data => ({
    type: actionTypes.SET_CURRENT_TEMPLATE_REQUEST,
    payload: { data }
  })
};

export const setCurrentDuplicate = {
  request: data => ({
    type: actionTypes.SET_CURRENT_DUPLICATE_REQUEST,
    payload: { data }
  })
};

export const deleteCurrentDuplicate = {
  request: data => ({
    type: actionTypes.DELETE_CURRENT_DUPLICATE_REQUEST,
    payload: { data }
  })
};

export const deleteCurrentTemplate = {
  request: data => ({
    type: actionTypes.DELETE_CURRENT_TEMPLATE_REQUEST,
    payload: { data }
  })
};

export const deleteMissionTemplate = {
  request: id => ({
    type: actionTypes.DELETE_MISSION_TEMPLATE_REQUEST,
    payload: { id }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_MISSION_TEMPLATE_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_MISSION_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const deleteMission = {
  request: id => ({
    type: actionTypes.DELETE_MISSION_REQUEST,
    payload: { id }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_MISSION_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_MISSION_FAILURE,
    payload: { error }
  })
};

export const resetMissionIndicator = {
  request: () => ({
    type: actionTypes.RESET_MISSION_INDICATOR_REQUEST
  })
};

export const resetMission = {
  request: () => ({
    type: actionTypes.RESET_MISSION_REQUEST
  })
};

export const getStored = {
  request: data => ({
    type: actionTypes.GET_STORED_REQUEST,
    payload: { data }
  })
};

export const searchMission = {
  request: data => ({
    type: actionTypes.SEARCH_MISSION_REQUEST,
    payload: data
  }),
  success: data => ({
    type: actionTypes.SEARCH_MISSION_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.SEARCH_MISSION_FAILURE,
    payload: { error }
  })
};

export const searchTemplates = {
  request: data => ({
    type: actionTypes.SEARCH_MISSION_TEMPLATE_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.SEARCH_MISSION_TEMPLATE_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.SEARCH_MISSION_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const updateTemplate = {
  request: data => ({
    type: actionTypes.UPDATE_VACANCY_TEMPLATE_REQUEST,
    payload: { data }
  }),
  success: (response, data) => ({
    type: actionTypes.UPDATE_VACANCY_TEMPLATE_SUCCESS,
    payload: { response, data }
  }),
  failure: error => ({
    type: actionTypes.UPDATE_VACANCY_TEMPLATE_FAILURE,
    payload: { error }
  })
};

export const getHabilitationsList = dispatch => {
  dispatch({
    type: GET_HABILITATION_REQUEST
  });
  return axios
    .get(HABILITATION_URL)
    .then(res => {
      dispatch({
        type: GET_HABILITATION_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_HABILITATION_FAILLED
      });
    });
};

export const getExtensions = (body, dispatch) => {
  dispatch({
    type: actionTypes.GET_EXTENSIONS_REQUEST
  });
  axios
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

export const addFavorite = (body, dispatch, getData) => {
  dispatch({
    type: actionTypes.ADD_FAVORITE_REQUEST
  });
  axios
    .post(VACANCY_URL + "/FavoriteMissions", body)
    .then(res => {
      dispatch({ type: APPROVE_BY_APPLICANT_SUCCESS });
      toastr.success("Succès", "L'offre à bien été ajoutée aux favoris.");
      if (getData != null) {
        getData();
      } else {
        dispatch({
          type: actionTypes.ADD_FAVORITE_SUCCESS
        });
      }
    })
    .catch(err => {
      toastr.success(
        "Erreur",
        "Une erreur s'est produite lors de l'ajout de l'offre aux favoris."
      );
      dispatch({
        type: actionTypes.ADD_FAVORITE_FAILURE
      });
    });
};

export const removeFavorite = (id, dispatch, getData) => {
  dispatch({
    type: actionTypes.REMOVE_FAVORITE_REQUEST
  });
  axios
    .delete(VACANCY_URL + "/FavoriteMissions?vacancyid=" + id)
    .then(res => {
      dispatch({ type: APPROVE_BY_APPLICANT_SUCCESS });
      toastr.success("Succès", "L'offre à bien été retirée des favoris.");
      if (getData != null) {
        getData();
      } else {
        dispatch({
          type: actionTypes.REMOVE_FAVORITE_SUCCESS
        });
      }
    })
    .catch(err => {
      toastr.success(
        "Erreur",
        "Une erreur s'est produite lors du retrait de l'offre des favoris."
      );
      dispatch({
        type: actionTypes.REMOVE_FAVORITE_FAILURE
      });
    });
};

import * as actionTypes from "constants/constants";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import {
  CHECK_INTERIMAIRE_SMS_CODE,
  REGISTER_INTERIMAIRE_URL,
  USER_START_GUIDE_URL,
  COUNT_MATCHING_URL
} from "../../api/shared/authApi";
import {
  INTERIMAIRE_REGISTER_BY_MOBILE_ERROR,
  INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS
} from "../../types/authTypes.js";
import {
  ADD_EXPERIENCE,
  REMOVE_EXPERIENCE,
  GET_USER_START_GUIDE,
  GO_TO_NEXT_STEP,
  USER_BY_MOBILE_SUCCESS,
  UPDATE_INTERIMAIRE_IDENTITY_REQUEST,
  UPDATE_INTERIMAIRE_IDENTITY_SUCCESS,
  UPDATE_INTERIMAIRE_IDENTITY_FAILLED,
  CLEAR_ANIMATION_DURATION,
  SET_COUNT_MATCHING,
  INCREMENT_COUNT_APPLICATIONS,
  GET_CONTRACT_LIST_REQUEST,
  GET_CONTRACT_LIST_SUCCESS,
  GET_CONTRACT_LIST_FAILLED,
  GET_DOCUMENTS_LIST_REQUEST,
  GET_DOCUMENTS_LIST_SUCCESS,
  GET_DOCUMENTS_LIST_FAILLED,
  INCREMENT_COUNT_PROPOSITIONS,
  REMOVE_ONE_DOCUMENT_SUCCESS,
  CLEAR_STEP_FIVE_MODAL,
  SET_CONTRACTS_COUNT,
  GET_NATIONALITIES_LIST
} from "../../types/interimaireTypes";
import {
  USER_URL,
  UPLOAD_DOCUMENT,
  DELETE_DOCUMENT,
  REMOVE_ONE_DOCUMENT
} from "../../api/client/applicantsApi";
import {
  INTERIMAIRE_CONTRACT_LIST_URL,
  INTERIMAIRE_DOCUMENTS_LIST_URL
} from "../../api/interimaire/interimairesApi";
import { HubConnectionBuilder } from "@microsoft/signalr";
import moment from "moment";

export const TENANTID = +process.env.REACT_APP_TENANT_ID;

export const getUserWithMobile = (datas, dispatch, action) => {
  const tenantid = TENANTID;
  const body = {
    tenantid,
    mobilePhone: datas.mobilePhone,
    isRegister: action === "register" ? true : false
  };

  return axios.post(REGISTER_INTERIMAIRE_URL, body).then(response => {
    if (response) {
      if (action === "register") {
        toastr.success(
          "Création de votre espace",
          "Nous venons de vous envoyer un code de confirmation sur votre téléphone. Merci de indiquer le code pour confirmer votre inscription."
        );
      } else {
        toastr.success(
          "Connexion à votre espace",
          "Nous venons de vous envoyer un code de confirmation sur votre téléphone. Merci de indiquer le code pour confirmer vous connecter."
        );
      }
      dispatch({
        type: USER_BY_MOBILE_SUCCESS,
        payload: response.data
      });
    }
    return response;
  });
};

export const checkSmsCode = (datas, dispatch, action) => {
  const tenantid = TENANTID;
  const body = {
    ...datas,
    tenantid
  };
  return axios
    .post(CHECK_INTERIMAIRE_SMS_CODE, body)
    .then(response => {
      if (action === "register") {
        toastr.success(
          "Bienvenue sur MyConnectt",
          "Votre inscription a bien été prise en compte, veuillez compléter votre profil afin d'augmenter vos chances de trouver une mission."
        );
      }
      axios
        .get(USER_URL)
        .then(res => {
          dispatch({
            type: USER_BY_MOBILE_SUCCESS,
            payload: res.data
          });
        })
        .catch(() => {
          toastr.error(
            "Erreur",
            "Une erreur s'est produite lors de la connexion, veuillez renouveller l'opération."
          );
          dispatch({
            type: INTERIMAIRE_REGISTER_BY_MOBILE_ERROR
          });
        });

      dispatch({
        type: INTERIMAIRE_REGISTER_BY_MOBILE_SUCCESS,
        payload: response.data
      });
    })
    .catch(() => {
      toastr.error(
        "Erreur",
        "Le code de confirmation semble erroné. Assurez-vous qu'il s'agisse bien du bon code."
      );
      dispatch({
        type: INTERIMAIRE_REGISTER_BY_MOBILE_ERROR
      });
    });
};

export const getInterimaire = {
  request: authToken => {
    return {
      type: actionTypes.GET_INTERIMAIRE_REQUEST,
      payload: { authToken }
    };
  },
  success: interimaire => {
    return {
      type: actionTypes.GET_INTERIMAIRE_SUCCESS,
      payload: { interimaire }
    };
  },
  failure: error => ({
    type: actionTypes.GET_INTERIMAIRE_FAILURE,
    payload: { error }
  })
};

export const deleteInterimaire = {
  request: data => ({
    type: actionTypes.DELETE_INTERIMAIRE_REQUEST,
    payload: { data }
  }),
  success: (data, id) => ({
    type: actionTypes.DELETE_INTERIMAIRE_SUCCESS,
    payload: { data, id }
  }),
  failure: error => ({
    type: actionTypes.DELETE_INTERIMAIRE_FAILURE,
    payload: { error }
  })
};

export const updateInterimaire = {
  request: data => ({
    type: actionTypes.UPDATE_INTERIMAIRE_REQUEST,
    payload: { data: data }
  }),
  success: interimaire => ({
    type: actionTypes.UPDATE_INTERIMAIRE_SUCCESS,
    payload: { interimaire }
  }),
  failure: error => ({
    type: actionTypes.UPDATE_INTERIMAIRE_FAILURE,
    payload: { error }
  })
};

export const getInterimaireById = {
  request: id => ({
    type: actionTypes.GET_INTERIMAIRE_BYID_REQUEST,
    payload: { data: id }
  }),
  success: data => ({
    type: actionTypes.GET_INTERIMAIRE_BYID_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.GET_INTERIMAIRE_BYID_FAILURE,
    payload: { error }
  })
};

export const parseResume = {
  request: data => ({
    type: actionTypes.PARSE_RESUME_REQUEST,
    payload: { data }
  }),
  success: interimaire => ({
    type: actionTypes.PARSE_RESUME_SUCCESS,
    payload: { interimaire }
  }),
  failure: error => ({
    type: actionTypes.PARSE_RESUME_FAILURE,
    payload: { error }
  })
};

export const searchInterimaires = {
  request: data => ({
    type: actionTypes.SEARCH_INTERIMAIRE_REQUEST,
    payload: { data }
  }),
  success: data => ({
    type: actionTypes.SEARCH_INTERIMAIRE_SUCCESS,
    payload: { data }
  }),
  failure: error => ({
    type: actionTypes.SEARCH_INTERIMAIRE_FAILURE,
    payload: { error }
  })
};

export const cancelEdit = {
  request: () => ({
    type: actionTypes.CANCEL_EDIT
  })
};

export const goToNextStep = (interimaire, step, dispatch) => {
  const { userID, hasContactInformation } = interimaire;
  let newStep = null;
  if (step === 0) {
    const body = {
      tenantid: TENANTID,
      userID,
      startGuideType: 0,
      validated: true
    };
    axios
      .post(USER_START_GUIDE_URL, body)
      .then(res => {
        const userGuideStep = Math.max.apply(
          Math,
          res.data.map(function(o) {
            return o.startGuideType;
          })
        );
        if (userGuideStep === 0 && !hasContactInformation) {
          newStep = 1;
        } else if (userGuideStep === 0 && hasContactInformation) {
          newStep = 2;
        }
        dispatch({
          type: GET_USER_START_GUIDE,
          payload: newStep
        });
      })
      .catch(err => err);
  } else if (step === 3) {
    dispatch({
      type: CLEAR_ANIMATION_DURATION
    });
    const body = {
      tenantid: TENANTID,
      userID,
      startGuideType: 1,
      validated: true
    };
    axios
      .post(USER_START_GUIDE_URL, body)
      .then(res => {
        const userGuideStep = Math.max.apply(
          Math,
          res.data.map(function(o) {
            return o.startGuideType;
          })
        );
        if (userGuideStep === 1) {
          newStep = 4;
        }
        dispatch({
          type: GET_USER_START_GUIDE,
          payload: newStep
        });
      })
      .catch(err => err);
  } else {
    const body = interimaire;
    axios
      .put(USER_URL, body)
      .then(res => {
        dispatch({
          type: USER_BY_MOBILE_SUCCESS,
          payload: res.data
        });
      })
      .catch(err => console.log(err));
  }
};

export const getUserStartGuide = (interimaire, dispatch) => {
  let {
    userID,
    hasContactInformation,
    hasMatching,
    hasExperience,
    hasDocuments,
    hasIDCard,
    email,
    city,
    postalCode
  } = interimaire;

  //hasDocuments = true

  axios.get(`${USER_START_GUIDE_URL}/${userID}`).then(res => {
    let step = null;
    const userGuideStep = Math.max.apply(
      Math,
      res.data.map(function(o) {
        return o.startGuideType;
      })
    );
    const body = interimaire;
    if (!res.data || res.data.length === 0) {
      step = 0;
    } else if (hasIDCard && hasMatching) {
      axios
        .post(COUNT_MATCHING_URL, body)
        .then(res => {
          dispatch({
            type: SET_COUNT_MATCHING,
            payload: res.data
          });
        })
        .catch(err => {
          console.log(err);
        });
      step = 6;
    } else if (hasExperience && hasMatching) {
      axios
        .post(COUNT_MATCHING_URL, body)
        .then(res => {
          dispatch({
            type: SET_COUNT_MATCHING,
            payload: res.data
          });
        })
        .catch(err => {
          console.log(err);
        });
      step = 5;
    } else if (userGuideStep === 1 && hasMatching) {
      axios
        .post(COUNT_MATCHING_URL, body)
        .then(res => {
          dispatch({
            type: SET_COUNT_MATCHING,
            payload: res.data
          });
        })
        .catch(err => {
          console.log(err);
        });
      step = 4;
    } else if (hasMatching && hasContactInformation) {
      axios
        .post(COUNT_MATCHING_URL, body)
        .then(res => {
          dispatch({
            type: SET_COUNT_MATCHING,
            payload: res.data
          });
        })
        .catch(err => {
          console.log(err);
        });
      step = 3;
    } else if (userGuideStep === 0 && !hasContactInformation) {
      step = 1;
    } else if ((userGuideStep === 0 && hasContactInformation) || !hasMatching) {
      step = 2;
    } else if (email && city && postalCode) {
      step = 3;
    } /*else if ((userGuideStep === 0 && hasContactInformation) || !hasMatching) {
      step = 2;
    }*/
    dispatch({
      type: GET_USER_START_GUIDE,
      payload: step
    });
  });
};

export const addExperience = (experience, dispatch) => {
  dispatch({
    type: ADD_EXPERIENCE,
    payload: experience
  });
};

export const removeExperience = (experienceId, dispatch) => {
  dispatch({
    type: REMOVE_EXPERIENCE,
    payload: experienceId
  });
};

export const updateInterimaireIdentity = (
  interimaire,
  imageArray,
  dispatch
) => {
  let newBirthDate = moment(interimaire.birthDate, "YYYY-MM-DDTHH:mm:ss");
  newBirthDate.set({ h: 12, m: 10 });
  let newIdCardIssueDate = moment(
    interimaire.idCardIssueDate,
    "YYYY-MM-DDTHH:mm:ss"
  );
  newIdCardIssueDate.set({ h: 12, m: 10 });
  let newIdCardExpirationDate = moment(
    interimaire.idCardExpirationDate,
    "YYYY-MM-DDTHH:mm:ss"
  );
  newIdCardExpirationDate.set({ h: 12, m: 10 });
  const body = {
    ...interimaire,
    birthDate: newBirthDate.format(),
    idCardIssueDate: newIdCardIssueDate.format(),
    idCardExpirationDate: newIdCardExpirationDate.format()
  };
  dispatch({
    type: UPDATE_INTERIMAIRE_IDENTITY_REQUEST
  });
  if (imageArray) {
    for (let i = 0; i < imageArray.length; i++) {
      const body = imageArray[i];
      axios
        .post(UPLOAD_DOCUMENT, body)
        .then(res => {
          dispatch({
            type: UPDATE_INTERIMAIRE_IDENTITY_SUCCESS,
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
        type: UPDATE_INTERIMAIRE_IDENTITY_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const addNewDocument = (imageArray, dispatch) => {
  for (let i = 0; i < imageArray.length; i++) {
    dispatch({
      type: UPDATE_INTERIMAIRE_IDENTITY_REQUEST
    });
    const body = imageArray[i];
    axios
      .post(UPLOAD_DOCUMENT, body)
      .then(res => {
        dispatch({
          type: UPDATE_INTERIMAIRE_IDENTITY_SUCCESS,
          payload: res.data
        });
      })
      .catch(err => console.log(err));
  }
};

export const deleteIdDocument = (body, dispatch) => {
  dispatch({
    type: UPDATE_INTERIMAIRE_IDENTITY_REQUEST
  });
  return axios
    .post(DELETE_DOCUMENT, body)
    .then(res => {
      dispatch({
        type: UPDATE_INTERIMAIRE_IDENTITY_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const removeOneDocument = (body, step, dispatch) => {
  axios
    .post(REMOVE_ONE_DOCUMENT, body)
    .then(res => {
      dispatch({
        type: REMOVE_ONE_DOCUMENT_SUCCESS,
        payload: {
          interimaire: res.data,
          step
        }
      });
    })
    .catch(err => console.log(err));
};

export const setSignalRInterimaire = (
  authToken,
  dispatch,
  setSelectedNotif
) => {
  const connection = new HubConnectionBuilder()
    .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/interimaire", {
      accessTokenFactory: () => authToken
    })
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(result => {
      connection.on("SendNotification", notif => {
        dispatch({
          type: actionTypes.PUSH_NEW_NOTIF,
          payload: notif
        });
        setSelectedNotif(notif);
      });
      connection.on("UpdatePropositions", count => {
        dispatch({
          type: INCREMENT_COUNT_PROPOSITIONS,
          payload: count
        });
      });
      connection.on("UpdateApplications", count => {
        dispatch({
          type: INCREMENT_COUNT_APPLICATIONS,
          payload: count
        });
      });
    })
    .catch(e => console.log("Connection failed: ", e));
};

export const getContractList = (body, dispatch) => {
  dispatch({
    type: GET_CONTRACT_LIST_REQUEST
  });
  axios
    .post(INTERIMAIRE_CONTRACT_LIST_URL, body)
    .then(res => {
      dispatch({
        type: GET_CONTRACT_LIST_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_CONTRACT_LIST_FAILLED
      });
    });
};

export const getDocumentList = (body, dispatch) => {
  dispatch({
    type: GET_DOCUMENTS_LIST_REQUEST
  });
  axios
    .post(INTERIMAIRE_DOCUMENTS_LIST_URL, body)
    .then(res => {
      dispatch({
        type: GET_DOCUMENTS_LIST_SUCCESS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: GET_DOCUMENTS_LIST_FAILLED
      });
    });
};

export const clearStepFiveModal = dispatch => {
  dispatch({
    type: CLEAR_STEP_FIVE_MODAL
  });
};

export const setContractsCount = (count, dispatch) => {
  dispatch({
    type: SET_CONTRACTS_COUNT,
    payload: count
  });
};

export const getNationalitiesList = dispatch => {
  const NATIONALITIES_URL = process.env.REACT_APP_WEBAPI_URL + "api/country";
  axios.get(NATIONALITIES_URL).then(res => {
    dispatch({
      type: GET_NATIONALITIES_LIST,
      payload: res.data
    });
  });
};

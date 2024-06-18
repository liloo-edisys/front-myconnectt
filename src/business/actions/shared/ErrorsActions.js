import * as actionTypes from "constants/constants";

export const deleteErrors = {
  request: () => ({
    type: actionTypes.DELETE_ERRORS_REQUEST,
    payload: {}
  })
};

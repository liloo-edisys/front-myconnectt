import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialUserState = {
  message: ""
};

export const errorReducers = persistReducer(
  { storage, key: "myconnectt-errors", whitelist: ["user", "authToken"] },
  (state = initialUserState, action) => {
    switch (action.type) {
      case "DELETE_ERRORS_REQUEST":
        return { message: "" };
      case "CLIENT_LOGIN_FAILURE":
        return { message: "AUTH.FAILURE" };
      default:
        return state;
    }
  }
);

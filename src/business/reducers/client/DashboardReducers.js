import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialDashboardState = {
  dashboard: {},
  loading: false,
  step: 15
};

export const clientDashboardReducer = persistReducer(
  { storage, key: "myconnectt-dashboard", whitelist: ["user", "authToken"] },
  (state = initialDashboardState, action) => {
    switch (action.type) {
      case actionTypes.GET_DASHBOARD_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_DASHBOARD_SUCCESS: {
        const {
          dashboard: { data: dashboard }
        } = action.payload;
        return { ...state, dashboard: dashboard, loading: false };
      }
      case actionTypes.GET_USER_START_GUIDE: {
        return { ...state, step: action.payload };
      }
      default:
        return state;
    }
  }
);

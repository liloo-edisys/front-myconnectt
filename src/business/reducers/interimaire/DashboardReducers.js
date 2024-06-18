import * as actionTypes from "constants/constants";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialDashboardState = {
  dashboard: {},
  loading: false
};

export const interimaireDashboardReducer = persistReducer(
  { storage, key: "myconnectt-dashboard", whitelist: ["user", "authToken"] },
  (state = initialDashboardState, action) => {
    switch (action.type) {
      case actionTypes.GET_DASHBOARD_INTERIMAIRE_REQUEST: {
        return { ...state, loading: true };
      }
      case actionTypes.GET_DASHBOARD_INTERIMAIRE_SUCCESS: {
        const {
          dashboard: { data: dashboard }
        } = action.payload;
        return { dashboard: dashboard, loading: false };
      }
      default:
        return state;
    }
  }
);

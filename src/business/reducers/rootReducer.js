import * as actionTypes from "constants/constants";

import { reducer as toastrReducer } from "react-redux-toastr";
import { clientAuthReducer } from "reducers/share/authReducers";
import { combineReducers } from "redux";
import { clientApplicantsReducer } from "./client/applicantsReducers";

import { clientCompaniesReducer } from "./client/companiesReducers";
import { clientContactsReducer } from "./client/contactsReducers";
import { clientDashboardReducer } from "./client/dashboardReducers";
import { interimaireDashboardReducer } from "./interimaire/dashboardReducers";
import { backOfficeDashboardReducer } from "./backoffice/dashboardReducers";
import { accountsReducer } from "./backoffice/accountsReducers";
import { clientMissionReducer } from "./client/missionsReducers";
import { clientUserReducer } from "./client/userReducers";
import { clientVacanciesReducer } from "./client/vacanciesReducers";
import { errorReducers } from "./share/errorsReducer";
import { listsReducer } from "./share/listsReducers";
import { InterimairesReducer } from "./interimaire/interimairesReducers";
import { recruiterReducer } from "./backoffice/recruiterReducers";
import { mailTemplatesdReducer } from "./backoffice/mailTemplatesReducers";
import { commercialAgreementsdReducer } from "./backoffice/commercialAgreementsReducers";
import { missionsBackOfficeReducer } from "./backoffice/missionsReducers";

const appReducer = combineReducers({
  auth: clientAuthReducer,
  companies: clientCompaniesReducer,
  contacts: clientContactsReducer,
  dashboard: clientDashboardReducer,
  dashboardReducerData: interimaireDashboardReducer,
  errors: errorReducers,
  lists: listsReducer,
  toastr: toastrReducer,
  user: clientUserReducer,
  vacancies: clientVacanciesReducer,
  missionsReducerData: clientMissionReducer,
  applicants: clientApplicantsReducer,
  interimairesReducerData: InterimairesReducer,
  recruiterReducerData: recruiterReducer,
  backOfficeDashboardReducerData: backOfficeDashboardReducer,
  accountsReducerData: accountsReducer,
  mailTemplatesdReducerData: mailTemplatesdReducer,
  commercialAgreementsdReducerData: commercialAgreementsdReducer,
  missionsBackOfficeReducer: missionsBackOfficeReducer
});
export const rootReducer = (state, action) => {
  if (action.type === actionTypes.CLIENT_LOGOUT_REQUEST) {
    state = undefined;
  }

  return appReducer(state, action);
};

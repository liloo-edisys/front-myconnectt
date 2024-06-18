import * as actionTypes from "constants/constants";

import { reducer as toastrReducer } from "react-redux-toastr";
import { clientAuthReducer } from "reducers/share/AuthReducers";
import { combineReducers } from "redux";
import { clientApplicantsReducer } from "./client/ApplicantsReducers";

import { clientCompaniesReducer } from "./client/CompaniesReducers";
import { clientContactsReducer } from "./client/ContactsReducers";
import { clientDashboardReducer } from "./client/DashboardReducers";
import { interimaireDashboardReducer } from "./interimaire/DashboardReducers";
import { backOfficeDashboardReducer } from "./backoffice/DashboardReducers";
import { accountsReducer } from "./backoffice/AccountsReducers";
import { clientMissionReducer } from "./client/MissionsReducers";
import { clientUserReducer } from "./client/UserReducers";
import { clientVacanciesReducer } from "./client/VacanciesReducers";
import { errorReducers } from "./share/ErrorsReducer";
import { listsReducer } from "./share/ListsReducers";
import { InterimairesReducer } from "./interimaire/InterimairesReducers";
import { recruiterReducer } from "./backoffice/RecruiterReducers";
import { mailTemplatesdReducer } from "./backoffice/MailTemplatesReducers";
import { commercialAgreementsdReducer } from "./backoffice/CommercialAgreementsReducers";
import { missionsBackOfficeReducer } from "./backoffice/MissionsReducers";

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

import { all, call, fork, spawn } from "redux-saga/effects";
import AuthSaga from "./shared/authSagas";
import CompaniesSagas from "./client/companiesSagas";
import ContactsSagas from "./client/contactsSagas";
import DashboardSagas from "./client/dashboardSagas";
import DashboardInterimaireSagas from "./interimaire/dashboardSagas";
import EmailSagas from "./client/emailSagas";
import UserSagas from "./client/userSagas";
import VacanciesSagas from "./client/vacanciesSagas";
import ListsSagas from "./shared/listsSagas";
import MissionsSagas from "./client/missionsSagas";
import ApplicantsSagas from "./client/applicantsSagas";
import InterimairesSagas from "./interimaire/interimairesSagas";
import RecruiterSagas from "./backoffice/recruiterSagas";
import BackOfficeDashboardSagas from "./backoffice/backOfficeDashboardSagas";
import AccountsSagas from "./backoffice/accountsSagas";
import MailTemplatesSagas from "./backoffice/mailTemplatesSagas";
import CommercialAgreementsSagas from "./backoffice/commercialAgreementsSagas";
import ApplicantsBackofficeSagas from "./backoffice/applicantsSagas";


export function* startWatchers() {
  yield all([
    spawn(AuthSaga),
    spawn(CompaniesSagas),
    spawn(ContactsSagas),
    spawn(DashboardSagas),
    spawn(ListsSagas),
    spawn(UserSagas),
    spawn(VacanciesSagas),
    spawn(EmailSagas),
    spawn(MissionsSagas),
    spawn(ApplicantsSagas),
    spawn(InterimairesSagas),
    spawn(DashboardInterimaireSagas),
    spawn(RecruiterSagas),
    spawn(BackOfficeDashboardSagas),
    spawn(AccountsSagas),
    spawn(MailTemplatesSagas),
    spawn(CommercialAgreementsSagas),
    spawn(ApplicantsBackofficeSagas)
  ]);
}

export function* root() {
  yield call(startWatchers);
}

// notice how we now only export the rootSaga
// single entry point to start all Sagas at once
export function* rootSaga() {
  yield fork(root);
}

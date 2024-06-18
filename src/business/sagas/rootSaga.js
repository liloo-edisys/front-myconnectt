import { all, call, fork, spawn } from "redux-saga/effects";
import AuthSaga from "./shared/AuthSagas";

import CompaniesSagas from "./client/CompaniesSagas";
import ContactsSagas from "./client/ContactsSagas";
import DashboardSagas from "./client/DashboardSagas";
import DashboardInterimaireSagas from "./interimaire/DashboardSagas";
import EmailSagas from "./client/EmailSagas";
import UserSagas from "./client/UserSagas";
import VacanciesSagas from "./client/VacanciesSagas";
import ListsSagas from "./shared/ListsSagas";
import MissionsSagas from "./client/MissionsSagas";
import ApplicantsSagas from "./client/ApplicantsSagas";
import InterimairesSagas from "./interimaire/InterimairesSagas";
import RecruiterSagas from "./backoffice/RecruiterSagas";
import BackOfficeDashboardSagas from "./backoffice/BackOfficeDashboardSagas";
import AccountsSagas from "./backoffice/AccountsSagas";
import MailTemplatesSagas from "./backoffice/MailTemplatesSagas";
import CommercialAgreementsSagas from "./backoffice/CommercialAgreementsSagas";
import ApplicantsBackofficeSagas from "./backoffice/ApplicantsSagas";

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

import React, { Suspense, useEffect } from "react";

// import DashboardPage from "components/backoffice/dashboard/DashboardPage";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { getRecruiter } from "actions/backoffice/recruiterActions";

import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout/index.js";

import Extensions from "./components/backoffice/extensions/index.js";
import Interimaires from "./components/backoffice/interimaires/index.js";
import BackOfficeDashboardPageNew from "./components/backoffice/dashboard/backOfficeDashboardPageNew.jsx";
import Contracts from "./components/backoffice/contracts/index.js";
import NewApplicant from "./components/backoffice/new-applicant/index.js";
import CustomersContainer from "../business/containers/customersContainer.js";
import MissionsPage from "./components/backoffice/missions/missionlist/MissionsPage.js";
import NewMission from "./components/backoffice/new-mission/index.js";
import MailTemplatesPage from "./components/backoffice/mailtemplates/mailTemplatesPage.jsx";
import CommercialAgreementsPage from "./components/backoffice/commercialagreements/commercialAgreementsPage.jsx";
import { CustomerOrderPage } from "./components/backoffice/customer-order/index.js";
import FinalStep from "./components/backoffice/new-mission/fields/mission-creator/missionForms/FinalStep.js";
import UsersCard from "./components/backoffice/users/index.js";
import HoursStatement from "./components/backoffice/hours-statement/HoursStatement.js";
import { Jobskills } from "./components/backoffice/jobskill/index.js";
import { Jobtags } from "./components/backoffice/jobtags/index.js";
import { HabilitationList } from "./components/backoffice/habilitations/index.js";
import { AccountsGroup } from "./components/backoffice/account-group/index.js";
import { RemunerationElements } from "./components/backoffice/remuneration-elements/index.js";
import { Jobtitles } from "./components/backoffice/jobtitle/index.js";
import Messenger from "./components/backoffice/messenger/messenger.jsx";
import Declinaisons from "./components/backoffice/declinaisons/declinaisons.jsx";
import Setting from "./components/backoffice/setting/index.js";
import ContactsContainer from "../business/containers/contactsContainerBackoffice.js";
import Statistiques from "./components/backoffice/statistiques/statistiques.jsx";

export default function BaseBackOfficePage(props) {
  const dispatch = useDispatch();
  const { user, mission } = useSelector(
    state => ({
      user: state.auth.user
    }),
    shallowEqual
  );
  useEffect(() => {
    dispatch(getRecruiter.request());
  }, [dispatch]);

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/backoffice-dashboard" />
        }
        <ContentRoute
          path="/backoffice-dashboard"
          component={BackOfficeDashboardPageNew}
        />
        <ContentRoute
          path="/backoffice-dashboard-king"
          component={BackOfficeDashboardPageNew}
        />
        <ContentRoute path="/contacts" component={ContactsContainer} />
        <ContentRoute path="/contracts" component={Contracts} />
        <ContentRoute path="/mission/final-step" component={FinalStep} />
        <ContentRoute path="/missions" component={MissionsPage} />
        <ContentRoute exact path="/mission/create" component={NewMission} />
        <ContentRoute path="/mission/update/:id" component={NewMission} />
        <ContentRoute path="/prolongations" component={Extensions} />
        <ContentRoute path="/interimaires" component={Interimaires} />
        <ContentRoute path="/interimaires-to-check" component={Interimaires} />
        <ContentRoute path="/interimaire/create" component={NewApplicant} />
        <ContentRoute path="/mailtemplates" component={MailTemplatesPage} />
        <ContentRoute path="/users" component={UsersCard} />
        <ContentRoute path="/cra" component={HoursStatement} />
        <ContentRoute path="/jobskills" component={Jobskills} />
        <ContentRoute path="/jobtags" component={Jobtags} />
        <ContentRoute path="/habilitations" component={HabilitationList} />
        <ContentRoute path="/accounts-group" component={AccountsGroup} />
        <ContentRoute path="/jobtitles" component={Jobtitles} />
        <ContentRoute path="/messenger/applicant" component={Messenger} />
        <ContentRoute path="/messenger/client" component={Messenger} />
        <ContentRoute path="/decline/applicant" component={Declinaisons} />
        <ContentRoute path="/decline/client" component={Declinaisons} />
        <ContentRoute path="/statistiques" component={Statistiques} />
        <ContentRoute
          path="/remuneration-elements"
          component={RemunerationElements}
        />
        <ContentRoute
          path="/customer-order/:missionId"
          component={CustomerOrderPage}
        />
        <ContentRoute
          path="/commercialagreements"
          component={CommercialAgreementsPage}
        />
        <ContentRoute
          path="/interimaire/edit/:interimaireId"
          component={NewApplicant}
        />
        <ContentRoute path="/customers" component={CustomersContainer} />
        <ContentRoute path="/setting" component={Setting} />
        <Redirect to="error/error-v1" />
      </Switch>
    </Suspense>
  );
}

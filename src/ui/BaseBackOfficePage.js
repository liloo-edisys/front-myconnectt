import React, { Suspense, useEffect } from "react";

// import DashboardPage from "components/backoffice/dashboard/DashboardPage";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import { getRecruiter } from "actions/backoffice/RecruiterActions";

import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout";

import UnderConstruction from "./components/shared/UnderConstruction";
import Extensions from "./components/backoffice/extensions";
import Interimaires from "./components/backoffice/interimaires";
import BackOfficeDashboardPage from "./components/backoffice/dashboard/BackOfficeDashboardPage";
import BackOfficeDashboardPageNew from "./components/backoffice/dashboard/BackOfficeDashboardPageNew";
import Contracts from "./components/backoffice/contracts";
import NewApplicant from "./components/backoffice/new-applicant";
import CustomersContainer from "../business/containers/CustomersContainer";
import MissionsPage from "./components/backoffice/missions/missionlist/MissionsPage";
import NewMission from "./components/backoffice/new-mission";
import MailTemplatesPage from "./components/backoffice/mailtemplates/MailTemplatesPage";
import CommercialAgreementsPage from "./components/backoffice/commercialagreements/CommercialAgreementsPage";
import { CustomerOrderPage } from "./components/backoffice/customer-order";
import FinalStep from "./components/backoffice/new-mission/fields/mission-creator/missionForms/FinalStep";
import UsersCard from "./components/backoffice/users";
import HoursStatement from "./components/backoffice/hours-statement/HoursStatement";
import { Jobskills } from "./components/backoffice/jobskill";
import { Jobtags } from "./components/backoffice/jobtags";
import { HabilitationList } from "./components/backoffice/habilitations";
import { AccountsGroup } from "./components/backoffice/account-group";
import { RemunerationElements } from "./components/backoffice/remuneration-elements";
import { Jobtitles } from "./components/backoffice/jobtitle";
import Messenger from "./components/backoffice/messenger/Messenger";
import Declinaisons from "./components/backoffice/declinaisons/Declinaisons";
import Setting from "./components/backoffice/setting";
import ContactsContainer from "../business/containers/ContactsContainerBackoffice";
import Statistiques from "./components/backoffice/statistiques/statistiques";

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

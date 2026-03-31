import React, { Suspense, useEffect } from "react";

import { getCompanies } from "actions/client/companiesActions";
import { getContact } from "actions/client/contactsActions";
import DashboardPage from "components/client/dashboard/dashboardPage.jsx";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout/index.js";

import EmailContactModal from "./components/client/Email/emailContactModal.jsx";
import MissionWizardForm from "./components/client/missions/missionForms/missionWizzard.jsx";
import MissionPage from "./components/client/missions/MissionPage/missionPage.jsx";
import CompaniesContainer from "../business/containers/companiesContainer.js";
import MissionsContainer from "../business/containers/missionsContainer.js";
import MissionTemplatesContainer from "../business/containers/missionTemplatesContainer.js";
import AccountInterimairesContainer from "../business/containers/accountInterimairesContainer.js";
import ContactsContainer from "../business/containers/contactsContainer.js";
import ProfileContainer from "../business/containers/profileContainer.js";
import UnderConstruction from "./components/shared/underConstruction.jsx";
import CommercialAgreement from "./components/client/commercial-agreement/index.js";
import ContractsClient from "./components/client/missions/contracts-client/index.js";
import Extensions from "./components/client/missions/extensions/index.js";
import { Calendar } from "./components/client/calendar/index.js";
import { HoursStatement } from "./components/client/hours-statement/index.js";
import CustomerOrderPage from "./components/client/customer-order/customerOrderPage.jsx";
import Reciepts from "./components/client/missions/reciepts/Reciepts.js";

export default function BasePage(props) {
  const dispatch = useDispatch();
  const { user, mission } = useSelector(
    state => ({
      user: state.auth.user,
      mission: state.missionsReducerData.mission
    }),
    shallowEqual
  );
  useEffect(() => {
    dispatch(getContact.request());
    dispatch(getCompanies.request());
  }, [dispatch]);

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/dashboard" />
        }
        <ContentRoute path="/dashboard" component={DashboardPage} />
        <ContentRoute path="/companies" component={CompaniesContainer} />
        <ContentRoute path="/contacts" component={ContactsContainer} />
        <ContentRoute path="/profile" component={ProfileContainer} />
        <ContentRoute path="/contrats" component={ContractsClient} />
        <ContentRoute path="/calendar" component={Calendar} />
        <ContentRoute
          path="/commercial-agreement"
          component={CommercialAgreement}
        />
        <ContentRoute path="/mission" component={MissionPage} />
        <ContentRoute path="/factures" component={Reciepts} />
        <ContentRoute path="/missions" component={MissionsContainer} />
        <ContentRoute path="/templates" component={MissionTemplatesContainer} />
        <ContentRoute path="/terms" component={UnderConstruction} />
        <ContentRoute path="/factures" component={UnderConstruction} />
        <ContentRoute path="/my-extensions" component={Extensions} />
        <ContentRoute path="/prolongations" component={ContractsClient} />
        <ContentRoute path="/cra" component={HoursStatement} />
        <ContentRoute
          path="/profiles"
          component={AccountInterimairesContainer}
        />
        <ContentRoute path="/matching" component={UnderConstruction} />
        <ContentRoute path="/remunerations" component={UnderConstruction} />

        <ContentRoute
          path="/mission-create"
          component={props => (
            <MissionWizardForm
              userDetails={user}
              mission={mission}
              {...props}
            />
          )}
        />
        <ContentRoute path={`/contact`}>
          {({ history, match }) => (
            <EmailContactModal
              show={match != null}
              history={history}
              onHide={() => {
                history.goBack();
              }}
            />
          )}
        </ContentRoute>
        <ContentRoute
          path="/customer-order/:missionId"
          component={CustomerOrderPage}
        />
        <Redirect to="error/error-v1" />
      </Switch>
    </Suspense>
  );
}

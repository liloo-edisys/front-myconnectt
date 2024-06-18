import React, { Suspense, useEffect } from "react";

import { getCompanies } from "actions/client/CompaniesActions";
import { getContact } from "actions/client/ContactsActions";
import DashboardPage from "components/client/dashboard/DashboardPage";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout";

import EmailContactModal from "./components/client/Email/EmailContactModal";
import MissionWizardForm from "./components/client/missions/missionForms/MissionWizzard";
import MissionPage from "./components/client/missions/MissionPage/MissionPage";
import CompaniesContainer from "./containers/CompaniesContainer";
import MissionsContainer from "./containers/MissionsContainer";
import MissionTemplatesContainer from "./containers/MissionTemplatesContainer";
import AccountInterimairesContainer from "./containers/AccountInterimairesContainer";
import ContactsContainer from "./containers/ContactsContainer";
import ProfileContainer from "./containers/ProfileContainer";
import UnderConstruction from "./components/shared/UnderConstruction";
import CommercialAgreement from "./components/client/commercial-agreement";
import ContractsClient from "./components/client/missions/contracts-client";
import Extensions from "./components/client/missions/extensions";
import { Calendar } from "./components/client/calendar";
import { HoursStatement } from "./components/client/hours-statement";
import CustomerOrderPage from "./components/client/customer-order/CustomerOrderPage";
import Reciepts from "./components/client/missions/reciepts/Reciepts";

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

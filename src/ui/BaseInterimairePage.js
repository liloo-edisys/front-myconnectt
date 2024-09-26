import React, { Suspense } from "react";

import DashboardPage from "components/interimaire/dashboard/dashboardInterimairePage.jsx";
import { Redirect, Switch } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout";

import UnderConstruction from "./components/shared/underConstruction.jsx";
import InterimaireMatchingContainer from "../business/containers/interimaireMatchingContainer.js";
import InterimaireMissionsContainer from "../business/containers/interimaireMissionsContainer.js";
import InterimairePropositionsContainer from "../business/containers/interimairePropositionsContainer.js";
import InterimaireApplicationsContainer from "../business/containers/interimaireApplicationsContainer.js";
import InterimaireFavoritesContainer from "../business/containers/interimaireFavoritesContainer.js";
import ProfileWizzard from "./components/interimaire/profile/profileForms/ProfileWizzard";
import { shallowEqual, useSelector } from "react-redux";
import Chat from "./components/interimaire/signalr/Chat";
import Contracts from "./components/interimaire/missions/contracts";


import EmailContactModal from "./components/client/Email/emailContactModal.jsx";
import Documents from "./components/interimaire/missions/documents";
import HoursStatement from "./components/interimaire/hours-statement/HoursStatement";

export default function BaseInterimairePage(props) {
  let { user } = useSelector(
    ({ auth, user }) => ({
      user: user.user
    }),
    shallowEqual
  );

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <Switch>
        {
          /* Redirect from root URL to /dashboard. */
          <Redirect exact from="/" to="/int-dashboard" />
        }

        <ContentRoute
          path="/int-profile-edit"
          component={props => <ProfileWizzard userDetails={user} {...props} />}
        />
        {/*<ContentRoute path="/int-dashboard" component={DashboardPage} />*/}
        <ContentRoute path="/int-dashboard" component={DashboardPage} />
        {/*<ContentRoute path="/int-dashboard" component={Home} />*/}
        <ContentRoute path="/search" component={InterimaireMissionsContainer} />
        <ContentRoute
          path="/favorites"
          component={InterimaireFavoritesContainer}
        />
        <ContentRoute
          path="/applications"
          component={InterimaireApplicationsContainer}
        />
        <ContentRoute
          path="/matching"
          component={InterimaireMatchingContainer}
        />
        <ContentRoute
          path="/propositions"
          component={InterimairePropositionsContainer}
        />
        <ContentRoute path="/contracts" component={Contracts} />
        <ContentRoute path="/documents" component={Documents} />
        <ContentRoute path="/rhs" component={UnderConstruction} />
        <ContentRoute path="/bulletins" component={UnderConstruction} />
        <ContentRoute path="/certificates" component={UnderConstruction} />
        <ContentRoute path="/chat" component={Chat} />
        <ContentRoute path="/cra" component={HoursStatement} />

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

        <Redirect to="error/int-error-v1" />
      </Switch>
    </Suspense>
  );
}

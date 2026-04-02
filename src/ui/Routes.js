/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import React from "react";

import { ErrorPage1 } from "components/errors/ErrorPage1";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, Route } from "react-router-dom";

import { Layout } from "../_metronic/layout";
import { OTPRequest, OTPVerify } from "../ui/components/client/auth";
import LogoutBackOffice from "../ui/components/backoffice/auth/Logout";
import BaseBackOfficePage from "./BaseBackOfficePage";
import DocumentDisplay from "./components/shared/DocumentDisplay";

export function Routes() {
  const dispatch = useDispatch();

  // Only BackOffice authentication is supported
  let { isAuthorized, isBackOffice } = useSelector(
    ({ auth }) => ({
      isAuthorized: auth.user != null && auth.user.userType === 2,
      isBackOffice: auth.user != null && auth.user.userType === 2
    }),
    shallowEqual
  );

  return (
    <Switch>
      {/* BackOffice OTP Authentication Routes */}
      <Route path="/auth/otp-request" component={OTPRequest} />
      <Route path="/auth/otp-verify" component={OTPVerify} />
      <Route path="/auth/login" component={OTPRequest} />
      <Route path="/auth" component={OTPRequest} />

      {/* Utility routes */}
      <Route path="/error" component={ErrorPage1} />
      <Route path="/backoffice-logout" component={LogoutBackOffice} />
      <Route path="/logout" component={LogoutBackOffice} />

      {/* Document display */}
      <Route
        path="/document/display/:documentUrl"
        component={DocumentDisplay}
      />

      {/* BackOffice Main Application */}
      {!isAuthorized ? (
        /* Redirect to login if not authorized */
        <Redirect to="/auth/login" />
      ) : isBackOffice ? (
        /* BackOffice Layout */
        <Layout>
          <BaseBackOfficePage />
        </Layout>
      ) : (
        /* Invalid user type - redirect to login */
        <Redirect to="/auth/login" />
      )}
    </Switch>
  );
}

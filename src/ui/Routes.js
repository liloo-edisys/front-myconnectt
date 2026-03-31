/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import React, { useEffect } from "react";

import { ErrorPage1 } from "components/errors/ErrorPage1";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, Route } from "react-router-dom";

import { Layout } from "../_metronic/layout";
import {
  Logout,
  AuthPage,
  OTPRequest,
  OTPVerify
} from "../ui/components/client/auth";
import { AuthBackOffice } from "../ui/components/backoffice/auth/AuthBackOffice";
import LogoutBackOffice from "../ui/components/backoffice/auth/Logout";
import { AuthInterimaire } from "../ui/components/interimaire/auth/AuthInterimaire";
import LogoutInterimaire from "../ui/components/interimaire/auth/LogoutInterimaire";
import RegisterConfirmInterimaire from "../ui/components/interimaire/auth/RegisterConfirmInterimaire";
import RegisterConfirm from "../ui/components/client/auth/RegisterConfirm";
import ResetPassword from "../ui/components/client/auth/ResetPassword";
import { getNationalitiesList } from "../business/actions/interimaire/InterimairesActions";

import BasePage from "./BasePage";
import BaseInterimairePage from "./BaseInterimairePage";
import BaseBackOfficePage from "./BaseBackOfficePage";
import DocumentDisplay from "./components/shared/DocumentDisplay";

export function Routes() {
  const { step } = useSelector(state => state.interimairesReducerData);
  const dispatch = useDispatch();
  useEffect(() => {
    getNationalitiesList(dispatch);
  }, []);
  let { isAuthorized, isInterimaire, isBackOffice, isCustomer } = useSelector(
    ({ auth, user }) => ({
      isAuthorized: auth.user != null,
      isInterimaire: auth.user != null ? auth.user.userType === 0 : false,
      isCustomer: auth.user != null ? auth.user.userType === 1 : false,
      isBackOffice: auth.user != null ? auth.user.userType === 2 : false,
      user: user.user
    }),
    shallowEqual
  );

  if (!isAuthorized) {
    isInterimaire = window.location.href.indexOf("int-") > 0;
    if (!isInterimaire)
      isBackOffice = window.location.href.indexOf("backoffice-") > 0;
  }

  return (
    <Switch>
      {/* OTP Authentication Routes - Must come before catch-all auth routes */}
      <Route path="/auth/otp-request" component={OTPRequest} />
      <Route path="/auth/otp-verify" component={OTPVerify} />
      <Route path="/auth/login" component={OTPRequest} />

      {/* Other specific auth routes */}
      <Route path="/auth/backoffice-login" component={AuthBackOffice} />
      <Route path="/auth/int-login" component={AuthInterimaire} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/auth/register-confirm" component={RegisterConfirm} />

      {/* Utility routes */}
      <Route path="/error" component={ErrorPage1} />
      <Route path="/logout" component={Logout} />
      <Route path="/int-logout" component={LogoutInterimaire} />
      <Route path="/backoffice-logout" component={LogoutBackOffice} />

      {/* Catch-all auth route - only matches /auth exactly or sub-routes not defined above */}
      {!isAuthorized ? (
        /*Render auth page when user at `/auth` and not authorized.*/
        isInterimaire ? (
          <Route path="/auth">
            <AuthInterimaire />
          </Route>
        ) : isBackOffice ? (
          <Route path="/auth">
            <AuthBackOffice />
          </Route>
        ) : (
          <Route path="/auth">
            <AuthPage />
          </Route>
        )
      ) : (
        /*Otherwise redirect to root page (`/`)*/
        <Redirect from="/auth" to="/" />
      )}

      {/* Additional routes */}
      <Route
        path="/document/display/:documentUrl"
        component={DocumentDisplay}
      />
      <Route
        path="/auth/int-register-confirm"
        component={RegisterConfirmInterimaire}
      />

      {/* Default redirects and main layout */}
      {!isAuthorized ? (
        isInterimaire ? (
          /*Redirect to `/auth` when user is not authorized*/
          /*<Redirect to="/auth/int-login" />*/
          <Redirect to="/auth/int-register-confirm-code" />
        ) : (
          <Redirect to="/auth/login" />
        )
      ) : isInterimaire ? (
        <div style={{ overflow: (step === 0 || step === 3) && "hidden" }}>
          <Layout>
            <BaseInterimairePage />
          </Layout>
        </div>
      ) : isBackOffice ? (
        <Layout>
          <BaseBackOfficePage />
        </Layout>
      ) : isCustomer ? (
        <Layout>
          <BasePage />
        </Layout>
      ) : (
        <Layout />
      )}
    </Switch>
  );
}

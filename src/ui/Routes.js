/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import React, { useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Redirect, Switch, Route } from "react-router-dom";

import { Layout } from "../_metronic/layout";
import { getNationalitiesList } from "../business/actions/interimaire/interimairesActions.js";


const ErrorPage1 = lazy(() => import("components/errors/errorPage1.jsx"));
const Logout = lazy(() => import("../ui/components/client/auth/logout.jsx"));
const AuthPage = lazy(() => import("../ui/components/client/auth/authPage.jsx"));
const AuthBackOffice = lazy(() => import("../ui/components/backoffice/auth/authBackOffice.jsx"));
const LogoutBackOffice = lazy(() => import("../ui/components/backoffice/auth/logout.jsx"));
const AuthInterimaire = lazy(() => import("../ui/components/interimaire/auth/authInterimaire.jsx"));
const LogoutInterimaire = lazy(() => import("./components/interimaire/auth/logoutInterimaire.jsx"));
const RegisterConfirmInterimaire = lazy(() => import("./components/interimaire/auth/registerConfirmInterimaire.jsx"));
const RegisterConfirm = lazy(() => import("../ui/components/client/auth/registerConfirm.jsx"));
const ResetPassword = lazy(() => import("./components/client/auth/resetPassword.jsx"));
const BasePage = lazy(() => import("./basePage"));
const BaseInterimairePage = lazy(() => import("./baseInterimairePage.js"));
const BaseBackOfficePage = lazy(() => import("./baseBackOfficePage.js"));
const DocumentDisplay = lazy(() => import("./components/shared/documentDisplay.jsx"));

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
      {!isAuthorized ? (
        /*Render auth page when user at `/auth` and not authorized.*/
        isInterimaire ? (
          <Route>
            <AuthInterimaire />
          </Route>
        ) : isBackOffice ? (
          <Route>
            <AuthBackOffice />
          </Route>
        ) : (
          <Route>
            <AuthPage />
          </Route>
        )
      ) : (
        /*Otherwise redirect to root page (`/`)*/
        <Redirect from="/auth" to="/" />
      )}

      <Route path="/error" component={ErrorPage1} />
      <Route path="/logout" component={Logout} />
      <Route path="/int-logout" component={LogoutInterimaire} />
      <Route path="/backoffice-logout" component={LogoutBackOffice} />
      <Route path="/auth/login" component={AuthPage} />
      <Route path="/auth/backoffice-login" component={AuthBackOffice} />
      <Route path="/auth/int-login" component={AuthInterimaire} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/auth/register-confirm" component={RegisterConfirm} />
      <Route
        path="/document/display/:documentUrl"
        component={DocumentDisplay}
      />
      <Route
        path="/auth/int-register-confirm"
        component={RegisterConfirmInterimaire}
      />
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

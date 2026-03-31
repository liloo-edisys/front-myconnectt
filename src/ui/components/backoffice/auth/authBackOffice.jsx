/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import { Switch, Redirect } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import { ContentRoute } from "../../../../_metronic/layout";

import Login from "./login.jsx";
import ForgotPassword from "./forgotPassword.jsx";
import ResetPassword from "./resetPassword.jsx";
import "../../../../_metronic/_assets/sass/pages/login/classic/login-5.scss";

export function AuthBackOffice() {
  const today = new Date().getFullYear();
  return (
    <>
      <div className="d-flex flex-column flex-root"> 
        <div
          className="login login-5 login-signin-on d-flex flex-row-fluid"
          id="kt_login"
        >
          <div className="d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid background-interimaire box-shadow-primary">
            <div className="card card-custom login-form text-white p-7 position-relative overflow-hidden border-top-backoffice">
              <img
                alt="Logo MyConnectt"
                className="logo_size"
                src={toAbsoluteUrl("/media/logos/logo-myconnectt-color.png")}
              />
              <div className="login-signin">
                <Switch>
                  <ContentRoute
                    path="/auth/backoffice-login"
                    component={Login}
                  />
                  <ContentRoute
                    path="/auth/backoffice-forgot-password"
                    component={ForgotPassword}
                  />
                  <ContentRoute
                    path="/auth/backoffice-reset-password"
                    component={ResetPassword}
                  />
                  <Redirect
                    from="/auth"
                    exact={true}
                    to="/auth/backoffice-login"
                  />
                </Switch>
              </div>
              <div className="separator my-10 mx-30 separator-backoffice"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

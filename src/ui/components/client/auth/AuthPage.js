/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import { FormattedMessage } from "react-intl";
import { Link, Switch, Redirect } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import { ContentRoute } from "../../../../_metronic/layout";

import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import RegisterConfirm from "./RegisterConfirm";
import Registration from "./Registration";
import "../../../../_metronic/_assets/sass/pages/login/classic/login-5.scss";
import ResetPassword from "./ResetPassword";

export function AuthPage() {
  const today = new Date().getFullYear();
  return (
    <>
      <div className="d-flex flex-column flex-root">
        <div
          className="login login-5 login-signin-on d-flex flex-row-fluid"
          id="kt_login"
        >
          <div className="d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid background-interimaire box-shadow-primary">
            <div className="card card-custom login-form text-white p-7 position-relative overflow-hidden border-top-client">
              <img
                alt="Logo MyConnectt"
                className="logo_size"
                src={toAbsoluteUrl("/media/logos/logo-myconnectt-color.png")}
              />
              <div className="login-signin">
                <Switch>
                  <ContentRoute path="/auth/login" component={Login} />
                  <ContentRoute
                    path="/auth/registration"
                    component={Registration}
                  />
                  <ContentRoute
                    path="/auth/forgot-password"
                    component={ForgotPassword}
                  />
                  <ContentRoute
                    path="/auth/reset-password"
                    component={ResetPassword}
                  />
                  <ContentRoute
                    path="/auth/register-confirm/"
                    component={RegisterConfirm}
                  />

                  <Redirect from="/auth" exact={true} to="/auth/login" />
                  <Redirect to="/auth/login" />
                </Switch>
              </div>
              <div className="separator my-10 mx-30 separator-client"></div>
              <div className="d-none flex-column-auto d-lg-flex justify-content-between mt-10">
                <div className="opacity-70 font-weight-bold">
                  <a
                    href="https://myconnectt.fr/"
                    target="blank"
                    className="text-dark"
                  >
                    <FormattedMessage id="TEXT.COPYRIGHT" />{" "}
                    <span className="text-dark font-weight-bold mr-2">
                      {today.toString()}
                    </span>
                    &copy;
                  </a>
                </div>
                <div className="d-flex">
                  <a
                    href="https://myconnectt.fr/mentions-legales/"
                    target="blank"
                    className="text-dark ml-10"
                  >
                    <FormattedMessage id="TEXT.LEGAL" />
                  </a>
                  <a
                    href="https://myconnectt.fr/protection-des-donnees-personnelles/"
                    target="blank"
                    className="text-dark ml-10"
                  >
                    <FormattedMessage id="TEXT.PRIVACY" />
                  </a>
                  <a
                    href="https://myconnectt.fr/contact"
                    target="blank"
                    className="text-dark ml-10"
                  >
                    <FormattedMessage id="TEXT.CONTACT" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

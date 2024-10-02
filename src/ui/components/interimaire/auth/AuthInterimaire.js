/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import { FormattedMessage } from "react-intl";
import { Link, Switch, Redirect } from "react-router-dom";

import { ContentRoute } from "../../../../_metronic/layout";

import ForgotPasswordInterimaire from "./ForgotPasswordInterimaire";
import LoginInterimaire from "./LoginInterimaire";
import RegisterConfirmInterimaire from "./RegisterConfirmInterimaire";
import RegisterInterimaire from "./RegisterInterimaire";
import "../../../../_metronic/_assets/sass/pages/login/classic/login-1.scss";
import ResetPasswordInterimaire from "./ResetPasswordInterimaire";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import RegisterConfirmSms from "./RegisterConfirmSms";
import "./AuthInterimaire.css";

export function AuthInterimaire() {
  const today = new Date().getFullYear();
  return (
    <>
      <div className="d-flex flex-column flex-root">
        <div
          className="login login-5 login-signin-on d-flex flex-row-fluid"
          id="kt_login"
        >
          <div className="d-flex flex-center bgi-size-cover bgi-no-repeat flex-row-fluid background-interimaire box-shadow-primary">
            <div className="card card-custom login-form text-white p-7 position-relative overflow-hidden border-top-interimaire">
              <img
                alt="Logo MyConnectt"
                className="logo_size"
                src={toAbsoluteUrl("/media/logos/logo-myconnectt-color.png")}
              />
              <div className="login-signin">
                <Switch>
                  <ContentRoute
                    path="/auth/int-login"
                    component={LoginInterimaire}
                  />
                  <ContentRoute
                    path="/auth/int-register"
                    component={RegisterInterimaire}
                  />
                  <ContentRoute
                    path="/auth/int-register-confirm-code"
                    component={RegisterConfirmSms}
                  />
                  <ContentRoute
                    path="/auth/int-forgot-password"
                    component={ForgotPasswordInterimaire}
                  />
                  <ContentRoute
                    path="/auth/int-reset-password"
                    component={ResetPasswordInterimaire}
                  />
                  <ContentRoute
                    path="/auth/int-register-confirm/"
                    component={RegisterConfirmInterimaire}
                  />
                  <Redirect from="/auth" exact={true} to="/auth/int-login" />
                  {/*<Redirect to="/auth/int-login" />*/}
                  <Redirect to="/auth/int-register-confirm-code" />
                </Switch>
              </div>
              <div className="separator my-10 mx-30 separator-interimaire"></div>
              <div className="d-none flex-column-auto d-lg-flex justify-content-between">
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
              <div className="display-mobile">
                <div className="opacity-70 font-weight-bold">
                  <a
                    href="https://myconnectt.fr/"
                    target="blank"
                    className="text-dark"
                  >
                    <FormattedMessage id="TEXT.COPYRIGHT" />{" "}
                    <span className="text-dark font-weight-bold">
                      {today.toString()}
                    </span>
                    &copy;
                  </a>
                </div>
                <a
                  href="https://myconnectt.fr/mentions-legales/"
                  target="blank"
                  className="text-dark mobile-link"
                >
                  <FormattedMessage id="TEXT.LEGAL" />
                </a>
                <a
                  href="https://myconnectt.fr/protection-des-donnees-personnelles/"
                  target="blank"
                  className="text-dark mobile-link"
                >
                  <FormattedMessage id="TEXT.PRIVACY" />
                </a>
                <a
                  href="https://myconnectt.fr/contact"
                  target="blank"
                  className="text-dark mobile-link"
                >
                  <FormattedMessage id="TEXT.CONTACT" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

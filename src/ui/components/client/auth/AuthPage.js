import React from "react";
import Login from "./Login";
import Registration from "./Registration";
import EmailVerification from "./EmailVerification";
import RegisterConfirm from "./RegisterConfirm";
import ForgotPassword from "./ForgotPassword";
import { Link, Switch, Redirect } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import { ContentRoute } from "../../../../_metronic/layout";
import "../../../../_metronic/_assets/sass/pages/login/classic/login-5.scss";

export function AuthPage() {
  return (
    <div className="d-flex flex-root h-100">
      {/* Main login container */}
      <div className=" h-100 w-100">
        <div
          style={{ backgroundColor: "#F3F6F9", width: "100%", height: "100%" }}
        >
          {/* Login content */}
          <div className="d-flex flex-column flex-column-fluid w-100 h-100">
            <Switch>
              <ContentRoute path="/auth/login" component={Login} />
              <ContentRoute
                path="/auth/registration"
                component={Registration}
              />
              <ContentRoute
                path="/auth/register-confirm"
                component={RegisterConfirm}
              />
              <ContentRoute
                path="/auth/email-confirm"
                component={EmailVerification}
              />
              <ContentRoute
                path="/auth/forgot-password"
                component={ForgotPassword}
              />
              <Redirect exact={true} to="/auth/login" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

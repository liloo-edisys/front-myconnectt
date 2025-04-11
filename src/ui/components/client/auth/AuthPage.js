import React from "react";
import Login from "./Login";
import Registration from "./Registration";
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
          {/* Logo
          <div className="d-flex flex-left mb-15 mt-5">
              <Link to="/">
                <img
                  alt="Logo"
                  src={toAbsoluteUrl("/media/logos/logo-myconnectt-color.png")}
                  className="max-h-75px"
                />
              </Link>
            </div> */}

          {/* Login content */}
          <div className="d-flex flex-column flex-column-fluid w-100 h-100">
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
              <Redirect from="/auth" exact={true} to="/auth/login" />
              <Redirect to="/auth/login" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}

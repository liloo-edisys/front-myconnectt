import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";

import { ErrorPage1 } from "./errorPage1.jsx";
import { ErrorPage2 } from "./errorPage2.jsx";
import { ErrorPage3 } from "./errorPage3.jsx";
import { ErrorPage4 } from "./errorPage4.jsx";
import { ErrorPage5 } from "./errorPage5.jsx";
import { ErrorPage6 } from "./errorPage6.jsx";

export default function ErrorsPage() {
  return (
    <Switch>
      <Redirect from="/error" exact={true} to="/error/error-v1" />
      <Route path="/error/error-v1" component={ErrorPage1} />
      <Route path="/error/error-v2" component={ErrorPage2} />
      <Route path="/error/error-v3" component={ErrorPage3} />
      <Route path="/error/error-v4" component={ErrorPage4} />
      <Route path="/error/error-v5" component={ErrorPage5} />
      <Route path="/error/error-v6" component={ErrorPage6} />
    </Switch>
  );
}


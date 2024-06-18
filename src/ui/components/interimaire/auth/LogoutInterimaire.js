import React, { Component } from "react";

import { logout } from "actions/shared/AuthActions";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import { LayoutSplashScreen } from "../../../../_metronic/layout";

class LogoutInterimaire extends Component {
  componentDidMount() {
    this.props.dispatch(logout.request());
  }

  render() {
    const { hasAuthToken } = this.props;
    return hasAuthToken ? (
      <LayoutSplashScreen />
    ) : (
      <Redirect to="/auth/int-login" />
    );
  }
}

export default connect(
  ({ auth }) => ({ hasAuthToken: Boolean(auth.authToken) }),
  null
)(LogoutInterimaire);

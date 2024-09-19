import React, { Component } from "react";

import { logout } from "actions/shared/authActions";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import { LayoutSplashScreen } from "../../../../_metronic/layout";

class Logout extends Component {
  componentDidMount() {
    this.props.dispatch(logout.request());
  }

  render() {
    const { hasAuthToken } = this.props;
    return hasAuthToken ? (
      <LayoutSplashScreen />
    ) : (
      <Redirect to="/auth/login" />
    );
  }
}

export default connect(
  ({ auth }) => ({ hasAuthToken: Boolean(auth.authToken) }),
  null
)(Logout);

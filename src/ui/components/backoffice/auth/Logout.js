import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";
import { LayoutSplashScreen } from "../../../../_metronic/layout";
import { logout } from "actions/shared/AuthActions";

function LogoutBackOffice(props) {
  const { hasAuthToken } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout.request());
  }, [dispatch]);
  return hasAuthToken ? (
    <LayoutSplashScreen />
  ) : (
    <Redirect to="/auth/backoffice-login" />
  );
}

export default LogoutBackOffice;

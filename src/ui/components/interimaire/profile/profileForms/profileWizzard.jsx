import React from "react";
import { useIntl } from "react-intl";
import ProfileWizzardClass from "./profileWizzardClass.jsx";

function ProfileWizzard(props) {
  const intl = useIntl();
  return <ProfileWizzardClass intl={intl} {...props} />;
}

export default ProfileWizzard;

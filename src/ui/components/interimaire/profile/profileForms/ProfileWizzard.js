import React from "react";
import { useIntl } from "react-intl";
import ProfileWizzardClass from "./ProfileWizzardClass";

function ProfileWizzard(props) {
  const intl = useIntl();
  return <ProfileWizzardClass intl={intl} {...props} />;
}

export default ProfileWizzard;

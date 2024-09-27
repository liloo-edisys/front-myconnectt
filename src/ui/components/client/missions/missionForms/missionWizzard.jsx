import React from "react";
import { useIntl } from "react-intl";
import MissionWizardFormClass from "./missionWizzardClass.jsx";

function MissionWizardForm(props) {
  const intl = useIntl();
  return <MissionWizardFormClass intl={intl} {...props} />;
}

export default MissionWizardForm;

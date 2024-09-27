import React from "react";
import MissionCreatorClass from "./missionCreatorClass.jsx";
import { useIntl } from "react-intl";

function MissionCreator(props) {
  const intl = useIntl();
  return <MissionCreatorClass intl={intl} {...props} />;
}

export default MissionCreator;

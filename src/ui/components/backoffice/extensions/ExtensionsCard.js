import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import ExtensionsTable from "./ExtensionsTable";

function ExtensionsCard(props) {
  const history = useHistory();
  const intl = useIntl();
  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({ id: "MISSION.EXTENTION.LIST.TITLE" })}
      >
        <button
          type="button"
          className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
          onClick={() => history.goBack()}
        >
          Retour
        </button>
      </CardHeader>
      <CardBody>
        <ExtensionsTable />
      </CardBody>
    </Card>
  );
}

export default ExtensionsCard;

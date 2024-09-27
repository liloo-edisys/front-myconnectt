import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";

//import MissionsTable from "./missionsTable.jsx";
import RecieptsTable from "./RecieptsTable";

function DocumentsCard(props) {
  const intl = useIntl();
  const history = useHistory();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "MISSION.INVOICE.TITLE" })}>
        <div className="contract_search_button_container">
          <button
            type="button"
            className="btn btn-light-primary contract_search_button"
            onClick={() => history.goBack()}
          >
            Retour
          </button>
        </div>
      </CardHeader>
      <CardBody>
        <RecieptsTable />
      </CardBody>
    </Card>
  );
}

export default DocumentsCard;

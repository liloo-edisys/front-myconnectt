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

//import MissionsTable from "./MissionsTable";
import DocumentsTable from "./DocumentsTable";

function DocumentsCard(props) {
  const intl = useIntl();
  const history = useHistory();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "MISSION.DOCUMENTS.TITLE" })}>
        <div className="contract_search_button_container">
          <button
            type="button"
            className="btn btn-light-primary contract_search_button"
            onClick={() => history.goBack()}
          >
            Retour
          </button>
          <NavLink to="/cra">
            <button className="btn btn-light-info contract_search_button">
              {intl.formatMessage({ id: "MODEL.CONTACT.SHIFTS" })}
            </button>
          </NavLink>
          <NavLink to="/contracts">
            <button className="btn btn-light-success contract_search_button">
              {intl.formatMessage({ id: "TEXT.MY.CONTRACTS" })}
            </button>
          </NavLink>
        </div>
      </CardHeader>
      <CardBody>
        <DocumentsTable />
      </CardBody>
    </Card>
  );
}

export default DocumentsCard;

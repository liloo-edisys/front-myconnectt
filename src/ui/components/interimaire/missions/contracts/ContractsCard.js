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
import ContractsTable from "./ContractsTable";
import "./styles.scss";

function ContractsCard(props) {
  const history = useHistory();
  const intl = useIntl();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "MISSION.CONTRACTS.TITLE" })}>
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
          <NavLink to="/documents">
            <button className="btn btn-light-warning contract_search_button">
              {intl.formatMessage({ id: "TEXT.MY.DOCUMENTS" })}
            </button>
          </NavLink>
        </div>
      </CardHeader>
      <CardBody>
        <ContractsTable />
      </CardBody>
    </Card>
  );
}

export default ContractsCard;

import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../../_metronic/_partials/controls";
import "./styles.scss";

//import MissionsTable from "./MissionsTable";
import ContractsTable from "./ContractsTable";

function ContractsCard(props) {
  const intl = useIntl();
  return (
    <Card className="contract-table-width-100">
      <CardHeader title={intl.formatMessage({ id: "CONTRACTS.LIST.TITLE" })}>
        <NavLink to="/documents">
          {/*<button className="btn btn-warning mt-5">
            {intl.formatMessage({ id: "TEXT.MY.DOCUMENTS" })}
          </button>*/}
        </NavLink>
      </CardHeader>
      <CardBody>
        <ContractsTable />
      </CardBody>
    </Card>
  );
}

export default ContractsCard;

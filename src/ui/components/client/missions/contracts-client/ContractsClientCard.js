import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";

//import MissionsTable from "./missionsTable.jsx";
import ContractsClientTable from "./ContractsClientTable";

function ContractsClientCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "MISSION.CONTRACTS.TITLE" })}>
        <div>
          <NavLink
            to="my-extensions"
            className="btn btn-light-warning btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
          >
            Mes demandes de prolongation
          </NavLink>
          <NavLink
            to="calendar"
            className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
          >
            <FormattedMessage id="TEXT.SEE.CALENDAR" />
          </NavLink>
        </div>
      </CardHeader>
      <CardBody>
        <ContractsClientTable />
      </CardBody>
    </Card>
  );
}

export default ContractsClientCard;

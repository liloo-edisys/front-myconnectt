import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import ContractsTable from "./ContractsTable";

function ContractsCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({ id: "MISSION.CONTRACTS.TITLE" })}
      ></CardHeader>
      <CardBody>
        <ContractsTable />
      </CardBody>
    </Card>
  );
}

export default ContractsCard;

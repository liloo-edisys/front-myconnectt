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
import ApplicationsTable from "./applicationsTable.jsx";

function ApplicationsCard(props) {
  const intl = useIntl();
  return (
    <Card className="contract-table-width-100">
      <CardHeader
        title={intl.formatMessage({ id: "OFFERS.LIST.TITLE" })}
      ></CardHeader>
      <CardBody>
        <ApplicationsTable />
      </CardBody>
    </Card>
  );
}

export default ApplicationsCard;

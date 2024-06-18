import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

import HabilitationsTable from "./HabilitationsTable";

function HabilitationsCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "TEXT.HABILITATION.TITLE" })}>
        <NavLink
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          to="/habilitations/new-habilitation"
        >
          <FormattedMessage id="MODEL.CREATE.HABILITATION.TITLE" />
        </NavLink>
      </CardHeader>
      <CardBody>
        <HabilitationsTable />
      </CardBody>
    </Card>
  );
}

export default HabilitationsCard;

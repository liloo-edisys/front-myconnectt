import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

import RemunerationElementsTable from "./remunerationElementsTable.jsx";

function RemunerationElementsCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({ id: "TEXT.REMUNERATION.ELEMENT.TITLE" })}
      >
        <NavLink
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          to="/remuneration-elements/new-remuneration-element"
        >
          <FormattedMessage id="MODEL.CREATE.REMUNERATION.ELEMENT.TITLE" />
        </NavLink>
      </CardHeader>
      <CardBody>
        <RemunerationElementsTable />
      </CardBody>
    </Card>
  );
}

export default RemunerationElementsCard;

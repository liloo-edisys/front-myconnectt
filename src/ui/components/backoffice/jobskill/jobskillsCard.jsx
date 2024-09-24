import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

import JobskillsTable from "./jobskillsTable.jsx";

function JobskillsCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "TEXT.JOBSKILL.TITLE" })}>
        <NavLink
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          to="/jobskills/new-jobskill"
        >
          <FormattedMessage id="MODEL.CREATE.JOBSKILL.TITLE" />
        </NavLink>
      </CardHeader>
      <CardBody>
        <JobskillsTable />
      </CardBody>
    </Card>
  );
}

export default JobskillsCard;

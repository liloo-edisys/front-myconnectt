import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

import JobtagsTable from "./jobtagsTable.jsx";

function JobtagsCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "TEXT.JOBTAG.TITLE" })}>
        <NavLink
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          to="/jobtags/new-jobtag"
        >
          <FormattedMessage id="MODEL.CREATE.JOBTAG.TITLE" />
        </NavLink>
      </CardHeader>
      <CardBody>
        <JobtagsTable />
      </CardBody>
    </Card>
  );
}

export default JobtagsCard;

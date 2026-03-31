import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

import JobtitlesTable from "./jobTitlesTable.jsx";

function JobtitlesCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "TEXT.JOBTITLE.TITLE" })}>
        <NavLink
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          to="/jobtitles/new-jobtitle"
        >
          <FormattedMessage id="MODEL.CREATE.JOBTITLE.TITLE" />
        </NavLink>
      </CardHeader>
      <CardBody>
        <JobtitlesTable />
      </CardBody>
    </Card>
  );
}

export default JobtitlesCard;

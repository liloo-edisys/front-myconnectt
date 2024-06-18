import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";
import InterimairesTable from "./InterimairesTable";

function InterimairesCard(props) {
  const intl = useIntl();
  return (
    <>
      <Card>
        <CardHeader
          title={intl.formatMessage({ id: "MISSION.APPLICANTS.TITLE" })}
        >
          <div>
            <NavLink
              className="btn btn-light-primary mt-5"
              style={{ height: 40 }}
              to="/interimaire/create"
            >
              <FormattedMessage id="MODEL.CREATE.APPLICANT.TITLE" />
            </NavLink>
          </div>
        </CardHeader>
        <CardBody>
          <InterimairesTable />
        </CardBody>
      </Card>
    </>
  );
}

export default InterimairesCard;

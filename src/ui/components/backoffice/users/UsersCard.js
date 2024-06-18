import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import UsersTable from "./UsersTable";

function UsersCard(props) {
  const intl = useIntl();
  const history = useHistory();
  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "TEXT.USERS.LIST" })}>
        <div className="row">
          <NavLink
            type="button"
            className="btn btn-light-warning btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
            to="/users/new-user"
          >
            <FormattedMessage id="TEXT.ADD.NEW.USER" />
          </NavLink>
        </div>
      </CardHeader>
      <CardBody>
        <UsersTable />
      </CardBody>
    </Card>
  );
}

export default UsersCard;

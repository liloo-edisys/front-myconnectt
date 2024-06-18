import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

import AccountsGroupTable from "./AccountsGroupTable";

function AccountsGroupCard(props) {
  const intl = useIntl();
  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({ id: "TEXT.ACCOUNT.GROUP.TITLE" })}
      >
        <NavLink
          className="btn btn-light-primary mt-5"
          style={{ height: 40 }}
          to="/accounts-group/new-account-group"
        >
          <FormattedMessage id="MODEL.CREATE.ACCOUNT.GROUP.TITLE" />
        </NavLink>
      </CardHeader>
      <CardBody>
        <AccountsGroupTable />
      </CardBody>
    </Card>
  );
}

export default AccountsGroupCard;

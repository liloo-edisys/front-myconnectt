import React, { Component } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";

import {
  Card,
  CardHeader,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import EditProfile from "./EditProfile";
class ProfileCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: null
    };
  }

  handleClose = () => {
    this.setState({ show: null });
  };

  handleShow = id => () => {
    this.setState({ show: id });
  };

  render() {
    const { show } = this.state;
    const { intl, openDeleteProfileDialog, contact } = this.props;

    return (
      <>
        <Card>
          <CardHeader
            className="pageTitle"
            title={intl.formatMessage({ id: "EDIT.PROFILE.TITLE" })}
          >
            <CardHeaderToolbar>
              <button
                type="button"
                className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={() => openDeleteProfileDialog(contact)}
              >
                <FormattedMessage id="CONTACTS.DELLETE.ACCOUNT" />
              </button>
            </CardHeaderToolbar>
          </CardHeader>
          <>
            <EditProfile handleClose={this.handleClose} show={show} />
          </>
        </Card>
      </>
    );
  }
}

export default injectIntl(connect()(ProfileCard));

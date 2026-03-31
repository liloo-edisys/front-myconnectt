import React, { Component } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import ContactsTable from "./contactsTable.jsx";

class ContactsCard extends Component {
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
    const { intl, contacts } = this.props;

    return (
      <Card>
        <CardHeader title={intl.formatMessage({ id: "CONTACTS.TITLE" })}>
          <CardHeaderToolbar>
            <button
              type="button"
              className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              onClick={this.handleShow("new")}
            >
              <FormattedMessage id="MODEL.CREATE.CONTACT.TITLE" />
            </button>
          </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          <ContactsTable
            contacts={contacts}
            handleClose={this.handleClose}
            show={show}
          />
        </CardBody>
      </Card>
    );
  }
}

export default injectIntl(connect()(ContactsCard));

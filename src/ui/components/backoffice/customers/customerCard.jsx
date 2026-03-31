import React, { Component } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls";

import CustomersTable from "./customersTable.jsx";

class CustomersCard extends Component {
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
    const { createCompany, customers, intl } = this.props;
    /*let filteredCustomers = customers.length
      ? customers.filter(customer => customer.parentID === null)
      : [];
    let worksites = customers.length
      ? customers.filter(customer => customer.parentID !== null)
      : [];*/
    return (
      <Card>
        <CardHeader title={intl.formatMessage({ id: "TEXT.CUSTOMERS.LIST" })}>
          <CardHeaderToolbar>
            <Link
              to="/contacts"
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            >
              <FormattedMessage id="CONTACTS.TITLE2" />
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              onClick={this.handleShow("new")}
            >
              <FormattedMessage id="COMPANIES.ADD.ACCOUNT" />
            </button>
          </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          <CustomersTable
            createCompany={createCompany}
            //customers={filteredCustomers}
            handleClose={this.handleClose}
            //worksites={worksites}
            show={show}
            getData={this.props.getData}
            setPageNumber={this.props.setPageNumber}
            setPageSize={this.props.setPageSize}
            setName={this.props.setName}
            setSelectedStatus={this.props.setSelectedStatus}
            setGroupId={this.props.setGroupId}
            setSelectedCreationDate={this.props.setSelectedCreationDate}
            setCustomers={this.props.setCustomers}
            setTotalCount={this.props.setTotalCount}
            state={this.props.state}
          />
        </CardBody>
      </Card>
    );
  }
}

export default injectIntl(connect()(CustomersCard));

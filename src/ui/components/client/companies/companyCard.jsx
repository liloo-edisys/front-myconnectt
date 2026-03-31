import React, { Component } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls/index.js";

import CompaniesTable from "./companiesTable.jsx";

class CompaniesCard extends Component {
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
    const { createCompany, companies, intl } = this.props;
    let filteredCompanies = companies.length
      ? companies.filter(company => company.parentID === null)
      : [];
    let worksites = companies.length
      ? companies.filter(company => company.parentID !== null)
      : [];
    return (
      <Card>
        <CardHeader title={intl.formatMessage({ id: "COMPANIES.TITLE" })}>
          <CardHeaderToolbar>
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
          <CompaniesTable
            createCompany={createCompany}
            companies={filteredCompanies}
            handleClose={this.handleClose}
            worksites={worksites}
            show={show}
          />
        </CardBody>
      </Card>
    );
  }
}

export default injectIntl(connect()(CompaniesCard));

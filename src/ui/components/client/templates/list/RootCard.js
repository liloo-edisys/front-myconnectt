import React, { Component } from "react";

import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";

import RootTable from "./RootTable";

class RootCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: null,
      refresh: 0
    };
  }

  handleClose = () => {
    this.setState({ show: null });
  };

  handleShow = id => () => {
    this.setState({ show: id });
  };

  handleUpdateChildren = () => {
    this.setState({ refresh: this.state.refresh + 1 });
    setTimeout(() => {
      this.setState({ refresh: 0 });
    }, 500);
  };

  render() {
    const { show } = this.state;
    const { intl } = this.props;
    return (
      <Card>
        <CardHeader
          title={intl.formatMessage({ id: "MISSIONS.TEMPLATES.LIST.TITLE" })}
        >
          <CardHeaderToolbar>
            <NavLink className="menu-link" to="/templates/create">
              <span className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4">
                <FormattedMessage id="TEMPLATE.CREATE.BUTTON" />
              </span>
            </NavLink>
            <button
              onClick={() => this.handleUpdateChildren()}
              className="btn btn-icon btn-light-primary pulse pulse-primary mr-5"
            >
              <i className="flaticon-refresh"></i>
              <span className="pulse-ring"></span>
            </button>
          </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          <RootTable
            handleClose={this.handleClose}
            show={show}
            refresh={this.state.refresh}
          />
        </CardBody>
      </Card>
    );
  }
}

export default injectIntl(connect()(RootCard));

import React, { Component } from "react";

import { injectIntl } from "react-intl";
import { connect } from "react-redux";

import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../../_metronic/_partials/controls";

import RootTable from "./rootTable.jsx";

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
          title={intl.formatMessage({ id: "INTERIMAIRE.LIST.TITLE" })}
        >
          <CardHeaderToolbar>
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

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

import MissionsTable from "./missionsTable.jsx";

class MissionsCard extends Component {
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
    const { intl, missions } = this.props;
    return (
      <Card>
        <CardHeader title="Liste des offres">
          <CardHeaderToolbar>
            <div>
              <NavLink
                className="btn btn-light-primary mr-5"
                style={{ height: 40 }}
                to="/mission/create"
              >
                <FormattedMessage id="TEXT.ADD.MISSION" />
              </NavLink>
              <button
                onClick={() => this.handleUpdateChildren()}
                className="btn btn-icon btn-light-primary pulse pulse-primary mr-5"
              >
                <i className="flaticon-refresh"></i>
                <span className="pulse-ring"></span>
              </button>
            </div>
          </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          <MissionsTable
            missions={missions}
            handleClose={this.handleClose}
            show={show}
            refresh={this.state.refresh}
          />
        </CardBody>
      </Card>
    );
  }
}

export default injectIntl(connect()(MissionsCard));

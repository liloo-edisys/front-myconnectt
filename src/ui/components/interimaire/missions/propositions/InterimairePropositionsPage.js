import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { MissionDisplayDialog as DisplayDialog } from "../modals/missionDisplayDialog.jsx";
import { MissionDeclineDialog as DeclineDialog } from "../modals/missionDeclineDialog.jsx";
import { MissionApproveDialog as ApproveDialog } from "../modals/missionApproveDialog.jsx";

import { InterimairePropositionsUIProvider } from "./InterimairePropositionsUIContext";
import InterimairePropositionsCard from "./InterimairePropositionsCard";

class InterimairePropositionsPage extends React.Component {
  render() {
    const { history } = this.props;
    const missionsUIEvents = {
      openDisplayDialog: id => {
        this.props.getMission(id);
        history.push(`/propositions/display/${id}`, id);
      },
      openApproveDialog: id => {
        this.props.getMission(id);
        history.push(`/propositions/approve/${id}`, id);
      },
      openDeclinePropositionsDialog: (id, row) => {
        this.props.getMission(id);
        history.push(`/propositions/decline/${id}`, (id, row));
      }
    };

    return (
      <InterimairePropositionsUIProvider
        missionsUIEvents={missionsUIEvents}
        history={history}
      >
        <Route path="/propositions/display/:id">
          {({ history, match }) => (
            <DisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/propositions");
              }}
            />
          )}
        </Route>
        <Route path="/propositions/approve/:id">
          {({ history, match }) => (
            <ApproveDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/propositions");
              }}
            />
          )}
        </Route>
        <Route path="/propositions/decline/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/propositions");
              }}
            />
          )}
        </Route>
        <Route path="/propositions/remove/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/propositions");
              }}
            />
          )}
        </Route>
        <InterimairePropositionsCard />
      </InterimairePropositionsUIProvider>
    );
  }
}

export default connect()(InterimairePropositionsPage);

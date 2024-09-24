import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { MissionDisplayDialog as DisplayDialog } from "../modals/missionDisplayDialog.jsx";
import { MatchingDeclineDialog as DeclineDialog } from "../modals/matchingDeclineDialog.jsx";
import { MissionApproveDialog as ApproveDialog } from "../modals/missionApproveDialog.jsx";

import { InterimaireMatchingUIProvider } from "./InterimaireMatchingUIContext.js";
import InterimaireMatchingCard from "./InterimaireMatchingCard.js";

class InterimaireMatchingPage extends React.Component {
  render() {
    const { history } = this.props;
    const missionsUIEvents = {
      openDisplayDialog: id => {
        this.props.getMission(id);
        history.push(`/matching/display/${id}`, id);
      },
      openApproveDialog: id => {
        this.props.getMission(id);
        history.push(`/matching/approve/${id}`, id);
      },
      openDeclineMatchingDialog: (id, row) => {
        this.props.getMission(id);
        history.push(`/matching/decline/${id}`, (id, row));
      }
    };

    return (
      <InterimaireMatchingUIProvider
        missionsUIEvents={missionsUIEvents}
        history={history}
      >
        <Route path="/matching/display/:id">
          {({ history, match }) => (
            <DisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/matching");
              }}
            />
          )}
        </Route>
        <Route path="/matching/approve/:id">
          {({ history, match }) => (
            <ApproveDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/matching");
              }}
            />
          )}
        </Route>
        <Route path="/matching/decline/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/matching");
              }}
            />
          )}
        </Route>
        <Route path="/matching/remove/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/matching");
              }}
            />
          )}
        </Route>
        <InterimaireMatchingCard />
      </InterimaireMatchingUIProvider>
    );
  }
}

export default connect()(InterimaireMatchingPage);

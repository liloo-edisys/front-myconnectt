import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { InterimaireMissionsUIProvider as MissionsUIProvider } from "./InterimaireMissionsUIContext";
import MissionsCard from "./InterimaireMissionsCard";
import { MissionDisplayDialog as DisplayDialog } from "../modals/MissionDisplayDialog";
import { MissionApproveDialog as ApproveDialog } from "../modals/MissionApproveDialog";
import { MissionDeclineDialog as DeclineDialog } from "../modals/MissionDeclineDialog";

class InterimaireMissionsPage extends React.Component {
  render() {
    const { history, interimaire } = this.props;
    const missionsUIEvents = {
      openDisplayDialog: id => {
        this.props.getMission(id);
        history.push(`/search/display`);
      },
      openApproveDialog: id => {
        this.props.getMission(id);
        history.push(`/search/approve`, interimaire.completedPercent);
      },
      openDeclineMatchingDialog: (id, row) => {
        this.props.getMission(id);
        history.push(`/search/decline`, (id, row));
      }
    };

    return (
      <MissionsUIProvider missionsUIEvents={missionsUIEvents} history={history}>
        <Route path="/search/display/:id">
          {({ history, match }) => (
            <DisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/search");
              }}
            />
          )}
        </Route>
        <Route path="/search/approve/:id">
          {({ history, match }) => (
            <ApproveDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/search");
              }}
            />
          )}
        </Route>
        <Route path="/search/decline/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/search");
              }}
            />
          )}
        </Route>
        <Route path="/search/remove/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/search");
              }}
            />
          )}
        </Route>
        <MissionsCard />
      </MissionsUIProvider>
    );
  }
}

export default connect()(InterimaireMissionsPage);

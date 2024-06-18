import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { MissionDisplayDialog as DisplayDialog } from "../modals/MissionDisplayDialog";
import { MissionDeclineDialog as DeclineDialog } from "../modals/MissionDeclineDialog";
import { MissionApproveDialog as ApproveDialog } from "../modals/MissionApproveDialog";

import { InterimaireApplicationsUIProvider } from "./InterimaireApplicationsUIContext";
import InterimaireApplicationsCard from "./InterimaireApplicationsCard";

class InterimaireApplicationsPage extends React.Component {
  render() {
    const { history } = this.props;
    const missionsUIEvents = {
      openDisplayDialog: id => {
        this.props.getMission(id);
        history.push(`/applications/display/${id}`, id);
      },
      openApproveDialog: id => {
        this.props.getMission(id);
        history.push(`/applications/approve/${id}`, id);
      },
      openDeclineApplicationsDialog: (id, row) => {
        this.props.getMission(id);
        history.push(`/applications/decline/${id}`, (id, row));
      }
    };

    return (
      <InterimaireApplicationsUIProvider
        missionsUIEvents={missionsUIEvents}
        history={history}
      >
        <Route path="/applications/display/:id">
          {({ history, match }) => (
            <DisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/applications");
              }}
            />
          )}
        </Route>
        <Route path="/applications/approve/:id">
          {({ history, match }) => (
            <ApproveDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/applications");
              }}
            />
          )}
        </Route>
        <Route path="/applications/decline/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/applications");
              }}
            />
          )}
        </Route>
        <Route path="/applications/remove/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/applications");
              }}
            />
          )}
        </Route>
        <InterimaireApplicationsCard />
      </InterimaireApplicationsUIProvider>
    );
  }
}

export default connect()(InterimaireApplicationsPage);

import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { InterimaireFavoritesUIProvider as FavoritesUIProvider } from "./interimaireFavoritesUIContext.jsx";
import FavoritesCard from "./interimaireFavoritesCard.jsx";
import { MissionDisplayDialog as DisplayDialog } from "../modals/missionDisplayDialog.jsx";
import { MissionApproveDialog as ApproveDialog } from "../modals/missionApproveDialog.jsx";
import { MissionDeclineDialog as DeclineDialog } from "../modals/missionDeclineDialog.jsx";

class InterimaireFavoritesPage extends React.Component {
  render() {
    const { history, interimaire } = this.props;
    const missionsUIEvents = {
      openDisplayDialog: id => {
        this.props.getMission(id);
        history.push(`/favorites/display`);
      },
      openApproveDialog: id => {
        this.props.getMission(id);
        history.push(`/favorites/approve`, interimaire.completedPercent);
      },
      openDeclineMatchingDialog: (id, row) => {
        this.props.getMission(id);
        history.push(`/favorites/decline`, (id, row));
      }
    };

    return (
      <FavoritesUIProvider
        missionsUIEvents={missionsUIEvents}
        history={history}
      >
        <Route path="/favorites/display/:id">
          {({ history, match }) => (
            <DisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/favorites");
              }}
            />
          )}
        </Route>
        <Route path="/favorites/approve/:id">
          {({ history, match }) => (
            <ApproveDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/favorites");
              }}
            />
          )}
        </Route>
        <Route path="/favorites/decline/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/favorites");
              }}
            />
          )}
        </Route>
        <Route path="/favorites/remove/:id">
          {({ history, match }) => (
            <DeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/favorites");
              }}
            />
          )}
        </Route>
        <FavoritesCard />
      </FavoritesUIProvider>
    );
  }
}

export default connect()(InterimaireFavoritesPage);

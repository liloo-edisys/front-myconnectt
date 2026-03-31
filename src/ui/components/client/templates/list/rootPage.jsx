import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { DeleteDialog } from "../modals/DeleteDialog.js";
import EditDialog from "../modals/EditDialog.js";

import { UIProvider } from "./rootUIContext.jsx";
import RootCard from "./rootCard.jsx";
import CreateDialog from "../modals/CreateDialog.js";

class RootPage extends React.Component {
  render() {
    const { history } = this.props;

    const UIEvents = {
      openDeleteDialog: data => {
        history.push(`/templates/delete`, data);
      },
      openEditDialog: data => {
        history.push(`/templates/${data.id}/edit`, data);
      }
    };
    const openCreateDialog = () => {
      history.push(`/templates/edit`);
    };
    return (
      <UIProvider UIEvents={UIEvents} history={history}>
        <Route path="/templates/:id/edit">
          {({ history, match }) => (
            <EditDialog
              show={match != null}
              id={match && match.params.id}
              history={history}
              onHide={() => {
                history.push("/templates");
              }}
            />
          )}
        </Route>
        <Route path="/templates/create">
          {({ history, match }) => (
            <CreateDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/templates");
              }}
            />
          )}
        </Route>
        <Route path="/templates/delete">
          {({ history, match }) => (
            <DeleteDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/templates");
              }}
            />
          )}
        </Route>
        <RootCard openCreateDialog={openCreateDialog} />
      </UIProvider>
    );
  }
}

export default connect()(RootPage);

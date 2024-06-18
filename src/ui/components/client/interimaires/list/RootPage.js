import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { DisplayDialog } from "../modals/DisplayDialog";

import { UIProvider } from "./RootUIContext";
import RootCard from "./RootCard";

class RootPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentApplicant: null
    };
  }
  render() {
    const { history } = this.props;

    const UIEvents = {
      openDisplayDialog: data => {
        this.props.getApplicantById(data.id);
        history.push(`/profiles/display/${data.id}`);
      }
    };

    return (
      <UIProvider UIEvents={UIEvents} history={history}>
        <Route path={`/profiles/display/:id`}>
          {({ history, match }) => (
            <DisplayDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/profiles");
              }}
            />
          )}
        </Route>
        <RootCard />
      </UIProvider>
    );
  }
}

export default connect()(RootPage);

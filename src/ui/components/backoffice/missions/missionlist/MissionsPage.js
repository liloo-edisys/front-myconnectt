import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { MissionsUIProvider } from "./MissionsUIContext";
import MissionsCard from "./MissionsCard";
import { deleteFromStorage } from "../../../shared/deleteFromStorage";
import { MissionDeleteDialog as DeleteDialog } from "../missionsModals/MissionDeleteDialog";
import { getMission } from "../../../../../business/api/client/missionsApi";
import { getMission as getMissionAction } from "actions/client/missionsActions";

class MissionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resumeOpen: false,
      resume: [],
      currentApplicant: null
    };
  }

  deleteItems = () => {
    var result = {};
    for (var type in window.localStorage)
      if (!type.includes("persist")) result[type] = window.localStorage[type];
    for (var item in result) deleteFromStorage(item);
  };
  componentDidMount() {
    this.deleteItems();
  }
  render() {
    const { history } = this.props;

    const missionsUIEvents = {
      openDeleteDialog: data => {
        history.push(`/missions/delete`, data);
      },
      openDisplayDialog: data => {
        getMission(data)
          .then(res => this.props.dispatch(getMissionAction.success(res)))
          .then(
            setTimeout(() => {
              localStorage.setItem("isPreview", true);
              history.push("/mission/final-step");
            }, 1000)
          );
      }
    };
    return (
      <MissionsUIProvider missionsUIEvents={missionsUIEvents} history={history}>
        <Route path="/missions/delete">
          {({ history, match }) => (
            <DeleteDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/missions");
              }}
            />
          )}
        </Route>
        <MissionsCard missions={this.props.missions} />
      </MissionsUIProvider>
    );
  }
}

export default connect()(MissionsPage);

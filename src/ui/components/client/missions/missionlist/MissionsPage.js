import React from "react";

import { connect } from "react-redux";
import { Route } from "react-router-dom";

import { MissionDeleteDialog as DeleteDialog } from "../missionsModals/missionDeleteDialog.jsx";
import { MissionsUIProvider } from "./missionsUIContext.jsx";
import MissionsCard from "./MissionsCard";
import { deleteFromStorage } from "../../../shared/deleteFromStorage";
import { MatchingDialog } from "../missionsModals/missionMatchingDialog.jsx";
import { MissionResumeDialog } from "../missionsModals/missionResumeDialog.jsx";
import { MissionDeclineDialog } from "../missionsModals/missionDeclineDialog.jsx";
import { MissionValidateDialog } from "../missionsModals/missionValidateDialog.jsx";
import { getMission } from "../../../../../business/api/client/missionsApi";
import { getMission as getMissionAction } from "actions/client/missionsActions";
import { MissionProfileDialog } from "../missionsModals/missionProfileDialog.jsx";
import { DeleteApplicationDialog } from "../missionsModals/deleteApplicationDialog.jsx";

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
    this.props.resetMission();
  }
  render() {
    const { history } = this.props;

    const missionsUIEvents = {
      openDeleteDialog: data => {
        history.push(`/missions/delete`, data);
      },
      openValidateDialog: data => {
        history.push(`/missions/approve`, data);
      },
      openDeclineDialog: row => {
        history.push(`/missions/decline`, row);
      },
      openDisplayDialog: data => {
        getMission(data)
          .then(res => this.props.dispatch(getMissionAction.success(res)))
          .then(
            setTimeout(() => {
              localStorage.setItem("isPreview", true);
              history.push("/mission-create/final-step");
            }, 1000)
          );
      },
      editMission: row => {
        this.deleteItems();
        this.props.getMission(row.id);
        history.push(`/mission-create/step-one`);
      },
      openMatchingDialog: (row, data) => {
        history.push(`/missions/match`, row, data);
      },
      openResumeDialog: (row, data) => {
        history.push(`/missions/resume`, data);
      },
      openMissionProfileDialog: data => {
        history.push(`/missions/applicant/${data.applicantID}`, data);
        this.setState({ currentApplicant: data.applicantID });
      },
      openDeleteApplicationDialog: row => {
        history.push(`/missions/delete-application`, row);
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
        <Route path="/missions/delete-application">
          {({ history, match }) => (
            <DeleteApplicationDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/missions");
              }}
            />
          )}
        </Route>
        <Route path={`/missions/applicant/:id`}>
          {({ history, match }) => (
            <MissionProfileDialog
              show={match != null}
              history={history}
              currentApplicant={this.state.currentApplicant}
              onHide={() => {
                history.push("/missions");
              }}
            />
          )}
        </Route>
        <Route path="/missions/decline">
          {({ history, match }) => (
            <MissionDeclineDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/missions");
              }}
            />
          )}
        </Route>
        <Route path="/missions/approve">
          {({ history, match }) => (
            <MissionValidateDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/missions");
              }}
            />
          )}
        </Route>
        <Route path="/missions/match">
          {({ history, match }) => {
            return (
              <MatchingDialog
                show={match != null}
                history={history}
                resumeRow={this.state.resume}
                resumeOpen={this.state.resumeOpen}
                onOpenResume={(row, data) => {
                  this.setState({ resumeOpen: true, resume: data });
                }}
                onCloseResume={() => {
                  this.setState({ resumeOpen: false });
                  this.props.resetResume();
                }}
                onHide={() => {
                  history.goBack();
                }}
              />
            );
          }}
        </Route>
        <Route path="/missions/resume">
          {({ history, match }) => (
            <MissionResumeDialog
              show={match != null}
              history={history}
              onHide={() => {
                history.push("/missions");
                this.props.resetResume();
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

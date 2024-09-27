import React, { useState } from "react";
import { useParams, Route, useHistory } from "react-router-dom";
import { MissionsUIProvider } from "../missions/missionlist/missionsUIContext.jsx";
import { DeleteApplicationDialog } from "../missions/missionsModals/deleteApplicationDialog.jsx";
import { MissionDeclineDialog } from "../missions/missionsModals/missionDeclineDialog.jsx";
import { MatchingDialog } from "../missions/missionsModals/missionMatchingDialog.jsx";
import { MissionValidateDialog } from "../missions/missionsModals/missionValidateDialog.jsx";
import { ApplicantListModal } from "./applicant-list-modal/index.js";
import { DisplayDialog } from "./applicant-modal/displayDialog.jsx";
import CustomerOrder from "./customerOrder.jsx";

function CustomerOrderPage(props) {
  const { missionId } = useParams();
  const [refresh, setrefresh] = useState(false);
  const history = useHistory();
  const onHide = () => {
    history.push(`/customer-order/${missionId}`);
    setTimeout(() => setrefresh(!refresh), 500);
  };

  const missionsUIEvents = {
    openDeleteDialog: () => {},
    openValidateDialog: () => {},
    openDeclineDialog: () => {},
    openDisplayDialog: () => {},
    editMission: () => {},
    openMatchingDialog: () => {},
    openResumeDialog: () => {},
    openMissionProfileDialog: () => {},
    openDeleteApplicationDialog: () => {}
  };

  return (
    <MissionsUIProvider missionsUIEvents={missionsUIEvents} history={history}>
      <Route exact path={`/customer-order/:missionId/applicant/:profileId`}>
        <DisplayDialog show={true} onHide={onHide} />
      </Route>
      <Route exact path={`/customer-order/:missionId/delete`}>
        {({ history, match }) => {
          return (
            <DeleteApplicationDialog
              show={match != null}
              history={history}
              onOpenResume={(row, data) => {
                this.setState({ resumeOpen: true, resume: data });
              }}
              onCloseResume={() => {
                this.setState({ resumeOpen: false });
                this.props.resetResume();
              }}
              onHide={onHide}
            />
          );
        }}
      </Route>
      <Route exact path={`/customer-order/:missionId/validate`}>
        {({ history, match }) => {
          return (
            <MissionValidateDialog
              show={match != null}
              history={history}
              onOpenResume={(row, data) => {
                this.setState({ resumeOpen: true, resume: data });
              }}
              onCloseResume={() => {
                this.setState({ resumeOpen: false });
                this.props.resetResume();
              }}
              onHide={onHide}
            />
          );
        }}
      </Route>
      <Route exact path={`/customer-order/:missionId/decline`}>
        {({ history, match }) => {
          return (
            <MissionDeclineDialog
              show={match != null}
              history={history}
              onOpenResume={(row, data) => {
                this.setState({ resumeOpen: true, resume: data });
              }}
              onCloseResume={() => {
                this.setState({ resumeOpen: false });
                this.props.resetResume();
              }}
              onHide={onHide}
            />
          );
        }}
      </Route>
      <Route exact path={`/customer-order/:missionId/match`}>
        {({ history, match }) => {
          return (
            <MatchingDialog
              show={match != null}
              history={history}
              onOpenResume={(row, data) => {
                this.setState({ resumeOpen: true, resume: data });
              }}
              onCloseResume={() => {
                this.setState({ resumeOpen: false });
                this.props.resetResume();
              }}
              onHide={onHide}
            />
          );
        }}
      </Route>
      <CustomerOrder refresh={refresh} />
    </MissionsUIProvider>
  );
}

export default CustomerOrderPage;

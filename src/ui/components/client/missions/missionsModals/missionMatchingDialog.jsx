import React, { useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getMatching } from "actions/client/applicantsActions";
import MatchingTable from "../missionlist/MatchingTable";
import { getMission } from "actions/client/missionsActions";
import {
  declineMatching,
  approveByCustomer
} from "../../../../../business/actions/client/applicantsActions";
import { MissionResumeDialog } from "./missionResumeDialog.jsx";
import { searchMission } from "../../../../../business/actions/client/missionsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
const TENANTID = process.env.REACT_APP_TENANT_ID;

export function MatchingDialog({
  show,
  onHide,
  history,
  resumeOpen,
  onOpenResume,
  onCloseResume,
  resumeRow
}) {
  const { state } = history.location;
  const dispatch = useDispatch();
  const { candidates, mission } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      candidates: state.applicants.matchingCandidates
    }),
    shallowEqual
  );
  const page = localStorage.getItem("pageNumber");
  const pageSize = localStorage.getItem("pageSize");
  const accountID = localStorage.getItem("accountID");
  const userID = localStorage.getItem("userId");

  const handleDeny = (missionID, candidateID, mission) => {
    dispatch(
      declineMatching.request(
        { id1: missionID, id2: candidateID },
        userID !== null
          ? {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true,
              userId: parseInt(userID)
            }
          : {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true
            }
      )
    );
    dispatch(getMatching.request(mission));
    dispatch(
      searchMission.request({
        city: null,
        endDate: null,
        hourlySalary: 0,
        isApplicationsOnly: false,
        isMatchingOnly: false,
        loadMissionApplications: false,
        missionJobTitles: [],
        pageNumber: parseInt(localStorage.getItem("pageNumber")),
        pageSize: parseInt(localStorage.getItem("pageSize")),
        startDate: null,
        tenantID: parseInt(TENANTID)
      })
    );
  };

  const handleAccept = (missionID, candidateID, mission) => {
    dispatch(
      approveByCustomer.request(
        { id1: missionID, id2: candidateID },
        userID !== null
          ? {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true,
              userId: parseInt(userID)
            }
          : {
              tenantID: parseInt(TENANTID),
              accountID: parseInt(accountID),
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactName: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: parseInt(pageSize),
              pageNumber: parseInt(page),
              loadMissionApplications: true
            }
      )
    );
    dispatch(getMatching.request(mission));
  };
  let missionId = state && state.id;

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const prevCandidates = usePrevious(candidates);
  useEffect(() => {
    show && mission.id !== missionId && dispatch(getMission.request(missionId));
  }, [show, mission, candidates, dispatch, missionId, prevCandidates]);

  useEffect(() => {
    show && !isNullOrEmpty(mission) && dispatch(getMatching.request(mission));
  }, [show, mission, dispatch]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      size="xl"
    >
      {resumeOpen === true ? (
        <MissionResumeDialog
          show={resumeOpen === true}
          history={history}
          resumeRow={resumeRow}
          onHide={() => {
            onCloseResume();
          }}
        />
      ) : null}
      <Modal.Header closeButton className="pb-5">
        <Modal.Title
          className="pageSubtitle w-100"
          id="example-modal-sizes-title-lg"
        >
          <FormattedMessage id="MATCHING.MODAL.TITLE" />
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={onHide}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body className="py-0">
        <MatchingTable
          candidates={candidates}
          handleAccept={handleAccept}
          handleDeny={handleDeny}
          onOpenResume={onOpenResume}
        />
      </Modal.Body>
    </Modal>
  );
}

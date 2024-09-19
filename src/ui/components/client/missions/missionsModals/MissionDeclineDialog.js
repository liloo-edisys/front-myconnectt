import React from "react";

import { declineByCustomer } from "actions/client/applicantsActions";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
const TENANTID = process.env.REACT_APP_TENANT_ID;

export function MissionDeclineDialog({ show, onHide, history }) {
  const dispatch = useDispatch();
  const { state } = history.location;
  const page = localStorage.getItem("pageNumber");
  const pageSize = localStorage.getItem("pageSize");
  const accountID = localStorage.getItem("accountID");
  const userID = localStorage.getItem("userId");

  const handleDecline = () => {
    dispatch(
      declineByCustomer.request(
        { id1: state.vacancyID, id2: state.applicantID },
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
      ),
      onHide()
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage
            id="CANDIDATE.DECLINE.TITLE"
            values={{ name: state && state.vacancyTitle }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id="CANDIDATE.DECLINE.DESCRIPTION"
            values={{ name: state && state.vacancyTitle }}
          />
        </span>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <> </>
          <button
            type="button"
            onClick={() => handleDecline()}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="DECLINE.BUTTON" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

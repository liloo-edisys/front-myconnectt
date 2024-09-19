import React from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { deleteApplication } from "../../../../../business/actions/client/applicantsActions";

export const TENANTID = process.env.REACT_APP_TENANT_ID;

export function DeleteApplicationDialog({ show, onHide, history }) {
  const dispatch = useDispatch();
  const { state } = history.location;
  const page = localStorage.getItem("pageNumber");
  const pageSize = localStorage.getItem("pageSize");
  const accountID = localStorage.getItem("accountID");
  const userID = localStorage.getItem("userId");

  const handleDelete = () => {
    dispatch(
      deleteApplication.request(
        { id1: parseInt(TENANTID), id2: state.applicationID },
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
          Annuler une invitation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>Voulez-vous vraiment annuler cette invitation ?</span>
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
            onClick={handleDelete}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.DELETE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

import React from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { deleteApplicant } from "../../../../business/actions/backoffice/applicantActions";

export function ApplicantDeleteModal({ show, onHide, getData, applicant }) {
  const dispatch = useDispatch();
  const handleDeleteApplicant = () => {
    dispatch(
      deleteApplicant.request(applicant.id),
      setTimeout(() => {
        getData();
      }, 500),
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
            id="TEXT.DELETE.TITLE"
            values={{ name: applicant.firstname + " " + applicant.lastname }}
          />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id="TEXT.DELETE.DESCRIPTION"
            values={{ name: applicant.firstname + " " + applicant.lastname }}
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
            onClick={handleDeleteApplicant}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.DELETE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

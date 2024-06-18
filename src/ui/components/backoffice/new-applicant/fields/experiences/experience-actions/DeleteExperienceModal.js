import React from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { removeSelectedApplicantExperience } from "../../../../../../../business/actions/backoffice/ApplicantActions";
import { useDispatch } from "react-redux";

const DeleteExperienceModal = ({ show, onHide, deleteExperience, row }) => {
  const dispatch = useDispatch();
  const confirmDelete = () => {
    const experienceId = row.id ? row.id : row.id_temp;
    removeSelectedApplicantExperience(experienceId, dispatch);
    onHide();
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="XP.DELETE.TITLE" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage id="XP.DELETE.DESC" />
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
            onClick={() => confirmDelete(row)}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="BUTTON.DELETE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteExperienceModal;

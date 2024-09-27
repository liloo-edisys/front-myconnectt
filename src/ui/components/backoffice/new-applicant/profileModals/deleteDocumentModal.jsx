import React from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

export function DeleteDocumentModal({ show, onHide, deleteDocument, row }) {
  const confirmDelete = row => {
    deleteDocument(row);
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
          <FormattedMessage id="DOC.DELETE.TITLE" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage id="DOC.DELETE.DESC" />
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
}

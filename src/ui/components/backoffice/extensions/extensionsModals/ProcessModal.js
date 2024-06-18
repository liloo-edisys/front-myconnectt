import React from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

function ProcessModal(props) {
  const { onHide, acceptExtension } = props;

  const handleClose = () => {
    onHide();
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          Traitement de la demande
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={() => handleClose()}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body>
        <div>
          <FormattedMessage id="MESSAGE.CONF.ANAEL.PROCESSED" />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            className="btn btn-light-success btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={acceptExtension}
          >
            <FormattedMessage id="TEXT.PROCESS" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ProcessModal;

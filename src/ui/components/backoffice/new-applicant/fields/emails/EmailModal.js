import React from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

function EmailModal(props) {
  const { onHide, activeMail } = props;
  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-5">
        <Modal.Title className="pageSubtitle w-100">
          <div
            style={{ fontSize: 14, margin: "5px 0" }}
            dangerouslySetInnerHTML={{ __html: activeMail.content_Subject }}
          />
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
      <Modal.Body className="pt-10 py-0 background-gray">
        <div className="d-flex card-spacer-x pb-3 flex-column flex-md-row flex-lg-column flex-xxl-row justify-content-between">
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column flex-grow-1 flex-wrap mr-2">
              <div className="d-flex">
                <span className="font-weight-bold text-muted mr-2">de :</span>
                <a
                  href="#"
                  className="font-size-lg font-weight-bolder text-dark-75 text-hover-primary mr-2"
                >
                  {activeMail.content_From}
                </a>
                <div className="font-weight-bold text-muted">
                  <span className="label label-success label-dot mr-2"></span>
                </div>
              </div>
              <div className="d-flex">
                <span className="font-weight-bold text-muted mr-2">à :</span>
                <a
                  href="#"
                  className="font-size-lg font-weight-bolder text-dark-75 text-hover-primary mr-2"
                >
                  {activeMail.content_To}
                </a>
                <div className="font-weight-bold text-muted">
                  <span className="label label-success label-dot mr-2"></span>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex my-2 my-xxl-0 align-items-md-center align-items-lg-start align-items-xxl-center flex-column flex-md-row flex-lg-column flex-xxl-row">
            <div className="font-weight-bold text-muted mx-2">
              {new Date(activeMail.creationDate).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: activeMail.content_Body }} />
      </Modal.Body>
    </Modal>
  );
}

export default EmailModal;

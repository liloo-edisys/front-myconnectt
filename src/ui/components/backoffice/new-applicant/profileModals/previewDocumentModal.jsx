import React from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

export function PreviewDocumentModal({ show, onHide, deleteExperience, row }) {
  const thumb = {
    display: "flex",
    borderRadius: 2,
    border: "1px solid #eaeaea",
    marginBottom: 8,
    marginRight: 8,
    width: "100%",
    height: 600,
    padding: 4,
    boxSizing: "border-box",
    overflow: "scroll"
  };

  const thumbInner = {
    display: "flex",
    minWidth: 0,
    width: "100%"
  };

  const img = {
    display: "block",
    width: "100%",
    height: "100%"
  };

  const formatType = () => {
    let type;
    if (row && row.filename && row.filename.includes(".pdf"))
      type = "application/pdf";
    if (row && row.filename && row.filename.includes(".png"))
      type = "image/png";
    if (row && row.filename && row.filename.includes(".jpeg"))
      type = "image/jpeg";
    if (row && row.filename && row.filename.includes(".jpg"))
      type = "image/jpeg";
    return type;
  };

  return (
    <Modal
      size="lg"
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">Aperçu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={thumb} key={!isNullOrEmpty(row) && row.Filename}>
          <div style={thumbInner}>
            {/* <img src={!isNullOrEmpty(files) && files.base64} style={img} alt="preview" /> */}
            <embed
              src={
                !isNullOrEmpty(row) &&
                !isNullOrEmpty(row.base64) &&
                "data:" + formatType() + ";base64," + row.base64
              }
              type={row.type}
              style={img}
              width="100%"
              height="auto"
            />
          </div>
        </div>
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
        </div>
      </Modal.Footer>
    </Modal>
  );
}

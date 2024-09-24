import React, { useState } from "react";
import axios from "axios";

import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";

export function SourcingScopTalentModal({ show, onHide, getData }) {
  const intl = useIntl();
  const API_URL = process.env.REACT_APP_WEBAPI_URL;

  const [scoptalentid, setScopTalentID] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePostScopTalentID = () => {
    setLoading(true);
    const SOURCING_SCOPTALENT_API_URL =
      API_URL + "api/Applicant/SourcingScopTalent/" + scoptalentid;
    axios
      .get(SOURCING_SCOPTALENT_API_URL)
      .then(res => {
        setLoading(false);
        onHide();
        getData();
      })
      .catch(err => setLoading(false));
  };

  const onChangeScopTalentID = e => {
    setScopTalentID(e.target.value);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.SOURCING.SCOPTALENT" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <label>
          <FormattedMessage id="TEXT.SCOPTALENT.APPLICANT.EMAIL" />
        </label>
        <input
          name="scoptalentid"
          className="form-control"
          placeholder={intl.formatMessage({
            id: "TEXT.SCOPTALENT.APPLICANT.EMAIL"
          })}
          type="text"
          value={scoptalentid}
          onChange={onChangeScopTalentID}
        />
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
            onClick={handlePostScopTalentID}
            disabled={loading ? true : false}
            className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="CONTACT.MODAL.SEND_BUTTON" />
            {loading && <span className="ml-3 spinner spinner-white"></span>}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

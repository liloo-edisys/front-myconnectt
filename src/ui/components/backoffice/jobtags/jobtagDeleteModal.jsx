import React, { useEffect, useState } from "react";

import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toastr } from "react-redux-toastr";

export function JobtagDeleteModal(props) {
  const api = process.env.REACT_APP_WEBAPI_URL;
  const { id } = useParams();
  const { onHide, getData } = props;
  const dispatch = useDispatch();
  const [competence, setCompetence] = useState({ name: "" });

  useEffect(() => {
    if (id) {
      getCompetence();
    }
  }, [id]);

  const getCompetence = () => {
    const SEARCH_JOBTAGS_API = api + "api/JobTag/" + id;
    axios
      .get(SEARCH_JOBTAGS_API)
      .then(res => setCompetence(res.data))
      .catch(err => console.log(err));
  };

  const handleDeleteApplicant = () => {
    const DELETE_JOBTAGS_API = api + "api/JobTag/?id=" + id;
    axios
      .delete(DELETE_JOBTAGS_API)
      .then(res => {
        getData();
        onHide();
        toastr.success("Succès", "Le tag a bien été suprimé.");
      })
      .catch(err => console.log(err));
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.DELETE.TITLE" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>
          <FormattedMessage
            id="TEXT.DELETE.JOBTAG.DESCRIPTION"
            values={{ name: competence.name }}
          />
        </span>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          <> </>
          <button
            type="button"
            className="btn btn-danger btn-shadow font-weight-bold"
            onClick={handleDeleteApplicant}
          >
            <FormattedMessage id="BUTTON.DELETE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

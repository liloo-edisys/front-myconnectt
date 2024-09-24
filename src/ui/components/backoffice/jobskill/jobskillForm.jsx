import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router-dom";
import axios from "axios";
import { call } from "redux-saga/effects";
import { useSelector, shallowEqual } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Formik, Form, Field } from "formik";
import { Input } from "metronic/_partials/controls";

function JobskillForm(props) {
  const { onHide, getData } = props;
  const { id } = useParams();
  const api = process.env.REACT_APP_WEBAPI_URL;

  const { user } = useSelector(
    state => ({
      user: state.user.user
    }),
    shallowEqual
  );

  const [competence, setCompetence] = useState({ name: "" });

  useEffect(() => {
    if (id) {
      getCompetence();
    }
  }, [id]);

  const getCompetence = () => {
    const SEARCH_JOBSKILLS_API = api + "api/JobSkill/" + id;
    axios
      .get(SEARCH_JOBSKILLS_API)
      .then(res => setCompetence(res.data))
      .catch(err => console.log(err));
  };

  const onChangeCompetenceName = e => {
    setCompetence({
      ...competence,
      name: e.target.value
    });
  };

  const onUpdateJobskill = () => {
    const UPDATE_JOBSKILLS_API = api + "api/JobSkill";
    const body = competence;
    axios
      .put(UPDATE_JOBSKILLS_API, body)
      .then(res => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "La compétence a été mise à jour avec succèes."
        );
      })
      .catch(err => console.log(err));
  };

  const onCreateJobskill = () => {
    const UPDATE_JOBSKILLS_API = api + "api/JobSkill";
    const body = { ...competence, tenantID: user.tenantID };
    axios
      .post(UPDATE_JOBSKILLS_API, body)
      .then(res => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "La nouvelle compétence a été ajoutée avec succèes."
        );
      })
      .catch(err => console.log(err));
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.JOBSKILL" : "ADD.NEW.JOBSKILL"}
            />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.JOBSKILL" : "ADD.NEW.JOBSKILL"}
            />
          </p>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={onHide}
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
          <label>
            <FormattedMessage id="TEXT.JOBSKILL.NAME" />
          </label>
          <input
            name="city"
            className="form-control"
            type="text"
            value={competence ? competence.name : ""}
            onChange={onChangeCompetenceName}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            onClick={onHide}
            className="btn btn-light-primary btn-shadow font-weight-bold mr-2"
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          {id ? (
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold"
              onClick={onUpdateJobskill}
            >
              <FormattedMessage id="BUTTON.EDIT" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold"
              onClick={onCreateJobskill}
            >
              <FormattedMessage id="TEXT.CREATE" />
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default JobskillForm;

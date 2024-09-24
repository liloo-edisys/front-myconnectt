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

function HabilitationForm(props) {
  const { onHide, getData } = props;
  const { id } = useParams();
  const api = process.env.REACT_APP_WEBAPI_URL;

  const { user } = useSelector(
    state => ({
      user: state.user.user
    }),
    shallowEqual
  );

  const [competence, setCompetence] = useState({
    name: "",
    startDateRequired: false,
    endDateRequired: false
  });

  useEffect(() => {
    if (id) {
      getCompetence();
    }
  }, [id]);

  const getCompetence = () => {
    const SEARCH_HABILITATIONS_API = api + "api/Habilitation/" + id;
    axios
      .get(SEARCH_HABILITATIONS_API)
      .then(res => setCompetence(res.data))
      .catch(err => console.log(err));
  };

  const onChangeCompetenceName = e => {
    setCompetence({
      ...competence,
      name: e.target.value
    });
  };

  const onChangeCompetenceStartDateRequired = () => {
    setCompetence({
      ...competence,
      startDateRequired: !competence.startDateRequired
    });
  };

  const onChangeCompetenceEndDateRequired = () => {
    setCompetence({
      ...competence,
      endDateRequired: !competence.endDateRequired
    });
  };

  const onUpdateJobskill = () => {
    const UPDATE_HABILITATIONS_API = api + "api/Habilitation";
    let body = competence;

    axios
      .put(UPDATE_HABILITATIONS_API, body)
      .then(res => {
        getData();
        onHide();
        toastr.success(
          "Succès",
          "L'habilitation a été mise à jour avec succèes."
        );
      })
      .catch(err => console.log(err));
  };

  const onCreateJobskill = () => {
    const UPDATE_HABILITATIONS_API = api + "api/Habilitation";
    let body = { ...competence, tenantID: user.tenantID };

    axios
      .post(UPDATE_HABILITATIONS_API, body)
      .then(res => {
        getData();
        onHide();
        toastr.success("Succès", "L'habilitation a été ajoutée avec succèes.");
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
              id={id ? "EDIT.NEW.HABILITATION" : "ADD.NEW.HABILITATION"}
            />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.HABILITATION" : "ADD.NEW.HABILITATION"}
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
          <div>
            <label>
              <FormattedMessage id="TEXT.HABILITATION.NAME" />
            </label>
            <input
              name="city"
              className="form-control"
              type="text"
              value={competence ? competence.name : ""}
              onChange={onChangeCompetenceName}
            />
          </div>
          <div className="mt-10">
            <label>
              <FormattedMessage id="TEXT.HABILITATION.START.DATE.NAME" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    checked={competence.startDateRequired}
                    onChange={onChangeCompetenceStartDateRequired}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
          <div className="mt-10">
            <label>
              <FormattedMessage id="TEXT.HABILITATION.EXPIRATION.DATE.NAME" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    checked={competence.endDateRequired}
                    onChange={onChangeCompetenceEndDateRequired}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
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

export default HabilitationForm;

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

function RemunerationElementForm(props) {
  const { onHide, getData } = props;
  const { id } = useParams();
  const api = process.env.REACT_APP_WEBAPI_URL;

  const { user } = useSelector(
    state => ({
      user: state.user.user
    }),
    shallowEqual
  );

  const [missionRemuneration, setMissionRemuneration] = useState({
    label: "",
    rate: "",
    isVisible: false,
    cotisation: "",
    code: "",
    base: ""
  });
  const [newSiren, setNewSiren] = useState("");

  useEffect(() => {
    if (id) {
      getMissionRemuneration();
    }
  }, [id]);

  const getMissionRemuneration = () => {
    const SEARCH_MISSION_REMUNERATION_API =
      api + "api/MissionRemuneration/" + id;
    axios
      .get(SEARCH_MISSION_REMUNERATION_API)
      .then(res => {
        setMissionRemuneration({
          ...res.data,
          cotisation: res.data.cotisation ? res.data.cotisation : "",
          code: res.data.code ? res.data.code : "",
          base: res.data.base ? res.data.base : ""
        });
      })
      .catch(err => console.log(err));
  };

  const onChangeMissionRemunerationName = e => {
    setMissionRemuneration({
      ...missionRemuneration,
      label: e.target.value
    });
  };

  const onChangeMissionRemunerationRate = e => {
    setMissionRemuneration({
      ...missionRemuneration,
      rate: parseInt(e.target.value)
    });
  };

  const onChangeMissionRemunerationCotisation = e => {
    setMissionRemuneration({
      ...missionRemuneration,
      cotisation: e.target.value
    });
  };

  const onChangeMissionRemunerationVisible = () => {
    setMissionRemuneration({
      ...missionRemuneration,
      isVisible: !missionRemuneration.isVisible
    });
  };

  const onChangeMissionRemunerationCode = e => {
    setMissionRemuneration({
      ...missionRemuneration,
      code: e.target.value
    });
  };

  const onChangeMissionRemunerationBase = e => {
    setMissionRemuneration({
      ...missionRemuneration,
      base: e.target.value
    });
  };

  const onUpdateMissionRemuneration = () => {
    const UPDATE_MISSION_REMUNERATION_API = api + "api/MissionRemuneration";
    const body = missionRemuneration;
    axios
      .put(UPDATE_MISSION_REMUNERATION_API, body)
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

  const onCreateMissionRemuneration = () => {
    const UPDATE_MISSION_REMUNERATION_API = api + "api/MissionRemuneration";
    const body = { ...missionRemuneration, tenantID: user.tenantID };
    axios
      .post(UPDATE_MISSION_REMUNERATION_API, body)
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
              id={
                id
                  ? "EDIT.NEW.REMUNERATION.ELEMENT"
                  : "ADD.NEW.REMUNERATION.ELEMENT"
              }
            />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage
              id={
                id
                  ? "EDIT.NEW.REMUNERATION.ELEMENT"
                  : "ADD.NEW.REMUNERATION.ELEMENT"
              }
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
            <FormattedMessage id="TEXT.REMUNERATION.ELEMENT.NAME" />
          </label>
          <input
            className="form-control"
            type="text"
            value={missionRemuneration ? missionRemuneration.label : ""}
            onChange={onChangeMissionRemunerationName}
          />
        </div>
        <div className="mt-5">
          <label>
            <FormattedMessage id="MODEL.VACANCY.RATE" />
          </label>
          <input
            className="form-control"
            type="number"
            value={missionRemuneration ? missionRemuneration.rate : ""}
            onChange={onChangeMissionRemunerationRate}
          />
        </div>
        <div className="mt-5">
          <label>
            <FormattedMessage id="TEXT.COTISATION" />
          </label>
          <input
            className="form-control"
            type="text"
            value={missionRemuneration ? missionRemuneration.cotisation : ""}
            onChange={onChangeMissionRemunerationCotisation}
          />
        </div>
        <div className="mt-5">
          <label>
            <FormattedMessage id="TEXT.JOBTITLE.CODE" />
          </label>
          <input
            className="form-control"
            type="text"
            value={missionRemuneration ? missionRemuneration.code : ""}
            onChange={onChangeMissionRemunerationCode}
          />
        </div>
        <div className="mt-5">
          <label>
            <FormattedMessage id="MODEL.BASE" />
          </label>
          <input
            className="form-control"
            type="text"
            value={missionRemuneration ? missionRemuneration.base : ""}
            onChange={onChangeMissionRemunerationBase}
          />
        </div>
        <div className="mt-5">
          <label>
            <FormattedMessage id="TEXT.VISIBLE.BY.CUSTOMER" />
          </label>
          <div>
            <span className="switch switch switch-sm">
              <label>
                <input
                  type="checkbox"
                  checked={missionRemuneration.isVisible}
                  onChange={onChangeMissionRemunerationVisible}
                />
                <span></span>
              </label>
            </span>
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
              onClick={onUpdateMissionRemuneration}
            >
              <FormattedMessage id="BUTTON.EDIT" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold"
              onClick={onCreateMissionRemuneration}
            >
              <FormattedMessage id="TEXT.CREATE" />
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default RemunerationElementForm;

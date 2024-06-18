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

function AccountGroupForm(props) {
  const { onHide, getData } = props;
  const { id } = useParams();
  const api = process.env.REACT_APP_WEBAPI_URL;

  const { user } = useSelector(
    state => ({
      user: state.user.user
    }),
    shallowEqual
  );

  const [accountGroup, setAccountGroup] = useState({
    name: "",
    arrayAccordCadreSirens: []
  });
  const [newSiren, setNewSiren] = useState("");

  useEffect(() => {
    if (id) {
      getAccountGroup();
    }
  }, [id]);

  const getAccountGroup = () => {
    const SEARCH_ACCOUNT_GROUP_API = api + "api/AccountGroup/" + id;
    axios
      .get(SEARCH_ACCOUNT_GROUP_API)
      .then(res => {
        const newAccountGroup = {
          ...res.data,
          arrayAccordCadreSirens: res.data.arrayAccordCadreSirens
            ? res.data.arrayAccordCadreSirens
            : []
        };
        setAccountGroup(newAccountGroup);
      })
      .catch(err => console.log(err));
  };

  const onChangeCompetenceName = e => {
    setAccountGroup({
      ...accountGroup,
      name: e.target.value
    });
  };

  const onAddNewSiren = () => {
    let newSirensArray = accountGroup.arrayAccordCadreSirens;
    newSirensArray.push("");
    setAccountGroup({
      ...accountGroup,
      arrayAccordCadreSirens: newSirensArray
    });
  };

  const onUpdateSiren = (e, index) => {
    let newSirensArray = accountGroup.arrayAccordCadreSirens;
    newSirensArray[index] = e.target.value;
    setAccountGroup({
      ...accountGroup,
      arrayAccordCadreSirens: newSirensArray
    });
  };

  const onDeleteSiret = index => {
    let newSirensArray = accountGroup.arrayAccordCadreSirens;
    newSirensArray.splice(index, 1);
    setAccountGroup({
      ...accountGroup,
      arrayAccordCadreSirens: newSirensArray
    });
  };

  const onUpdateAccountGroup = () => {
    const UPDATE_ACCOUNT_GROUP_API = api + "api/AccountGroup";
    const body = accountGroup;
    axios
      .put(UPDATE_ACCOUNT_GROUP_API, body)
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

  const onCreateAccountGroup = () => {
    const UPDATE_ACCOUNT_GROUP_API = api + "api/AccountGroup";
    const body = { ...accountGroup, tenantID: user.tenantID };
    axios
      .post(UPDATE_ACCOUNT_GROUP_API, body)
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
              id={id ? "EDIT.NEW.ACCOUNT.GROUP" : "ADD.NEW.ACCOUNT.GROUP"}
            />
          </p>
        </Modal.Title>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <p className="pageDetails">
            <FormattedMessage
              id={id ? "EDIT.NEW.ACCOUNT.GROUP" : "ADD.NEW.ACCOUNT.GROUP"}
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
            <FormattedMessage id="TEXT.ACCOUNT.GROUP.NAME" />
          </label>
          <input
            name="city"
            className="form-control"
            type="text"
            value={accountGroup ? accountGroup.name : ""}
            onChange={onChangeCompetenceName}
          />
        </div>
        <div className="mt-10">
          <label>
            <FormattedMessage id="TITLE.SIREN.NUMBER" />
          </label>
          {accountGroup.arrayAccordCadreSirens &&
            accountGroup.arrayAccordCadreSirens.length > 0 &&
            accountGroup.arrayAccordCadreSirens.map((siren, i) => (
              <div className="input-group mb-5">
                <input
                  name="city"
                  className="form-control"
                  type="text"
                  value={siren}
                  onChange={e => onUpdateSiren(e, i)}
                />
                <div
                  className="input-group-append"
                  onClick={() => onDeleteSiret(i)}
                >
                  <span className="input-group-text bg-light-danger">
                    <i className="icon-sm text-danger flaticon2-delete icon-md extra-remuneration"></i>
                  </span>
                </div>
              </div>
            ))}
        </div>
        <div
          className="mission-form mt-5 p-0 d-flex flex-row align-items-center"
          onClick={onAddNewSiren}
        >
          <i className="ki ki-plus icon-md extra-remuneration"></i>
          <p className="extra-remuneration">
            <FormattedMessage id="TEXT.SIREN.ADD" />
          </p>
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
              onClick={onUpdateAccountGroup}
            >
              <FormattedMessage id="BUTTON.EDIT" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold"
              onClick={onCreateAccountGroup}
            >
              <FormattedMessage id="TEXT.CREATE" />
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default AccountGroupForm;

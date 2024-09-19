import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import {
  getAccountTemplates,
  getAccountMissions,
  setCurrentTemplate,
  setCurrentDuplicate,
  getMission as getMissionAction,
  getTemplate as getTemplateAction
} from "actions/client/missionsActions";
import { deleteFromStorage } from "../../shared/DeleteFromStorage";
import {
  deleteCurrentDuplicate,
  deleteCurrentTemplate
} from "../../../../business/actions/client/missionsActions";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";

const MissionFormType = ({ intl, isChecked, history, CompanyEditModal }) => {
  const dispatch = useDispatch();
  const { templates, missions, userDetails, mission } = useSelector(
    state => ({
      templates: state.missionsReducerData.templates,
      missions: state.missionsReducerData.missions.list,
      userDetails: state.auth.user,
      mission: state.missionsReducerData.mission
    }),
    shallowEqual
  );

  const [show, setShow] = useState("");
  const [selection, setSelection] = useState();
  const [templateSelection, setTemplateSelection] = useState();
  useEffect(() => {
    dispatch(getAccountTemplates.request());
    selection && dispatch(getMissionAction.request(selection));
    templateSelection && dispatch(getTemplateAction.request(templateSelection));
    dispatch(getAccountMissions.request({ tenantID: userDetails.tenantID }));
  }, [dispatch, userDetails, selection, templateSelection]);
  let deleteItems = () => {
    var result = {};
    for (var type in window.localStorage)
      if (!type.includes("persist")) result[type] = window.localStorage[type];
    for (var item in result) deleteFromStorage(item);
  };
  const handleCardClick = () => {
    deleteItems();
    dispatch(getMissionAction.delete());
    return !isChecked ? CompanyEditModal() : history.push("mission-create/");
  };

  const handleValidateClick = show => {
    dispatch(deleteCurrentDuplicate.request());
    dispatch(deleteCurrentTemplate.request());
    deleteItems();
    if (mission !== null && mission.id > 0) {
      show === "template" && dispatch(setCurrentTemplate.request(mission));
      show === "duplicate" && dispatch(setCurrentDuplicate.request(mission));
      history.push("mission-create/");
    }
  };

  const onHide = () => {
    setShow("");
  };
  const handleChoiceClick = value => {
    setShow(value);
  };

  const getMission = id => {
    setSelection(id);
  };

  const getTemplate = id => {
    setTemplateSelection(id);
  };

  const renderModal = () => {
    return (
      <Modal
        size="md"
        show={show !== ""}
        onHide={onHide}
        aria-labelledby="example-modal-sizes-title-md"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {show === "template"
              ? intl.formatMessage({ id: "MISSION.CREATE.TEMPLATE.TITLE" })
              : intl.formatMessage({ id: "MISSION.CREATE.DUPLICATE.TITLE" })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className=" col-form-label">
              {show === "template"
                ? intl.formatMessage({ id: "MISSION.DUPLICATE.FROM_TEMPLATE" })
                : intl.formatMessage({ id: "MISSION.DUPLICATE.FROM_MISSION" })}
            </label>
            {show === "template" &&
              (templates ? (
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl fas fa-list text-primary"></i>
                    </span>
                  </div>
                  <select
                    onChange={e => getTemplate(e.target.value)}
                    className="form-control form-control-lg"
                  >
                    <option disabled selected value="">
                      --{" "}
                      {intl.formatMessage({
                        id: "MISSION.DUPLICATE.FROM_TEMPLATE"
                      })}{" "}
                      --
                    </option>
                    {templates.map(template => (
                      <option
                        value={template.id}
                        data={{ ...template }}
                        label={template.vacancyTemplateName}
                      >
                        {template.vacancyTemplateName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="d-flex justify-content-center mt-5">
                  <div
                    className="alert alert-custom alert-notice alert-light-info fade show px-5 py-0"
                    role="alert"
                  >
                    <div className="alert-icon">
                      <i className="flaticon-warning"></i>
                    </div>
                    <div className="alert-text">
                      <FormattedMessage id="MESSAGE.CREATE.TEMPLATE" />
                    </div>
                  </div>
                </div>
              ))}
            {show === "duplicate" &&
              (missions && missions.length > 0 ? (
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl fas fa-list text-primary"></i>
                    </span>
                  </div>
                  <select
                    onChange={e => getMission(e.target.value)}
                    className="form-control form-control-lg"
                  >
                    <option disabled selected value="">
                      --{" "}
                      {intl.formatMessage({
                        id: "MISSION.DUPLICATE.FROM_MISSION"
                      })}{" "}
                      --
                    </option>
                    {missions
                      .filter(m => m.status !== 0)
                      .map(mission => (
                        <option value={mission.id} label={mission.vacancyTitle}>
                          {mission.vacancyTitle}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="d-flex justify-content-center mt-5">
                  <div
                    className="alert alert-custom alert-notice alert-light-info fade show px-5 py-0"
                    role="alert"
                  >
                    <div className="alert-icon">
                      <i className="flaticon-warning"></i>
                    </div>
                    <div className="alert-text">
                      <FormattedMessage id="MESSAGE.CREATE.VACANCY" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="form-group step-buttons-lg col-lg-12 d-flex p-0 flex-wrap flex-center">
            <button
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              onClick={() => setShow("")}
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </button>

            <button
              onClick={() => handleValidateClick(show)}
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            >
              <FormattedMessage id="BUTTON.VALIDATE" />
            </button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <div className="justify-content-around row mt-10 ml-10 mr-10">
      {renderModal()}
      {!isNullOrEmpty(templates) ? (
        <div
          onClick={() => handleChoiceClick("template")}
          className="card card-custom gutter-b mission-card col-lg-3 min-w-300px box-shadow-primary"
        >
          <div className="mission-card-header">
            <div className="icon-wrapper large-icon">
              <img
                src="/media/elements/mission-template.gif"
                alt=""
                className="align-self-end h-200px"
              />
            </div>

            <h3 className="mt-5">
              <FormattedMessage id="MISSION.CREATE.TEMPLATE.TITLE" />
            </h3>
            <p className="description mb-30">
              <FormattedMessage id="MISSION.CREATE.TEMPLATE.DESC" />
            </p>
          </div>
          <div className="mission-card-footer bg-info">
            <FormattedMessage id="MISSION.CREATE.TEMPLATE.BUTTON" />
          </div>
        </div>
      ) : (
        <div className="card disabled-div card-custom gutter-b mission-card col-lg-3 min-w-300px box-shadow-primary">
          <div className="mission-card-header">
            <div className="icon-wrapper large-icon">
              <img
                src="/media/elements/mission-template.gif"
                alt=""
                className="align-self-end h-200px"
              />
            </div>

            <h3 className="mt-5">
              <FormattedMessage id="MISSION.CREATE.TEMPLATE.TITLE" />
            </h3>
            <p className="description mb-30">
              <FormattedMessage id="MISSION.CREATE.TEMPLATE.DESC" />
            </p>
          </div>
          <div className="mission-card-footer bg-info">
            <FormattedMessage id="MISSION.CREATE.TEMPLATE.BUTTON" />
          </div>
        </div>
      )}
      {!isNullOrEmpty(missions) ? (
        <div
          onClick={() => handleChoiceClick("duplicate")}
          className="card card-custom gutter-b mission-card col-lg-3 min-w-300px box-shadow-primary"
        >
          <div className="mission-card-header">
            <div className="icon-wrapper large-icon">
              <img
                src="/media/elements/mission-duplicate.gif"
                alt=""
                className="align-self-end h-200px"
              />
            </div>

            <h3 className="mt-5">
              <FormattedMessage id="MISSION.CREATE.DUPLICATE.TITLE" />
            </h3>
            <p className="description mb-30">
              2
              <FormattedMessage id="MISSION.CREATE.DUPLICATE.DESC" />
            </p>
          </div>
          <div className="mission-card-footer bg-info">
            <FormattedMessage id="MISSION.CREATE.DUPLICATE.BUTTON" />
          </div>
        </div>
      ) : (
        <div className="card disabled-div card-custom gutter-b mission-card col-lg-3 min-w-300px box-shadow-primary">
          <div className="mission-card-header">
            <div className="icon-wrapper large-icon">
              <img
                src="/media/elements/mission-duplicate.gif"
                alt=""
                className="align-self-end h-200px"
              />
            </div>

            <h3 className="mt-5">
              <FormattedMessage id="MISSION.CREATE.DUPLICATE.TITLE" />
            </h3>
            <p className="description mb-30">
              <FormattedMessage id="MISSION.CREATE.DUPLICATE.DESC" />
            </p>
          </div>
          <div className="mission-card-footer bg-info">
            <FormattedMessage id="MISSION.CREATE.DUPLICATE.BUTTON" />
          </div>
        </div>
      )}
      <div
        onClick={() => {
          handleCardClick("new");
        }}
        className="card card-custom gutter-b mission-card col-lg-3 min-w-300px box-shadow-primary"
      >
        <div className="mission-card-header">
          <div className="icon-wrapper large-icon">
            <img
              src="/media/elements/mission-scratch.gif"
              alt=""
              className="align-self-end h-200px"
            />
          </div>

          <h3 className="mt-5">
            <FormattedMessage id="MISSION.CREATE.NEW.TITLE" />
          </h3>
          <p className="description mb-30">
            <FormattedMessage id="MISSION.CREATE.NEW.DESC" />
          </p>
        </div>
        <div className="mission-card-footer bg-info">
          <FormattedMessage id="MISSION.CREATE.NEW.BUTTON" />
        </div>
      </div>
    </div>
  );
};

export default injectIntl(MissionFormType);

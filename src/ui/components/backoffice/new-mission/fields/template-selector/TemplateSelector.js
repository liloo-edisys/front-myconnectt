import React, { useEffect, useState } from "react";
import { FormattedMessage, injectIntl, useIntl } from "react-intl";
import { Modal } from "react-bootstrap";
import axios from "axios";
import moment from "moment";

const TemplateSelector = props => {
  const intl = useIntl();
  const {
    setSelectedTemplate,
    selectedAccount,
    vacancyTemplates,
    setTemplateSelection,
    missions
  } = props;
  const [show, setShow] = useState("");

  ///api/VacancyTemplate/{id}

  const showModal = type => {
    setShow(type);
  };

  const onHide = () => {
    setShow("");
  };

  const getTemplate = id => {
    const templateIndex = vacancyTemplates.findIndex(
      template => template.id === parseInt(id)
    );
    let selectedTemplate = {
      ...vacancyTemplates[templateIndex],
      vacancyContractualVacancyEmploymentContractTypeStartDate: "",
      vacancyContractualVacancyEmploymentContractTypeEndDate: "",
      status: 1
      /*vacancyContractualVacancyEmploymentContractTypeStartDate: moment(
        vacancyTemplates[templateIndex]
          .vacancyContractualVacancyEmploymentContractTypeStartDate
      ),
      vacancyContractualVacancyEmploymentContractTypeEndDate: moment(
        vacancyTemplates[templateIndex]
          .vacancyContractualVacancyEmploymentContractTypeEndDate
      )*/
    };
    delete selectedTemplate["id"];
    setTemplateSelection(selectedTemplate);
  };

  const getMission = id => {
    axios
      .get(process.env.REACT_APP_WEBAPI_URL + "api/Vacancy/" + id)
      .then(res => {
        let selectedTemplate = {
          ...res.data,
          status: 1,
          vacancyContractualVacancyEmploymentContractTypeStartDate: "",
          vacancyContractualVacancyEmploymentContractTypeEndDate: ""
          /*vacancyContractualVacancyEmploymentContractTypeStartDate: moment(
            res.data.vacancyContractualVacancyEmploymentContractTypeStartDate
          ),
          vacancyContractualVacancyEmploymentContractTypeEndDate: moment(
            res.data.vacancyContractualVacancyEmploymentContractTypeEndDate
          )*/
        };
        delete selectedTemplate["id"];
        setTemplateSelection(selectedTemplate);
      })
      .catch(err => console.log(err));
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
              (vacancyTemplates && vacancyTemplates.length > 0 ? (
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl fas fa-list text-primary"></i>
                    </span>
                  </div>
                  <select
                    onChange={(e, data) => getTemplate(e.target.value, data)}
                    className="form-control form-control-lg"
                  >
                    <option disabled selected value="">
                      --{" "}
                      {intl.formatMessage({
                        id: "MISSION.DUPLICATE.FROM_TEMPLATE"
                      })}{" "}
                      --
                    </option>
                    {vacancyTemplates.map(template => (
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
            <div
              type="button"
              className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              onClick={() => setShow("")}
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </div>

            <div
              onClick={() => setSelectedTemplate("ok")}
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            >
              <FormattedMessage id="BUTTON.VALIDATE" />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <div className="justify-content-around row mt-10 ml-10 mr-10">
      {renderModal()}
      <div
        onClick={() => showModal("template")}
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
      <div
        onClick={() => showModal("duplicate")}
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
            <FormattedMessage id="MISSION.CREATE.DUPLICATE.DESC" />
          </p>
        </div>
        <div className="mission-card-footer bg-info">
          <FormattedMessage id="MISSION.CREATE.DUPLICATE.BUTTON" />
        </div>
      </div>
      <div
        className="card card-custom gutter-b mission-card col-lg-3 min-w-300px box-shadow-primary"
        onClick={() => setSelectedTemplate("ok")}
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

export default injectIntl(TemplateSelector);

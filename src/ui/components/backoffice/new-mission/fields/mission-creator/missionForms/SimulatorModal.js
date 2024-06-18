import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Modal } from "react-bootstrap";
//import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import { FormattedMessage, useIntl } from "react-intl";
import { toastr } from "react-redux-toastr";
import moment from "moment";
import axios from "axios";
import { validateMission } from "actions/client/MissionsActions";

function SimulatorModal(props) {
  const dispatch = useDispatch();
  const { missionToDisplay, user } = useSelector(
    state => ({
      missionToDisplay: state.missionsReducerData.lastCreatedMission,
      user: state.user.user
    }),
    shallowEqual
  );
  const {
    hideSimulator,
    hourlySalary,
    startDate,
    endDate,
    startHour,
    endHour,
    accountID,
    jobTitleID,
    setAgreementValidated,
    weeklyHours
  } = props;

  const intl = useIntl();
  const [localHourlySalary, setLocalHourlySalary] = useState(0);
  const [localWeeklyHours, setLocalWeeklyHours] = useState(0);
  const [localMissionDuration, setLocalMissionDuration] = useState(0);
  const [coeficient, setCoeficient] = useState(2);
  const [conditionAccepted, setConditionAccepted] = useState(false);
  const [coeficientAccepted, setCoeficientAccepted] = useState(false);
  const [isCoeficient, setIsCoeficient] = useState(false);

  useEffect(() => {
    /*var a = moment(startDate);
    var b = moment(endDate);
    let workingDay = b.diff(a, "days") + 1;
    const workingWeek = parseInt(workingDay / 7);
    workingDay = workingDay - workingWeek * 2;
    const hours = weeklyHours / 5;*/

    let start = moment(
      new Date(startDate).toLocaleDateString("en-CA"),
      "YYYY-MM-DD"
    );
    let end = moment(
      new Date(endDate).toLocaleDateString("en-CA"),
      "YYYY-MM-DD"
    );
    let workingDay = 0;

    while (start <= end) {
      if (start.format("ddd") !== "sam." && start.format("ddd") !== "dim.") {
        workingDay++;
      }
      start = moment(start, "YYYY-MM-DD").add(1, "days");
    }
    if (workingDay > 5) {
      workingDay = 5;
    }

    const hours = weeklyHours / 5;

    let body = {
      id1: accountID,
      id2: jobTitleID
    };
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/GetCommercialAgreement`,
        body
      )
      .then(res => {
        if (res.data) {
          if (res.data.isValidated) {
            setIsCoeficient(true);
          }
          if (res.data.coefficient && res.data.coefficient !== 0) {
            setCoeficient(res.data.coefficient);
          } else {
            setCoeficient(2);
          }
        }
      });

    setLocalHourlySalary(hourlySalary);
    setLocalWeeklyHours(hours);
    setLocalMissionDuration(workingDay);
  }, []);

  const validateAgreement = () => {
    if (coeficientAccepted) {
      const body = {
        id: user.id,
        tenantID: 1,
        accountID: missionToDisplay.accountID,
        qualificationID: jobTitleID,
        coefficient: coeficient
      };
      axios
        .post(
          `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/BackofficeValidate`,
          body
        )
        .then(res => {
          /*setAgreementValidated(true);
          dispatch(
            validateMission.request(
              {
                ...missionToDisplay,
                MissionIsValidated: true,
                IsCreateTemplate: true,
              },
              { id: missionToDisplay.id }
            )
          );*/
        })
        .catch(err =>
          toastr.error(
            intl.formatMessage({ id: "ERROR" }),
            "Une erreur s'est produite lors de la validation."
          )
        );
    } else {
      toastr.error(
        "Offre incomplète",
        "Veuillez accepter le coefficient proposé et prendre connaissance des conditions générales de vente."
      );
    }
  };

  const askToContact = () => {
    const body = {
      id: user.id,
      tenantID: 1,
      qualificationID: jobTitleID,
      coefficient: coeficient
    };
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/NegociationRequest`,
        body
      )
      .then(res => {
        hideSimulator();
        toastr.success(
          "Votre demande envoyée.",
          "L'un de nos conseiller vous recontactera dans les plus brefs délais"
        );
      })
      .catch(err => {
        toastr.error(
          intl.formatMessage({ id: "ERROR" }),
          "Une erreur s'est produite lors de la demande."
        );
      });
  };

  const toogleCoeficientAccepted = () => {
    setCoeficientAccepted(!coeficientAccepted);
  };

  const toogleConditionAccepted = () => {
    setConditionAccepted(!conditionAccepted);
  };

  const handleClose = () => {
    hideSimulator();
  };

  return (
    <Modal
      size="xl"
      show={true}
      onHide={hideSimulator}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton style={{ display: "block" }}>
        <Modal.Title id="example-modal-sizes-title-lg">
          <div>
            <h1 style={{ textAlign: "center", color: "#4f91fe" }}>
              <FormattedMessage id="TITLE.COST.ESTIMATION" />
            </h1>
            <div style={{ fontSize: 10, textAlign: "center" }}>
              <FormattedMessage id="MESSAGE.COST.ESTIMATION" />
            </div>
          </div>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={() => handleClose()}
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
        <h1 className="mb-10 text-primary" style={{ textAlign: "center" }}>
          {missionToDisplay.vacancyTitle}
        </h1>
        <div className="form form-label-right">
          <div className="form-group row mx-10">
            <div
              className="col-lg-6 pr-10"
              style={{ borderRight: "1px solid red" }}
            >
              <div className="row mb-5">
                <label
                  className="col-form-label col-lg-8"
                  style={{ color: "#4f91fe", fontSize: 14 }}
                >
                  <FormattedMessage id="DISPLAY.INTERIMAIRE.REMUNERATION" />
                </label>
                <div className="input-group col-lg-4">
                  <input
                    className="col-lg-12"
                    style={{
                      backgroundColor: "#c0dafc",
                      color: "#4f91fe",
                      fontSize: 16,
                      fontWeight: "bold",
                      textAlign: "center",
                      borderRadius: 5,
                      border: "1px solid #4f91fe"
                    }}
                    component={Input}
                    value={localHourlySalary}
                    onChange={e => setLocalHourlySalary(e.target.value)}
                  />
                </div>
              </div>
              <div className="row mb-5">
                <label
                  className="col-form-label col-lg-8"
                  style={{ color: "#4f91fe", fontSize: 14 }}
                >
                  <FormattedMessage id="DISPLAY.NUMBER.WOKRED.DAYS" />
                </label>
                <div className="input-group col-lg-4">
                  <input
                    className="col-lg-12"
                    style={{
                      backgroundColor: "#c0dafc",
                      color: "#4f91fe",
                      fontSize: 16,
                      fontWeight: "bold",
                      textAlign: "center",
                      borderRadius: 5,
                      border: "1px solid #4f91fe"
                    }}
                    component={Input}
                    value={localMissionDuration}
                    onChange={e => setLocalMissionDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="row mb-5">
                <label
                  className="col-form-label col-lg-8"
                  style={{ color: "#4f91fe", fontSize: 14 }}
                >
                  <FormattedMessage id="DISPLAY.HOURS.PER.DAY" />
                </label>
                <div className="input-group col-lg-4">
                  <input
                    className="col-lg-12"
                    style={{
                      backgroundColor: "#c0dafc",
                      color: "#4f91fe",
                      fontSize: 16,
                      fontWeight: "bold",
                      textAlign: "center",
                      borderRadius: 5,
                      border: "1px solid #4f91fe"
                    }}
                    component={Input}
                    value={localWeeklyHours}
                    onChange={e => setLocalWeeklyHours(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-6 pl-10">
              <div className="mb-5" style={{ textAlign: "right" }}>
                <label
                  className="col-form-label"
                  style={{ color: "#4f91fe", fontSize: 14 }}
                >
                  <span style={{ fontWeight: "bold", color: "red" }}>*</span>
                  <FormattedMessage id="DISPLAY.TOTAL.HT.BILLED" />
                </label>
                <div
                  className="input-group mb-5"
                  style={{
                    justifyContent: "flex-end"
                  }}
                >
                  <input
                    className="col-lg-4 py-2"
                    style={{
                      color: "#4f91fe",
                      fontSize: 16,
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                    component={Input}
                    disabled
                    value={`${parseFloat(
                      localHourlySalary *
                        localWeeklyHours *
                        coeficient *
                        localMissionDuration
                    ).toFixed(2)}€`}
                  />
                </div>
              </div>
              <div className="row mb-5">
                <label
                  className="col-form-label col-lg-8"
                  style={{ color: "#4f91fe", fontSize: 14 }}
                >
                  <FormattedMessage id="DISPLAY.COEFFICIENT.BILL" /> :
                </label>
                <div className="input-group col-lg-4">
                  <input
                    component={Input}
                    disabled
                    className="col-lg-12"
                    style={{
                      backgroundColor: "#c0dafc",
                      color: "#4f91fe",
                      fontSize: 16,
                      fontWeight: "bold",
                      textAlign: "center",
                      borderRadius: 5,
                      border: "1px solid #4f91fe"
                    }}
                    value={coeficient}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mb-10">
            <div style={{ textAlign: "center" }}>
              <div>
                Coût total de la mission = (Taux horaire X Nb d'heures par jour)
                X Nb jours travaillés
                {/*<FormattedMessage id="MESSAGE.TOTAL.COST.VACANCY" />*/}
              </div>{" "}
              {/*<div>
                {`Le calcul est effectué sur une semaine de mission standard : ${localHourlySalary} x ${weeklyHours} x ${coeficient}.`}
              </div>*/}
              <div className="mt-5">
                <span className="text-danger">*</span> Mission standard: les
                tarifs ci dessus, sont exprimés pour une semaine hors majoration
              </div>
              <div>
                (heures de nuit, heures supplémentaires, heures de week-end,
                heures de jour férié)
              </div>
            </div>
            <div
              className="mt-5"
              style={{ color: "#4f91fe", fontSize: 14, textAlign: "center" }}
            >
              <FormattedMessage id="TEXT.MISSION.COEFICIENT" />
            </div>
          </div>
          {!isCoeficient && (
            <div>
              <div style={{ textAlign: "center" }} className="mb-10">
                <div>
                  <label style={{ color: "#4f91fe", fontSize: 14 }}>
                    <input
                      onClick={toogleCoeficientAccepted}
                      type="checkbox"
                      name="acceptCoeficient"
                      checked={coeficientAccepted}
                    />{" "}
                    <FormattedMessage id="TEXT.ACCEPT.MISSION.COEFICIENT" />
                  </label>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <a
                  onClick={askToContact}
                  className="my-3 mx-4"
                  style={{ color: "#4f91fe", borderBottom: "1px solid" }}
                >
                  <FormattedMessage id="BUTTON.WANT.CONTACT" />
                </a>
                <button
                  onClick={validateAgreement}
                  className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                >
                  <FormattedMessage id="BUTTON.VALIDATE" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SimulatorModal;

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Modal } from "react-bootstrap";
import { Input } from "metronic/_partials/controls";
import { FormattedMessage } from "react-intl";
import axios from "axios";
import { getJobTitles } from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

function SimulatorModalEmpty(props) {
  const dispatch = useDispatch();
  const { missionToDisplay, user, jobTitleList, accountID } = useSelector(
    state => ({
      missionToDisplay: state.missionsReducerData.lastCreatedMission,
      user: state.user.user,
      jobTitleList: state.lists.jobTitles,
      accountID: state.auth.user.accountID
    }),
    shallowEqual
  );
  const { hideSimulator } = props;

  const [localHourlySalary, setLocalHourlySalary] = useState("");
  const [localWeeklyHours, setLocalWeeklyHours] = useState("");
  const [localMissionDuration, setLocalMissionDuration] = useState("");
  const [coeficient, setCoeficient] = useState(2);
  const [conditionAccepted, setConditionAccepted] = useState(false);
  const [coeficientAccepted, setCoeficientAccepted] = useState(false);
  const [isCoeficient, setIsCoeficient] = useState(false);

  useEffect(() => {
    isNullOrEmpty(jobTitleList) && dispatch(getJobTitles.request());
  }, [jobTitleList]);

  const getCoeficient = e => {
    const id = parseInt(e.target.value);
    const body = {
      id1: accountID,
      id2: id
    };
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/GetCommercialAgreement`,
        body
      )
      .then(res => {
        if (res.data) {
          if (res.data.coefficient !== 0) {
            setCoeficient(res.data.coefficient);
          } else {
            setCoeficient(2);
          }
        }
      });
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
        <div className="form-group row mx-10">
          <select
            className="form-control h-auto py-5 px-6 mb-10"
            name="titleTypeID"
            onChange={e => {
              getCoeficient(e);
            }}
          >
            {jobTitleList.map(xp => (
              <option key={xp.id} value={xp.id}>
                {xp.name}
              </option>
            ))}
          </select>
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
                    localHourlySalary * localWeeklyHours * coeficient * 5
                  ).toFixed(2)}€`}
                  /*value={`${parseFloat(
                    localHourlySalary *
                      localWeeklyHours *
                      coeficient *
                      localMissionDuration
                  ).toFixed(2)}€`}*/
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
              <FormattedMessage id="MESSAGE.TOTAL.COST.VACANCY" />
            </div>{" "}
            <div>
              Le calcul est effectué sur une semaine de mission standard.
            </div>
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
      </Modal.Body>
    </Modal>
  );
}

export default SimulatorModalEmpty;

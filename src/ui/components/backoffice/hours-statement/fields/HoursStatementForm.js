import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import axios from "axios";
import _, { isNull } from "lodash";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getMissionRemuneration } from "../../../../../business/actions/shared/listsActions";
import { joursFeriesFix, joursFeriesFlexible } from "./joursFeries";

function HoursStatementForm(props) {
  const { id } = useParams();
  const { idList, getRH } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const intl = useIntl();
  const { missionRemuneration } = useSelector(state => ({
    missionRemuneration: state.lists.missionRemuneration,
    user: state.auth.user
  }));
  const [timeRecords, setTimeRecords] = useState(null);
  const [missionRemunerationItems, setMissionRemunerationItems] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [remunerationElements, setRemunerationElements] = useState([]);
  const [remunerations, setRemunerations] = useState([]);
  const [totalDayHours, setTotalDaysHours] = useState(0);
  const [totalNightHours, setTotalNightHours] = useState(0);
  const [totalWeekHours, setTotalWeekHours] = useState(0);
  const [totalWeekMinutes, setTotalWeekMinutes] = useState(0);
  const [reloadCalculation, setReloadCalculation] = useState(false);
  const [reload, setReload] = useState(false);
  const [contract, setContract] = useState(null);
  useEffect(() => {
    dispatch(getMissionRemuneration.request());
    getData();
  }, [id]);

  useEffect(() => {
    calculateTotalHours(daysOfWeek);
  }, [reloadCalculation]);

  useEffect(() => {
    renderRemunerationElements();
  }, [remunerations]);

  const DaysArray = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi"
  ];

  const getData = () => {
    const GET_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/${id}`;
    axios
      .get(GET_TIME_RECORDS_URL)
      .then(res => {
        const CONTRACT_URL = `${process.env.REACT_APP_WEBAPI_URL}api/contract/${res.data.contractID}`;
        axios.get(CONTRACT_URL).then(result => {
          setContract(result.data);
        });
        calculateTotalHours(res.data.dailyTimeRecords);
        getMonths(res.data);
        setRemunerations(
          res.data.additionalRemunerationItems
            ? res.data.additionalRemunerationItems
            : []
        );
        setTimeRecords(res.data);
      })
      .catch(err => console.log(err));
  };

  const calculateTotalHours = dailyTimeRecords => {
    let dayHoursTemp = 0;
    let nightHoursTemp = 0;

    for (let i = 0; i < dailyTimeRecords.length; i++) {
      if (dailyTimeRecords[i].dayHours) {
        dayHoursTemp = dayHoursTemp + dailyTimeRecords[i].dayHours;
      } else {
        dayHoursTemp = dayHoursTemp + 0;
      }

      if (dailyTimeRecords[i].nightHours) {
        nightHoursTemp = nightHoursTemp + dailyTimeRecords[i].nightHours;
      } else {
        nightHoursTemp = nightHoursTemp + 0;
      }
    }

    const dayHours = parseFloat(dayHoursTemp);
    const nightHours = parseFloat(nightHoursTemp);
    const totalHours = parseFloat(dayHoursTemp + nightHoursTemp);

    setTotalDaysHours(dayHours);
    setTotalNightHours(nightHours);
    setTotalWeekHours(totalHours);
  };

  const getMonths = data => {
    const { dailyTimeRecords } = data;
    let newDailyTimeRecords = [];
    for (let i = 0; i < dailyTimeRecords.length; i++) {
      const date = dailyTimeRecords[i].date.substring(0, 10);
      const year = dailyTimeRecords[i].date.substring(0, 5);
      const result = joursFeriesFix.filter(word => year + word === date);
      const result2 = joursFeriesFlexible.filter(word => word === date);
      if (result.length > 0 || result2.length > 0) {
        newDailyTimeRecords.push({
          ...dailyTimeRecords[i],
          isFerie: true
        });
      } else {
        newDailyTimeRecords.push({
          ...dailyTimeRecords[i],
          isFerie: false
        });
      }
    }
    setDaysOfWeek(newDailyTimeRecords);
  };

  useEffect(() => {
    renderDaysForm();
  }, [reload]);

  const sendToAnael = () => {
    const GET_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord`;
    let body = {
      ...timeRecords,
      dailyTimeRecords: daysOfWeek,
      additionalRemunerationItems: remunerations
    };
    axios
      .put(GET_TIME_RECORDS_URL, body)
      .then(() => {
        const SENDTOANAEL_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/SendToAnael/${id}`;
        axios
          .get(SENDTOANAEL_TIME_RECORDS_URL)
          .then(() => {
            getData();
            getRH();
            toastr.success(
              "Succès",
              "Le relevé d'heures a bien été envoyé à Anael."
            );
          })
          .catch(() => {
            toastr.error(
              "Erreur",
              "Une erreur s'est produite l'envoi du relevé d'heures à Anael."
            );
          });
      })
      .catch(() => {
        toastr.error(
          "Erreur",
          "Une erreur s'est produite lors de la mis à jour du relevé d'heures."
        );
      });
  };

  const renderDaysForm = () => {
    return daysOfWeek.map((day, i) => (
      <div
        key={i}
        className="mb-2"
        style={{ borderBottom: "1px solid lightgrey" }}
      >
        <div>
          <strong>{day.longDate}</strong>
        </div>
        <div className="form-group my-2 row">
          <div className="col-lg-6">
            <label>Heures de jour</label>
            <div className="form-group mb-2 row px-2">
              <div className="col-lg-3 p-0">
                <input
                  className="form-control p-2"
                  type="number"
                  placeholder="7"
                  value={day.dayHours}
                  onChange={e => onChangeHours(e, i, "dayHours")}
                />
              </div>
              <div className="col-lg-3 p-0">
                <input
                  className="form-control p-2"
                  type="number"
                  placeholder="30"
                  value={day.dayMinutes}
                  onChange={e => onChangeHours(e, i, "dayMinutes")}
                  disabled={
                    timeRecords != null &&
                    (timeRecords.ended || timeRecords.status === 2)
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <label>Heures de nuit</label>
            <div className="form-group mb-2 row px-2">
              <div className="col-lg-3 p-0">
                <input
                  className="form-control p-2"
                  type="number"
                  placeholder="7"
                  value={day.nightHours}
                  onChange={e => onChangeHours(e, i, "nightHours")}
                  disabled={
                    timeRecords != null &&
                    (timeRecords.ended || timeRecords.status === 2)
                  }
                />
              </div>
              <div className="col-lg-3 p-0">
                <input
                  className="form-control p-2"
                  type="number"
                  placeholder="30"
                  value={day.nightMinutes}
                  onChange={e => onChangeHours(e, i, "nightMinutes")}
                  disabled={
                    timeRecords != null &&
                    (timeRecords.ended || timeRecords.status === 2)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const onChangeHours = (e, index, label) => {
    let daysOfWeekTemp = daysOfWeek;
    let value = e.target.value;
    if (
      (parseFloat(value) >= 60 &&
        (label === "dayMinutes" || label === "nightMinutes")) ||
      (parseFloat(value) >= 24 &&
        (label === "dayHours" || label === "nightHours"))
    ) {
      value = 0;
    }
    if (
      parseFloat(value) < 0 &&
      (label === "dayMinutes" || label === "nightMinutes")
    ) {
      value = 59;
    }
    if (
      parseFloat(value) < 0 &&
      (label === "dayHours" || label === "nightHours")
    ) {
      value = 23;
    }
    if (label === "dayHours") {
      daysOfWeekTemp[index].dayHours = parseFloat(value);
    } else if (label === "dayMinutes") {
      daysOfWeekTemp[index].dayMinutes = parseFloat(value);
    } else if (label === "nightHours") {
      daysOfWeekTemp[index].nightHours = parseFloat(value);
    } else if (label === "nightMinutes") {
      daysOfWeekTemp[index].nightMinutes = parseFloat(value);
    }
    //daysOfWeekTemp[index].[label] = parseInt(value);
    setDaysOfWeek(daysOfWeekTemp);
    setReload(!reload);
    setReloadCalculation(!reloadCalculation);
  };

  const onUpdateTimeRecords = state => {
    let hoursError = false;
    daysOfWeek.forEach(dtr => {
      const totalMins = dtr.dayHours + dtr.nightHours;
      if (totalMins > 14) {
        hoursError = true;
      }
    });
    if (!hoursError) {
      if (state === "anael") {
        sendToAnael();
      } else {
        const GET_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord`;
        let body = {
          ...timeRecords,
          dailyTimeRecords: daysOfWeek,
          additionalRemunerationItems: remunerations
        };
        axios
          .put(GET_TIME_RECORDS_URL, body)
          .then(() => {
            if (state === "update") {
              toastr.success(
                "Succès",
                "Le relevé d'heures a bien été mis à jour."
              );
            } else if (state === "close") {
              history.push(`/cra/close-mission/${timeRecords.id}`);
            }
          })
          .catch(() => {
            toastr.error(
              "Erreur",
              "Une erreur s'est produite lors de la mis à jour du relevé d'heures."
            );
          });
      }
    } else {
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        intl.formatMessage({ id: "ERROR.HOURS.STATEMENT.14" })
      );
    }
  };

  const renderRemunerationElements = () => {
    let el = [];
    let index = 0;
    for (let i = 0; i < remunerations.length; i++) {
      el.push(
        <div className="col-lg-8 p-0 d-flex flex-row justify-content-between">
          <label className="col-lg-5  ">
            <FormattedMessage id="MODEL.DESIGNATION" />
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-list text-primary"></i>
                </span>
              </div>
              <select
                name="missionRemunerationItems"
                className="col-lg-12 form-control"
                type="text"
                placeholder={intl.formatMessage({ id: "MODEL.DESIGNATION" })}
                value={
                  !isNull(remunerations) && !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].missionRemunerationID
                    : null
                }
                onChange={e => {
                  handleChangeRemuneration(e, i);
                }}
              >
                <option disabled selected value>
                  -- {intl.formatMessage({ id: "MODEL.ANOTHER_REMUNERATION" })}{" "}
                  --
                </option>
                {missionRemuneration &&
                  missionRemuneration.map(job => (
                    <option key={job.id} label={job.label} value={job.id}>
                      {job.label}
                    </option>
                  ))}
                ;
              </select>
            </div>
          </label>
          <label className="col-lg-4  ">
            <FormattedMessage id="MODEL.AMOUNT" />
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-euro-sign text-primary"></i>
                </span>
              </div>
              <input
                className="col-lg-12 form-control"
                type="text"
                disabled={
                  !isNull(remunerations) &&
                  !isNullOrEmpty(remunerations[i]) &&
                  !remunerations[i]
                }
                placeholder={intl.formatMessage({ id: "MODEL.AMOUNT" })}
                value={
                  !isNull(remunerations) && !isNullOrEmpty(remunerations[i])
                    ? remunerations[i].amount
                    : null
                }
                onChange={e => handleChangeAmount(e, i)}
              ></input>
            </div>
          </label>
          <div
            className="d-flex justify-content-center align-items-center"
            onClick={() => filterRem(i)}
          >
            <i className="flaticon2-delete mr-3 mt-5"></i>
          </div>
        </div>
      );
      index = index++;
    }

    return el;
  };

  const filterRem = i => {
    let rem = remunerations;
    rem.splice(i, 1);
    setRemunerations(rem);
    //props.formik.setFieldValue("missionRemunerationItems", rem);
    setRemunerationElements(remunerationElements - 1);
  };

  const handleChangeAmount = (e, i) => {
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    let value = e.target.value.replace(",", ".");
    currentRemuneration[i].amount = parseInt(value);

    setRemunerations(currentRemuneration);
  };

  const handleChangeRemuneration = (e, i) => {
    let filteredValue = missionRemuneration.filter(
      mission => mission.id === parseInt(e.target.value)
    );
    let currentRemuneration =
      remunerations && remunerations.length ? [...remunerations] : [];
    if (!currentRemuneration.includes(formattedRemuneration(filteredValue)))
      currentRemuneration[i] = formattedRemuneration(filteredValue);
    setRemunerations(currentRemuneration);
  };

  let formattedRemuneration = remuneration => {
    let newRemuneration = {};
    newRemuneration["missionRemunerationID"] = remuneration[0]["id"];
    newRemuneration["label"] = remuneration[0]["label"];
    newRemuneration["base"] = "1";
    newRemuneration["amount"] = remuneration[0]["amount"];

    return newRemuneration;
  };

  const resetHoursForm = () => {
    let daysOfWeekTemp = [];
    for (let i = 0; i < daysOfWeek.length; i++) {
      daysOfWeekTemp.push({
        ...daysOfWeek[i],
        dayHours: 0,
        dayMinutes: 0,
        nightHours: 0,
        nightMinutes: 0
      });
    }
    setDaysOfWeek(daysOfWeekTemp);
    setReload(!reload);
    setReloadCalculation(!reloadCalculation);
  };

  const onGoNextDailyReport = () => {
    let index = idList.findIndex(dailyId => dailyId === parseInt(id)) + 1;
    if (index > idList.length - 1) {
      index = 0;
    }
    const newId = idList[index];
    history.push(`/cra/new-hours/${newId}`);
  };

  const onGoBackDailyReport = () => {
    let index = idList.findIndex(dailyId => dailyId === parseInt(id)) - 1;
    if (index < 0) {
      index = idList.length - 1;
    }
    const newId = idList[index];
    history.push(`/cra/new-hours/${newId}`);
  };

  return (
    <Modal
      show={true}
      onHide={() => history.push("/cra")}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            <FormattedMessage id="TITLE.HOURS.STATEMENT" />
          </p>
        </Modal.Title>
        <button
          onClick={() => history.push("/cra")}
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body className="py-0 m-5">
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          className="mb-5"
        >
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9"
            onClick={onGoBackDailyReport}
          >
            <FormattedMessage id="BUTTON.BACK" />
          </button>
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9"
            onClick={onGoNextDailyReport}
          >
            <FormattedMessage id="BUTTON.NEXT" />
          </button>
        </div>
        {timeRecords && (
          <div className="mb-10 rounded p-5 bg-light-primary font-weight-bold">
            <div className="row mb-5">
              <div className="col-lg-3">
                <strong>Semaine N°{timeRecords.weekNumber} </strong>
                <span style={{ fontSize: 10 }}>
                  (Du {new Date(timeRecords.startDate).toLocaleDateString()} au{" "}
                  {new Date(timeRecords.endDate).toLocaleDateString()})
                </span>
              </div>
              <div className="col-lg-3">
                <FormattedMessage id="TEXT.APPLICANT" /> :{" "}
                {timeRecords.applicantName}
              </div>
              <div className="col-lg-3">
                <FormattedMessage id="COLUMN.CONTRACT.NUMBER" /> :{" "}
                {timeRecords.contractNumber}
              </div>
              <div className="col-lg-3">
                <FormattedMessage id="MODEL.ACCOUNT.SITE.NAME" /> :{" "}
                {timeRecords.chantierName}
              </div>
            </div>
            <div className="row">
              {<div className="col-lg-3" />}
              <div className="col-lg-3">
                Qualification : {contract && contract.qualification}
              </div>

              <div className="col-lg-3">
                Taux horaire :{" "}
                {contract &&
                  contract.vacancy.vacancyContractualProposedHourlySalary &&
                  contract.vacancy.vacancyContractualProposedHourlySalary}
                €
              </div>
              {contract && contract.vacancy.missionSalarySupplement && (
                <div className="col-lg-3">
                  Complément de salaire :{" "}
                  {contract.vacancy.missionSalarySupplement}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="row" style={{ borderBottom: "1px solid lightgrey" }}>
          <div style={{ width: "12.5%" }} />
          {daysOfWeek.map(day => (
            <div style={{ width: "12.5%", textAlign: "center" }}>
              <div
                className="py-2"
                style={{
                  backgroundColor: day.isHoliday
                    ? "#FBBF77"
                    : day.dailyType === 1
                    ? "#a5d6a7"
                    : day.dailyType === 2
                    ? "#FF6865"
                    : day.dailyType === 3 && "#f1d0d6"
                }}
              >
                <div>{DaysArray[new Date(day.date).getDay()]}</div>
                {new Date(day.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ borderBottom: "1px solid lightgrey" }}>
          <div style={{ width: "12.5%" }} className="mt-2">
            Heures de jour
          </div>
          {daysOfWeek.map((day, i) => (
            <div
              className="py-2"
              style={{
                backgroundColor: day.isHoliday
                  ? "#FBBF77"
                  : day.dailyType === 1
                  ? "#a5d6a7"
                  : day.dailyType === 2
                  ? "#FF6865"
                  : day.dailyType === 3 && "#f1d0d6",
                width: "12.5%"
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  alignItems: "center",
                  margin: "0 40px",
                  borderRadius: 5,
                  border: "1px solid grey"
                }}
              >
                <input
                  className="px-10 form-control"
                  style={{
                    backgroundColor:
                      (timeRecords && timeRecords.status === 2) ||
                      (timeRecords &&
                        timeRecords.dailyTimeRecords.filter(
                          item =>
                            new Date(item.date).toLocaleDateString() ===
                            new Date().toLocaleDateString()
                        ).length > 0) ||
                      (timeRecords &&
                        new Date(day.date) < new Date(timeRecords.firstDay)) ||
                      (timeRecords && new Date(day.date) > new Date())
                        ? "lightgrey"
                        : "rgba(0,0,0,0)",
                    border: 0,
                    textAlign: "center"
                  }}
                  disabled={
                    (timeRecords && timeRecords.status === 2) ||
                    (timeRecords &&
                      timeRecords.dailyTimeRecords.filter(
                        item =>
                          new Date(item.date).toLocaleDateString() ===
                          new Date().toLocaleDateString()
                      ).length > 0) ||
                    (timeRecords &&
                      new Date(day.date) < new Date(timeRecords.firstDay)) ||
                    (timeRecords && new Date(day.date) > new Date())
                  }
                  type="number"
                  placeholder=""
                  value={day.dayHours === 0 ? "" : day.dayHours}
                  onChange={e => onChangeHours(e, i, "dayHours")}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ borderBottom: "1px solid lightgrey" }}>
          <div style={{ width: "12.5%" }} className="mt-2">
            Heures de nuit
          </div>
          {daysOfWeek.map((day, i) => (
            <div
              className="py-2"
              style={{
                backgroundColor: day.isHoliday
                  ? "#FBBF77"
                  : day.dailyType === 1
                  ? "#a5d6a7"
                  : day.dailyType === 2
                  ? "#FF6865"
                  : day.dailyType === 3 && "#f1d0d6",
                width: "12.5%"
              }}
            >
              <div
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  alignItems: "center",
                  margin: "0 40px",
                  borderRadius: 5,
                  border: "1px solid grey"
                }}
              >
                <input
                  className="px-10 form-control"
                  style={{
                    backgroundColor:
                      (timeRecords && timeRecords.status === 2) ||
                      (timeRecords &&
                        timeRecords.dailyTimeRecords.filter(
                          item =>
                            new Date(item.date).toLocaleDateString() ===
                            new Date().toLocaleDateString()
                        ).length > 0) ||
                      (timeRecords &&
                        new Date(day.date) < new Date(timeRecords.firstDay)) ||
                      (timeRecords && new Date(day.date) > new Date())
                        ? "lightgrey"
                        : "rgba(0,0,0,0)",
                    border: 0,
                    textAlign: "center"
                  }}
                  type="number"
                  placeholder=""
                  value={day.nightHours === 0 ? "" : day.nightHours}
                  onChange={e => onChangeHours(e, i, "nightHours")}
                  disabled={
                    (timeRecords && timeRecords.status === 2) ||
                    (timeRecords &&
                      timeRecords.dailyTimeRecords.filter(
                        item =>
                          new Date(item.date).toLocaleDateString() ===
                          new Date().toLocaleDateString()
                      ).length > 0) ||
                    (timeRecords &&
                      new Date(day.date) < new Date(timeRecords.firstDay)) ||
                    (timeRecords && new Date(day.date) > new Date())
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className="row mt-5">
          <div style={{ display: "flex" }} className="mr-20">
            <div
              style={{ height: 20, width: 20, backgroundColor: "#a5d6a7" }}
            ></div>
            <div className="ml-2">Premier jour</div>
          </div>
          <div style={{ display: "flex" }} className="mr-20">
            <div
              style={{ height: 20, width: 20, backgroundColor: "#FF6865" }}
            ></div>
            <div className="ml-2">Dernier jour</div>
          </div>
          <div style={{ display: "flex" }} className="mr-20">
            <div
              style={{ height: 20, width: 20, backgroundColor: "#f1d0d6" }}
            ></div>
            <div className="ml-2">Date de souplesse</div>
          </div>
          <div style={{ display: "flex" }} className="mr-20">
            <div
              style={{ height: 20, width: 20, backgroundColor: "#FBBF77" }}
            ></div>
            <div className="ml-2">Jours fériés</div>
          </div>
        </div>
        <div className="row mt-10">
          <div
            className="col-lg-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className=" rounded p-5 bg-light-primary font-weight-bold text-center">
              <div>
                <label>
                  <FormattedMessage id="TOTAL.DAY.HOURS" />
                </label>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>{totalDayHours}h</strong>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className=" rounded p-5 bg-light-primary font-weight-bold text-center">
              <div>
                <label>
                  <FormattedMessage id="TOTAL.NIGHT.HOURS" />
                </label>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>{totalNightHours}h</strong>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className=" rounded p-5 bg-light-primary font-weight-bold text-center">
              <div>
                <label>
                  <FormattedMessage id="TOTAL.WEEK.HOURS" />
                </label>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>{totalWeekHours}h</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {timeRecords &&
            timeRecords.missionRemunerationItems.map(item => (
              <div className="col-lg-8 p-0 d-flex flex-row justify-content-between">
                <label className="col-lg-5  ">
                  <FormattedMessage id="MODEL.DESIGNATION" />
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl fas fa-list text-primary"></i>
                      </span>
                    </div>
                    <input
                      name="missionRemunerationItems"
                      disabled
                      className="col-lg-12 form-control"
                      type="text"
                      placeholder={intl.formatMessage({
                        id: "MODEL.DESIGNATION"
                      })}
                      value={item.label}
                    />
                  </div>
                </label>
                <label className="col-lg-4  ">
                  <FormattedMessage id="MODEL.AMOUNT" />
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl fas fa-euro-sign text-primary"></i>
                      </span>
                    </div>
                    <input
                      className="col-lg-12 form-control"
                      type="text"
                      disabled
                      placeholder={intl.formatMessage({ id: "MODEL.AMOUNT" })}
                      value={item.amount}
                    ></input>
                  </div>
                </label>
                <div className="d-flex justify-content-center align-items-center">
                  <i className="flaticon2-delete mr-3 mt-5 white"></i>
                </div>
              </div>
            ))}
        </div>
        {renderRemunerationElements()}
        {timeRecords?.callbackClient && (
          <div className="mt-10">
            <strong>
              <FormattedMessage id="TEXT.CALLBACK.CLIENT" />
            </strong>
          </div>
        )}
        {timeRecords?.comment && (
          <div className="mt-10">
            <label>
              <strong>Commentaire :</strong>
            </label>
            <div
              style={{
                border: "1px solid lightgrey",
                padding: 10,
                width: "50%",
                borderRadius: 5
              }}
            >
              <div>{timeRecords.comment}</div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div>
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => history.push("/cra")}
          >
            <FormattedMessage id="BUTTON.CANCEL" />
          </button>
          {timeRecords != null &&
            !timeRecords.ended &&
            timeRecords.status !== 2 && (
              <>
                <button
                  type="button"
                  className="btn btn-light-warning btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                  onClick={() => {
                    onUpdateTimeRecords("anael");
                  }}
                >
                  <FormattedMessage id="BUTTON.SEND.TO.ANAEL" />
                </button>
                <button
                  className="btn btn-light-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                  onClick={e => {
                    e.stopPropagation();
                    onUpdateTimeRecords("close");
                  }}
                >
                  <FormattedMessage id="TEXT.CLOSE.MISSION" />
                </button>
                <button
                  type="button"
                  className="btn btn-light-info btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                  onClick={resetHoursForm}
                >
                  <FormattedMessage id="AUTH.RESET" />
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                  onClick={() => {
                    onUpdateTimeRecords("update");
                  }}
                >
                  <FormattedMessage id="BUTTON.SAVE.DONE" />
                </button>
              </>
            )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default HoursStatementForm;

import React, { useEffect, useState } from "react";
import DateTime from "luxon/src/datetime.js";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import axios from "axios";
import moment from "moment";
import _, { debounce, isNull } from "lodash";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getMissionRemuneration } from "../../../../../business/actions/shared/ListsActions";
import { joursFeriesFix, joursFeriesFlexible } from "./joursFeries";
import "./styles.scss";

function HoursStatementForm(props) {
  const { id } = useParams();
  const { idList } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const intl = useIntl();
  const { missionRemuneration, user } = useSelector(state => ({
    missionRemuneration: state.lists.missionRemuneration,
    user: state.auth.user
  }));
  const [timeRecords, setTimeRecords] = useState(null);
  const [missionRemunerationItems, setMissionRemunerationItems] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [remunerationElements, setRemunerationElements] = useState([]);
  const [remunerations, setRemunerations] = useState([]);
  const [totalDayHours, setTotalDaysHours] = useState(0);
  const [totalDayMinutes, setTotalDaysMinutes] = useState(0);
  const [totalNightHours, setTotalNightHours] = useState(0);
  const [totalNightMinutes, setTotalNightMinutes] = useState(0);
  const [totalWeekHours, setTotalWeekHours] = useState(0);
  const [totalWeekMinutes, setTotalWeekMinutes] = useState(0);
  const [reloadCalculation, setReloadCalculation] = useState(false);
  const [reload, setReload] = useState(false);
  useEffect(() => {
    dispatch(getMissionRemuneration.request());
    const GET_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/${id}`;
    axios
      .get(GET_TIME_RECORDS_URL)
      .then(res => {
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
    "vendredi",
    "Samedi"
  ];

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

    /*let arrayOfDays = [];
    for (let i = 0; i <= 6; i++) {
      let newObject;
      var dayOfWeek = moment()
        .week(data.weekNumber)
        .startOf("week")
        .add(i, "days");
      const day = new Date(dayOfWeek).getDay();
      const longDay = DaysArray[day];
      const longDate = `${longDay} ${dayOfWeek.format("DD MMMM")}`;
      const date = dayOfWeek.format("YYYY-MM-DD");
      const existDate = dailyTimeRecords.filter(
        dayFromDB => dayFromDB.day === day
      )[0];

      if (existDate) {
        newObject = {
          ...existDate,
          longDate
        };
      } else {
        newObject = {
          dayHours: 0,
          dayMinutes: 0,
          nightHours: 0,
          nightMinutes: 0,
          tenantID: user.tenantID,
          day,
          date,
          longDate
        };
      }
      arrayOfDays.push(newObject);
    }*/
    setDaysOfWeek(newDailyTimeRecords);
  };

  const onUpdateTimeRecords = () => {
    const GET_TIME_RECORDS_URL = `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord`;
    let body = {
      ...timeRecords,
      dailyTimeRecords: daysOfWeek,
      additionalRemunerationItems: remunerations
    };
    axios
      .put(GET_TIME_RECORDS_URL, body)
      .then(res => {
        toastr.success("Succès", "Le relevé d'heures a bien été mis à jour.");
        //history.goBack()
      })
      .catch(err => {
        toastr.error(
          "Erreur",
          "Une erreur s'est produite lors de la mis à jour du relevé d'heures."
        );
      });
  };

  const renderRemunerationElements = () => {
    return (
      timeRecords &&
      timeRecords.additionalRemunerationItems.map((item, i) => (
        <div className="col-lg-8 p-0 d-flex flex-row justify-content-between">
          <label className="col-lg-5 hours_statement_remunerations_responsive">
            <FormattedMessage id="MODEL.DESIGNATION" />
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-list text-primary"></i>
                </span>
              </div>
              <input
                name="additionalRemunerationItems"
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
          <label className="col-lg-4 hours_statement_remunerations_responsive">
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
      ))
    );
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
      <Modal.Body className="py-0 applicant_hours_statement_body">
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
                <strong>Semaine N°{timeRecords.weekNumber}</strong>
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
              <div className="col-lg-3">
                <FormattedMessage id="TEXT.START.DATE" /> :{" "}
                {new Date(timeRecords.startDate).toLocaleDateString()}
              </div>
              <div className="col-lg-3">
                <FormattedMessage id="TEXT.END.DATE" /> :{" "}
                {new Date(timeRecords.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
        <div className="applicant_hours_array_responsive">
          <div style={{ width: "32%" }}>
            <div className="mt-2" style={{ textAlign: "center" }}>
              Jours
            </div>
            {daysOfWeek.map((day, i) => (
              <div style={{ textAlign: "center" }}>
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
          <div style={{ width: "34%" }}>
            <div style={{ borderBottom: "1px solid lightgrey" }}>
              <div className="mt-2" style={{ textAlign: "center" }}>
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
                      : day.dailyType === 3 && "#f1d0d6"
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      alignItems: "center",
                      margin: "0 5px",
                      borderRadius: 5,
                      border: "1px solid grey"
                    }}
                  >
                    <input
                      className="px-2 form-control"
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
                            new Date(day.date) <
                              new Date(timeRecords.firstDay)) ||
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
                          new Date(day.date) <
                            new Date(timeRecords.firstDay)) ||
                        (timeRecords && new Date(day.date) > new Date())
                      }
                      type="number"
                      placeholder=""
                      value={day.dayHours === 0 ? "" : day.dayHours}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: "34%" }}>
            <div style={{ borderBottom: "1px solid lightgrey" }}>
              <div className="mt-2" style={{ textAlign: "center" }}>
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
                      : day.dailyType === 3 && "#f1d0d6"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      backgroundColor: "white",
                      alignItems: "center",
                      margin: "0 5px",
                      borderRadius: 5,
                      border: "1px solid grey"
                    }}
                  >
                    <input
                      className="px-2 form-control"
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
                            new Date(day.date) <
                              new Date(timeRecords.firstDay)) ||
                          (timeRecords && new Date(day.date) > new Date())
                            ? "lightgrey"
                            : "rgba(0,0,0,0)",
                        border: 0,
                        textAlign: "center"
                      }}
                      type="number"
                      placeholder=""
                      value={day.nightHours === 0 ? "" : day.nightHours}
                      disabled={
                        (timeRecords && timeRecords.status === 2) ||
                        (timeRecords &&
                          timeRecords.dailyTimeRecords.filter(
                            item =>
                              new Date(item.date).toLocaleDateString() ===
                              new Date().toLocaleDateString()
                          ).length > 0) ||
                        (timeRecords &&
                          new Date(day.date) <
                            new Date(timeRecords.firstDay)) ||
                        (timeRecords && new Date(day.date) > new Date())
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="applicant_hours_array">
          <div className="row" style={{ borderBottom: "1px solid lightgrey" }}>
            <div style={{ width: "12.5%" }} />
            {daysOfWeek.map((day, i) => (
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
                          new Date(day.date) <
                            new Date(timeRecords.firstDay)) ||
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
                          new Date(day.date) <
                            new Date(timeRecords.firstDay)) ||
                        (timeRecords && new Date(day.date) > new Date())
                          ? "lightgrey"
                          : "rgba(0,0,0,0)",
                      border: 0,
                      textAlign: "center"
                    }}
                    type="number"
                    placeholder=""
                    value={day.nightHours === 0 ? "" : day.nightHours}
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
        </div>
        <div className="row mt-5 hours_statement_legend">
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
        <div className="mt-5 hours_statement_legend_responsive">
          <div className="mb-2" style={{ display: "flex" }}>
            <div style={{ display: "flex", width: "50%" }}>
              <div
                style={{ height: 20, width: 20, backgroundColor: "#a5d6a7" }}
              ></div>
              <div className="ml-2">Premier jour</div>
            </div>
            <div style={{ display: "flex", width: "50%" }}>
              <div
                style={{ height: 20, width: 20, backgroundColor: "#FF6865" }}
              ></div>
              <div className="ml-2">Dernier jour</div>
            </div>
          </div>
          <div className="mb-2" style={{ display: "flex" }}>
            <div style={{ display: "flex", width: "50%" }}>
              <div
                style={{ height: 20, width: 20, backgroundColor: "#f1d0d6" }}
              ></div>
              <div className="ml-2">Date de souplesse</div>
            </div>
            <div style={{ display: "flex", width: "50%" }}>
              <div
                style={{ height: 20, width: 20, backgroundColor: "#FBBF77" }}
              ></div>
              <div className="ml-2">Jours fériés</div>
            </div>
          </div>
        </div>
        <div className="row mt-10">
          <div
            className="col-lg-4 mb-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className=" rounded p-5 bg-light-primary font-weight-bold text-center">
              <div>
                <label>
                  <FormattedMessage id="TOTAL.DAY.HOURS" />
                </label>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>
                  {totalDayHours}h
                  {totalDayMinutes < 10
                    ? "0" + totalDayMinutes
                    : totalDayMinutes}
                </strong>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4 mb-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className=" rounded p-5 bg-light-primary font-weight-bold text-center">
              <div>
                <label>
                  <FormattedMessage id="TOTAL.NIGHT.HOURS" />
                </label>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>
                  {totalNightHours}h
                  {totalNightMinutes < 10
                    ? "0" + totalNightMinutes
                    : totalNightMinutes}
                </strong>
              </div>
            </div>
          </div>
          <div
            className="col-lg-4 mb-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className=" rounded p-5 bg-light-primary font-weight-bold text-center">
              <div>
                <label>
                  <FormattedMessage id="TOTAL.WEEK.HOURS" />
                </label>
              </div>
              <div>
                <strong style={{ fontSize: 20 }}>
                  {totalWeekHours}h
                  {totalWeekMinutes < 10
                    ? "0" + totalWeekMinutes
                    : totalWeekMinutes}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="mission-form mt-5 my-10 p-0">
          <h4 className="group-title">
            <FormattedMessage id="TEXT.REMUNERATION_ANOTHER" />
          </h4>
        </div>
        {timeRecords &&
          timeRecords.missionRemunerationItems.map((item, i) => (
            <div className="col-lg-8 p-0 d-flex flex-row justify-content-between">
              <label className="col-lg-5 hours_statement_remunerations_responsive">
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
              <label className="col-lg-4 hours_statement_remunerations_responsive">
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
        {renderRemunerationElements()}
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
            className="btn btn-light-warning btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
          >
            <FormattedMessage id="TEXT.COMPLAINT" />
          </button>
          <button
            type="button"
            className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            onClick={() => history.push("/cra")}
          >
            <FormattedMessage id="MATCHING.MODAL.CLOSE" />
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default HoursStatementForm;

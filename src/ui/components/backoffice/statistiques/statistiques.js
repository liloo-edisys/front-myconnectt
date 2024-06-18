import React, { useState, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { getJobTitles } from "actions/shared/ListsActions";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";
import axios from "axios";

function Statistiques(props) {
  const dispatch = useDispatch();
  const [selectedQualification, setSelectedQualification] = useState("");
  const intl = useIntl();
  const [selectedStartDate, setSetelectedStartDate] = useState(null);
  const [selectedEndDate, setSetelectedEndDate] = useState(null);
  const [statistiques, setStatistiques] = useState(null);

  const { jobTitleList } = useSelector(
    state => ({
      jobTitleList: state.lists.jobTitles
    }),
    shallowEqual
  );

  function getStatisques() {
    const GET_STATISTIQUES_URL =
      process.env.REACT_APP_WEBAPI_URL + "api/Stats/GetStatsData";
    const body = {
      qualificationId: +selectedQualification,
      startDate: selectedStartDate,
      endDate: selectedEndDate
    };

    axios.post(GET_STATISTIQUES_URL, body).then(res => {
      setStatistiques(res.data);
    });
  }

  useEffect(() => {
    dispatch(getJobTitles.request());
    getStatisques();
  }, [dispatch]);

  const renderQualificationFilter = () => {
    return (
      <div className="col-lg-2">
        <select
          className="col-lg-12 form-control"
          name="jobTitleID"
          value={selectedQualification}
          onChange={e => setSelectedQualification(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.QUALIFICATION" })} --
          </option>
          {jobTitleList.map((job, i) => (
            <option key={i} label={job.name} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.QUALIFICATION" />
        </small>
      </div>
    );
  };
  const renderStartDateFilter = () => {
    return (
      <div className="col-lg-1 width-100">
        <DatePicker
          className={`col-lg-12   form-control`}
          style={{ width: "100%" }}
          onChange={val => {
            setSetelectedStartDate(val, dispatch);
          }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          selected={selectedStartDate}
          locale={fr}
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
        />
        <small className="form-text text-muted">Date de début</small>
      </div>
    );
  };

  const renderEndDateFilter = () => {
    return (
      <div className="col-lg-1 width-100">
        <DatePicker
          className={`col-lg-12 form-control`}
          style={{ width: "100%" }}
          onChange={val => {
            setSetelectedEndDate(val, dispatch);
          }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          selected={selectedEndDate}
          locale={fr}
          showMonthDropdown
          showYearDropdown
          minDate={selectedStartDate ? new Date(selectedStartDate) : null}
          yearItemNumber={9}
        />
        <small className="form-text text-muted">Date de fin</small>
      </div>
    );
  };

  return (
    <>
      <div className="card card-custom gutter-b">
        <div class="card-header">
          <div class="card-title">
            <h3 class="card-label">Statistiques détaillées</h3>
          </div>
          <div class="card-toolbar">
            <button
              onClick={getStatisques}
              class="btn btn-icon btn-light-primary pulse pulse-primary mr-5"
            >
              <i class="flaticon-refresh"></i>
              <span class="pulse-ring"></span>
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row mb-5">
            {renderQualificationFilter()}
            {renderStartDateFilter()}
            {renderEndDateFilter()}
          </div>
          <div className="row ml-lg-12">
            <div className="col-lg-3">
              <div className="statistics_inscriptions_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Nombre d'intérimaires
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-primary">
                    {statistiques ? statistiques.applicants : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="statistics_inscriptions_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Nombre de clients
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-primary">
                    {statistiques ? statistiques.accounts : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="statistics_inscriptions_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Nombre d'offres éditées (crées dans ces périodes)
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-primary">
                    {statistiques ? statistiques.missions : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="statistics_applicants_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Nombre de candidatures (nbr. de personnes ayant postulé)
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats color_green">
                    {statistiques ? statistiques.applications : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row ml-lg-12 mt-5">
            <div className="col-lg-3">
              <div className="statistics_clients_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Nombre de personnes qui se re-connecte
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-info">
                    {statistiques ? statistiques.loginApplicants : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="statistics_clients_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Suppression Intérimaire
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-info">
                    {statistiques ? statistiques.deletedApplicants : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="statistics_clients_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Supression client
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-info">
                    {statistiques ? statistiques.deletedAccounts : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="statistics_clients_container">
                <div
                  className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2"
                  style={{ minHeight: 60 }}
                >
                  Contrats
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div className="custom_counter_stats text-info">
                    {statistiques ? statistiques.contracts : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Statistiques;

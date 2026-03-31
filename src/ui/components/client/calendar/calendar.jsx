import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import moment from "moment";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";
import { useHistory } from "react-router-dom";
import { colorsPalette } from "./colorsPalette";
import { FormattedMessage, useIntl } from "react-intl";
import { getJobTitles } from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";
import { CSVLink } from "react-csv";
import { monthsArray } from "./monthsArray";
import Avatar from "react-avatar";
import "./styles.scss";

import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

function Calendar(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const intl = useIntl();
  const { user, companies, currentCompanyID, jobTitleList } = useSelector(
    state => ({
      user: state.auth.user,
      companies: state.companies.companies,
      currentCompanyID: state.auth.user.accountID,
      jobTitleList: state.lists.jobTitles
    })
  );
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [applicantsList, setApplicantsList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [activeContractsList, setActiveContractsList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedWorksite, setSelectedWorksite] = useState(0);
  const [selectedQualification, setSelectedQualification] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState("");
  const [csvData, setCsvData] = useState({ data: [], headers: [] });
  const [activeMonth, setActiveMonth] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [activeWeekNumber, setActiveWeekNumber] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [worksites, setWorksites] = useState([]);

  let filteredCompanies = companies.length
    ? companies.filter(company => company.parentID === null)
    : [];

  useEffect(() => {
    isNullOrEmpty(jobTitleList) && dispatch(getJobTitles.request());
    getData();
  }, []);

  useEffect(() => {
    onSelectCompany(user.accountID);
  }, [companies]);

  const getData = () => {
    setLoading(true);
    const INTERIMAIRE_CONTRACT_LIST_URL =
      process.env.REACT_APP_WEBAPI_URL + "api/Contract/PlanningContracts";
    let body = {
      tenantID: user.tenantID,
      accountID: user.accountID,
      qualificationID: parseInt(selectedQualification),
      chantierID: parseInt(selectedWorksite),
      applicantName: selectedApplicant,
      //CalendarStartDate: startDate ? new Date(startDate) : null,
      //CalendarEndDate: endDate ? new Date(endDate) : null,
      startdate: selectedStartDate ? selectedStartDate : null,
      enddate: selectedEndDate ? selectedEndDate : null
    };
    axios
      .post(INTERIMAIRE_CONTRACT_LIST_URL, body)
      .then(res => {
        setLoading(false);
        //if (startDate && endDate) {
        /*const currentdate = new Date(endDate);
        var oneJan = new Date(currentdate.getFullYear(), 0, 1);
        var numberOfDays = Math.floor(
          (currentdate - oneJan) / (24 * 60 * 60 * 1000)
        );
        var result = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
        setActiveWeekNumber(result);*/
        const contractsList = res.data;
        csvDataFormatter(contractsList);
        let filteredContracts = [];
        let filteredApplicants = [];
        for (let i = 0; i < contractsList.length; i++) {
          const contractIndex = filteredContracts.findIndex(
            contract => contract.applicantID === contractsList[i].applicantID
          );
          const applicantIndex = filteredApplicants.findIndex(
            contract => contract.applicantID === contractsList[i].applicantID
          );
          if (applicantIndex < 0) {
            let applicant = {
              applicantID: contractsList[i].applicantID,
              applicantName: contractsList[i].applicantName,
              qualification: contractsList[i].qualification,
              color: colorsPalette[i],
              active: true,
              applicantMissionsCount: contractsList[i].applicantMissionsCount,
              applicantPicture: contractsList[i].applicantPicture
            };
            filteredApplicants.push(applicant);
          }
          let contract = {
            title: `${contractsList[i].contractNumber} - ${contractsList[i].applicantName} - ${contractsList[i].chantierName} - (${contractsList[i].qualification})`,
            start: moment(contractsList[i].startDate).format("YYYY-MM-DD"),
            end: moment(contractsList[i].endDate)
              .add(1, "days")
              .format("YYYY-MM-DD"),
            color:
              contractIndex >= 0
                ? filteredContracts[contractIndex].color
                : colorsPalette[i],
            applicantID: contractsList[i].applicantID
          };
          filteredContracts.push(contract);
        }
        setContractsList(filteredContracts);
        setActiveContractsList(filteredContracts);
        setApplicantsList(filteredApplicants);
        //}
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const csvDataFormatter = data => {
    /*let csvHeaders = [
      { label: "Intérimaire", key: "applicantName" },
      { label: "N° du contrat", key: "contractNumber" },
      { label: "Chantier", key: "chantierName" },
      { label: "Qualification", key: "qualification" },
      { label: "Date de début", key: "startDate" },
      { label: "Date de fin", key: "endDate" },
    ];*/
    let csvHeaders = [
      "Intérimaire",
      "N° du contrat",
      "Chantier",
      "Qualification",
      "Date de début",
      "Date de fin"
    ];

    let csvData = [];
    for (let i = 0; i < data.length; i++) {
      const {
        applicantName,
        contractNumber,
        chantierName,
        qualification,
        startDate,
        endDate
      } = data[i];
      /*let newContractData = {
        applicantName,
        contractNumber,
        chantierName,
        qualification,
        startDate: startDate ? new Date(startDate).toLocaleDateString() : "",
        endDate: endDate ? new Date(endDate).toLocaleDateString() : "",
      };*/
      let newContractData = [
        applicantName,
        contractNumber,
        chantierName,
        qualification,
        startDate ? new Date(startDate).toLocaleDateString() : "",
        endDate ? new Date(endDate).toLocaleDateString() : ""
      ];
      csvData.push(newContractData);
    }

    setCsvData({
      headers: csvHeaders,
      data: csvData.map(e => e.join(";")).join("\n")
    });
  };

  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">Aucun intérimaire sur cette période !</div>
      </div>
    </div>
  );
  useEffect(() => {
    const newArray = [];

    for (let i = 0; i < applicantsList.length; i++) {
      for (let j = 0; j < contractsList.length; j++) {
        if (
          applicantsList[i].active &&
          applicantsList[i].applicantID === contractsList[j].applicantID
        ) {
          newArray.push(contractsList[j]);
        }
      }
    }
    setActiveContractsList(newArray);
    renderApplicantList();
  }, [refresh]);

  const handleMonthChange = e => {
    const date = new Date(e.start);
    const tempDate = date.setDate(date.getDate() + 15);
    const currentMonth = new Date(tempDate).getMonth();
    const currentYear = new Date(tempDate).getFullYear();
    const newStartDate = new Date(e.start).toDateString();
    const newEndDate = new Date(e.end).toDateString();

    const currentdate = new Date(newEndDate);
    var oneJan = new Date(currentdate.getFullYear(), 0, 1);
    var numberOfDays = Math.floor(
      (currentdate - oneJan) / (24 * 60 * 60 * 1000)
    );
    var result = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
    setActiveWeekNumber(result);

    setActiveMonth(monthsArray[currentMonth]);
    setActiveYear(currentYear);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleChangeActiveApplicant = id => {
    let oldApplicantList = applicantsList;
    const applicantIndex = oldApplicantList.findIndex(
      aplicant => aplicant.applicantID === id
    );
    if (oldApplicantList[applicantIndex].active) {
      oldApplicantList[applicantIndex] = {
        ...oldApplicantList[applicantIndex],
        active: false
      };
    } else {
      oldApplicantList[applicantIndex] = {
        ...oldApplicantList[applicantIndex],
        active: true
      };
    }
    setApplicantsList(oldApplicantList);
    setRefresh(!refresh);
  };

  const onSelectCompany = id => {
    setSelectedCompany(id);
    let newWorksites = companies.length
      ? companies.filter(company => company.parentID === parseInt(id))
      : [];
    setWorksites(newWorksites);
  };

  const handleChangeStartDate = val => {
    if (val > selectedEndDate) {
      setSelectedEndDate("");
    }
    setSelectedStartDate(val);
  };

  const renderStartDateFilter = () => {
    return (
      <div style={{ zIndex: 999 }} className="col-lg-2 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? handleChangeStartDate(val)
              : setSelectedStartDate("");
          }}
          selected={selectedStartDate}
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
          locale={fr}
        />
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.STARTDATE" />
        </small>
      </div>
    );
  };

  const renderEndDateFilter = () => {
    return (
      <div style={{ zIndex: 999 }} className="col-lg-2 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? setSelectedEndDate(val)
              : setSelectedEndDate("");
          }}
          minDate={
            selectedStartDate ? moment(selectedStartDate).toDate() : null
          }
          selected={selectedEndDate}
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
          locale={fr}
        />
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.ENDDATE" />
        </small>
      </div>
    );
  };

  const renderCompanies = () => {
    return (
      <div className="col-lg-2 mb-2">
        <select
          className="form-control"
          name="accountID"
          issearchable={true}
          value={selectedCompany}
          onChange={e => onSelectCompany(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.COMPANY" })} --
          </option>
          {filteredCompanies.map((account, index) => (
            <option id={account.id} key={index} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          {intl.formatMessage({ id: "TEXT.COMPANY" })}
        </small>
      </div>
    );
  };

  const renderApplicantList = () => {
    return (
      <div
        className="col-lg-3 p-10 bg-light-primary"
        style={{ border: "1px solid #3165a7", borderRadius: 5 }}
      >
        <div
          className="row pb-2 mb-2"
          style={{ borderBottom: "1px solid lightgrey" }}
        >
          <div className="col-lg-2" />
          <div className="col-lg-5">
            <strong style={{ fontSize: 10 }}>Intérimaires</strong>
          </div>
          <div className="col-lg-3">
            <strong style={{ fontSize: 10 }}>Qualification</strong>
          </div>
          <div className="col-lg-2" />
        </div>
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: 50 }}
          >
            <span className="colmx-auto spinner spinner-primary"></span>
          </div>
        ) : applicantsList.length === 0 ? (
          <NoDataIndication />
        ) : (
          applicantsList.length > 0 &&
          applicantsList.map(applicant => (
            <div
              className="row pb-2 mb-2"
              style={{ borderBottom: "1px solid lightgrey" }}
            >
              <div className="col-lg-2">
                <div
                  style={{
                    backgroundColor: applicant.color,
                    width: 15,
                    height: 15
                  }}
                />
              </div>
              <div className="col-lg-5">
                <div className="row">
                  <span>
                    {!isNullOrEmpty(applicant) &&
                    !isNullOrEmpty(applicant.applicantPicture) ? (
                      <Avatar
                        size="25"
                        className="symbol-label mr-2"
                        color="#3699FF"
                        src={
                          "data:image/" +
                          applicant.applicantPicture.filename.split(".")[1] +
                          ";base64," +
                          applicant.applicantPicture.base64
                        }
                      />
                    ) : (
                      <Avatar
                        className="symbol-label mr-2"
                        color="#3699FF"
                        size="25"
                        maxInitials={2}
                        name={
                          applicant &&
                          applicant.firstname &&
                          applicant.firstname.concat(" ", applicant.lastname)
                        }
                      />
                    )}
                  </span>
                  <div>
                    <div style={{ fontSize: 10 }}>
                      {applicant.applicantName}
                    </div>
                    <div style={{ fontSize: 10 }}>
                      {applicant.applicantMissionsCount} mission(s)
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3">
                <div style={{ fontSize: 10 }}>{applicant.qualification}</div>
              </div>
              {/*<div className="col-lg-3">
                <div style={{ fontSize: 10 }}>
                  {applicant.applicantMissionsCount}
                </div>
            </div>*/}
              <div className="col-lg-2">
                <span className="switch switch switch-xs">
                  <label>
                    <input
                      type="checkbox"
                      onChange={() =>
                        handleChangeActiveApplicant(applicant.applicantID)
                      }
                      checked={applicant.active}
                      name=""
                    />
                    <span></span>
                  </label>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderInterimaires = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedApplicant}
          onChange={e => setSelectedApplicant(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.APPLICANT" />
        </small>
      </div>
    );
  };

  const renderChantier = () => {
    return (
      <>
        <div className="col-lg-2 width-100">
          <select
            className="col-lg-12 form-control"
            name="workSiteID"
            value={selectedWorksite}
            onChange={e => setSelectedWorksite(e.target.value)}
          >
            <option selected value={0} style={{ color: "lightgrey" }}>
              -- {intl.formatMessage({ id: "MODEL.ACCOUNT.SITE.NAME" })} --
            </option>
            {worksites.map(worksite => (
              <option key={worksite.id} value={worksite.id}>
                {worksite.name}
              </option>
            ))}
            ;
          </select>
          <small className="form-text text-muted">
            <FormattedMessage id="MODEL.ACCOUNT.SITE.NAME" />
          </small>
        </div>
      </>
    );
  };

  const renderQualifications = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedQualification}
          onChange={e => setSelectedQualification(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.QUALIFICATION" })} --
          </option>
          {jobTitleList.map(job => (
            <option key={job.id} label={job.name} value={job.id}>
              {job.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.QUALIFICATION" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    getData();
  };

  return (
    <Card>
      <CardHeader title={intl.formatMessage({ id: "MISSION.CONTRACTS.TITLE" })}>
        <div>
          {!loading && (
            <CSVLink
              className="btn btn-light-warning btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
              filename={`contracts-list-${activeMonth}-${activeYear}.csv`}
              data={csvData.data}
              headers={csvData.headers}
              separator=";"
              enclosingCharacter={`'`}
            >
              Export CSV
            </CSVLink>
          )}
          <button
            onClick={() => history.goBack()}
            className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
          >
            <span>Retour</span>
          </button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="mx-15">
          <div
            className="row mb-5 d-flex flex-row"
            style={{ justifyContent: "flex-end" }}
          >
            {renderCompanies()}
            {renderChantier()}
            {renderInterimaires()}
            {renderQualifications()}
            {renderStartDateFilter()}
            {renderEndDateFilter()}
            <button
              onClick={onSearchFilteredContracts}
              className="btn btn-success font-weight-bold ml-10 mb-10 px-10"
            >
              <i className="fa fa-search mr-5"></i>
              <span>
                <FormattedMessage id="BUTTON.SEARCH" />
              </span>
            </button>
          </div>
          <div className="row d-flex flex-row justify-content-between mb-10">
            {renderApplicantList()}
            <div className="col-lg-9">
              <FullCalendar
                customButtons={{
                  myCustomButton: {
                    text: `Semaine N°${activeWeekNumber}`
                  }
                }}
                events={
                  startDate === null || endDate === null
                    ? e => handleMonthChange(e)
                    : activeContractsList
                }
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridWeek"
                headerToolbar={{
                  right: "prev,next",
                  center: "myCustomButton",
                  left: "title"
                }}
                datesSet={handleMonthChange}
                locale="fr"
                firstDay={1}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default Calendar;

import React, { useEffect, useState } from "react";
import { NavLink, useHistory, Route } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";
import axios from "axios";
import moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import HoursStatementComplaint from "./fields/HoursStatementComplaint";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider} from "react-bootstrap-table2-paginator";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";
import {
  Card,
  CardHeader,
  CardBody} from "../../../../_metronic/_partials/controls";
import { getCompanies } from "actions/client/companiesActions";
import { getJobTitles } from "actions/shared/listsActions";
import HoursStatementForm from "./fields/HoursStatementForm";
import ComplaintsList from "./fields/ComplaintsList";

function HoursStatement(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const intl = useIntl();
  const { user, jobTitleList, companies } = useSelector(state => ({
    user: state.auth.user,
    jobTitleList: state.lists.jobTitles,
    companies: state.companies.companies
  }));
  const [rhList, setRhList] = useState([]);
  const [pageSize, setPageSize] = useState(12);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  var firstDay = new Date();
  firstDay.setDate(firstDay.getDate() - 30);
  let lastDay = new Date();
  const [selectedStartDate, setSelectedStartDate] = useState(firstDay);
  const [selectedEndDate, setSelectedEndDate] = useState(lastDay);
  const [selectedContractNumber, setSelectedContractNumber] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(0);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedWorksite, setSelectedWorksite] = useState(0);
  const [selectedQualification, setSelectedQualification] = useState(0);
  const [idList, setIdList] = useState([]);
  const [notSeenCount, setNotSeenCount] = useState(0);
  const [selectAvenants, setSelectAvenants] = useState(null);
  const [bornageStartDate, setBornageStartDate] = useState("");
  const [bornageEndDate, setBornageEndDate] = useState("");

  let filteredCompanies = companies.length
    ? companies.filter(company => company.parentID === null)
    : [];

  let worksites = companies.length
    ? companies.filter(company => company.parentID !== null)
    : [];

  useEffect(() => {
    if (companies.length === 0) {
      dispatch(getCompanies.request());
    }
    dispatch(getJobTitles.request());
    getRH();
  }, [pageNumber]);

  const getRH = (firstDay, lastDay, contractNumber) => {
    let body = {
      tenantID: user.tenantID,
      applicantID: user.applicantID,
      pageSize,
      pageNumber,
      weekNumber: parseInt(selectedWeekNumber),
      accountID: parseInt(selectedCompany),
      ChantierID: parseInt(selectedWorksite),
      contractNumber: contractNumber ? contractNumber : selectedContractNumber,
      QualificationID: parseInt(selectedQualification),
      status: 2,
      year: selectedYear ? parseInt(selectedYear) : 0
    };

    if (firstDay) {
      body = {
        ...body,
        startDate: firstDay
      };
    } else if (selectedStartDate) {
      body = {
        ...body,
        startDate: selectedStartDate
      };
    }

    if (lastDay) {
      body = {
        ...body,
        endDate: lastDay
      };
    } else if (selectedEndDate) {
      body = {
        ...body,
        endDate: selectedEndDate
      };
    }

    if (selectedYear && selectedWeekNumber) {
      var simple = new Date(selectedYear, 0, 1 + (selectedWeekNumber - 1) * 7);
      var dow = simple.getDay();
      var ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      var ISOweekEnd = new Date(ISOweekStart);
      ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
      setBornageStartDate(ISOweekStart);
      setSelectedStartDate(ISOweekStart);
      setBornageEndDate(ISOweekEnd);
      setSelectedEndDate(ISOweekEnd);
    } else {
      setBornageStartDate("");
      setBornageEndDate("");
    }

    axios.put(
      `${process.env.REACT_APP_WEBAPI_URL}api/timerecord/seen/${user.applicantID}`
    );
    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/SearchTimeRecords`,
        body
      )
      .then(res => {
        let count = 0;
        for (let i = 0; i < res.data.list.length; i++) {
          if (!res.data.list[i].seenByApplicant) {
            count = count + 1;
          }
        }
        setRhList(res.data.list);
        setTotalCount(res.data.totalcount);
        setIdList(res.data.idlist);
        setNotSeenCount(count);
      })
      .catch(err => console.log(err));
  };

  const columns = [
    {
      dataField: "weekNumber",
      //text: intl.formatMessage({ id: "TEXT.WEEK.NUMBER" }),
      formatter: (value, row) => {
        const filteredWeekNumber =
          parseInt(row.weekNumber) < 10 ? "0" + row.weekNumber : row.weekNumber;
        return <span>{row.year + "" + filteredWeekNumber}</span>;
      }
    },
    {
      dataField: "applicantName",
      text: intl.formatMessage({ id: "TEXT.APPLICANT" })
    },
    {
      dataField: "entrepriseName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" })
    },
    {
      dataField: "chantierName",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.SITE.NAME" })
    },
    {
      dataField: "contractNumber",
      text: intl.formatMessage({ id: "COLUMN.CONTRACT.NUMBER" })
    },
    {
      dataField: "qualification",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" })
    },
    {
      dataField: "startDate",
      text: intl.formatMessage({ id: "TEXT.START.DATE" }),
      formatter: value => <span>{new Date(value).toLocaleDateString()}</span>
    },
    {
      dataField: "endDate",
      text: intl.formatMessage({ id: "TEXT.END.DATE" }),
      formatter: value => <span>{new Date(value).toLocaleDateString()}</span>
    },
    {
      dataField: "status",
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      formatter: value => (
        <span>
          {value === 0
            ? intl.formatMessage({ id: "TEXT.TO.FILL" })
            : value === 1
            ? intl.formatMessage({ id: "TEXT.TO.VALIDATE" })
            : value === 2
            ? intl.formatMessage({ id: "TEXT.VALEDATED" })
            : ""}
        </span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => {
        return (
          <>
            <div
              className="btn btn-light-primary ml-2"
              onClick={e => {
                e.stopPropagation();
                history.push(`/cra/new-hours/${row.id}`);
              }}
            >
              <FormattedMessage id="BUTTON.SEE.MORE" />
            </div>
            <>
              {row.isComplaint == 0 && row.status === 2 && (
                <div
                  className="btn btn-light-warning ml-2"
                  onClick={e => {
                    e.stopPropagation();
                    history.push(`/cra/complaint/${row.id}`);
                  }}
                >
                  <FormattedMessage id="TEXT.COMPLAINT" />
                </div>
              )}
              {row.isComplaint > 0 && (
                <div
                  className="btn btn-light-warning ml-2"
                  onClick={e => {
                    e.stopPropagation();
                    history.push(`/cra/complaints/${row.id}`);
                  }}
                >
                  Voir les réclamations
                </div>
              )}
            </>
          </>
        );
      }
    }
  ];

  const NoDataIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">
          <FormattedMessage id="MESSAGE.NO.EXTENSION" />
        </div>
      </div>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
    handleChangePage(sizePerPage, page);
  };

  const handleChangePage = (size, page) => {};

  /*const renderWeeks = () => {
    return (
      <div className="col-lg-2 mb-2">
        <select
          className="form-control"
          isSearchable={true}
          onChange={e => setSelectedWeekNumber(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.WEEK.NUMBER" })} --
          </option>
          {weekList.map(week => {
            return (
              <option id={week.value} key={week.value} value={week.value}>
                {week.label}
              </option>
            );
          })}
        </select>
        <small className="form-text text-muted">
          {intl.formatMessage({ id: "TEXT.WEEK.NUMBER" })}
        </small>
      </div>
    );
  };*/

  const onChangeWeekNumber = value => {
    if (!value || value <= 0) {
      setSelectedWeekNumber(0);
    } else if (value > 53) {
      setSelectedWeekNumber(53);
    } else {
      setSelectedWeekNumber(value);
    }
  };

  const renderWeeks = () => {
    return (
      <div className="col-lg-2 mb-2">
        <input
          name="city"
          className="form-control"
          type="number"
          value={selectedWeekNumber > 0 ? selectedWeekNumber : ""}
          onChange={e => onChangeWeekNumber(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          {intl.formatMessage({ id: "TEXT.WEEK.NUMBER" })}
        </small>
      </div>
    );
  };

  const renderYear = () => {
    return (
      <div className="col-lg-2 mb-2">
        <input
          name="city"
          className="form-control"
          type="number"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.YEAR" />
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
          isSearchable={true}
          onChange={e => setSelectedCompany(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.COMPANY" })} --
          </option>
          {filteredCompanies.map((account, index) => {
            return (
              <option id={account.id} key={index} value={account.id}>
                {account.name}
              </option>
            );
          })}
        </select>
        <small className="form-text text-muted">
          {intl.formatMessage({ id: "TEXT.COMPANY" })}
        </small>
      </div>
    );
  };

  const renderChantier = () => {
    return (
      <>
        <div className="col-lg-2 mb-2">
          <select
            className="col-lg-12 form-control"
            name="workSiteID"
            value={selectedWorksite}
            onChange={e => setSelectedWorksite(e.target.value)}
          >
            <option selected value={0} style={{ color: "lightgrey" }}>
              -- {intl.formatMessage({ id: "MODEL.ACCOUNT.SITE.NAME" })} --
            </option>
            {worksites.map((worksite, i) => (
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

  const onChangeContratsNumber = value => {
    setSelectedContractNumber(value);
    let body = {
      tenantID: user.tenantID,
      applicantID: user.applicantID,
      pageSize,
      pageNumber,
      weekNumber: parseInt(selectedWeekNumber),
      accountID: parseInt(selectedCompany),
      ChantierID: parseInt(selectedWorksite),
      contractNumber: value,
      QualificationID: parseInt(selectedQualification),
      status: 2,
      year: selectedYear ? parseInt(selectedYear) : 0
    };
    if (selectedStartDate) {
      body = {
        ...body,
        startDate: selectedStartDate
      };
    }
    if (selectedEndDate) {
      body = {
        ...body,
        endDate: selectedEndDate
      };
    }

    if (selectedYear && selectedWeekNumber) {
      var simple = new Date(selectedYear, 0, 1 + (selectedWeekNumber - 1) * 7);
      var dow = simple.getDay();
      var ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      var ISOweekEnd = new Date(ISOweekStart);
      ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
      setBornageStartDate(ISOweekStart);
      setSelectedStartDate(ISOweekStart);
      setBornageEndDate(ISOweekEnd);
      setSelectedEndDate(ISOweekEnd);
    } else {
      setBornageStartDate("");
      setBornageEndDate("");
    }

    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/SearchTimeRecords`,
        body
      )
      .then(res => {
        setRhList(res.data.list);
        setTotalCount(res.data.totalcount);
        setIdList(res.data.idlist);
      })
      .catch(err => console.log(err));
  };

  const renderContratsNumber = () => {
    return (
      <div className="col-lg-2 mb-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedContractNumber}
          onChange={e => {
            onChangeContratsNumber(e.target.value);
            getRH(null, null, e.target.value);
          }}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.CONTRACT.OR.APPLICANT.NUMBER" />
        </small>
      </div>
    );
  };

  const renderStartDateFilter = () => {
    return (
      <div className="col-lg-2 width-100 mb-2">
        <DatePicker
          className={`col-lg-12 form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="bottom-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? handleChangeStartDate(val)
              : setSelectedStartDate("");
          }}
          selected={selectedStartDate}
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
          minDate={bornageStartDate ? moment(bornageStartDate).toDate() : null}
          maxDate={bornageEndDate ? moment(bornageEndDate).toDate() : null}
          locale={fr}
        />
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.STARTDATE" />
        </small>
      </div>
    );
  };

  const handleChangeStartDate = val => {
    if (val > selectedEndDate) {
      setSelectedEndDate("");
    }
    setSelectedStartDate(val);
  };

  const renderEndDateFilter = () => {
    return (
      <div className="col-lg-2 width-100 mb-2">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="bottom-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? setSelectedEndDate(val)
              : setSelectedEndDate("");
          }}
          minDate={
            selectedStartDate ? moment(selectedStartDate).toDate() : null
          }
          maxDate={bornageEndDate ? moment(bornageEndDate).toDate() : null}
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

  const renderQualifications = () => {
    return (
      <div className="col-lg-2 mb-2">
        <select
          className="col-lg-12 form-control"
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
    let body = {
      tenantID: user.tenantID,
      applicantID: user.applicantID,
      pageSize,
      pageNumber,
      weekNumber: parseInt(selectedWeekNumber),
      accountID: parseInt(selectedCompany),
      ChantierID: parseInt(selectedWorksite),
      contractNumber: selectedContractNumber,
      QualificationID: parseInt(selectedQualification),
      status: 2,
      year: selectedYear ? parseInt(selectedYear) : 0
    };
    if (selectedStartDate) {
      body = {
        ...body,
        startDate: selectedStartDate
      };
    }
    if (selectedEndDate) {
      body = {
        ...body,
        endDate: selectedEndDate
      };
    }

    if (selectedYear && selectedWeekNumber) {
      var simple = new Date(selectedYear, 0, 1 + (selectedWeekNumber - 1) * 7);
      var dow = simple.getDay();
      var ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      var ISOweekEnd = new Date(ISOweekStart);
      ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
      setBornageStartDate(ISOweekStart);
      setSelectedStartDate(ISOweekStart);
      setBornageEndDate(ISOweekEnd);
      setSelectedEndDate(ISOweekEnd);
    } else {
      setBornageStartDate("");
      setBornageEndDate("");
    }

    axios
      .post(
        `${process.env.REACT_APP_WEBAPI_URL}api/TimeRecord/SearchTimeRecords`,
        body
      )
      .then(res => {
        setRhList(res.data.list);
        setTotalCount(res.data.totalcount);
        setIdList(res.data.idlist);
      })
      .catch(err => console.log(err));
  };

  const RemotePagination = ({
    data,
    page,
    sizePerPage,
    onTableChange,
    totalSize,
    from,
    to
  }) => (
    <div>
      <PaginationProvider
        pagination={paginationFactory({
          custom: true,
          page,
          sizePerPage,
          totalSize,
          from,
          to,
          showTotal: true,
          firstPageText: intl.formatMessage({ id: "BEGINNING" }),
          prePageText: "<",
          nextPageText: ">",
          lastPageText: intl.formatMessage({ id: "END" }),
          nextPageTitle: ">",
          prePageTitle: "<"
        })}
      >
        {({ paginationProps, paginationTableProps }) => (
          <div>
            <div style={{ display: "none" }}>
              <BootstrapTable
                remote
                wrapperClasses="table-responsive"
                bordered={false}
                classes="table table-head-custom table-vertical-center overflow-hidden"
                bootstrap4
                keyField="id"
                data={[]}
                columns={columns}
                onTableChange={onTableChange}
                {...paginationTableProps}
                noDataIndication={() => <NoDataIndication />}
              />
            </div>
            <div className="d-flex flex-row justify-content-between">
              <PaginationListStandalone {...paginationProps} />
              <div className="d-flex flex-row align-items-center">
                <p className="ml-5" style={{ margin: 0 }}>
                  <FormattedMessage
                    id="MESSAGE.HOURS.STATEMENT.TOTALCOUNT"
                    values={{ totalCount: totalCount }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );

  const onChangeSelectAvenants = value => {
    if (value === selectAvenants) {
      setSelectAvenants(null);
    } else {
      setSelectAvenants(value);
    }
  };

  const onPressNext = () => {
    if (selectedStartDate && selectedEndDate) {
      var firstDay = new Date(selectedStartDate);
      firstDay.setDate(firstDay.getDate() + 30);
      let lastDay = new Date(selectedEndDate);
      lastDay.setDate(lastDay.getDate() + 30);
      setSelectedStartDate(firstDay);
      setSelectedEndDate(lastDay);
      getRH(firstDay, lastDay);
    }
  };

  const onPressBack = () => {
    if (selectedStartDate && selectedEndDate) {
      var firstDay = new Date(selectedStartDate);
      firstDay.setDate(firstDay.getDate() - 30);
      let lastDay = new Date(selectedEndDate);
      lastDay.setDate(lastDay.getDate() - 30);
      setSelectedStartDate(firstDay);
      setSelectedEndDate(lastDay);
      getRH(firstDay, lastDay);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader title={intl.formatMessage({ id: "TITLE.HOURS.STATEMENT" })}>
          <div className="contract_search_button_container">
            <button
              type="button"
              className="btn btn-light-primary contract_search_button"
              onClick={() => history.goBack()}
            >
              Retour
            </button>
            <NavLink to="/contracts">
              <button className="btn btn-light-success contract_search_button">
                {intl.formatMessage({ id: "TEXT.MY.CONTRACTS" })}
              </button>
            </NavLink>
            <NavLink to="/documents">
              <button className="btn btn-light-warning contract_search_button">
                {intl.formatMessage({ id: "TEXT.MY.DOCUMENTS" })}
              </button>
            </NavLink>
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-10 mx-15">
            Il vous reste <strong>{notSeenCount}</strong> relevé d'heures non
            consulté.
          </div>
          <div className="row mb-5 mx-15">
            {renderWeeks()}
            {renderYear()}
            {renderCompanies()}
            {renderChantier()}
            {renderQualifications()}
            {renderContratsNumber()}
            {renderStartDateFilter()}
            {renderEndDateFilter()}
            <div className="col-lg-2 mb-2">
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
          </div>
          <div
            className="mb-10 mx-20"
            style={{
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <button
              onClick={onPressBack}
              className="btn btn-light-primary font-weight-bold px-10"
            >
              <i className="flaticon2-back mr-5"></i>
              <span>
                <FormattedMessage id="BUTTON.BACK" />
              </span>
            </button>
            <button
              onClick={onPressNext}
              className="btn btn-light-primary font-weight-bold px-10"
            >
              <span>
                <FormattedMessage id="BUTTON.NEXT" />
              </span>
              <i className="flaticon2-next ml-5"></i>
            </button>
          </div>
          {/*rhList && (
            <BootstrapTable
              remote
              rowClasses={["dashed"]}
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              keyField="id"
              data={rhList}
              columns={columns}
            />
          )*/}

          <Row>
            {rhList.map((annonce, i) => (
              <Col key={i} lg={2} className="cursor-hand">
                <div className="annonce_container box-shadow-interimaire">
                  <div>
                    <div className="annonce_header_container pb-0">
                      <h2 className="annonce_header_title">
                        {annonce.entrepriseName}
                      </h2>
                    </div>
                    <div className="annonce_body_container py-3">
                      <div className="annonce_body_item">
                        <i className="flaticon-map-location annonce_body_item_icon" />
                        <div>
                          {annonce.chantierName}
                          {annonce.city && <span>{annonce.city}</span>}
                        </div>
                      </div>
                      <div className="annonce_body_item">
                        <i className="flaticon-edit-1 annonce_body_item_icon" />
                        <div>{annonce.contractNumber}</div>
                      </div>
                      <div className="annonce_body_item">
                        <i className="flaticon-customer annonce_body_item_icon" />
                        <div>
                          <div>{annonce.qualification}</div>
                        </div>
                      </div>
                      <div className="annonce_body_item">
                        <i className="flaticon-calendar-2 annonce_body_item_icon" />
                        <div>
                          {new Date(annonce.startDate).toLocaleDateString(
                            "fr-FR"
                          )}{" "}
                          -{" "}
                          {new Date(annonce.endDate).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                      <div className="annonce_body_item">
                        <i className="flaticon-layers annonce_body_item_icon" />
                        <div>
                          {annonce.status === 0
                            ? intl.formatMessage({ id: "TEXT.TO.FILL" })
                            : annonce.status === 1
                            ? intl.formatMessage({ id: "TEXT.TO.VALIDATE" })
                            : annonce.status === 2
                            ? intl.formatMessage({ id: "TEXT.VALEDATED" })
                            : ""}
                        </div>
                      </div>
                      {annonce.ifm ? (
                        <div className="annonce_body_item">
                          <i className="flaticon-coins annonce_body_item_icon" />
                          <div>
                            <div>{annonce.ifm.toFixed(2)} €</div>
                            <div className="annonce_body_salary_text">
                              <FormattedMessage id="DISPLAY.IFM.CP" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="annonce_body_item">
                          <i className="flaticon-coins annonce_body_item_icon" />
                          <div>
                            <div>IFM non renseignée</div>
                          </div>
                        </div>
                      )}
                      <div className="annonce_body_item">
                        <i className="flaticon-exclamation-1 annonce_body_item_icon" />
                        <div>
                          {annonce.isComplaint !== 0 ? (
                            <span
                              style={{
                                height: "25px",
                                width: "25px",
                                backgroundColor:
                                  annonce.isComplaint === 2
                                    ? "#FF4500"
                                    : "#ADFF2F",
                                borderRadius: "50%",
                                display: "inline-block"
                              }}
                            ></span>
                          ) : (
                            <span>Pas de réclamation</span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginTop: 10
                        }}
                      >
                        <>
                          <div
                            className="btn btn-light-primary mb-2"
                            onClick={e => {
                              e.stopPropagation();
                              history.push(`/cra/new-hours/${annonce.id}`);
                            }}
                          >
                            <FormattedMessage id="BUTTON.SEE.MORE" />
                          </div>
                          <>
                            {annonce.isComplaint == 0 && annonce.status === 2 && (
                              <div
                                className="btn btn-light-warning"
                                onClick={e => {
                                  e.stopPropagation();
                                  history.push(`/cra/complaint/${annonce.id}`);
                                }}
                              >
                                <FormattedMessage id="TEXT.COMPLAINT" />
                              </div>
                            )}
                            {annonce.isComplaint > 0 && (
                              <div
                                className="btn btn-light-warning mt-2"
                                onClick={e => {
                                  e.stopPropagation();
                                  history.push(`/cra/complaints/${annonce.id}`);
                                }}
                              >
                                Voir les réclamations
                              </div>
                            )}
                          </>
                        </>
                      </div>
                    </div>
                    {/*<div className="annonce_body_container py-3">
                                    <div className="annonce_body_item">
                                      <i className="flaticon-map-location annonce_body_item_icon" />
                                      <div>
                                        {annonce.vacancyBusinessAddressCity} (
                                        {annonce.vacancyBusinessAddressPostalCode})
                                      </div>
                                    </div>
                                    <div className="annonce_body_item">
                                      <i className="flaticon-calendar-2 annonce_body_item_icon" />
                                      <div>
                                        {new Date(
                                          annonce.vacancyContractualVacancyEmploymentContractTypeStartDate
                                        ).toLocaleDateString("fr-FR")}{" "}
                                        -{" "}
                                        {new Date(
                                          annonce.vacancyContractualVacancyEmploymentContractTypeEndDate
                                        ).toLocaleDateString("fr-FR")}
                                      </div>
                                    </div>
                                    <div className="annonce_body_item">
                                      <i className="flaticon-coins annonce_body_item_icon" />
                                      <div>
                                        <div>
                                          {annonce.missionHourlyGrossSalary.toFixed(2)} €
                                        </div>
                                        <div className="annonce_body_salary_text">
                                          <FormattedMessage id="DISPLAY.IFM.CP" />
                                        </div>
                                      </div>
                                    </div>
                                        </div>*/}
                  </div>
                  {/*<div className="annonce_footer_container">
                                  <i
                                    className={
                                      annonce.isFavorite
                                        ? "fas flaticon-star icon-xxl mx-2 heart-icon-color"
                                        : "far flaticon-star icon-xxl mx-2"
                                    }
                                    onClick={() => {
                                      handleFavorites(annonce.id, !annonce.isFavorite);
                                    }}
                                  />
                                  <Link
                                    className="annonce_footer_showmore mx-2 text-white"
                                    to={`/matching/approve/${annonce.id}`}
                                  >
                                    <i className="flaticon2-send-1 annonce_footer_showmore_icon" />
                                    <FormattedMessage id="TEXT.APPLY" />
                                  </Link>
                                  <Link
                                    className="annonce_footer_showmore mx-2 bg-light-danger"
                                    to={`/matching/remove/${annonce.id}`}
                                  >
                                    <i className="flaticon2-cross annonce_footer_cancel_icon" />
                                  </Link>
                                  </div>*/}
                </div>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={rhList}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          </div>
        </CardBody>
      </Card>
      <Route path="/cra/new-hours/:id">
        <HoursStatementForm idList={idList} />
      </Route>
      <Route path="/cra/complaint/:id">
        <HoursStatementComplaint getRH={getRH} />
      </Route>
      <Route path="/cra/complaints/:id">
        <ComplaintsList getRH={getRH} />
      </Route>
    </div>
  );
}

export default HoursStatement;

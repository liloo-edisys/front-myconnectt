import React, { useEffect, useState } from "react";
import { useHistory, Route } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";
import axios from "axios";
import moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty.js";
import {
  Card,
  CardHeader,
  CardBody,
  CardHeaderToolbar
} from "../../../../_metronic/_partials/controls/index.js";
import { fakeData, weekList, statusList } from "./fakeDatas.js";
import { getTRJobTitles } from "actions/shared/listsActions";
import HoursStatementForm from "./fields/hoursStatementForm.jsx";
import { DisplayDialog } from "../interimaires/modals/displayDialog.jsx";
import ContractDetails from "../missions/contracts-client/ContractDetails.js";
import HoursStatementComplaint from "./fields/hoursStatementComplaint.jsx";
import MissionEndingForm from "./fields/missionEndingForm.jsx";
import ComplaintsList from "./fields/complaintsList.jsx";

function HoursStatement(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const intl = useIntl();
  const { user, jobTitleList, companies } = useSelector(state => ({
    user: state.auth.user,
    jobTitleList: state.lists.trJobTitles,
    companies: state.companies.companies
  }));
  const [rhList, setRhList] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState("");
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
  const [selectedContractStatus, setSelectedContractStatus] = useState(0);
  const [idList, setIdList] = useState([]);
  const [bornageStartDate, setBornageStartDate] = useState("");
  const [bornageEndDate, setBornageEndDate] = useState("");

  let filteredCompanies = companies.length
    ? companies.filter(company => company.parentID === null)
    : [];

  let worksites = companies.length
    ? companies.filter(company => company.parentID !== null)
    : [];

  useEffect(() => {
    dispatch(getTRJobTitles.request(parseInt(selectedCompany)));
    setSelectedCompany(user.accountID);
    getRH();
  }, [pageNumber]);

  const getRH = (firstDay, lastDay, contractNumber) => {
    let body = {
      tenantID: user.tenantID,
      pageSize,
      pageNumber,
      weekNumber: parseInt(selectedWeekNumber),
      applicantName: selectedApplicant,
      accountID: parseInt(selectedCompany),
      ChantierID: parseInt(selectedWorksite),
      contractNumber: contractNumber ? contractNumber : selectedContractNumber,
      QualificationID: parseInt(selectedQualification),
      status: parseInt(selectedContractStatus),
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
            ? intl.formatMessage({ id: "TEXT.WAITING.VALIDATION" })
            : value === 2
            ? intl.formatMessage({ id: "TEXT.VALEDATED" })
            : ""}
        </span>
      )
    },
    {
      dataField: "isComplaint",
      text: intl.formatMessage({ id: "COLUMN.COMPLAINTS" }),
      formatter: (value, row) => {
        console.log(value);
        const color = value === 2 ? "#ADFF2F" : "#FF4500";
        console.log(color);
        const title =
          value === 2
            ? intl.formatMessage({ id: "COMPLAINT.TO.PROCESS" })
            : intl.formatMessage({ id: "COMPLAINT.PROCESSED" });
        return (
          <>
            {value !== 0 && (
              <span
                title={title}
                style={{
                  height: "25px",
                  width: "25px",
                  backgroundColor: color,
                  borderRadius: "50%",
                  display: "inline-block"
                }}
              ></span>
            )}
          </>
        );
      }
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
              <FormattedMessage
                id={row.ended || row.status == 2 ? "BUTTON.SEE" : "TEXT.GRAB"}
              />
            </div>
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
            <div
              className="btn btn-light-info ml-2"
              onClick={e => {
                e.stopPropagation();
                history.push(`/cra/interimaire/${row.applicantID}`);
              }}
            >
              <FormattedMessage id="TEXT.APPLICANT" />
            </div>
            <div
              className="btn btn-light-success ml-2"
              onClick={e => {
                e.stopPropagation();
                history.push(`/cra/contract/${row.contractID}`);
              }}
            >
              <FormattedMessage id="MODEL.CONTACT.CONTRACT" />
            </div>
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

  const renderApplicant = () => {
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

  const renderCompanies = () => {
    return (
      <div className="col-lg-2 mb-2">
        <select
          className="form-control"
          name="accountID"
          isSearchable={true}
          value={selectedCompany}
          onChange={e => setSelectedCompany(e.target.value)}
        >
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

  const onChangeContractNumber = value => {
    setSelectedContractNumber(value);
    let body = {
      tenantID: user.tenantID,
      pageSize,
      pageNumber,
      weekNumber: selectedWeekNumber ? parseInt(selectedWeekNumber) : 0,
      applicantName: selectedApplicant,
      accountID: parseInt(selectedCompany),
      ChantierID: parseInt(selectedWorksite),
      contractNumber: value,
      QualificationID: parseInt(selectedQualification),
      status: parseInt(selectedContractStatus),
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
            onChangeContractNumber(e.target.value);
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

  const renderStatusSelector = () => {
    return (
      <div className="col-lg-2">
        <select
          className="col-lg-12 form-control"
          name="jobTitleID"
          value={selectedContractStatus}
          onChange={e => setSelectedContractStatus(e.target.value)}
        >
          <option selected value={-1} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "COLUMN.STATUS" })} --
          </option>
          {statusList.map(status => {
            return (
              <option id={status.value} key={status.value} value={status.value}>
                {status.label}
              </option>
            );
          })}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.STATUS" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    let body = {
      tenantID: user.tenantID,
      pageSize,
      pageNumber,
      weekNumber: selectedWeekNumber ? parseInt(selectedWeekNumber) : 0,
      applicantName: selectedApplicant,
      accountID: parseInt(selectedCompany),
      ChantierID: parseInt(selectedWorksite),
      contractNumber: selectedContractNumber,
      QualificationID: parseInt(selectedQualification),
      status: parseInt(selectedContractStatus),
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
        console.log(res.data.list);
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
          <div>
            <button
              type="button"
              className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-2 my-5 mx-4"
              onClick={() => history.goBack()}
            >
              Retour
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="row mb-5 mx-15">
            {renderWeeks()}
            {renderYear()}
            {renderApplicant()}
            {renderCompanies()}
            {renderChantier()}
            {renderQualifications()}
            {renderStartDateFilter()}
            {renderEndDateFilter()}
            {renderContratsNumber()}
            {renderStatusSelector()}
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
          {rhList && (
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
          )}
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
        <HoursStatementForm idList={idList} getRH={getRH} />
      </Route>
      <Route path="/cra/interimaire/:id">
        {({ history, match }) => (
          <DisplayDialog
            show={match != null}
            history={history}
            onHide={() => {
              history.goBack();
            }}
          />
        )}
      </Route>
      <Route path="/cra/contract/:id" component={ContractDetails} />
      <Route path="/cra/complaint/:id">
        <HoursStatementComplaint getRH={getRH} />
      </Route>
      <Route path="/cra/close-mission/:id">
        <MissionEndingForm getRH={getRH} />
      </Route>
      <Route path="/cra/complaints/:id">
        <ComplaintsList getRH={getRH} />
      </Route>
    </div>
  );
}

export default HoursStatement;

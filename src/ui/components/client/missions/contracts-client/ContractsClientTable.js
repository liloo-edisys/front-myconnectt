import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Route, useHistory } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getBackOfficeContractList } from "../../../../../business/actions/backoffice/recruiterActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import { getJobTitles } from "actions/shared/listsActions";
import moment from "moment";
import ContractClientExpensionModal from "./ContractClientExpensionModal";
import ContractClientRenewalModal from "./ContractClientRenewalModal";
import ContractDetails from "./ContractDetails";

function ContractsClientTable(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const intl = useIntl();

  const {
    contractList,
    user,
    jobTitleList,
    companies,
    currentCompanyID
  } = useSelector(state => ({
    user: state.auth.user,
    contractList: state.recruiterReducerData.contractList,
    jobTitleList: state.lists.jobTitles,
    companies: state.companies.companies,
    currentCompanyID: state.auth.user.accountID
  }));
  const [expanded, setExpanded] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedContractNumber, setSelectedContractNumber] = useState("");
  const [selectedWorksite, setSelectedWorksite] = useState(0);
  const [selectedQualification, setSelectedQualification] = useState(0);
  const [selectedId, setSelectedId] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [toogleExpensionModal, setToogleExpensionModal] = useState(false);
  const [toogleRenewalModal, setToogleRenewalModal] = useState(false);
  const [activeMission, setActiveMission] = useState(null);
  const [contractStatus, setContractStatus] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [reloadAfterExpension, setReloadAfterExpention] = useState(false);

  let worksites = companies.length
    ? companies.filter(company => company.parentID === currentCompanyID)
    : [];

  useEffect(() => {
    if (user) {
      if (window.location.pathname === "/prolongations") {
        setContractStatus(3);
        let body = {
          tenantID: user.tenantID,
          accountID: user.accountID,
          applicantID: 0,
          status: 3,
          pageSize: pageSize,
          pageNumber: pageNumber
        };
        isNullOrEmpty(jobTitleList) && dispatch(getJobTitles.request());
        isNullOrEmpty(contractList) &&
          getBackOfficeContractList(body, dispatch);
        //return getBackOfficeContractList(body, dispatch);
      } else {
        let body = {
          tenantID: user.tenantID,
          accountID: user.accountID,
          applicantID: 0,
          status: contractStatus,
          pageSize: pageSize,
          pageNumber: pageNumber
        };
        //getBackOfficeContractList(body, dispatch);
        isNullOrEmpty(jobTitleList) && dispatch(getJobTitles.request());
        isNullOrEmpty(contractList) &&
          getBackOfficeContractList(body, dispatch);
      }
    }
  }, [user, pageNumber, reloadAfterExpension]);

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
                    id="MESSAGE.CONTRACTS.TOTALCOUNT"
                    values={{ totalCount: contractList.totalcount }}
                  />
                </p>
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );
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
          <FormattedMessage id="MESSAGE.NO.MISSION.MATCH" />
        </div>
      </div>
    </div>
  );

  function encoreUrl(str) {
    let newUrl = "";
    const len = str && str.length;
    let url;
    for (let i = 0; i < len; i++) {
      let c = str.charAt(i);
      let code = str.charCodeAt(i);

      if (c === " ") {
        newUrl += "+";
      } else if (
        (code < 48 && code !== 45 && code !== 46) ||
        (code < 65 && code > 57) ||
        (code > 90 && code < 97 && code !== 95) ||
        code > 122
      ) {
        newUrl += "%" + code.toString(16);
      } else {
        newUrl += c;
      }
    }
    if (newUrl.indexOf(".doc") > 0 || newUrl.indexOf(".docx") > 0) {
      url = "https://view.officeapps.live.com/op/embed.aspx?src=" + newUrl;
    } else {
      url =
        "https://docs.google.com/gview?url=" +
        newUrl +
        "&embedded=true&SameSite=None";
    }
    return url;
  }

  const handleChangePage = (size, page) => {
    setPageNumber(page.page);
  };

  const columns = [
    {
      dataField: "contractNumber",
      text: intl.formatMessage({ id: "COLUMN.CONTRACT.ID" })
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
      dataField: "applicantName",
      text: intl.formatMessage({ id: "TEXT.APPLICANT" })
    },
    {
      dataField: "qualification",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" })
    },
    {
      dataField: "recourseReason",
      text: intl.formatMessage({ id: "COLUMN.APPEAL.REASON" }),
      formatter: (value, row) => <span>{value}</span>
    },
    {
      dataField: "startDate",
      text: intl.formatMessage({ id: "COLUMN.START.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "endDate",
      text: intl.formatMessage({ id: "COLUMN.END.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "signedByClient",
      text: intl.formatMessage({ id: "COLUMN.SIGNED" }),
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => {
        const months = moment([row.endDate]).diff(
          moment([row.startDate]),
          "months",
          true
        );

        let start = moment(
          new Date(row.endDate).toLocaleDateString("en-CA"),
          "YYYY-MM-DD"
        );
        let end = moment(new Date().toLocaleDateString("en-CA"), "YYYY-MM-DD");
        let workingDay = 0;
        const vacancyLength = 100;

        while (start <= end) {
          if (
            start.format("ddd") !== "sam." &&
            start.format("ddd") !== "dim."
          ) {
            workingDay++;
          }
          start = moment(start, "YYYY-MM-DD").add(1, "days");
        }
        return (
          <div style={{ display: "flex" }}>
            <div
              onMouseEnter={e => {
                e.stopPropagation();
                setSelectedId(true);
              }}
              onMouseOut={() => setSelectedId(false)}
            >
              <Link
                to={`/contrats/display/${row.id}`}
                className="btn btn-light-primary font-size-sm mr-2"
              >
                <FormattedMessage id="TEXT.DISPLAY.CONTRACT" />
              </Link>
              {selectedId ? (
                <div>
                  <FormattedMessage id="MESSAGE.PROCESSING" />
                </div>
              ) : (
                <>
                  {row.showProlongation ? (
                    <div
                      className="btn btn-light-warning font-weight-bolder font-size-sm mr-2"
                      onClick={e => {
                        e.stopPropagation();
                        showExpensionModal(row);
                      }}
                    >
                      Prolongation
                    </div>
                  ) : (
                    row.showRenouvellement && (
                      <div
                        className="btn btn-light-info font-weight-bolder font-size-sm mr-2"
                        onClick={e => {
                          e.stopPropagation();
                          showRenewalModal(row);
                        }}
                      >
                        <FormattedMessage id="TEXT.RENEWAL" />
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        );
      }
    },
    {
      text: intl.formatMessage({ id: "COLUMN.DOCUMENTS" }),
      formatter: (value, row) => {
        return row.accountDocumentUrl ? (
          <span className="text-dark-75 d-block font-size-lg">
            <a
              target="_blank"
              rel="noopener noreferrer"
              //href={encoreUrl(row.accountDocumentUrl)}
              href={`/document/display/${encoreUrl(row.accountDocumentUrl)}`}
              className="btn btn-light-primary"
            >
              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
            </a>
          </span>
        ) : (
          <div style={{ fontSize: 8 }}>
            <FormattedMessage id="MESSAGE.PROCESSING" />
          </div>
        );
      }
    }
  ];

  const avenantColumn = [
    {
      dataField: "contractNumber",
      text: intl.formatMessage({ id: "COLUMN.AMENDMENT.NUMBER" })
    },
    {
      dataField: "startDate",
      text: intl.formatMessage({ id: "COLUMN.START.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "endDate",
      text: intl.formatMessage({ id: "COLUMN.END.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.DOCUMENT" }),
      formatter: (value, row) => {
        return row.accountDocumentUrl ? (
          <span className="text-dark-75 d-block font-size-lg">
            <a
              target="_blank"
              rel="noopener noreferrer"
              //href={encoreUrl(row.accountDocumentUrl)}
              href={`/document/display/${encoreUrl(row.accountDocumentUrl)}`}
              className="btn btn-light-primary"
            >
              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
            </a>
          </span>
        ) : (
          <div style={{ fontSize: 8 }}>
            <FormattedMessage id="MESSAGE.PROCESSING" />
          </div>
        );
      }
    }
  ];

  const expandRow = {
    renderer: (row, rowKey) => {
      if (row.childs.length <= 0) {
        return;
      }
      return (
        <div className="subtable">
          <BootstrapTable
            bordered={false}
            classes={`table table-head-custom table-vertical-center overflow-hidden `}
            style={{ width: "50%" }}
            bootstrap4
            remote
            wrapperClasses="table-responsive test"
            keyField="id"
            data={row && row.childs ? row.childs : []}
            columns={avenantColumn}
          ></BootstrapTable>
        </div>
      );
    },
    expandHeaderColumnRenderer: () => {
      return <span></span>;
    },
    headerClasses: "hidden",
    onExpand: (row, isExpand, rowIndex, e) => {
      if (isExpand) {
        let exp = [...expanded, row.id];
        setExpanded(exp);
      } else {
        let exp = expanded.filter(x => x !== row.id);
        setExpanded(exp);
      }
    },
    showExpandColumn: true,
    expanded: expanded,
    expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
      let contract = contractList.list.filter(
        contract => contract.id === rowKey
      )[0];
      return (
        contract.childs.length > 0 && (
          <div>
            {expanded ? (
              <i className="fas fa-angle-double-down text-primary"></i>
            ) : (
              <i className="fas fa-angle-double-right text-primary"></i>
            )}
          </div>
        )
      );
    }
  };

  const renderApplicant = () => {
    return (
      <div className="col-lg-1">
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

  const handleChangeStartDate = val => {
    if (val > selectedEndDate) {
      setSelectedEndDate("");
    }
    setSelectedStartDate(val);
  };

  const renderStartDateFilter = () => {
    return (
      <div className="col-lg-1 width-100">
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
      <div className="col-lg-1 width-100">
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

  const renderContratsNumber = () => {
    return (
      <div className="col-lg-1">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedContractNumber}
          onChange={e => setSelectedContractNumber(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.CONTRACT.OR.APPLICANT.NUMBER" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    let body = {
      tenantID: user.tenantID,
      accountID: user.accountID,
      applicantID: 0,
      status: contractStatus,
      pageSize: pageSize,
      pageNumber: 1,
      startDate: selectedStartDate ? selectedStartDate : null,
      endDate: selectedEndDate ? selectedEndDate : null,
      contractNumber: selectedContractNumber,
      applicantName: selectedApplicant,
      qualificationID: parseInt(selectedQualification),
      chantierID: parseInt(selectedWorksite)
    };
    getBackOfficeContractList(body, dispatch);
  };

  const showExpensionModal = value => {
    setActiveMission(value);
    setToogleExpensionModal(true);
  };

  const hideExpensionModal = () => {
    setToogleExpensionModal(false);
  };

  const showRenewalModal = value => {
    setActiveMission(value);
    setToogleRenewalModal(true);
  };

  const hideRenewalModal = () => {
    setToogleRenewalModal(false);
  };

  const onChangeContractStatus = () => {
    if (contractStatus === 0) {
      setContractStatus(3);
    } else {
      setContractStatus(0);
    }
  };

  const onReloadAfterExpension = () => {
    setReloadAfterExpention(!reloadAfterExpension);
  };

  return (
    <div>
      {toogleExpensionModal && (
        <ContractClientExpensionModal
          onHide={hideExpensionModal}
          activeMission={activeMission}
          onReloadAfterExpension={onReloadAfterExpension}
        />
      )}
      {toogleRenewalModal && (
        <ContractClientRenewalModal
          onHide={hideRenewalModal}
          activeMission={activeMission}
          onReloadAfterExpension={onReloadAfterExpension}
        />
      )}
      <div className="row mb-5 mx-15">
        {renderApplicant()}
        {renderChantier()}
        {renderStartDateFilter()}
        {renderEndDateFilter()}
        {renderQualifications()}
        {renderContratsNumber()}
        <div className="col-lg-2 width-100">
          <div className="row">
            <label className="col-lg-8 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.ECHEANCE.CONTRACTS" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    onChange={onChangeContractStatus}
                    checked={contractStatus === 3}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
        </div>
        <div className="col-lg-2 width-100">
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
      {contractList && contractList.list && (
        <>
          <BootstrapTable
            remote
            rowClasses={["dashed"]}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={contractList.list}
            columns={columns}
            expandRow={expandRow}
          />
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={contractList.list}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={contractList.totalcount}
              onTableChange={handleChangePage}
            />
          </div>
        </>
      )}
      <Route path="/contrats/display/:id" component={ContractDetails} />
    </div>
  );
}

export default ContractsClientTable;

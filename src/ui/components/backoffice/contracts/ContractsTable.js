import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Route } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import DatePicker from "react-datepicker";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";
import fr from "date-fns/locale/fr";
import { FormattedMessage, useIntl } from "react-intl";
import { getBackOfficeContractList } from "../../../../business/actions/backoffice/RecruiterActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { getAccounts } from "actions/backoffice/AccountsActions";
import moment from "moment";
import { getCompanies } from "actions/client/CompaniesActions";
import { getJobTitles } from "actions/shared/ListsActions";
import ContractDetails from "./ContractDetails";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { toastr } from "react-redux-toastr";

function ContractsTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const {
    contractList,
    user,
    accounts,
    jobTitleList,
    companies,
    currentCompanyID
  } = useSelector(state => ({
    contractList: state.recruiterReducerData.contractList,
    user: state.recruiterReducerData.user,
    accounts: state.lists.accounts,

    jobTitleList: state.lists.jobTitles,
    companies: state.companies.companies,
    currentCompanyID: state.auth.user.accountID
  }));
  const [expanded, setExpanded] = useState([]);
  const [selectPassedContracts, setSelectPassedContracts] = useState(false);
  const [selectActiveContracts, setSelectActiveContracts] = useState(false);
  const [selectAccount, setSelectAccount] = useState(null);
  const [selectedId, setSelectedId] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedContractNumber, setSelectedContractNumber] = useState("");
  const [selectedWorksite, setSelectedWorksite] = useState(0);
  const [selectedQualification, setSelectedQualification] = useState(0);
  const [contractStatus, setContractStatus] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [toggleProlongationModal, setToggleProlongationModal] = useState(null);
  const [extractDate, setExtractDate] = useState();

  let filteredCompanies = companies.length
    ? companies.filter(company => company.parentID === null)
    : [];

  let worksites = companies.length
    ? companies.filter(company => company.parentID !== null)
    : [];

  useEffect(() => {
    if (user) {
      let body = {
        tenantID: user.tenantID,
        status: contractStatus,
        pageSize: pageSize,
        pageNumber: pageNumber,
        accountId: Number(selectAccount)
      };
      getBackOfficeContractList(body, dispatch);
      dispatch(getAccounts.request());
    }
    if (companies.length === 0) {
      dispatch(getCompanies.request());
    }
    isNullOrEmpty(jobTitleList) && dispatch(getJobTitles.request());
  }, [user, pageNumber]);

  const onShowProlongationModal = row => {
    setToggleProlongationModal(row.id);
    setExtractDate(moment(row.endDate).toDate());
  };

  const onHideProlongationModal = () => {
    setToggleProlongationModal(null);
  };

  const onExtractContract = () => {
    const EXTEND_CONTRACT_URL = `${process.env.REACT_APP_WEBAPI_URL}api/contract/ExtendContract`;
    let body = {
      contractID: toggleProlongationModal,
      date: extractDate
    };
    axios
      .post(EXTEND_CONTRACT_URL, body)
      .then(res => {
        let body = {
          tenantID: user.tenantID,
          status: contractStatus,
          pageSize: pageSize,
          pageNumber: pageNumber,
          accountId: Number(selectAccount)
        };
        getBackOfficeContractList(body, dispatch);
        dispatch(getAccounts.request());
        toastr.success("Succès", "Le contrat a été prolongé avec succès.");
        setToggleProlongationModal(null);
      })
      .catch(err =>
        toastr.error(
          "Erreur",
          "Une erreur s'est produite lors de la prolongation du contrat."
        )
      );
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
          <FormattedMessage
            id="NO.CORRESPONDING"
            values={{ name: "mission" }}
          />
        </div>
      </div>
    </div>
  );

  const handleChangePage = (size, page) => {
    setPageNumber(page.page);
  };

  const columns = [
    {
      dataField: "contractNumber",
      text: intl.formatMessage({ id: "COLUMN.CONTRACT.NUMBER" })
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
      text: intl.formatMessage({ id: "COLUMN.APPEAL.REASON" })
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
      formatter: value => (
        <div>
          {value ? (
            <i className="far fa-check-circle mr-5 text-success" />
          ) : (
            <i className="far fa-window-close mr-5 text-danger" />
          )}
        </div>
      )
    },
    {
      text: intl.formatMessage({ id: "MATCHING.TABLE.ACTIONS" }),
      formatter: (value, row) => (
        <div style={{ display: "flex" }}>
          <Link
            to={`/contracts/display/${row.id}`}
            className="btn btn-light-primary font-size-sm mr-2"
          >
            <FormattedMessage id="TEXT.DISPLAY.CONTRACT" />
          </Link>
          <button
            className="btn btn-light-primary font-size-sm mr-2"
            onClick={() => onShowProlongationModal(row)}
          >
            <FormattedMessage id="TEXT.EXPENSION.CONTRACT" />
          </button>
        </div>
      )
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
  {
    /*<div className="col-lg-2">
        <input name="city" className="form-control" type="text"></input>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.QUALIFICATION" />
        </small>
      </div>*/
  }

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
      accountId: Number(selectAccount),
      applicantID: 0,
      status: contractStatus,
      pageSize: 10,
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

  const onChangeContractStatus = () => {
    if (contractStatus === 0) {
      setContractStatus(3);
    } else {
      setContractStatus(0);
    }
  };

  return (
    <div>
      <div className="row mb-5 mx-15">
        {toggleProlongationModal && (
          <Modal
            show={true}
            onHide={onHideProlongationModal}
            aria-labelledby="example-modal-sizes-title-lg"
          >
            <Modal.Header closeButton>
              <Modal.Title id="example-modal-sizes-title-lg">
                <FormattedMessage id="TEXT.EXPENSION.CONTRACT" />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <span>
                <FormattedMessage id="TEXT.ENDDATE" />
              </span>
              <div className="col-lg-12 width-100 mt-5">
                <DatePicker
                  className={`col-lg-12 form-control`}
                  style={{ width: "100%" }}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top-start"
                  onChange={val => {
                    !isNullOrEmpty(val)
                      ? setExtractDate(val)
                      : setExtractDate("");
                  }}
                  minDate={extractDate ? moment(extractDate).toDate() : null}
                  selected={extractDate}
                  showMonthDropdown
                  showYearDropdown
                  yearItemNumber={9}
                  locale={fr}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div>
                <button
                  type="button"
                  onClick={onHideProlongationModal}
                  className="btn btn-light-primary btn-shadow font-weight-bold"
                >
                  <FormattedMessage id="BUTTON.CANCEL" />
                </button>
                <button
                  type="button"
                  onClick={onExtractContract}
                  className="btn btn-light-primary btn-shadow font-weight-bold ml-5"
                >
                  <FormattedMessage id="TEXT.EXPENSION.CONTRACT" />
                </button>
              </div>
            </Modal.Footer>
          </Modal>
        )}
        {renderApplicant()}
        <div className="col-lg-2">
          <select
            className="form-control"
            name="accountID"
            isSearchable={true}
            onChange={e => setSelectAccount(e.target.value)}
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
        <div
          style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}
        >
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
      <div className="row mb-5 mx-15"></div>
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
          <Route path="/contracts/display/:id" component={ContractDetails} />
        </>
      )}
    </div>
  );
}

export default ContractsTable;

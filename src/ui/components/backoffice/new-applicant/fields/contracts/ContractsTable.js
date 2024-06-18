import React, { useState, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import DatePicker from "react-datepicker";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import { FormattedMessage, useIntl } from "react-intl";
import { getBackOfficeContractList } from "../../../../../../business/actions/backoffice/RecruiterActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import fr from "date-fns/locale/fr";
import moment from "moment";

function ContractsTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const { contractList, interimaire } = useSelector(
    state => ({
      contractList: state.recruiterReducerData.contractList,
      interimaire: state.accountsReducerData.activeInterimaire
    }),
    shallowEqual
  );
  const [expanded, setExpanded] = useState([]);
  const [selectPassedContracts, setSelectPassedContracts] = useState(false);
  const [selectActiveContracts, setSelectActiveContracts] = useState(false);
  const [selectedId, setSelectedId] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (interimaire) {
      let status = 0;

      if (
        (selectPassedContracts && selectActiveContracts) ||
        (!selectPassedContracts && !selectActiveContracts)
      ) {
        status = 0;
      } else if (selectPassedContracts) {
        status = 1;
      } else if (selectActiveContracts) {
        status = 2;
      }

      let body = {
        tenantID: interimaire.tenantID,
        accountID: 0,
        applicantID: interimaire.id,
        status: status,
        pageSize: pageSize,
        pageNumber: pageNumber
      };
      getBackOfficeContractList(body, dispatch);
    }
  }, [selectPassedContracts, selectActiveContracts, pageNumber, interimaire]);

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

  const handleChangePage = (size, page) => {
    setPageNumber(page.page);
  };

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
      dataField: "city",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.CITY" })
    },
    {
      dataField: "qualification",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" })
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
      dataField: "endReason",
      text: intl.formatMessage({ id: "COLUMN.END.REASON" })
    },
    {
      dataField: "ifm",
      text: intl.formatMessage({ id: "COLUMN.IFM" })
    },
    {
      text: intl.formatMessage({ id: "COLUMN.DOCUMENTS" }),
      formatter: (value, row) => {
        return row.applicantDocumentUrl ? (
          <span className="text-dark-75 d-block font-size-lg">
            <a
              target="_blank"
              rel="noopener noreferrer"
              //href={encoreUrl(row.applicantDocumentUrl)}
              href={`/document/display/${encoreUrl(row.applicantDocumentUrl)}`}
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
      text: "Numéro de l'avenant"
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
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          {row.applicantDocumentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              //href={encoreUrl(row.applicantDocumentUrl)}
              href={`/document/display/${encoreUrl(row.applicantDocumentUrl)}`}
              className="btn btn-light-primary"
            >
              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
            </a>
          ) : (
            <a>
              <FormattedMessage id="MESSAGE.PROCESSING" />
            </a>
          )}
        </div>
      )
    }
  ];

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

  const handleChangeStartDate = val => {
    if (val > selectedEndDate) {
      setSelectedEndDate("");
    }
    setSelectedStartDate(val);
  };

  const renderStartDateFilter = () => {
    return (
      <div className="col-lg-2 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? handleChangeStartDate(val)
              : onChangeSelectedStartDate("");
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
      <div className="col-lg-2 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? onChangeSelectedEndDate(val)
              : onChangeSelectedEndDate("");
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

  const onChangeSelectPassedContracts = () => {
    setSelectPassedContracts(!selectPassedContracts);
    setSelectedStartDate("");
    setSelectedEndDate("");
  };

  const onChangeSelectedActiveContracts = () => {
    setSelectActiveContracts(!selectActiveContracts);
    setSelectedStartDate("");
    setSelectedEndDate("");
  };

  const onChangeSelectedStartDate = val => {
    setSelectPassedContracts(false);
    setSelectActiveContracts(false);
    setSelectedStartDate(val);
  };

  const onChangeSelectedEndDate = val => {
    setSelectPassedContracts(false);
    setSelectActiveContracts(false);
    setSelectedEndDate(val);
  };

  const onSearchFilteredContracts = () => {
    let body = {
      tenantID: interimaire.tenantID,
      accountID: 0,
      applicantID: interimaire.id,
      status: 0,
      pageSize: pageSize,
      pageNumber: 1,
      startDate: selectedStartDate ? selectedStartDate : null,
      endDate: selectedEndDate ? selectedEndDate : null
    };
    getBackOfficeContractList(body, dispatch);
  };

  return (
    <div>
      <div className="row mb-5 mx-15">
        <div className="col-lg-2 width-100">
          <div className="row">
            <label className="col-lg-6 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.PASSED.CONTRACTS" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    onChange={onChangeSelectPassedContracts}
                    checked={selectPassedContracts}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
        </div>
        <div className="col-lg-2 width-100">
          <div className="row">
            <label className="col-lg-6 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.ACTIVE.CONTRACTS" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    onChange={onChangeSelectedActiveContracts}
                    checked={selectActiveContracts}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
        </div>
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
    </div>
  );
}

export default ContractsTable;

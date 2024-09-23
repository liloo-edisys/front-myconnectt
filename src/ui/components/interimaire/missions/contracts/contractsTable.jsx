import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory, Route } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import DatePicker from "react-datepicker";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty.js";
import { FormattedMessage, useIntl } from "react-intl";
import { getContractList } from "../../../../../business/actions/interimaire/interimairesActions.js";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import fr from "date-fns/locale/fr";
import moment from "moment";
import ClientDetails from "./clientDetails.jsx";
import { Col, Row } from "react-bootstrap";

function ContractsTable(props) {
  const history = useHistory();
  const dispatch = useDispatch();
  const intl = useIntl();

  const { contractList, interimaire } = useSelector(
    state => state.interimairesReducerData
  );
  
  const [expanded, setExpanded] = useState([]);
  const [selectPassedContracts, setSelectPassedContracts] = useState(false);
  const [selectActiveContracts, setSelectActiveContracts] = useState(true);
  const [selectedId, setSelectedId] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [pageSize, setPageSize] = useState(12);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectAvenants, setSelectAvenants] = useState(null);

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
      getContractList(body, dispatch);
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
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <Link
          to={`/contracts/client/${row.entrepriseID}`}
          className="btn btn-light-success font-weight-bolder font-size-sm mr-5"
        >
          <FormattedMessage id="CUSTOMER" />
        </Link>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.DOCUMENTS" }),
      formatter: (value, row) => {
        return row.applicantDocumentUrl ? (
          <span className="text-dark-75 d-block font-size-lg">
            <a
              target="_blank"
              rel="noopener noreferrer"
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
      pageNumber: 1,
      startDate: selectedStartDate ? selectedStartDate : null,
      endDate: selectedEndDate ? selectedEndDate : null
    };
    getContractList(body, dispatch);
  };

  const onChangeSelectAvenants = value => {
    if (value === selectAvenants) {
      setSelectAvenants(null);
    } else {
      setSelectAvenants(value);
    }
  };

  return (
    <div>
      <div className="row mb-5 search_filter_container">
        <div className="col-lg-2 width-100">
          <div className="row">
            <label className="col-6 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.PASSED.CONTRACTS" />
            </label>
            <div className="col-6 width-100 d-flex col-form-label">
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
            <label className="col-6 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.ACTIVE.CONTRACTS" />
            </label>
            <div className="col-6 width-100 d-flex col-form-label">
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
          className="btn btn-success font-weight-bold ml-10 mb-10 px-10 search_filter_button"
        >
          <i className="fa fa-search mr-5"></i>
          <span>
            <FormattedMessage id="BUTTON.SEARCH" />
          </span>
        </button>
      </div>
      {contractList && contractList.list && (
        <>
          {/*<BootstrapTable
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
          />*/}

          <Row>
            {contractList.list.map((annonce, i) => (
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
                          <div>
                            {annonce.endReason
                              ? annonce.endReason
                              : "Motif de fin non renseigné"}
                          </div>
                        </div>
                      </div>
                      <div className="annonce_body_item">
                        <i className="flaticon-coins annonce_body_item_icon" />
                        {annonce.ifm ? (
                          <div>
                            <div>{annonce.ifm}€</div>
                            <div className="annonce_body_salary_text">
                              <FormattedMessage id="DISPLAY.IFM.CP" />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div>IFM non renseignée</div>
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                          marginTop: 10
                        }}
                      >
                        <Link
                          to={`/contracts/client/${annonce.entrepriseID}`}
                          className="btn btn-light-success font-weight-bolder font-size-sm mr-5"
                        >
                          <FormattedMessage id="CUSTOMER" />
                        </Link>
                        {annonce.applicantDocumentUrl ? (
                          <span className="text-dark-75 d-block font-size-lg">
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`/document/display/${encoreUrl(
                                annonce.applicantDocumentUrl
                              )}`}
                              className="btn btn-light-primary"
                            >
                              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                            </a>
                          </span>
                        ) : (
                          <div style={{ fontSize: 8 }}>
                            <FormattedMessage id="DOCUMENT.MESSAGE.PROCESSING" />
                          </div>
                        )}
                      </div>
                      {annonce.childs.length > 0 && (
                        <>
                          <div className="my-5">
                            {selectAvenants ? (
                              <i
                                className="fas fa-angle-double-down text-primary mr-5"
                                onClick={() => onChangeSelectAvenants(i)}
                              ></i>
                            ) : (
                              <i
                                className="fas fa-angle-double-right text-primary mr-5"
                                onClick={() => onChangeSelectAvenants(i)}
                              ></i>
                            )}
                            Avenants
                          </div>
                          {selectAvenants === i &&
                            annonce.childs.map((avenant, j) => (
                              <div
                                className="mb-5"
                                style={{ borderBottom: "1px solid lightgrey" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 12
                                  }}
                                >
                                  <div>{avenant.contractNumber}</div>
                                  <div>
                                    {new Date(
                                      avenant.startDate
                                    ).toLocaleDateString("fr-FR")}{" "}
                                    -{" "}
                                    {new Date(
                                      avenant.endDate
                                    ).toLocaleDateString("fr-FR")}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    textAlign: "center",
                                    marginTop: 5,
                                    marginBottom: 5
                                  }}
                                >
                                  {avenant.applicantDocumentUrl ? (
                                    <span className="text-dark-75 d-block font-size-lg">
                                      <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`/document/display/${encoreUrl(
                                          avenant.applicantDocumentUrl
                                        )}`}
                                        className="btn btn-light-primary"
                                      >
                                        <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                                      </a>
                                    </span>
                                  ) : (
                                    <div style={{ fontSize: 8 }}>
                                      <FormattedMessage id="DOCUMENT.MESSAGE.PROCESSING" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </>
                      )}
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
              data={contractList.list}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={contractList.totalcount}
              onTableChange={handleChangePage}
            />
          </div>
          <Route path="/contracts/client/:id" component={ClientDetails} />
        </>
      )}
    </div>
  );
}

export default ContractsTable;

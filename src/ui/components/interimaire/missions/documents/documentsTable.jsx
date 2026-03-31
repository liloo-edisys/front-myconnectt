import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import DatePicker from "react-datepicker";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { FormattedMessage, useIntl } from "react-intl";
import { getDocumentList } from "../../../../../business/actions/interimaire/interimairesActions";
import fr from "date-fns/locale/fr";
import moment from "moment";
import { Col, Row } from "react-bootstrap";

function DocumentsTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const { documentsList, interimaire } = useSelector(
    state => state.interimairesReducerData
  );
  const [expanded, setExpanded] = useState([]);
  const [selectPassedContracts, setSelectPassedContracts] = useState(false);
  const [selectActiveContracts, setSelectActiveContracts] = useState(false);

  const [pageSize, setPageSize] = useState(12);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedId, setSelectedId] = useState(false);
  const [isShown, setIsShown] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");

  useEffect(() => {
    if (interimaire) {
      let body = {
        tenantID: interimaire.tenantID,
        applicantID: interimaire.id,
        pageSize: pageSize,
        pageNumber: pageNumber,
        documentType: []
      };
      getDocumentList(body, dispatch);
    }
  }, [interimaire, pageNumber]);

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
                  Total de {documentsList.totalcount} document(s)
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
      dataField: "documentType",
      text: "Type du document",
      formatter: value => (
        <span>
          {value === 18
            ? "Attestation"
            : value === 17
            ? "Bulletin de paie"
            : value === 20
            ? "Certificat de travail"
            : ""}
        </span>
      )
    },
    {
      dataField: "additionalInformation",
      text: "Libellé du document"
    },
    {
      text: intl.formatMessage({ id: "COLUMN.DOCUMENTS" }),
      formatter: (value, row) => {
        return row.documentUrl ? (
          <span className="text-dark-75 d-block font-size-lg">
            <a
              target="_blank"
              rel="noopener noreferrer"
              //href={encoreUrl(row.documentUrl)}
              href={`/document/display/${encoreUrl(row.documentUrl)}`}
              className="btn btn-light-primary"
            >
              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
            </a>
          </span>
        ) : (
          <div style={{ fontSize: 8 }}>Pas de document</div>
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
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          {row.applicantDocumentUrl ? (
            <a
              href="#"
              className="btn btn-light-success font-weight-bolder font-size-sm"
            >
              Document
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

  const renderTypeSelector = () => {
    const typeArray = [
      {
        id: 17,
        name: "Bulletin de paie"
      },
      {
        id: 18,
        name: "Attestation"
      },
      {
        id: 20,
        name: "Certificat de travail"
      }
    ];
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedDocumentType}
          onChange={e => setSelectedDocumentType(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- Type de document --
          </option>
          {typeArray.map(type => (
            <option key={type.id} label={type.name} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.DOCUMENT.TYPE" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    let body = {
      tenantID: interimaire.tenantID,
      applicantID: interimaire.id,
      pageSize: pageSize,
      pageNumber: 1
    };
    if (
      parseInt(selectedDocumentType) === 17 ||
      parseInt(selectedDocumentType) === 18 ||
      parseInt(selectedDocumentType) === 20
    ) {
      body = {
        ...body,
        documentType: [parseInt(selectedDocumentType)]
      };
    }
    getDocumentList(body, dispatch);
  };

  return (
    <div>
      <div className="row mb-5 mx-15">
        {renderTypeSelector()}
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
      {documentsList && documentsList.list && (
        <>
          <Row>
            {documentsList.list.map((annonce, i) => (
              <Col key={i} lg={2} className="cursor-hand">
                <div className="annonce_container box-shadow-interimaire">
                  <div>
                    <div className="annonce_header_container pb-0">
                      <h2 className="annonce_header_title">
                        {annonce.documentType === 18
                          ? "Attestation"
                          : annonce.documentType === 17
                          ? "Bulletin de paie"
                          : annonce.documentType === 20
                          ? "Certificat de travail"
                          : ""}
                      </h2>
                    </div>
                    <div className="annonce_body_container py-3">
                      <div className="annonce_body_item">
                        <i className="flaticon-edit-1 annonce_body_item_icon" />
                        <div>
                          {annonce.additionalInformation
                            ? annonce.additionalInformation
                            : "Ce document n'a pas de libellé"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                          marginTop: 10
                        }}
                      >
                        {annonce.documentUrl ? (
                          <span className="text-dark-75 d-block font-size-lg">
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              //href={encoreUrl(row.documentUrl)}
                              href={`/document/display/${encoreUrl(
                                annonce.documentUrl
                              )}`}
                              className="btn btn-light-primary"
                            >
                              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                            </a>
                          </span>
                        ) : (
                          <div style={{ fontSize: 8 }}>Pas de document</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={documentsList.list}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={documentsList.totalcount}
              onTableChange={handleChangePage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default DocumentsTable;

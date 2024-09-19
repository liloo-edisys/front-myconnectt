import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import {
  getExtensions,
  putExtension
} from "../../../../business/actions/backoffice/missionsActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import ProcessModal from "./extensionsModals/ProcessModal";
import { ExtensionProfileDialog } from "./extensionsModals/ExtensionProfileDialog";
import { getApplicantById } from "actions/client/applicantsActions";
import ClientModal from "./extensionsModals/ClientModal";

function ExtensionsTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [iSExtensions, setIsExtension] = useState(false);
  const [toogleProcessModal, setToogleProcessModal] = useState(false);
  const [activeExtension, setActiveExtension] = useState(null);
  const [toogleInterimaireModal, setToogleInterimaireModal] = useState(false);
  const [toogleClientModal, setToogleClientModal] = useState(false);
  const [activeClient, setActiveClient] = useState(null);
  const [extentionsToBeProcessed, setExtentionsToBeProcessed] = useState(true);
  const [extentionsProcessed, setExtentionsProcessed] = useState(false);

  const { extensionList, user, accounts, totalCount } = useSelector(state => ({
    extensionList: state.lists.extensions.list,
    totalCount: state.lists.extensions.totalcount,
    user: state.recruiterReducerData.user,
    accounts: state.lists.accounts
  }));

  const getData = () => {
    let selectedExtensionsStatus = 0;
    if (extentionsProcessed !== extentionsToBeProcessed) {
      if (extentionsToBeProcessed) {
        selectedExtensionsStatus = 1;
      }
      if (extentionsProcessed) {
        selectedExtensionsStatus = 2;
      }
    }
    let body = {
      tenantID: user.tenantID,
      pageSize: pageSize,
      status: selectedExtensionsStatus,
      pageNumber: pageNumber
    };
    getExtensions(body, dispatch);
    setIsExtension(true);
  };

  useEffect(() => {
    getData();
  }, [pageNumber, extentionsToBeProcessed, extentionsProcessed]);

  const columns = [
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "COLUMN.EXTENSION.DATE" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
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
      dataField: "endDate",
      text: intl.formatMessage({ id: "COLUMN.END.DATE.REQUESTED" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "applicantFullName",
      text: intl.formatMessage({ id: "TEXT.APPLICANT" })
    },
    {
      dataField: "status",
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      formatter: (value, row) => (
        <span>
          {value === 1
            ? intl.formatMessage({ id: "MENU.INPROGRESS" })
            : value === 2
            ? intl.formatMessage({ id: "TEXT.VALEDATED" })
            : value === 3 && "Refusée"}
        </span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          <a
            onClick={e => {
              e.stopPropagation();
              onShowInterimaireModal(row);
            }}
            className="btn btn-light-warning mr-2"
          >
            <FormattedMessage id="TEXT.APPLICANT" />
          </a>
          <a
            onClick={e => {
              e.stopPropagation();
              onShowClientModal(row);
            }}
            className="btn btn-light-info mr-2"
          >
            <FormattedMessage id="CUSTOMER" />
          </a>
          {row.status === 1 && (
            <a
              onClick={e => {
                e.stopPropagation();
                onShowProcessModal(row);
              }}
              className="btn btn-light-success mr-2"
            >
              Traiter
            </a>
          )}
        </div>
      )
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

  const handleChangePage = (size, page) => {
    localStorage.setItem("pageNumber", page);
    getData();
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
                    id="MESSAGE.EXTENSIONS.TOTALCOUNT"
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

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
  };

  const onShowProcessModal = row => {
    setToogleProcessModal(true);
    setActiveExtension(row);
  };

  const onHideProcessModal = () => {
    setToogleProcessModal(false);
    setActiveExtension(null);
  };

  const onShowInterimaireModal = row => {
    setToogleInterimaireModal(true);
    dispatch(getApplicantById.request(row.applicantID));
  };

  const onHideInterimaireModal = row => {
    setToogleInterimaireModal(false);
  };

  const onShowClientModal = row => {
    setActiveClient(row);
    setToogleClientModal(true);
  };

  const onHideClientModal = row => {
    setActiveClient(null);
    setToogleClientModal(false);
  };

  const onAcceptExtension = async () => {
    await putExtension({ ...activeExtension, status: 2 }, getData, dispatch);
    onHideProcessModal();
  };

  const onChangeSelectedStatus = {};

  return (
    <div>
      {toogleClientModal && (
        <ClientModal activeClient={activeClient} onHide={onHideClientModal} />
      )}
      {toogleInterimaireModal && (
        <ExtensionProfileDialog onHide={onHideInterimaireModal} />
      )}
      {toogleProcessModal && (
        <ProcessModal
          onHide={onHideProcessModal}
          acceptExtension={onAcceptExtension}
        />
      )}
      <div className="row">
        <div className="col-lg-2 width-100 mb-10">
          <div className="row">
            <label className="col-lg-8 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.EXTENSIONS.TO.BE.PROCESSED" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    onChange={() =>
                      setExtentionsToBeProcessed(!extentionsToBeProcessed)
                    }
                    checked={extentionsToBeProcessed}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
        </div>
        <div className="col-lg-2 width-100 mb-10">
          <div className="row">
            <label className="col-lg-8 width-100 d-flex col-form-label">
              <FormattedMessage id="TEXT.EXTENSIONS.PROCESSED" />
            </label>
            <div>
              <span className="switch switch switch-sm">
                <label>
                  <input
                    type="checkbox"
                    onChange={() =>
                      setExtentionsProcessed(!extentionsProcessed)
                    }
                    checked={extentionsProcessed}
                  />
                  <span></span>
                </label>
              </span>
            </div>
          </div>
        </div>
      </div>
      {extensionList && extensionList && (
        <BootstrapTable
          remote
          rowClasses={["dashed"]}
          wrapperClasses="table-responsive"
          bordered={false}
          classes="table table-head-custom table-vertical-center overflow-hidden"
          bootstrap4
          keyField="id"
          data={extensionList}
          columns={columns}
        />
      )}
      <div style={{ marginTop: 30 }}>
        <RemotePagination
          data={extensionList}
          page={pageNumber}
          sizePerPage={pageSize}
          totalSize={totalCount}
          onTableChange={handleTableChange}
        />
      </div>
    </div>
  );
}

export default ExtensionsTable;

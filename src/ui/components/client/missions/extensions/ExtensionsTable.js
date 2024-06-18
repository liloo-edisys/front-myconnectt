import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import { getExtensions } from "../../../../../business/actions/client/MissionsActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import axios from "axios";
import { toastr } from "react-redux-toastr";

function ExtensionsTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [pageSize, setPageSize] = useState(12);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedExension, setSelectedExension] = useState(null);

  const { extensionList, user, totalCount } = useSelector(state => ({
    extensionList: state.lists.extensions.list,
    totalCount: state.lists.extensions.totalcount,
    user: state.auth.user
  }));

  useEffect(() => {
    if (user) {
      let body = {
        tenantID: user.tenantID,
        accountID: user.accountID,
        pageSize: 10,
        pageNumber: 1
      };
      getExtensions(body, dispatch);
    }
  }, [user]);

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
      dataField: "extensionType",
      text: intl.formatMessage({ id: "COLUMN.REQUEST.TYPE" }),
      formatter: value => (
        <span>
          {value === 0
            ? intl.formatMessage({ id: "TEXT.EXTENSION.REQUEST" })
            : value === 1 && intl.formatMessage({ id: "TEXT.RENEWAL.REQUEST" })}
        </span>
      )
    },
    {
      dataField: "endDate",
      text: intl.formatMessage({ id: "COLUMN.END.DATE.REQUESTED" }),
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "status",
      text: intl.formatMessage({ id: "COLUMN.STATUS" }),
      formatter: value => (
        <span>
          {value === 1
            ? intl.formatMessage({ id: "TEXT.WAITING.VALIDATION" })
            : value === 2
            ? intl.formatMessage({ id: "TEXT.VALEDATED" })
            : value === 3
            ? intl.formatMessage({ id: "STATUS.REJECTED" })
            : ""}
        </span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => {
        if (row.status === 1) {
          return (
            <div
              className="btn btn-light-danger"
              onClick={e => {
                e.stopPropagation();
                setSelectedExension(row);
              }}
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </div>
          );
        }
      }
    }
    // {
    //   text: intl.formatMessage({ id: "COLUMN.ACTION" }),
    //   formatter: (value, row) => (
    //     <div style={{ display: "flex" }}>
    //       <Link
    //         to={`/Extensions/${row.id}`}
    //         className="btn btn-light-success font-weight-bolder font-size-sm mr-5"
    //       >
    //         Client
    //       </Link>
    //       <div
    //         onMouseEnter={e => {
    //           e.stopPropagation();
    //           setSelectedId(true);
    //         }}
    //         onMouseOut={() => setSelectedId(false)}
    //       >
    //         {selectedId ? (
    //           <div>traitement en cours</div>
    //         ) : (
    //           <div className="btn btn-light-success font-weight-bolder font-size-sm">
    //             Document
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   )
    // }
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
    let body = {
      tenantID: user.tenantID,
      accountID: user.accountID,
      pageSize: 10,
      pageNumber: page
    };
    getExtensions(body, dispatch);
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
    handleChangePage(sizePerPage, page);
  };

  const onHideModal = () => {
    setSelectedExension(null);
  };

  const onDeleteExtension = () => {
    const EXTENSIONS_URL =
      process.env.REACT_APP_WEBAPI_URL +
      `api/contractextension?id=${selectedExension.id}`;
    axios
      .delete(EXTENSIONS_URL)
      .then(() => {
        let body = {
          tenantID: user.tenantID,
          accountID: user.accountID,
          pageSize: 10,
          pageNumber: 1
        };
        getExtensions(body, dispatch);
        toastr.success(
          "Succès",
          intl.formatMessage({ id: "MESSAGE.EXTENSION.CANCEL.REQUEST.SUCCESS" })
        );
        onHideModal();
      })
      .catch(() =>
        toastr.error(
          intl.formatMessage({ id: "ERROR" }),
          intl.formatMessage({ id: "MESSAGE.CANCEL.REQUEST.ERROR" })
        )
      );
  };

  return (
    <div>
      <Modal
        show={selectedExension ? true : false}
        onHide={onHideModal}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            {selectedExension && selectedExension.extensionType === 0
              ? "Annuler la demande de prolongation"
              : selectedExension &&
                selectedExension.extensionType === 1 &&
                "Annuler la demande de renouvellement"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExension && selectedExension.extensionType === 0
            ? `Annuler la demande de prolongation pour la mission: ${selectedExension &&
                selectedExension.missionTitle}?`
            : selectedExension &&
              selectedExension.extensionType === 1 &&
              `Annuler la demande de renouvellement pour la mission: ${selectedExension &&
                selectedExension.missionTitle}?`}
        </Modal.Body>
        <Modal.Footer>
          <div>
            <button
              type="button"
              onClick={onHideModal}
              className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
            >
              <FormattedMessage id="MATCHING.MODAL.CLOSE" />
            </button>
            <> </>
            <button
              type="button"
              className="btn btn-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              onClick={onDeleteExtension}
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </button>
          </div>
        </Modal.Footer>
      </Modal>
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

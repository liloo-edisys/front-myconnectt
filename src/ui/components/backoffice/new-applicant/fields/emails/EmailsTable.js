import React, { useState, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import DatePicker from "react-datepicker";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import { FormattedMessage, useIntl } from "react-intl";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import fr from "date-fns/locale/fr";
import moment from "moment";
import { getSelectedApplicantEmails } from "../../../../../../business/actions/backoffice/ApplicantActions";
import EmailModal from "./EmailModal";
import EmailContactModal from "./EmailSender/EmailContactModal";
import { useParams } from "react-router-dom";

function EmailsTable(props) {
  const dispatch = useDispatch();
  const { interimaireId } = useParams();
  const intl = useIntl();
  const { interimaire, selectedApplicantEmails } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire,
      selectedApplicantEmails: state.accountsReducerData.selectedApplicantEmails
    }),
    shallowEqual
  );

  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeMail, setActiveMail] = useState(null);
  const [mailSender, setMailSender] = useState(false);

  useEffect(() => {
    if (interimaire) {
      handleGetApplcantEmails();
    }
  }, [pageSize, pageNumber]);

  const handleGetApplcantEmails = () => {
    let body = {
      tenantID: interimaire.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      userID: interimaire.userID,
      messagesOnly: true
    };
    getSelectedApplicantEmails(body, dispatch);
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
                    id="MESSAGE.MAILS.TOTALCOUNT"
                    values={{ totalCount: selectedApplicantEmails.totalcount }}
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
          <FormattedMessage id="MESSAGE.NO.MAIL" />
        </div>
      </div>
    </div>
  );

  const handleChangePage = (size, page) => {
    setPageNumber(page.page);
  };

  const columns = [
    {
      dataField: "creationDate",
      text: "Date",
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "content_From",
      text: intl.formatMessage({ id: "COLUMN.FROM" })
    },
    {
      dataField: "content_To",
      text: intl.formatMessage({ id: "COLUMN.TO" })
    },
    {
      dataField: "content_Subject",
      text: intl.formatMessage({ id: "COLUMN.SUBJECT" }),
      formatter: value => (
        <span dangerouslySetInnerHTML={{ __html: value }}></span>
      )
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <a
          className="btn btn-light-success font-weight-bolder font-size-sm mr-5"
          onClick={e => {
            e.stopPropagation();
            setActiveMail(row);
          }}
        >
          <FormattedMessage id="BUTTON.SEE.MAIL" />
        </a>
      )
    }
  ];

  const onHideEmailModal = () => {
    setActiveMail(null);
  };
  const showMailSender = () => {
    setMailSender(true);
  };
  const hideMailSender = () => {
    setMailSender(false);
  };
  return (
    <div>
      {activeMail && (
        <EmailModal onHide={onHideEmailModal} activeMail={activeMail} />
      )}
      {mailSender && (
        <EmailContactModal
          onHide={hideMailSender}
          id={interimaireId}
          handleGetApplcantEmails={handleGetApplcantEmails}
        />
      )}
      <div style={{ textAlign: "right" }}>
        <button className="btn btn-light-primary" onClick={showMailSender}>
          <FormattedMessage id="CONTACT.MODAL.TITLE" />
        </button>
      </div>
      {selectedApplicantEmails && selectedApplicantEmails.list && (
        <>
          <BootstrapTable
            remote
            rowClasses={["dashed"]}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={selectedApplicantEmails.list}
            columns={columns}
          />
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={selectedApplicantEmails.list}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={selectedApplicantEmails.totalcount}
              onTableChange={handleChangePage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default EmailsTable;

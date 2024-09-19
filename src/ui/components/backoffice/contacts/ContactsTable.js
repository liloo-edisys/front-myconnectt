import React, { useMemo, useEffect, useState } from "react";

import { headerSortingClasses, sortCaret } from "metronic/_helpers";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getCompanies } from "../../../../business/actions/client/companiesActions";

// import CompanyCreateModal from "./companiesModals/CompanyCreateModal";
import { useContactsUIContext } from "./ContactsUIContext";
import InviteContactModal from "./Modals/InviteContactModal";
function ContactsTable({
  contacts,
  createCompany,
  handleClose,
  show,
  worksites
}) {
  const { user, companies } = useSelector(state => ({
    user: state.auth.user,
    companies: state.companies.companies
  }));
  const intl = useIntl();
  const dispatch = useDispatch();
  const contactsUIContext = useContactsUIContext();
  const contactsUIProps = useMemo(() => {
    return {
      newContactButtonClick: contactsUIContext.newContactButtonClick,
      openEditContactModal: contactsUIContext.openEditContactModal,
      openDeleteContactDialog: contactsUIContext.openDeleteContactDialog
    };
  }, [contactsUIContext]);
  const [contactsList, setContactsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(10);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getCompanies.request());
  }, []);

  useEffect(() => {
    getContactList();
  }, [selectedPageNumber]);

  useEffect(() => {
    if (!show) {
      setTimeout(() => {
        getContactList();
      }, 3000);
    }
  }, [show]);

  const filteredCompanies = companies.filter(item => item.parentID === null);

  const getContactList = company => {
    const GET_CONTACT_URL =
      process.env.REACT_APP_WEBAPI_URL + "api/Contact/search";
    const body = {
      tenantID: user.tenantID,
      accountID: company ? parseInt(company) : parseInt(selectedCompany),
      pageSize: selectedPageSize,
      pageNumber: selectedPageNumber,
      email: selectedEmail,
      name: selectedName
    };

    axios.post(GET_CONTACT_URL, body).then(res => {
      setLoading(false);
      setContactsList(res.data.list);
      setTotalCount(res.data.totalcount);
    });
  };

  function isAdminFormatter(cell) {
    return cell !== null && cell ? (
      <span className="label label-lg label-light-success label-inline">
        <FormattedMessage id="TEXT.ADMINISTRATEUR" />
      </span>
    ) : (
      <span className="label label-lg label-light-primary label-inline">
        <FormattedMessage id="TEXT.UTILISATEUR" />
      </span>
    );
  }

  function isApprovedFormatter(cell) {
    return cell !== null && cell ? (
      <span className="label label-lg label-light-success label-inline">
        <FormattedMessage id="TEXT.VALEDATED" />
      </span>
    ) : (
      <span className="label label-lg label-light-warning label-inline">
        <FormattedMessage id="TEXT.WAITINGFOR" />
      </span>
    );
  }

  let columns = [
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "MODEL.LASTNAME" }),
      sort: true
    },
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "accountID",
      text: intl.formatMessage({ id: "TEXT.COMPANY" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: value => {
        let company = null;
        if (filteredCompanies.length > 0) {
          company = filteredCompanies.filter(item => value === item.id)[0];
        }
        return <div>{company ? company.name : ""}</div>;
      }
    },
    {
      dataField: "poste",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "isAdmin",
      text: intl.formatMessage({ id: "TEXT.DROITS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: isAdminFormatter
    },
    {
      dataField: "isApproved",
      text: intl.formatMessage({ id: "TEXT.STATUS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: isApprovedFormatter
    }
    /*{
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px",
      },
      formatExtraData: {
        newContactButtonClick: contactsUIProps.newContactButtonClick,
        openEditContactModal: contactsUIProps.openEditContactModal,
        openDeleteContactDialog: contactsUIContext.openDeleteContactDialog,
      },
    },*/
  ];

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
                data={contactsList}
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
                    id="MESSAGE.CONTACTS.TOTALCOUNT2"
                    values={{ totalCount }}
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
          <FormattedMessage id="MESSAGE.NO.INTERIMAIRE" />
        </div>
      </div>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setSelectedPageNumber(parseInt(page));
    setSelectedPageSize(sizePerPage);

    //handleChangePage(sizePerPage, page);
  };

  const onSelectCompany = company => {
    setSelectedCompany(company);
    getContactList(company);
  };

  const renderCompanies = () => {
    return (
      <div className="col-lg-2 mb-2">
        <select
          className="form-control"
          name="accountID"
          issearchable={true}
          value={selectedCompany}
          onChange={e => onSelectCompany(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.COMPANY" })} --
          </option>
          {filteredCompanies.map((account, index) => (
            <option id={account.id} key={index} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          {intl.formatMessage({ id: "TEXT.COMPANY" })}
        </small>
      </div>
    );
  };

  const renderNameSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.LASTNAME" />
        </small>
      </div>
    );
  };

  const renderEmailSelector = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedEmail}
          onChange={e => setSelectedEmail(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.EMAIL" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    setLoading(true);
    getContactList();
  };

  return (
    <div>
      <InviteContactModal
        onHide={handleClose}
        show={show}
        getContactList={getContactList}
      />
      <div className="row mb-5">
        {renderCompanies()}
        {renderNameSelector()}
        {renderEmailSelector()}
        <button
          onClick={onSearchFilteredContracts}
          className="btn btn-success font-weight-bold ml-10 mb-10 px-10"
        >
          {loading ? (
            <span className="mr-10 spinner spinner-white"></span>
          ) : (
            <i className="fa fa-search mr-5"></i>
          )}
          <span>
            <FormattedMessage id="BUTTON.SEARCH" />
          </span>
        </button>
      </div>
      {companies && companies.length > 0 && (
        <>
          <BootstrapTable
            remote
            rowClasses={"dashed"}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={contactsList}
            columns={columns}
          />
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={contactsList}
              page={selectedPageNumber}
              sizePerPage={selectedPageSize}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          </div>
        </>
      )}
      {/*<BootstrapTable
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        remote
        keyField="id"
        data={contactsList}
        columns={columns}
      >
        <PleaseWaitMessage entities={contacts.contacts} />
        <NoRecordsFoundMessage entities={contacts.contacts} />
  </BootstrapTable>*/}
    </div>
  );
}

export default ContactsTable;

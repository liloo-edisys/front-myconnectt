import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route } from "react-router-dom";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import * as actionTypes from "constants/constants";
import { Input, Select } from "metronic/_partials/controls";
import {
  getMailTemplates,
  getMailTemplateCategories
} from "../../../../business/actions/backoffice/MailTemplatesActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import axios from "axios";
import UserForm from "./usersModals/user-form/UserForm";
import DeleteModal from "./usersModals/user-form/DeleteModal";
import { userTypes } from "./usersModals/user-form/userTypeList";

function UsersTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();
  const [usersList, setUsersList] = useState([]);
  const [usersCount, setUsersCount] = useState("0");
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [backofficeRole, setBackofficeRole] = useState(0);
  const [toogleMailTemplateModal, setToogleMailTemplateModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const { mailTemplatesList, user, totalCount, categories } = useSelector(
    state => ({
      user: state.user.user,
      mailTemplatesList: state.mailTemplatesdReducerData.mailTemplates.list,
      totalCount: state.mailTemplatesdReducerData.mailTemplates.totalcount,
      categories: state.mailTemplatesdReducerData.categories
    })
  );

  const getData = () => {
    const USERS_API = `${process.env.REACT_APP_WEBAPI_URL}api/user/SearchBackofficeUsers`;
    const body = {
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      firstName: firstName,
      lastName: lastName,
      backofficeRole: parseInt(backofficeRole),
      email: email
    };
    axios
      .post(USERS_API, body)
      .then(res => {
        setUsersList(res.data.list);
        setUsersCount(res.data.totalcount);
      })
      .catch(err => console.log(err));
    dispatch(getMailTemplates.request(body));
  };

  useEffect(() => {
    getData();
    dispatch(getMailTemplateCategories.request());
  }, [pageNumber, refresh]);

  const columns = [
    {
      dataField: "lastname",
      text: intl.formatMessage({ id: "COLUMN.NAME" })
    },
    {
      dataField: "firstname",
      text: intl.formatMessage({ id: "MODEL.FIRSTNAME" })
    },
    {
      dataField: "email",
      text: intl.formatMessage({ id: "MODEL.EMAIL" })
    },
    {
      dataField: "backofficeRole",
      text: intl.formatMessage({ id: "TEXT.TYPE" }),
      formatter: value => <span>{userTypes[value - 1].value}</span>
    },
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "MODEL.VACANCY.CREATIONDATE" }),
      formatter: value => <span>{new Date(value).toLocaleDateString()}</span>
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          {(user.backofficeRole === 1 || user.backofficeRole === 2) && (
            <button
              className="btn btn-light-primary mr-2"
              onClick={() => history.push(`/users/edit-user/${row.id}`)}
            >
              Modifier
            </button>
          )}
          {row.id !== user.id &&
            (user.backofficeRole === 1 || user.backofficeRole === 2) &&
            !(user.backofficeRole === 2 && row.backofficeRole === 1) && (
              <button
                className="btn btn-light-danger mr-2"
                onClick={() => history.push(`/users/delete-user/${row.id}`)}
              >
                Supprimer
              </button>
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
          <FormattedMessage id="MESSAGE.NO.MAIL.TEMPLATE" />
        </div>
      </div>
    </div>
  );

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
                    id="MESSAGE.USERS.TOTALCOUNT"
                    values={{ totalCount: usersCount }}
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
  };

  const onShowMailTemplateModal = row => {
    setToogleMailTemplateModal(true);
    dispatch({
      type: actionTypes.SET_MAIL_TEMPLATE,
      payload: row
    });
  };

  const onHideMailTemplateModal = row => {
    setToogleMailTemplateModal(false);
    dispatch({
      type: actionTypes.SET_MAIL_TEMPLATE,
      payload: null
    });
  };

  const renderLastnameFilter = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="COLUMN.NAME" />
        </small>
      </div>
    );
  };

  const renderFistnameFilter = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.FIRSTNAME" />
        </small>
      </div>
    );
  };

  const renderEmailFilter = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.EMAIL" />
        </small>
      </div>
    );
  };

  const renderBackofficeRoleFilter = () => {
    return (
      <div className="col-lg-2">
        <select
          value={backofficeRole}
          className="form-control"
          onChange={e => setBackofficeRole(e.target.value)}
        >
          <option selected value="0">
            --{" "}
            {intl.formatMessage({
              id: "TEXT.ROLE"
            })}{" "}
            --
          </option>
          {userTypes.map(type => {
            return (
              <option key={type.id} value={type.id}>
                {type.value}
              </option>
            );
          })}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.ROLE" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    getData();
  };

  return (
    <>
      <div className="row mb-5" style={{ justifyContent: "flex-end" }}>
        <Route path="/users/new-user">
          <UserForm onHide={() => history.push("/users")} getData={getData} />
        </Route>
        <Route path="/users/edit-user/:id">
          <UserForm onHide={() => history.push("/users")} getData={getData} />
        </Route>
        <Route path="/users/delete-user/:id">
          <DeleteModal
            onHide={() => history.push("/users")}
            getData={getData}
          />
        </Route>
        {renderLastnameFilter()}
        {renderFistnameFilter()}
        {renderEmailFilter()}
        {renderBackofficeRoleFilter()}
        <div className="col-lg-2">
          <button
            onClick={onSearchFilteredContracts}
            className="btn btn-success font-weight-bold px-10"
          >
            <i className="fa fa-search mr-5"></i>
            <span>
              <FormattedMessage id="BUTTON.SEARCH" />
            </span>
          </button>
        </div>
      </div>
      <div>
        {/*toogleMailTemplateModal && (
          <MailTemplateDialog onHide={onHideMailTemplateModal} />
        )*/}
        {mailTemplatesList && mailTemplatesList && (
          <BootstrapTable
            remote
            rowClasses={["dashed"]}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={usersList}
            columns={columns}
          />
        )}
        <div style={{ marginTop: 30 }}>
          <RemotePagination
            data={usersList}
            page={pageNumber}
            sizePerPage={pageSize}
            totalSize={usersCount}
            onTableChange={handleTableChange}
          />
        </div>
      </div>
    </>
  );
}

export default UsersTable;

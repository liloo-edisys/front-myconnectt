import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import * as actionTypes from "constants/constants";
import { getCommercialAgreements } from "../../../../business/actions/backoffice/CommercialAgreementsActions";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider
} from "react-bootstrap-table2-paginator";
import { CommercialAgreementEditDialog } from "./commercialAgreementsModals/CommercialAgreementEditDialog";
import { CommercialAgreementDeleteDialog } from "./commercialAgreementsModals/CommercialAgreementDeleteDialog";
import {
  getAccountGroups,
  getJobTitles,
  getAccounts
} from "../../../../business/actions/shared/ListsActions";

function CommercialAgreementsTable(props) {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [
    toggleCommercialAgreementsModal,
    setToggleCommercialAgreementsModal
  ] = useState(false);
  const [
    toggleCommercialAgreementDeleteModal,
    setToggleCommercialAgreementDeleteModal
  ] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [selectedJobTitle, setSelectedJobTitle] = useState(0);

  const {
    commercialAgreementsList,
    user,
    totalCount,
    groups,
    accounts,
    jobTitles
  } = useSelector(state => ({
    user: state.user.user,
    commercialAgreementsList:
      state.commercialAgreementsdReducerData.commercialAgreements.list,
    totalCount:
      state.commercialAgreementsdReducerData.commercialAgreements.totalcount,
    groups: state.lists.accountGroups,
    accounts: state.lists.accounts,
    jobTitles: state.lists.jobTitles
  }));

  let filteredCompanies = accounts.length
    ? accounts.filter(company => company.parentID === null)
    : [];

  const getData = body => {
    dispatch(getCommercialAgreements.request(body));
  };

  useEffect(() => {
    getData({
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      qualificationID: parseInt(selectedJobTitle),
      accountID: parseInt(selectedCompany),
      groupID: parseInt(selectedGroup)
    });
    dispatch(getAccountGroups.request());
    dispatch(getJobTitles.request());
    dispatch(getAccounts.request());
  }, [pageNumber, refresh]);

  const columns = [
    {
      dataField: "qualificationTitle",
      text: intl.formatMessage({ id: "TEXT.QUALIFICATION" })
    },
    {
      dataField: "coefficient",
      text: intl.formatMessage({ id: "TEXT.COEFFICIENT" })
    },
    {
      dataField: "groupName",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.GROUP" })
    },
    {
      dataField: "accountName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" })
    },
    {
      dataField: "isValidated",
      text: intl.formatMessage({ id: "COLUMN.VALIDATED.CUSTOMER" }),
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
      dataField: "validatedDate",
      text: intl.formatMessage({ id: "COLUMN.VALIDATED.ON" }),
      formatter: value => (
        <span>
          {value != null ? new Date(value).toLocaleDateString("fr-FR") : ""}
        </span>
      )
    },
    {
      dataField: "validatedByName",
      text: intl.formatMessage({ id: "COLUMN.VALIDATED.BY" })
    },
    {
      text: intl.formatMessage({ id: "COLUMN.ACTION" }),
      formatter: (value, row) => (
        <div>
          <a
            onClick={e => {
              e.stopPropagation();
              onShowCommercialAgreementsModal(row);
            }}
            className="btn btn-light-info mr-2"
          >
            <i className="far fa-edit"></i>
          </a>
          <a
            onClick={e => {
              e.stopPropagation();
              onShowCommercialAgreementDeleteModal(row);
            }}
            title={intl.formatMessage({ id: "BUTTON.DELETE" })}
            className="btn btn-icon btn-light-danger mr-2"
          >
            <i className="far fa-trash-alt"></i>
          </a>
        </div>
      )
    }
  ];

  const renderCompanySelect = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="accountID"
          value={selectedCompany}
          onChange={e => {
            setSelectedCompany(e.target.value);
            getData({
              tenantID: user.tenantID,
              pageSize: pageSize,
              pageNumber: pageNumber,
              groupID: parseInt(selectedGroup),
              accountID: parseInt(e.target.value),
              qualificationID: parseInt(selectedJobTitle)
            });
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.CUSTOMERS" })} --
          </option>
          {filteredCompanies.map(data => (
            <option key={data.id} label={data.name} value={data.id}>
              {data.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.CUSTOMERS" />
        </small>
      </div>
    );
  };

  const renderGroupSelect = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="groupID"
          value={selectedGroup}
          onChange={e => {
            setSelectedGroup(e.target.value);
            getData({
              tenantID: user.tenantID,
              pageSize: pageSize,
              pageNumber: pageNumber,
              groupID: parseInt(e.target.value),
              accountID: parseInt(selectedCompany),
              qualificationID: parseInt(selectedJobTitle)
            });
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "MODEL.ACCOUNT.GROUP" })} --
          </option>
          {groups.map(group => (
            <option key={group.id} label={group.name} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.ACCOUNT.GROUP" />
        </small>
      </div>
    );
  };

  const renderJobTitlesSelect = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedJobTitle}
          onChange={e => {
            setSelectedJobTitle(e.target.value);
            getData({
              tenantID: user.tenantID,
              pageSize: pageSize,
              pageNumber: pageNumber,
              groupID: parseInt(selectedGroup),
              accountID: parseInt(selectedCompany),
              qualificationID: parseInt(e.target.value)
            });
          }}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "TEXT.QUALIFICATION" })} --
          </option>
          {jobTitles.map(jobTitle => (
            <option key={jobTitle.id} label={jobTitle.name} value={jobTitle.id}>
              {jobTitle.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.QUALIFICATION" />
        </small>
      </div>
    );
  };

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
            values={{ name: "accord commercial" }}
          />
        </div>
      </div>
    </div>
  );

  const handleChangePage = (size, page) => {
    localStorage.setItem("pageNumber", page);
    getData({
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      groupID: parseInt(selectedGroup),
      qualificationID: parseInt(selectedJobTitle)
    });
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
                  Total de {totalCount} accord(s) commercial(aux)
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

  const onShowCommercialAgreementsModal = row => {
    setToggleCommercialAgreementsModal(true);
    dispatch({
      type: actionTypes.SET_COMMERCIAL_AGREEMENT,
      payload: row
    });
  };

  const onShowCommercialAgreementDeleteModal = row => {
    setToggleCommercialAgreementDeleteModal(true);
    dispatch({
      type: actionTypes.SET_COMMERCIAL_AGREEMENT,
      payload: row
    });
  };

  const onHideModals = row => {
    setToggleCommercialAgreementsModal(false);
    setToggleCommercialAgreementDeleteModal(false);
    dispatch({
      type: actionTypes.SET_COMMERCIAL_AGREEMENT,
      payload: null
    });
    getData({
      tenantID: user.tenantID,
      pageSize: pageSize,
      pageNumber: pageNumber,
      groupID: parseInt(selectedGroup),
      qualificationID: parseInt(selectedJobTitle)
    });
  };

  return (
    <>
      <div className="row mb-5 mx-15">
        {renderGroupSelect()}
        {renderCompanySelect()}
        {renderJobTitlesSelect()}
      </div>
      <div>
        {toggleCommercialAgreementsModal && (
          <CommercialAgreementEditDialog onHide={onHideModals} />
        )}
        {toggleCommercialAgreementDeleteModal && (
          <CommercialAgreementDeleteDialog onHide={onHideModals} />
        )}
        {commercialAgreementsList && commercialAgreementsList && (
          <BootstrapTable
            remote
            rowClasses={"dashed"}
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="id"
            data={commercialAgreementsList}
            columns={columns}
          />
        )}
        <div style={{ marginTop: 30 }}>
          <RemotePagination
            data={commercialAgreementsList}
            page={pageNumber}
            sizePerPage={pageSize}
            totalSize={totalCount}
            onTableChange={handleTableChange}
          />
        </div>
      </div>
    </>
  );
}

export default CommercialAgreementsTable;

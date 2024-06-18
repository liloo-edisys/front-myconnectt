import React, { useMemo, useState, useEffect } from "react";

import { headerSortingClasses, sortCaret } from "metronic/_helpers";
import BootstrapTable from "react-bootstrap-table-next";
import { useIntl, FormattedMessage } from "react-intl";
import DatePicker from "react-datepicker";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";
import fr from "date-fns/locale/fr";

import {
  NoRecordsFoundMessage,
  PleaseWaitMessage
} from "../../../../_metronic/_helpers";
import { clearLatestClientEdited } from "../../../../business/actions/backoffice/AccountsActions";
import CompanyCreateModal from "./companiesModals/CompanyCreateModal";
import { useCustomersUIContext } from "./CustomersUIContext";
import ActionsColumnFormatter from "./customers-table/column-formatters/ActionsColumnFormatter";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";

function CustomersTable(props) {
  const dispatch = useDispatch();
  const {
    createCompany,
    handleClose,
    show,
    getData,
    state,
    setPageNumber,
    setPageSize,
    setName,
    setSelectedStatus,
    setGroupId,
    setSelectedCreationDate,
    setCustomers,
    setTotalCount
  } = props;
  const {
    selectedStatus,
    selectedCreationDate,
    loading,
    customers,
    pageNumber,
    pageSize,
    totalCount,
    name,
    groupId
  } = state;
  const intl = useIntl(); // intl extracted from useIntl hook
  const CUSTOMERS_URL =
    process.env.REACT_APP_WEBAPI_URL + "api/Account/SearchAccounts";
  /*const formatWorksite = (id) => {
    if (worksites.length) {
      return worksites.filter((worksite) => worksite.parentID === id);
    }
    return [];
  };*/
  const { user, accountGroups, latestClientEdited } = useSelector(
    state => ({
      user: state.contacts.user,
      accountGroups: state.lists.accountGroups,
      latestClientEdited: state.accountsReducerData.latestClientEdited
    }),
    shallowEqual
  );
  const [expanded, setExpanded] = useState(null);

  const statusArray = [
    { id: 1, value: 1, name: intl.formatMessage({ id: "STATUS.REGISTERED" }) },
    { id: 2, value: 2, name: intl.formatMessage({ id: "STATUS.MODIFIED" }) },
    {
      id: 3,
      value: 3,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.COMMERCIALS.ENCOURS" })
    },
    {
      id: 4,
      value: 4,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.COMMERCIALS" })
    },
    {
      id: 5,
      value: 5,
      name: intl.formatMessage({ id: "STATUS.VALIDATED.ENCOURS" })
    },
    {
      id: 6,
      value: 6,
      name: intl.formatMessage({ id: "STATUS.ANAEL.UPDATED" })
    }
  ];

  useEffect(() => {
    getData();
  }, [pageNumber]);

  useEffect(() => {
    if (latestClientEdited) {
      setExpanded([parseInt(latestClientEdited)]);
      setTimeout(() => {
        clearLatestClientEdited(dispatch);
      }, 1000);
    }
  }, [latestClientEdited]);

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
                    id="MESSAGE.CUSTOMERS.TOTALCOUNT"
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
    //handleChangePage(sizePerPage, page);
  };

  const expandRow = {
    renderer: row => {
      if (row.childs.length <= 0) {
        return;
      }
      return (
        <div className="subtable">
          <BootstrapTable
            wrapperClasses=""
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            remote
            keyField="id"
            data={row && row.childs ? row.childs : []}
            columns={worksitesColumns}
          ></BootstrapTable>
        </div>
      );
    },
    showExpandColumn: true,
    expanded: expanded && expanded,
    expandHeaderColumnRenderer: () => null,
    expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
      let customer = customers.filter(customer => customer.id === rowKey)[0];
      return (
        customer.childs &&
        customer.childs.length > 0 && (
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
    /*expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
      if (formatWorksite(rowKey).length) {
        return expanded ? (
          <i className="fas fa-angle-double-down text-primary"></i>
        ) : (
          <i className="fas fa-angle-double-right text-primary"></i>
        );
      }
      return null;
    },*/
  };

  const customersUIContext = useCustomersUIContext();
  const customersUIProps = useMemo(() => {
    return {
      ids: customersUIContext.ids,
      setIds: customersUIContext.setIds,
      queryParams: customersUIContext.queryParams,
      setQueryParams: customersUIContext.setQueryParams,
      newWorksiteButtonClick: customersUIContext.newWorksiteButtonClick,
      openEditCompanyDialog: customersUIContext.openEditCompanyDialog,
      openDeleteCompanyDialog: customersUIContext.openDeleteCompanyDialog,
      openEditWorksiteDialog: customersUIContext.openEditWorksiteDialog,
      openPreviewWorksiteDialog: customersUIContext.openPreviewWorksiteDialog
    };
  }, [customersUIContext]);

  let columns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "TEXT.COMPANY" }),
      sort: true
    },
    {
      dataField: "postalCode",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.POSTALCODE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "phoneNumber",
      text: intl.formatMessage({ id: "ABBRV.PHONE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: value => (
        <span>{value && value.match(/.{1,2}/g).join(" ")}</span>
      )
    },
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "COLUMN.CREATION.CLIENT" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "lastModifiedDate",
      text: intl.formatMessage({ id: "COLUMN.MODIFICATION.CLIENT" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "lastConnexionDate",
      text: intl.formatMessage({ id: "COLUMN.CONNEXION.CLIENT" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: value => (
        <span>{value ? new Date(value).toLocaleDateString("fr-FR") : "-"}</span>
      )
    },
    {
      dataField: "outstandingsValidated",
      text: "En cours Anael",
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      dataField: "commercialContractSigned",
      text: "Accord cadre",
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      dataField: "commercialAgreementsValidated",
      text: intl.formatMessage({ id: "USER.COMMERCIAL.AGREEMENT" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatExtraData: {
        newWorksiteButtonClick: customersUIProps.newWorksiteButtonClick,
        openEditCompanyDialog: customersUIProps.openEditCompanyDialog,
        openDeleteCompanyDialog: customersUIProps.openDeleteCompanyDialog,
        openPreviewWorksiteDialog: customersUIProps.openPreviewWorksiteDialog,
        openEditWorksiteDialog: customersUIProps.openEditWorksiteDialog,
        user: user,
        getData: getData
      }
    }
  ];

  let worksitesColumns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.SITE.NAME" }),
      sort: true
    },
    {
      dataField: "postalCode",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.POSTALCODE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "creationDate",
      text: intl.formatMessage({ id: "TEXT.SIGNUP.DATE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: value => (
        <span>{new Date(value).toLocaleDateString("fr-FR")}</span>
      )
    },
    {
      dataField: "phoneNumber",
      text: intl.formatMessage({ id: "ABBRV.PHONE" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses
    },
    {
      dataField: "outstandingsValidated",
      text: "En cours Anael",
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      dataField: "commercialContractSigned",
      text: intl.formatMessage({ id: "BUTTON.ACCEPT.SIGNED.AGREEMENTS" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      dataField: "commercialAgreementsValidated",
      text: intl.formatMessage({ id: "USER.COMMERCIAL.AGREEMENT" }),
      sort: true,
      sortCaret: sortCaret,
      headerSortingClasses,
      formatter: (value, row) => {
        return (
          <div>
            {value ? (
              <i className="far fa-check-circle mr-5 text-success" />
            ) : (
              <i className="far fa-window-close mr-5 text-danger" />
            )}
          </div>
        );
      }
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatExtraData: {
        newWorksiteButtonClick: customersUIProps.newWorksiteButtonClick,
        openEditCompanyDialog: customersUIProps.openEditCompanyDialog,
        openDeleteCompanyDialog: customersUIProps.openDeleteCompanyDialog,
        openPreviewWorksiteDialog: customersUIProps.openPreviewWorksiteDialog,
        openEditWorksiteDialog: customersUIProps.openEditWorksiteDialog,
        user: user
      }
    }
  ];

  const renderName = () => {
    return (
      <div className="col-lg-2 width-100">
        <input
          name="city"
          className="form-control"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.LASTNAME" />
        </small>
      </div>
    );
  };

  const renderStatusSelector = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          <option selected value={null} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "COLUMN.STATUS" })} --
          </option>
          {statusArray.map(status => (
            <option key={status.id} label={status.name} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.STATUS" />
        </small>
      </div>
    );
  };

  const renderGroupSelector = () => {
    return (
      <div className="col-lg-2">
        <select
          className="form-control form-control-lg p-2"
          name="jobTitleID"
          value={groupId}
          onChange={e => setGroupId(e.target.value)}
        >
          <option selected value={0} style={{ color: "lightgrey" }}>
            -- {intl.formatMessage({ id: "MODEL.ACCOUNT.GROUP" })} --
          </option>
          {accountGroups.map(status => (
            <option key={status.id} label={status.name} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.ACCOUNT.GROUP" />
        </small>
      </div>
    );
  };

  const renderCreationDateSelector = () => {
    return (
      <div className="col-lg-2 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          onChange={val => {
            !isNullOrEmpty(val)
              ? setSelectedCreationDate(val)
              : setSelectedCreationDate("");
          }}
          selected={selectedCreationDate}
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
          locale={fr}
        />
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.CREATION.DATE" />
        </small>
      </div>
    );
  };

  const onSearchFilteredContracts = () => {
    setPageNumber(1);
    let body = {
      tenantID: parseInt(process.env.REACT_APP_TENANT_ID),
      name: name,
      groupID: parseInt(groupId),
      pageSize: pageSize,
      pageNumber: 1,
      status: selectedStatus ? parseInt(selectedStatus) : null
    };

    if (selectedCreationDate) {
      body = {
        ...body,
        creationDate: selectedCreationDate
      };
    }
    axios
      .post(CUSTOMERS_URL, body)
      .then(res => {
        const customers = res.data.list;
        let filteredCustomers = customers.length
          ? customers.filter(customer => customer.parentID === null)
          : [];
        let worksites = customers.length
          ? customers.filter(customer => customer.parentID !== null)
          : [];
        for (let i = 0; i < filteredCustomers.length; i++) {
          for (let j = 0; j < worksites.length; j++) {
            if (filteredCustomers[i].id === worksites[j].parentID) {
              let childs = filteredCustomers[i].childs
                ? filteredCustomers[i].childs
                : [];
              childs.push(worksites[j]);
              filteredCustomers[i] = {
                ...filteredCustomers[i],
                childs
              };
            }
          }
        }
        setCustomers(filteredCustomers);
        //setWorksites(worksites);
        setTotalCount(res.data.totalcount);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <>
      {loading ? (
        <span className="colmx-auto spinner spinner-primary"></span>
      ) : (
        <div>
          <CompanyCreateModal
            createCompany={createCompany}
            onHide={handleClose}
            getData={getData}
            show={show}
          />
          <div className="row mb-5 mx-15">
            {renderName()}
            {renderStatusSelector()}
            {renderCreationDateSelector()}
            {renderGroupSelector()}
            <div className="col-lg-2">
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
          <div>
            <BootstrapTable
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              remote
              keyField="id"
              data={!customers.length ? [] : customers}
              columns={columns}
              expandRow={expandRow}
            >
              <PleaseWaitMessage entities={customers.customers} />
              <NoRecordsFoundMessage entities={customers.customers} />
            </BootstrapTable>
          </div>
          <div style={{ marginTop: 30 }}>
            <RemotePagination
              data={customers}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CustomersTable;

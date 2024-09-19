/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";

import { useUIContext } from "./RootUIContext";
import ActionsColumnFormatter from "../formatters/ActionsColumnFormatter";
import _ from "lodash";
import Select from "react-select";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { searchTemplates } from "../../../../../business/actions/client/missionsActions";

import { getJobTitles } from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

const tenantID = +process.env.REACT_APP_TENANT_ID;

const baseDate = new Date();
baseDate.setMonth(baseDate.getMonth() - 1);
// eslint-disable-next-line no-extend-native
Array.constructor.prototype.flexFilter = function(info) {
  var matchesFilter,
    matches = [],
    count;

  matchesFilter = function(item) {
    count = 0;
    for (var n = 0; n < info.length; n++) {
      if (info[n]["Values"].indexOf(item[info[n]["Field"]]) > -1) {
        count++;
      }
    }
    return count === info.length;
  };

  for (var i = 0; i < this.length; i++) {
    if (matchesFilter(this[i])) {
      matches.push(this[i]);
    }
  }
  return matches;
};

function RootTable({ refresh }) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const dispatch = useDispatch();
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedCity, setSetelectedCity] = useState("");
  const [titleList, setTitleList] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);

  const clearFilter = () => {
    setSelectedTitles(null);
    setTitleList(null);
    setSetelectedCity("");
  };

  let {
    rootlist,
    loading,
    jobTitles,
    totalCount,
    user,
    companyID
  } = useSelector(
    state => ({
      rootlist: state.missionsReducerData.templates.list
        ? state.missionsReducerData.templates.list
        : [],
      totalCount: state.missionsReducerData.templates.totalcount,
      loading: state.missionsReducerData.loading,
      jobTitles: state.lists.jobTitles,
      user: state.contacts.user,
      companyID: state.auth.user.accountID
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    !loading &&
      dispatch(
        searchTemplates.request({
          tenantID,
          missionJobTitles: reduceData(selectedTitles),
          accountID: companyID,
          userID:
            user && user.isAdmin && user.displayChoice === 0 ? 0 : user.userID,
          city: null,
          pageSize: 5,
          pageNumber: pageNumber
        })
      );
  }, [rootlist]);

  useEffect(() => {
    if (refresh > 0) {
      clearFilter();
      dispatch(
        searchTemplates.request({
          tenantID,
          accountID: companyID,
          userID:
            user && user.isAdmin && user.displayChoice === 0 ? 0 : user.userID,
          missionJobTitles: null,
          city: null,
          pageSize: pageSize,
          pageNumber: pageNumber
        })
      );
    }
  }, [refresh, rootlist]);

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
          Aucun modèle ne correspond à votre recherche !
        </div>
      </div>
    </div>
  );

  const UIContext = useUIContext();
  const UIProps = useMemo(() => {
    return {
      ids: UIContext.ids,
      setIds: UIContext.setIds,
      queryParams: UIContext.queryParams,
      setQueryParams: UIContext.setQueryParams,
      openDeleteDialog: UIContext.openDeleteDialog,
      openEditDialog: UIContext.openEditDialog
    };
  }, [UIContext]);

  let columns = [
    {
      dataField: "vacancyTitle",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" })
    },
    {
      dataField: "vacancyBusinessAddressCity",
      text: intl.formatMessage({ id: "MODEL.VACANCY.LOCATION" })
    },
    {
      dataField: "vacancyContractualProposedHourlySalary",
      text: intl.formatMessage({ id: "MODEL.VACANCY.HOURLY_RATE" })
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
        openEditDialog: UIProps.openEditDialog,
        openDeleteDialog: UIProps.openDeleteDialog
      }
    }
  ];

  useEffect(() => {
    if (_.isEmpty(titleList)) {
      missionTitleFormatter(jobTitles);
    }
  }, [rootlist, jobTitles]);

  useEffect(() => {
    isNullOrEmpty(jobTitles) && dispatch(getJobTitles.request());
  }, [dispatch, jobTitles]);

  const renderTitleFilter = () => {
    return (
      <div className="col-lg-3">
        <Select
          name="invoiceTypeID"
          isMulti
          value={selectedTitles}
          onChange={e => {
            filterTitle(e);
            handleChangeTitle(e);
          }}
          options={titleList}
        ></Select>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.JOBTITLE" />
        </small>
      </div>
    );
  };

  const filterTitle = value => {
    dispatch(
      searchTemplates.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(value) ? reduceData(value) : null,
        accountID: companyID,
        userID:
          user && user.isAdmin && user.displayChoice === 0 ? 0 : user.userID,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: pageSize,
        pageNumber: 1
      })
    );
  };

  const onChangeCity = e => {
    dispatch(
      searchTemplates.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        accountID: companyID,
        userID:
          user && user.isAdmin && user.displayChoice === 0 ? 0 : user.userID,
        city: e,
        pageSize: pageSize,
        pageNumber: 1
      })
    );
  };

  const handleChangeTitle = e => {
    setSelectedTitles(e);
  };

  const renderCityFilter = () => {
    return (
      <div className="col-lg-2">
        <input
          name="city"
          className="form-control"
          type="text"
          value={selectedCity}
          onChange={e => {
            setSetelectedCity(e.target.value);
            onChangeCity(e.target.value);
          }}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.LOCATION" />
        </small>
      </div>
    );
  };

  const createOption = (label, value) => ({
    label,
    value
  });

  let missionTitleFormatter = value => {
    let missionTitles = [];
    !isNullOrEmpty(value) &&
      value.map(arr => {
        return missionTitles.push(createOption(arr.name, arr.id));
      });
    return setTitleList(missionTitles);
  };

  const reduceData = data => {
    let result = [];
    !isNullOrEmpty(data) &&
      data.map(value => {
        result.push(value.value);
      });
    return result;
  };

  const handleChangePage = (size, page) => {
    dispatch(
      searchTemplates.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        accountID: companyID,
        userID:
          user && user.isAdmin && user.displayChoice === 0 ? 0 : user.userID,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: size,
        pageNumber: page
      })
    );
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
          sizePerPageList: [
            {
              text: "5",
              value: 5
            },
            {
              text: "10",
              value: 10
            },
            {
              text: "25",
              value: 25
            },
            {
              text: "Toutes",
              value: rootlist && rootlist.length
            }
          ],
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
            <BootstrapTable
              remote
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              keyField="id"
              data={rootlist ? rootlist : []}
              columns={columns}
              onTableChange={onTableChange}
              {...paginationTableProps}
              noDataIndication={() => <NoDataIndication />}
            />
            <div className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-row align-items-center">
                <SizePerPageDropdownStandalone {...paginationProps} />
                <p className="ml-5" style={{ margin: 0 }}>
                  <FormattedMessage
                    id="MESSAGE.TEMPLATES.TOTALCOUNT"
                    values={{ totalCount: totalCount }}
                  />
                </p>
              </div>
              <PaginationListStandalone {...paginationProps} />
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

  return (
    <>
      <div className="row mb-5">
        {renderTitleFilter()}
        {renderCityFilter()}
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <span className="colmx-auto spinner spinner-primary"></span>
        </div>
      ) : (
        <div className="mx-auto">
          <RemotePagination
            data={rootlist}
            page={pageNumber}
            sizePerPage={pageSize}
            totalSize={totalCount}
            onTableChange={handleTableChange}
          />
        </div>
      )}
    </>
  );
}

export default RootTable;

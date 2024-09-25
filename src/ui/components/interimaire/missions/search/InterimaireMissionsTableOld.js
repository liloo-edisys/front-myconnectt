/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";

import { useInterimaireMissionsUIContext as useMissionsUIContext } from "./InterimaireMissionsUIContext";
import ActionsColumnFormatter from "../../column-formatters/missionsActionsColumnFormatter.jsx";
import DateColumnFormatter from "../../column-formatters/missionsDateColumnFormatter.jsx";
import SalaryColumnFormatter from "../../column-formatters/missionsSalaryColumnFormatter.jsx";
import _ from "lodash";
import Select from "react-select";
import DatePicker from "react-datepicker";
import fr from "date-fns/locale/fr";
import moment from "moment";
import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { searchMission } from "../../../../../business/actions/client/missionsActions";
import { resetMissionIndicator } from "actions/client/missionsActions";

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

function InterimaireMissionsTable({ refresh }) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const dispatch = useDispatch();
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedStartDate, setSetelectedStartDate] = useState(null);
  const [selectedEndDate, setSetelectedEndDate] = useState(null);
  const [selectedSalary, setSetelectedSalary] = useState("");
  const [selectedCity, setSetelectedCity] = useState("");
  const [titleList, setTitleList] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);

  const clearFilter = () => {
    setSetelectedStartDate(null);
    setSetelectedEndDate(null);
    setSelectedTitles(null);
    setTitleList(null);
    setSetelectedSalary("");
    setSetelectedCity("");
  };

  let { missions, loadingMission, jobTitles, totalCount } = useSelector(
    state => ({
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      jobTitles: state.lists.jobTitles
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(resetMissionIndicator.request());
    localStorage.setItem("pageNumber", 1);
    localStorage.setItem("pageSize", 5);
    dispatch(
      searchMission.request({
        tenantID,
        missionJobTitles: reduceData(selectedTitles),
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: 0,
        city: null,
        pageSize: 5,
        pageNumber: pageNumber,
        loadMissionApplications: false
      })
    );
  }, [missions]);

  useEffect(() => {
    if (refresh > 0) {
      clearFilter();
      dispatch(
        searchMission.request({
          tenantID,
          missionJobTitles: null,
          startDate: null,
          endDate: null,
          contactNames: null,
          isMatchingOnly: false,
          isApplicationsOnly: false,
          hourlySalary: 0,
          city: null,
          pageSize: pageSize,
          pageNumber: pageNumber,
          loadMissionApplications: false,
          status: null
        })
      );
    }
  }, [refresh, missions]);

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
          <FormattedMessage id="MESSAGE.NO.VACANCY" />
        </div>
      </div>
    </div>
  );

  const missionsUIContext = useMissionsUIContext();
  const missionsUIProps = useMemo(() => {
    return {
      ids: missionsUIContext.ids,
      setIds: missionsUIContext.setIds,
      queryParams: missionsUIContext.queryParams,
      setQueryParams: missionsUIContext.setQueryParams,
      openDisplayDialog: missionsUIContext.openDisplayDialog,
      openApproveDialog: missionsUIContext.openApproveDialog,
      openDeclineMatchingDialog: missionsUIContext.openDeclineMatchingDialog
    };
  }, [missionsUIContext]);

  let columns = [
    {
      dataField: "vacancyTitle",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" }),
      sort: true
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeStartDate",
      text: intl.formatMessage({ id: "TEXT.STARTDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeEndDate",
      text: intl.formatMessage({ id: "TEXT.ENDDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "missionHourlyGrossSalary",
      text: intl.formatMessage({ id: "MODEL.VACANCY.HOURLY_RATE" }),
      sort: true,
      formatter: SalaryColumnFormatter
    },
    {
      dataField: "vacancyBusinessAddressCity",
      text: intl.formatMessage({ id: "TEXT.LOCATION" }),
      sort: true
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
        openDisplayDialog: missionsUIProps.openDisplayDialog,
        openApproveDialog: missionsUIProps.openApproveDialog,
        openDeclineMatchingDialog: missionsUIProps.openDeclineMatchingDialog
      }
    }
  ];

  useEffect(() => {
    if (_.isEmpty(titleList)) {
      missionTitleFormatter(jobTitles);
    }
  }, [missions, jobTitles]);

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
        <small className="form-text text-muted">Intitulé du poste</small>
      </div>
    );
  };

  const filterTitle = value => {
    dispatch(
      searchMission.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(value) ? reduceData(value) : null,
        startDate: !isNullOrEmpty(selectedStartDate)
          ? moment(selectedStartDate).format("YYYY-MM-DD")
          : null,
        endDate: !isNullOrEmpty(selectedEndDate)
          ? moment(selectedEndDate).format("YYYY-MM-DD")
          : null,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: !isNullOrEmpty(selectedSalary)
          ? parseFloat(selectedSalary)
          : 0,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: pageSize,
        pageNumber: 1,
        loadMissionApplications: false
      })
    );
  };

  const onChangeStartDate = e => {
    dispatch(
      searchMission.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        startDate: moment(e).format("YYYY-MM-DD"),
        endDate: !isNullOrEmpty(selectedEndDate)
          ? moment(selectedEndDate).format("YYYY-MM-DD")
          : null,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: !isNullOrEmpty(selectedSalary)
          ? parseFloat(selectedSalary)
          : 0,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: pageSize,
        pageNumber: 1,
        loadMissionApplications: false
      })
    );
  };

  const onChangeEndDate = e => {
    dispatch(
      searchMission.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        startDate: !isNullOrEmpty(selectedStartDate)
          ? moment(selectedStartDate).format("YYYY-MM-DD")
          : null,
        endDate: !isNullOrEmpty(e) ? moment(e).format("YYYY-MM-DD") : null,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: !isNullOrEmpty(selectedSalary)
          ? parseFloat(selectedSalary)
          : 0,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: pageSize,
        pageNumber: 1,
        loadMissionApplications: false
      })
    );
  };

  const onChangeSalary = e => {
    dispatch(
      searchMission.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        startDate: !isNullOrEmpty(selectedStartDate)
          ? moment(selectedStartDate).format("YYYY-MM-DD")
          : null,
        endDate: !isNullOrEmpty(selectedEndDate)
          ? moment(selectedEndDate).format("YYYY-MM-DD")
          : null,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: !isNullOrEmpty(e) ? parseFloat(e) : 0,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: pageSize,
        pageNumber: 1,
        loadMissionApplications: false
      })
    );
  };

  const onChangeCity = e => {
    dispatch(
      searchMission.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        startDate: !isNullOrEmpty(selectedStartDate)
          ? moment(selectedStartDate).format("YYYY-MM-DD")
          : null,
        endDate: !isNullOrEmpty(selectedEndDate)
          ? moment(selectedEndDate).format("YYYY-MM-DD")
          : null,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: !isNullOrEmpty(selectedSalary)
          ? parseFloat(selectedSalary)
          : 0,
        city: e,
        pageSize: pageSize,
        pageNumber: 1,
        loadMissionApplications: false
      })
    );
  };

  const renderStartDateFilter = () => {
    return (
      <div className="col-lg-1 width-100">
        <DatePicker
          className={`col-lg-12  form-control`}
          style={{ width: "100%" }}
          onChange={val => {
            !isNullOrEmpty(val)
              ? setSetelectedStartDate(val)
              : setSetelectedStartDate(null);
            onChangeStartDate(val);
          }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
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
      <div className="col-lg-1 width-100">
        <DatePicker
          className={`col-lg-12 form-control`}
          style={{ width: "100%" }}
          onChange={val => {
            !isNullOrEmpty(val)
              ? setSetelectedEndDate(val)
              : setSetelectedEndDate(null);
            onChangeEndDate(val);
          }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          selected={selectedEndDate}
          locale={fr}
          showMonthDropdown
          showYearDropdown
          minDate={selectedStartDate}
          yearItemNumber={9}
        />
        <small className="form-text text-muted">
          <FormattedMessage id="TEXT.ENDDATE" />
        </small>
      </div>
    );
  };

  const handleChangeTitle = e => {
    setSelectedTitles(e);
  };

  const renderSalaryFilter = () => {
    return (
      <div className="col-lg-1">
        <input
          name="hourlySalary"
          className="form-control"
          type="text"
          value={selectedSalary}
          onChange={e => {
            let val = e.target.value;
            if (!isNaN(val)) {
              setSetelectedSalary(e.target.value);
              onChangeSalary(e.target.value);
            }
          }}
        ></input>
        <small className="form-text text-muted">
          <FormattedMessage id="MODEL.VACANCY.HOURLY_RATE" />
        </small>
      </div>
    );
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
      searchMission.request({
        tenantID,
        missionJobTitles: !isNullOrEmpty(selectedTitles)
          ? reduceData(selectedTitles)
          : null,
        startDate: !isNullOrEmpty(selectedStartDate)
          ? moment(selectedStartDate).format("YYYY-MM-DD")
          : null,
        endDate: !isNullOrEmpty(selectedEndDate)
          ? moment(selectedEndDate).format("YYYY-MM-DD")
          : null,
        isMatchingOnly: false,
        isApplicationsOnly: false,
        hourlySalary: !isNullOrEmpty(selectedSalary)
          ? parseFloat(selectedSalary)
          : 0,
        city: !isNullOrEmpty(selectedCity) ? selectedCity : null,
        pageSize: size,
        pageNumber: page,
        loadMissionApplications: false
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
              value: missions && missions.length
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
              data={!isNullOrEmpty(missions) ? missions : []}
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
                    id="MESSAGE.VACANCIES.TOTALCOUNT"
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
    localStorage.setItem("pageNumber", page);
    localStorage.setItem("pageSize", sizePerPage);
  };

  return (
    <>
      <div className="row mb-5">
        {renderTitleFilter()}
        {renderStartDateFilter()}
        {renderEndDateFilter()}
        {renderSalaryFilter()}
        {renderCityFilter()}
      </div>
      {loadingMission ? (
        <div className="d-flex justify-content-center align-items-center">
          <span className="colmx-auto spinner spinner-primary"></span>
        </div>
      ) : (
        <div className="mx-auto">
          <RemotePagination
            data={missions}
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

export default InterimaireMissionsTable;

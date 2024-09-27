/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { FormattedMessage, useIntl } from "react-intl";

import { useHistory } from "react-router-dom";

import { useMissionsUIContext } from "./missionsUIContext.jsx";
import ActionsColumnFormatter from "../column-formatters/missionsActionsColumnFormatter.jsx";
import DateColumnFormatter from "../column-formatters/missionsDateColumnFormatter.jsx";
import OccupiedColumnFormatter from "../column-formatters/missionsOccupiedColumnFormatter.jsx";
import ApplicationsStatusColumnFormatter from "../column-formatters/applicationsStatusColumnFormatter.jsx";
import ApplicationsActionsColumnFormatter from "../column-formatters/applicationsActionsColumnFormatter.jsx";
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
import { searchMission } from "../../../../../business/actions/client/missionsActions.js";
import { resetMissionIndicator } from "actions/client/missionsActions";
import { getMission } from "api/client/missionsApi";

import { getJobTitles } from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty.js";
import { getCompanies } from "actions/client/companiesActions";
import MissionsStatusColumnFormatter from "../column-formatters/missionsStatusColumnFormatter.jsx";
import {
  deleteCurrentDuplicate,
  deleteCurrentTemplate
} from "../../../../../business/actions/client/missionsActions.js";
import Avatar from "react-avatar";
import {
  setSetelectedStartDate,
  setSetelectedEndDate,
  setSelectedAccount,
  setDefaultStatus,
  setPageSize,
  setPageNumber
} from "../../../../../business/actions/backoffice/missionsActions.js";

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

function MissionsTable({ refresh }) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const dispatch = useDispatch();
  let date = new Date(moment().subtract(1, "months"));
  /*const [selectedStartDate, setSetelectedStartDate] = useState(date);
  const [selectedEndDate, setSetelectedEndDate] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);*/
  const [expanded, setExpanded] = useState([]);

  const clearFilter = () => {
    setSetelectedStartDate(null, dispatch);
    setSelectedAccount(null, dispatch);
    setSetelectedEndDate(null, dispatch);
    setDefaultStatus(null, dispatch);
  };

  const status = [
    { value: 0, label: intl.formatMessage({ id: "STATUS.DRAFT" }) },
    { value: 1, label: intl.formatMessage({ id: "STATUS.NON.PROVIDED" }) },
    {
      value: 2,
      label: intl.formatMessage({ id: "STATUS.PARTIALLY.PROVIDED" })
    },
    { value: 3, label: intl.formatMessage({ id: "STATUS.PROVIDED" }) },
    {
      value: 4,
      label: intl.formatMessage({ id: "STATUS.PROPOSITION.CANCELED" })
    },
    {
      value: 5,
      label: intl.formatMessage({ id: "STATUS.VALIDATED.MYCONNECTT" })
    }
  ];
  let history = useHistory();

  let isEdit =
    history && history.location.pathname === "/missions" ? true : undefined;
  let {
    missions,
    user,
    loadingMission,
    jobTitles,
    totalCount,
    companyID,
    companies,
    selectedStartDate,
    selectedEndDate,
    selectedAccount,
    defaultStatus,
    pageSize,
    pageNumber
  } = useSelector(
    state => ({
      user: state.contacts.user,
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      jobTitles: state.lists.jobTitles,
      companyID: state.auth.user.accountID,
      mission: state.missionsReducerData.mission,
      companies: state.companies.companies,
      selectedStartDate: state.missionsBackOfficeReducer.selectedStartDate,
      selectedEndDate: state.missionsBackOfficeReducer.selectedEndDate,
      selectedAccount: state.missionsBackOfficeReducer.selectedAccount,
      defaultStatus: state.missionsBackOfficeReducer.defaultStatus,
      pageSize: state.missionsBackOfficeReducer.pageSize,
      pageNumber: state.missionsBackOfficeReducer.pageNumber
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);
  let filteredCompanies =
    companies != null
      ? companies.length
        ? companies
            .filter(company => company.parentID === null)
            .map(function(c) {
              return {
                value: c.id,
                label: c.name
              };
            })
        : []
      : [];

  useMountEffect(() => {
    localStorage.setItem("pageNumber", 1);
    localStorage.setItem("pageSize", 5);
    localStorage.setItem("accountID", companyID);
    if (companies.length === 0) {
      dispatch(getCompanies.request());
    }
    dispatch(deleteCurrentDuplicate.request());
    dispatch(deleteCurrentTemplate.request());
    dispatch(resetMissionIndicator.request());
    if (user && user.isAdmin && user.displayChoice === 0) {
      isNullOrEmpty(missions) &&
        !loadingMission &&
        dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
    } else {
      localStorage.setItem("userId", user.userID);

      isNullOrEmpty(missions) &&
        !loadingMission &&
        dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
    }
  }, [missions]);

  useEffect(() => {
    if (refresh > 0) {
      clearFilter();
      user.displayChoice === 0 && !loadingMission
        ? dispatch(
            searchMission.request({
              tenantID,
              startDate: !isNullOrEmpty(selectedStartDate)
                ? moment(selectedStartDate).format("YYYY-MM-DD")
                : null,
              endDate: !isNullOrEmpty(selectedEndDate)
                ? moment(selectedEndDate).format("YYYY-MM-DD")
                : null,
              accountID: selectedAccount ? selectedAccount.value : 0,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: 1,
              loadMissionApplications: true,
              status: !isNullOrEmpty(defaultStatus)
                ? reduceData(defaultStatus)
                : null
            })
          )
        : dispatch(
            searchMission.request({
              tenantID,
              startDate: !isNullOrEmpty(selectedStartDate)
                ? moment(selectedStartDate).format("YYYY-MM-DD")
                : null,
              endDate: !isNullOrEmpty(selectedEndDate)
                ? moment(selectedEndDate).format("YYYY-MM-DD")
                : null,
              accountID: selectedAccount ? selectedAccount.value : 0,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: 1,
              loadMissionApplications: true,
              status: !isNullOrEmpty(defaultStatus)
                ? reduceData(defaultStatus)
                : null
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
        <div className="alert-text">Aucune offre disponible !</div>
      </div>
    </div>
  );
  const NoApplicantsIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-info fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">
          <FormattedMessage id="MESSAGE.NO.APPLICANT.VACANCY" />
        </div>
      </div>
    </div>
  );

  const expandRow = {
    renderer: (row, rowKey) => (
      <div className="subtable">
        <BootstrapTable
          bordered={false}
          classes={`table table-head-custom table-vertical-center overflow-hidden `}
          bootstrap4
          remote
          wrapperClasses="table-responsive test"
          keyField="applicationID"
          data={row && row.missionApplications ? row.missionApplications : []}
          columns={applicationColumns}
          noDataIndication={() => <NoApplicantsIndication />}
        ></BootstrapTable>
      </div>
    ),
    expandHeaderColumnRenderer: () => {
      return null;
    },
    headerClasses: "hidden",
    className: (isExpanded, row, rowIndex) => {
      return "fulfilled-row";
    },
    onExpand: (row, isExpand, rowIndex, e) => {
      if (isExpand) {
        let exp = [...expanded, row.id];
        setExpanded(exp);
      } else {
        let exp = expanded.filter(x => x !== row.id);
        setExpanded(exp);
      }

      getMission(row.id)
        .then(res => res.data)
        .then(data =>
          localStorage.setItem("candidateMission", JSON.stringify(data))
        )
        .then(localStorage.setItem("candidate", JSON.stringify(row)));
    },
    showExpandColumn: true,
    expanded: expanded,
    expandColumnRenderer: ({ expanded, rowKey, expandable }) => {
      let mission =
        missions && missions.filter(mission => mission.id === rowKey)[0];
      return (
        <div>
          <span
            onClick={() => filterExpanded()}
            data-tip={
              mission && mission.userName
                ? mission.userName
                : intl.formatMessage({ id: "CREATED.FOR.YOU.MYCONNECTT" })
            }
            className="symbol symbol-35 symbol-light-success mr-2"
          >
            {mission && (
              <Avatar
                className="symbol-label"
                color="#C9F7F5"
                size="35"
                fgColor="#1BC5BD"
                maxInitials={2}
                name={mission && mission.userName && mission.userName}
              />
            )}
          </span>

          {expanded ? (
            <i className="fas fa-angle-double-down text-primary"></i>
          ) : (
            <i className="fas fa-angle-double-right text-primary"></i>
          )}
        </div>
      );
    }
  };

  const missionsUIContext = useMissionsUIContext();
  const missionsUIProps = useMemo(() => {
    return {
      openDeleteDialog: missionsUIContext.openDeleteDialog,
      openDisplayDialog: missionsUIContext.openDisplayDialog
    };
  }, [missionsUIContext]);

  let columns = [
    {
      dataField: "entrepriseName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" })
    },
    {
      dataField: "vacancyNumberOfApplications",
      formatter: OccupiedColumnFormatter,
      text: intl.formatMessage({ id: "COLUMN.JOBS.NBR" }),
      attrs: (cell, row) => ({ id: `rowid_${row.id}` })
    },
    {
      dataField: "vacancyTitle",
      text: intl.formatMessage({ id: "MODEL.JOBTITLE" })
    },
    {
      dataField: "vacancyBusinessAddressPostalCode",
      formatter: (value, row) =>
        (row.vacancyBusinessAddressCity != null
          ? row.vacancyBusinessAddressCity
          : "") + (value != null ? " (" + value.substring(0, 2) + ")" : ""),
      text: intl.formatMessage({ id: "MODEL.LOCATION" })
    },
    {
      dataField: "status",
      text: intl.formatMessage({ id: "TEXT.STATUS" }),
      sort: true,
      sortFunc: (a, b, order, dataField, rowA, rowB) => {
        return a - b;
      },

      formatter: MissionsStatusColumnFormatter
    },

    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeStartDate",
      text: intl.formatMessage({ id: "COLUMN.START.DATE" }),
      formatter: DateColumnFormatter
    },
    {
      dataField: "vacancyContractualVacancyEmploymentContractTypeEndDate",
      text: intl.formatMessage({ id: "COLUMN.END.DATE" }),
      formatter: DateColumnFormatter
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      formatter: ActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px",
        paddinBottom: "10px"
      },
      formatExtraData: {
        openDeleteDialog: missionsUIProps.openDeleteDialog,
        openDisplayDialog: missionsUIProps.openDisplayDialog
      }
    }
  ];

  let applicationColumns = [
    {
      headerAttrs: {
        hidden: true
      },
      dataField: "name",
      sort: true,
      formatter: (value, row) => (
        <span>
          {!isNullOrEmpty(row) && !isNullOrEmpty(row.applicantPicture) ? (
            <Avatar
              size="35"
              className="symbol-label mr-2"
              color="#3699FF"
              src={
                "data:image/" +
                row.applicantPicture.filename.split(".")[1] +
                ";base64," +
                row.applicantPicture.base64
              }
            />
          ) : (
            <Avatar
              className="symbol-label mr-2"
              color="#3699FF"
              size="35"
              maxInitials={2}
              name={
                row && row.firstname && row.firstname.concat(" ", row.lastname)
              }
            />
          )}
          {value.split(" ")[0]}
        </span>
      )
    },
    {
      dataField: "applicationID",
      formatter: ApplicationsStatusColumnFormatter
    },
    {
      headerAttrs: {
        hidden: true
      },
      dataField: "action",
      formatter: ApplicationsActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatExtraData: {
        openDeleteDialog: missionsUIProps.openDeleteDialog,
        openDisplayDialog: missionsUIProps.openDisplayDialog
      }
    }
  ];

  const filterExpanded = () => {
    let filtered = [];
    let rows = !isNullOrEmpty(missions)
      ? missions.filter(
          mission =>
            mission.status === 1 && !isNullOrEmpty(mission.missionApplications)
        )
      : [];
    !isNullOrEmpty(rows) && rows.map(row => filtered.push(row.id));
    return;
  };

  useEffect(() => {
    !isNullOrEmpty(missions) && filterExpanded();
  }, [missions]);

  useEffect(() => {
    isNullOrEmpty(jobTitles) && dispatch(getJobTitles.request());
  }, [dispatch, jobTitles]);

  useEffect(() => {
    if (isEdit === true) {
      setDefaultStatus([], dispatch);
      user.displayChoice === 0 && !loadingMission
        ? dispatch(
            searchMission.request({
              tenantID,
              startDate: !isNullOrEmpty(selectedStartDate)
                ? moment(selectedStartDate).format("YYYY-MM-DD")
                : null,
              endDate: !isNullOrEmpty(selectedEndDate)
                ? moment(selectedEndDate).format("YYYY-MM-DD")
                : null,
              accountID: selectedAccount ? selectedAccount.value : 0,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: 1,
              loadMissionApplications: true,
              status: !isNullOrEmpty(defaultStatus)
                ? reduceData(defaultStatus)
                : null
            })
          )
        : dispatch(
            searchMission.request({
              tenantID,
              startDate: !isNullOrEmpty(selectedStartDate)
                ? moment(selectedStartDate).format("YYYY-MM-DD")
                : null,
              endDate: !isNullOrEmpty(selectedEndDate)
                ? moment(selectedEndDate).format("YYYY-MM-DD")
                : null,
              accountID: selectedAccount ? selectedAccount.value : 0,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: 1,
              loadMissionApplications: true,
              status: !isNullOrEmpty(defaultStatus)
                ? reduceData(defaultStatus)
                : null
            })
          );
    } else {
      setDefaultStatus(null, dispatch);
      user.displayChoice === 0 && !loadingMission
        ? dispatch(
            searchMission.request({
              tenantID,
              startDate: !isNullOrEmpty(selectedStartDate)
                ? moment(selectedStartDate).format("YYYY-MM-DD")
                : null,
              endDate: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: pageNumber,
              loadMissionApplications: true,
              status: null
            })
          )
        : dispatch(
            searchMission.request({
              tenantID,
              startDate: !isNullOrEmpty(selectedStartDate)
                ? moment(selectedStartDate).format("YYYY-MM-DD")
                : null,
              endDate: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: pageNumber,
              loadMissionApplications: true,
              status: null
            })
          );
    }
  }, [isEdit]);

  const filterTitle = value => {
    if (user.displayChoice === 0) {
      dispatch(
        searchMission.request({
          tenantID,
          startDate: !isNullOrEmpty(selectedStartDate)
            ? moment(selectedStartDate).format("YYYY-MM-DD")
            : null,
          endDate: !isNullOrEmpty(selectedEndDate)
            ? moment(selectedEndDate).format("YYYY-MM-DD")
            : null,
          isMatchingOnly: false,
          isApplicationsOnly: false,
          pageSize: pageSize,
          pageNumber: 1,
          accountID: selectedAccount ? selectedAccount.value : 0,
          loadMissionApplications: true,
          status: !isNullOrEmpty(defaultStatus)
            ? reduceData(defaultStatus)
            : null
        })
      );
    } else {
      dispatch(
        searchMission.request({
          tenantID,
          startDate: !isNullOrEmpty(selectedStartDate)
            ? moment(selectedStartDate).format("YYYY-MM-DD")
            : null,
          endDate: !isNullOrEmpty(selectedEndDate)
            ? moment(selectedEndDate).format("YYYY-MM-DD")
            : null,
          isMatchingOnly: false,
          isApplicationsOnly: false,
          pageSize: pageSize,
          accountID: selectedAccount ? selectedAccount.value : 0,
          pageNumber: 1,
          loadMissionApplications: true,
          status: !isNullOrEmpty(defaultStatus)
            ? reduceData(defaultStatus)
            : null
        })
      );
    }
  };

  const filterAskers = value => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        )
      : dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
  };

  const filterStatus = value => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(value) ? reduceData(value) : null
          })
        )
      : dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(value) ? reduceData(value) : null
          })
        );
  };

  const filterAccount = value => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: value,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        )
      : dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: value,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
  };

  const onChangeStartDate = e => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            startDate: moment(e).format("YYYY-MM-DD"),
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        )
      : dispatch(
          searchMission.request({
            tenantID,
            startDate: moment(e).format("YYYY-MM-DD"),
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
  };

  const onChangeEndDate = e => {
    user.displayChoice === 0 && !loadingMission
      ? dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: moment(e).format("YYYY-MM-DD"),
            isMatchingOnly: false,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        )
      : dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: moment(e).format("YYYY-MM-DD"),
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
  };

  const renderStartDateFilter = () => {
    return (
      <div className="col-lg-1 width-100">
        <DatePicker
          className={`col-lg-12   form-control`}
          style={{ width: "100%" }}
          onChange={val => {
            setSetelectedStartDate(val, dispatch);
            onChangeStartDate(val);
          }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          selected={selectedStartDate}
          locale={fr}
          showMonthDropdown
          showYearDropdown
          yearItemNumber={9}
        />
        <small className="form-text text-muted">Date de début</small>
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
            setSetelectedEndDate(val, dispatch);
            onChangeEndDate(val);
          }}
          dateFormat="dd/MM/yyyy"
          popperPlacement="top-start"
          selected={selectedEndDate}
          locale={fr}
          showMonthDropdown
          showYearDropdown
          minDate={selectedStartDate ? new Date(selectedStartDate) : null}
          yearItemNumber={9}
        />
        <small className="form-text text-muted">Date de fin</small>
      </div>
    );
  };

  const handleChange = e => {
    setDefaultStatus(e, dispatch);
  };

  const renderStatusFilter = () => {
    return (
      <div className="col-lg-3">
        <Select
          name="invoiceTypeID"
          isMulti
          value={defaultStatus}
          onChange={e => {
            filterStatus(e);
            handleChange(e);
          }}
          options={status}
        ></Select>
        <small className="form-text text-muted">
          <FormattedMessage id="COLUMN.STATUS" />
        </small>
      </div>
    );
  };

  const renderEntrepriseFilter = () => {
    return (
      <div className="col-lg-3">
        <Select
          name="accountID"
          options={filteredCompanies}
          value={selectedAccount}
          placeholder="--Entreprise--"
          onChange={e => {
            setSelectedAccount(e, dispatch);
            filterAccount(e.value);
          }}
        ></Select>
        <small className="form-text text-muted">Entreprise</small>
      </div>
    );
  };

  const reduceData = data => {
    let result = [];
    !isNullOrEmpty(data) &&
      data.map(value => {
        result.push(value.value);
      });
    return result;
  };

  const reduceString = data => {
    let result = [];
    !isNullOrEmpty(data) &&
      data.map(value => {
        result.push(value.label);
      });
    return result;
  };

  const handleChangePage = (size, page) => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: size,
            pageNumber: page,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        )
      : dispatch(
          searchMission.request({
            tenantID,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            accountID: selectedAccount ? selectedAccount.value : 0,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: size,
            pageNumber: page,
            loadMissionApplications: true,
            status: !isNullOrEmpty(defaultStatus)
              ? reduceData(defaultStatus)
              : null
          })
        );
  };

  const rowStyle = (row, rowIndex) => {
    const style = {};
    if (
      expanded.find(id => row.id === id) &&
      row.status !== 3 &&
      row.status !== 5 &&
      rowIndex % 2 !== 0
    ) {
      style.backgroundColor = "rgba(225, 240, 255, 0.2)";
    } else if (
      expanded.find(id => row.id === id) &&
      row.status !== 3 &&
      row.status !== 5 &&
      rowIndex % 2 === 0
    ) {
      style.backgroundColor = "rgba(137, 196, 244, 0.2)";
    } else if (row.status === 3 || row.status === 5) {
      style.backgroundColor = "rgba(137, 80, 252, 0.1)";
    } else {
      style.backgroundColor = "white";
    }
    return style;
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
              value: missions && totalCount
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
          <div className="table-wrapper">
            <BootstrapTable
              remote
              rowStyle={rowStyle}
              rowClasses={["dashed"]}
              wrapperClasses="table-responsive"
              bordered={false}
              classes="table table-head-custom table-vertical-center overflow-hidden"
              bootstrap4
              keyField="id"
              data={!isNullOrEmpty(missions) ? missions : []}
              columns={columns}
              expandRow={expandRow}
              onTableChange={onTableChange}
              {...paginationTableProps}
              noDataIndication={() => <NoDataIndication />}
            />
            <div className="d-flex flex-row align-items-left justify-content-between">
              <div className="d-flex flex-row align-items-center">
                <SizePerPageDropdownStandalone {...paginationProps} />
              </div>
              <div className="d-flex flex-row align-items-center">
                <p className="mr-5">
                  <FormattedMessage
                    id="MESSAGE.VACANCIES.TOTALCOUNT"
                    values={{ totalCount: totalCount }}
                  />
                </p>
                <PaginationListStandalone {...paginationProps} />
              </div>
            </div>
          </div>
        )}
      </PaginationProvider>
    </div>
  );

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page, dispatch);
    setPageSize(sizePerPage, dispatch);
    handleChangePage(sizePerPage, page);
    localStorage.setItem("pageNumber", page);
    localStorage.setItem("pageSize", sizePerPage);
  };

  return (
    <div
      className={`${
        loadingMission
          ? "d-flex justify-content-center align-items-center"
          : null
      }`}
    >
      {loadingMission ? (
        <span className="colmx-auto spinner spinner-primary"></span>
      ) : (
        <>
          <div className="row mb-5">
            {renderEntrepriseFilter()}
            {renderStatusFilter()}
            {renderStartDateFilter()}
            {renderEndDateFilter()}
          </div>
          <div className="mx-auto">
            <RemotePagination
              data={missions}
              page={pageNumber}
              sizePerPage={pageSize}
              totalSize={totalCount}
              onTableChange={handleTableChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MissionsTable;

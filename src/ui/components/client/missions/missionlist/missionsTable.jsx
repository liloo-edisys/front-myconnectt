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
import MissionsStatusColumnFormatter from "../column-formatters/missionsStatusColumnFormatter.jsx";
import {
  deleteCurrentDuplicate,
  deleteCurrentTemplate
} from "../../../../../business/actions/client/missionsActions.js";
import Avatar from "react-avatar";

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
  const [selectedStartDate, setSetelectedStartDate] = useState(null);
  const [selectedEndDate, setSetelectedEndDate] = useState(null);
  const [selectedAskers, setSelectedAskers] = useState([]);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [titleList, setTitleList] = useState([]);
  const [askers, setAskers] = useState([]);
  const [defaultStatus, setDefaultStatus] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);
  const [expanded, setExpanded] = useState([]);

  const clearFilter = () => {
    setSetelectedStartDate(null);
    setSetelectedEndDate(null);
    setSelectedAskers(null);
    setSelectedTitles(null);
    setTitleList(null);
    setAskers(null);
    setDefaultStatus(null);
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
    history && history.location.pathname === "/missions/encours"
      ? true
      : undefined;

  let {
    missions,
    user,
    loadingMission,
    jobTitles,
    totalCount,
    companyID
  } = useSelector(
    state => ({
      user: state.contacts.user,
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      jobTitles: state.lists.jobTitles,
      companyID: state.auth.user.accountID,
      mission: state.missionsReducerData.mission
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    localStorage.setItem("pageNumber", 1);
    localStorage.setItem("pageSize", 5);
    localStorage.setItem("accountID", companyID);
    dispatch(getJobTitles.request());

    dispatch(deleteCurrentDuplicate.request());
    dispatch(deleteCurrentTemplate.request());
    dispatch(resetMissionIndicator.request());
    if (user && user.isAdmin && user.displayChoice === 0) {
      isNullOrEmpty(missions) &&
        !loadingMission &&
        dispatch(
          searchMission.request({
            tenantID,
            accountID: companyID,
            missionJobTitles: reduceData(selectedTitles),
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            contactName: selectedAskers,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: 5,
            pageNumber: pageNumber,
            loadMissionApplications: true
          })
        );
    } else {
      localStorage.setItem("userId", user.userID);

      isNullOrEmpty(missions) &&
        !loadingMission &&
        dispatch(
          searchMission.request({
            tenantID,
            accountID: companyID,
            userId: user.userID,
            missionJobTitles: reduceData(selectedTitles),
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            contactName: selectedAskers,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: 5,
            pageNumber: pageNumber,
            loadMissionApplications: true
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
              accountID: companyID,
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactNames: null,
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
              accountID: companyID,
              userID: user.userID,
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactNames: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: pageNumber,
              loadMissionApplications: true,
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
      if (row.status === 3 || row.status === 5) {
        return "fulfilled-row";
      } else if (rowIndex % 2 === 0) {
        return "odd-row";
      } else return "even-row";
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
      ids: missionsUIContext.ids,
      setIds: missionsUIContext.setIds,
      queryParams: missionsUIContext.queryParams,
      setQueryParams: missionsUIContext.setQueryParams,
      newWorksiteButtonClick: missionsUIContext.newWorksiteButtonClick,
      openEditCompanyDialog: missionsUIContext.openEditCompanyDialog,
      openDeleteDialog: missionsUIContext.openDeleteDialog,
      openDisplayDialog: missionsUIContext.openDisplayDialog,
      openEditWorksiteDialog: missionsUIContext.openEditWorksiteDialog,
      openMatchingDialog: missionsUIContext.openMatchingDialog,
      editMission: missionsUIContext.editMission,
      openResumeDialog: missionsUIContext.openResumeDialog,
      openDeclineDialog: missionsUIContext.openDeclineDialog,
      openValidateDialog: missionsUIContext.openValidateDialog,
      openMissionProfileDialog: missionsUIContext.openMissionProfileDialog,
      openDeleteApplicationDialog: missionsUIContext.openDeleteApplicationDialog
    };
  }, [missionsUIContext]);

  let columns = [
    {
      dataField: "vacancyNumberOfOccupiedJobs",
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
        openDisplayVacancyDialog: missionsUIProps.newWorksiteButtonClick,
        openEditVacancyDialog: missionsUIProps.openEditCompanyDialog,
        openDeleteDialog: missionsUIProps.openDeleteDialog,
        openDisplayDialog: missionsUIProps.openDisplayDialog,
        openMatchingDialog: missionsUIProps.openMatchingDialog,
        openDuplicateVacancyDialog: missionsUIProps.openEditWorksiteDialog,
        history: history,
        editMission: missionsUIProps.editMission
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
        openEditWorksiteDialog: missionsUIProps.openEditWorksiteDialog,
        openDeleteDialog: missionsUIProps.openDeleteDialog,
        openDisplayDialog: missionsUIProps.openDisplayDialog,
        openResumeDialog: missionsUIProps.openResumeDialog,
        openDeclineDialog: missionsUIProps.openDeclineDialog,
        openValidateDialog: missionsUIProps.openValidateDialog,
        openMissionProfileDialog: missionsUIProps.openMissionProfileDialog,
        openDeleteApplicationDialog: missionsUIProps.openDeleteApplicationDialog
      }
    }
  ];
  useEffect(() => {
    if (_.isEmpty(titleList)) {
      missionTitleFormatter(jobTitles);
    }
    if (_.isEmpty(askers)) {
      missionAskerFormatter();
    }
  }, [missions, jobTitles]);

  const filterExpanded = () => {
    let filtered = [];
    let rows = !isNullOrEmpty(missions)
      ? missions.filter(
          mission =>
            mission.status === 1 && !isNullOrEmpty(mission.missionApplications)
        )
      : [];
    !isNullOrEmpty(rows) && rows.map(row => filtered.push(row.id));
    setExpanded(filtered);
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
      setDefaultStatus([
        { value: 1, label: intl.formatMessage({ id: "STATUS.NON.PROVIDED" }) },
        {
          label: intl.formatMessage({ id: "STATUS.PARTIALLY.PROVIDED" }),
          value: 2
        }
      ]);
      user.displayChoice === 0 && !loadingMission
        ? dispatch(
            searchMission.request({
              tenantID,
              accountID: companyID,
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactNames: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: pageNumber,
              loadMissionApplications: true,
              status: [1, 2]
            })
          )
        : dispatch(
            searchMission.request({
              tenantID,
              accountID: companyID,
              userID: user.userID,
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactNames: null,
              isMatchingOnly: false,
              isApplicationsOnly: false,
              pageSize: pageSize,
              pageNumber: pageNumber,
              loadMissionApplications: true,
              status: [1, 2]
            })
          );
    } else {
      setDefaultStatus(null);
      user.displayChoice === 0 && !loadingMission
        ? dispatch(
            searchMission.request({
              tenantID,
              accountID: companyID,
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactNames: null,
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
              accountID: companyID,
              userID: user.userID,
              missionJobTitles: null,
              startDate: null,
              endDate: null,
              contactNames: null,
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
    if (user.displayChoice === 0) {
      dispatch(
        searchMission.request({
          tenantID,
          accountID: companyID,
          missionJobTitles: !isNullOrEmpty(value) ? reduceData(value) : null,
          startDate: !isNullOrEmpty(selectedStartDate)
            ? moment(selectedStartDate).format("YYYY-MM-DD")
            : null,
          endDate: !isNullOrEmpty(selectedEndDate)
            ? moment(selectedEndDate).format("YYYY-MM-DD")
            : null,
          contactNames: !isNullOrEmpty(selectedAskers)
            ? reduceString(selectedAskers)
            : null,
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
      dispatch(
        searchMission.request({
          tenantID,
          accountID: companyID,
          userID: user.userID,
          missionJobTitles: !isNullOrEmpty(value) ? reduceData(value) : null,
          startDate: !isNullOrEmpty(selectedStartDate)
            ? moment(selectedStartDate).format("YYYY-MM-DD")
            : null,
          endDate: !isNullOrEmpty(selectedEndDate)
            ? moment(selectedEndDate).format("YYYY-MM-DD")
            : null,
          contactNames: !isNullOrEmpty(selectedAskers)
            ? reduceString(selectedAskers)
            : null,
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
  };

  const filterAskers = value => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            accountID: companyID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(value) ? reduceString(value) : null,
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
            accountID: companyID,
            userID: user.userID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(value) ? reduceString(value) : null,
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
            accountID: companyID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
            accountID: companyID,
            userId: user.userID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
            isMatchingOnly: false,
            isApplicationsOnly: false,
            pageSize: pageSize,
            pageNumber: 1,
            loadMissionApplications: true,
            status: !isNullOrEmpty(value) ? reduceData(value) : null
          })
        );
  };

  const onChangeStartDate = e => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            accountID: companyID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: moment(e).format("YYYY-MM-DD"),
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
            accountID: companyID,
            userId: user.userID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: moment(e).format("YYYY-MM-DD"),
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
            accountID: companyID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: moment(e).format("YYYY-MM-DD"),
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
            accountID: companyID,
            userID: user.userID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: moment(e).format("YYYY-MM-DD"),
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
            setSetelectedStartDate(val);
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
            setSetelectedEndDate(val);
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
    setDefaultStatus(e);
  };

  const handleChangeTitle = e => {
    setSelectedTitles(e);
  };

  const handleChangeAskers = e => {
    setSelectedAskers(e);
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
        <small className="form-text text-muted">Status</small>
      </div>
    );
  };

  const renderAskerFilter = () => {
    return (
      <div className="col-lg-3">
        <Select
          name="askers"
          isMulti
          value={selectedAskers}
          onChange={e => {
            filterAskers(e);
            handleChangeAskers(e);
          }}
          options={askers}
        ></Select>
        <small className="form-text text-muted">Demandeurs</small>
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

  const reduceString = data => {
    let result = [];
    !isNullOrEmpty(data) &&
      data.map(value => {
        result.push(value.label);
      });
    return result;
  };

  let missionAskerFormatter = () => {
    let missionAskers = [];
    let askersArray = _.uniqBy(missions, function(e) {
      return e.userName;
    });
    askersArray.map(arr => {
      return missionAskers.push(createOption(arr.userName, arr.id));
    });
    return setAskers(missionAskers);
  };

  const handleChangePage = (size, page) => {
    user.displayChoice === 0
      ? dispatch(
          searchMission.request({
            tenantID,
            accountID: companyID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
            accountID: companyID,
            userID: user.userID,
            missionJobTitles: !isNullOrEmpty(selectedTitles)
              ? reduceData(selectedTitles)
              : null,
            startDate: !isNullOrEmpty(selectedStartDate)
              ? moment(selectedStartDate).format("YYYY-MM-DD")
              : null,
            endDate: !isNullOrEmpty(selectedEndDate)
              ? moment(selectedEndDate).format("YYYY-MM-DD")
              : null,
            contactNames: !isNullOrEmpty(selectedAskers)
              ? reduceString(selectedAskers)
              : null,
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
    setPageNumber(page);
    setPageSize(sizePerPage);
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
            {renderTitleFilter()}
            {renderStatusFilter()}
            {renderStartDateFilter()}
            {renderEndDateFilter()}
            {renderAskerFilter()}
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

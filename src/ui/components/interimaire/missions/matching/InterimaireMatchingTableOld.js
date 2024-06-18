/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { useIntl, FormattedMessage } from "react-intl";

import { useMissionsUIContext } from "./InterimaireMatchingUIContext";
import ActionsColumnFormatter from "../../column-formatters/MissionsActionsColumnFormatter";
import DateColumnFormatter from "../../column-formatters/MissionsDateColumnFormatter";
import MatchingColumnFormatter from "../../column-formatters/MissionsMatchingColumnFormatter";
import SalaryColumnFormatter from "../../column-formatters/MissionsSalaryColumnFormatter";
import CityColumnFormatter from "../../column-formatters/MissionsCityColumnFormatter";
import { resetMissionIndicator } from "actions/client/MissionsActions";

import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { searchMission } from "../../../../../business/actions/client/MissionsActions";

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
function InterimaireMatchingTable({ refresh }) {
  const intl = useIntl(); // intl extracted from useIntl hook
  const dispatch = useDispatch();

  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);

  let { missions, totalCount, loadingMission, userDetails } = useSelector(
    state => ({
      user: state.contacts.user,
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      userDetails: state.auth.user
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(resetMissionIndicator.request());

    dispatch(
      searchMission.request({
        tenantID,
        isMatchingOnly: true,
        isApplicationsOnly: false,
        pageSize: 5,
        pageNumber: pageNumber,
        loadMissionApplications: false,
        applicantID: userDetails.applicantID
      })
    );
  }, [missions]);

  useEffect(() => {
    if (refresh > 0) {
      dispatch(
        searchMission.request({
          tenantID,
          isMatchingOnly: true,
          isApplicationsOnly: false,
          pageSize: pageSize,
          pageNumber: pageNumber,
          loadMissionApplications: false,
          applicantID: userDetails.applicantID
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
          <FormattedMessage id="MESSAGE.NO.MISSION.MATCH" />
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
      formatter: CityColumnFormatter,
      sort: true
    },
    {
      dataField: "matchingScore",
      text: intl.formatMessage({ id: "TEXT.MATCHING" }),
      sort: true,
      formatter: MatchingColumnFormatter
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

  const handleChangePage = (size, page) => {
    localStorage.setItem("pageNumber", page);
    dispatch(
      searchMission.request({
        tenantID,
        isMatchingOnly: true,
        isApplicationsOnly: false,
        pageSize: size,
        pageNumber: page,
        loadMissionApplications: false,
        applicantID: userDetails.applicantID
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
              classes="table table-head-custom table-vertical-center overflow-hidden table-no-padding"
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

export default InterimaireMatchingTable;

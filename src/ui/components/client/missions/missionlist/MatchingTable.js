/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { useIntl } from "react-intl";

import { useMissionsUIContext } from "./MissionsUIContext";
import { shallowEqual, useSelector } from "react-redux";
import MatchingCandidateColumnFormatter from "../column-formatters/matchingCandidateColumnFormatter.jsx";
import MatchingCandidateLastJobsFormatter from "../column-formatters/matchingCandidateLastJobsFormatter.jsx";
import MissionsMatchingColumnFormatter from "../column-formatters/missionsMatchingColumnFormatter.jsx";
import MatchingActionsColumnFormatter from "../column-formatters/matchingActionsColumnFormatter.jsx";

function MatchingTable({ candidates, handleDeny, handleAccept, onOpenResume }) {
  const intl = useIntl();
  let {
    missions,
    loadingMission,
    totalCount,
    mission,
    candidatesLoading
  } = useSelector(
    state => ({
      user: state.contacts.user,
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      jobTitles: state.lists.jobTitles,
      companyID: state.auth.user.accountID,
      mission: state.missionsReducerData.mission,
      candidatesLoading: state.applicants.loading
    }),
    shallowEqual
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
          Aucun intérimaire ne correspond à cette offre !
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
      newWorksiteButtonClick: missionsUIContext.newWorksiteButtonClick,
      openEditCompanyDialog: missionsUIContext.openEditCompanyDialog,
      openDeleteDialog: missionsUIContext.openDeleteDialog,
      openDisplayDialog: missionsUIContext.openDisplayDialog,
      openEditWorksiteDialog: missionsUIContext.openEditWorksiteDialog,
      openMatchingDialog: missionsUIContext.openMatchingDialog,
      editMission: missionsUIContext.editMission
    };
  }, [missionsUIContext]);

  let columns = [
    {
      dataField: "name",
      text: intl.formatMessage({ id: "MATCHING.TABLE.CANDIDATE" }),
      sort: true,
      formatter: MatchingCandidateColumnFormatter,
      formatExtraData: {
        onOpenResume: onOpenResume
      }
    },
    {
      dataField: "lastJobTitles",
      text: intl.formatMessage({ id: "MATCHING.TABLE.LAST_JOBS" }),
      sort: true,
      formatter: MatchingCandidateLastJobsFormatter
    },
    {
      dataField: "matchingScore",
      text: intl.formatMessage({ id: "MATCHING.TABLE.MATCHING" }),
      sort: true,
      formatter: MissionsMatchingColumnFormatter
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MATCHING.TABLE.ACTIONS" }),
      formatter: MatchingActionsColumnFormatter,
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "190px"
      },
      formatExtraData: {
        openDisplayVacancyDialog: missionsUIProps.newWorksiteButtonClick,
        openEditVacancyDialog: missionsUIProps.openEditCompanyDialog,
        openDeleteDialog: missionsUIProps.openDeleteDialog,
        openDisplayDialog: missionsUIProps.openDisplayDialog,
        openMatchingDialog: missionsUIProps.openMatchingDialog,
        openDuplicateVacancyDialog: missionsUIProps.openEditWorksiteDialog,
        editMission: missionsUIProps.editMission,
        handleDeny: handleDeny,
        mission: mission,
        handleAccept: handleAccept,
        onOpenResume: onOpenResume
      }
    }
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
      <BootstrapTable
        remote
        wrapperClasses="table-responsive"
        bordered={false}
        classes="table table-head-custom table-vertical-center overflow-hidden"
        bootstrap4
        keyField="id"
        data={candidates ? candidates : []}
        columns={columns}
        onTableChange={onTableChange}
        noDataIndication={() => <NoDataIndication />}
      />
    </div>
  );

  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(1);

  const handleTableChange = (type, { page, sizePerPage }) => {
    setPageNumber(page);
    setPageSize(sizePerPage);
  };
  return (
    <div
      className={`${
        loadingMission || candidatesLoading
          ? "d-flex justify-content-center align-items-center min-height-100"
          : null
      }`}
    >
      {loadingMission || candidatesLoading ? (
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

export default MatchingTable;

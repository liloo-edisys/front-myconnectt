/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { FormattedMessage, useIntl } from "react-intl";
import { Col, Row } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { Fade } from "react-reveal";

import { useMissionsUIContext } from "./InterimaireMatchingUIContext";
//import ActionsColumnFormatter from "../../column-formatters/MissionsActionsColumnFormatter";
//import DateColumnFormatter from "../../column-formatters/MissionsDateColumnFormatter";
//import MatchingColumnFormatter from "../../column-formatters/MissionsMatchingColumnFormatter";
//import SalaryColumnFormatter from "../../column-formatters/MissionsSalaryColumnFormatter";
//import CityColumnFormatter from "../../column-formatters/MissionsCityColumnFormatter";
import { resetMissionIndicator } from "actions/client/MissionsActions";

import paginationFactory, {
  PaginationListStandalone,
  PaginationProvider,
  SizePerPageDropdownStandalone
} from "react-bootstrap-table2-paginator";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  searchMission,
  addFavorite,
  removeFavorite
} from "../../../../../business/actions/client/MissionsActions";

import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import "../style.css";
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
  const history = useHistory();

  const [pageSize, setPageSize] = useState(12);
  const [pageNumber, setPageNumber] = useState(1);
  const { interimaire } = useSelector(state => state.interimairesReducerData);
  let {
    missions,
    totalCount,
    loadingMission,
    userDetails,
    refreshMissionsList
  } = useSelector(
    state => ({
      user: state.contacts.user,
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      userDetails: state.auth.user,
      refreshMissionsList: state.applicants.refreshMissionsList
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
        pageSize: pageSize,
        pageNumber: pageNumber,
        loadMissionApplications: false,
        applicantID: userDetails.applicantID
      })
    );
  }, [missions]);

  useEffect(() => {
    dispatch(resetMissionIndicator.request());
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
  }, [refreshMissionsList]);

  const onSelectMission = annonce => {
    history.push(`/matching/display/${annonce.id}`);
  };

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

  const getData = () => {
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
  };

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
                    id="MESSAGE.VACANCIES.TOTALCOUNT"
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
    handleChangePage(sizePerPage, page);
  };

  const handleFavorites = (id, value) => {
    if (value) {
      let body = {
        tenantID: userDetails.tenantID,
        userID: userDetails.userID,
        vacancyID: id
      };
      addFavorite(body, dispatch, getData);
    } else {
      removeFavorite(id, dispatch, getData);
    }
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
        <Fade duration={1000} bottom cascade>
          <div className="search_annonces_list">
            <Row>
              {missions && missions.length > 0 ? (
                missions.map((annonce, i) => (
                  <Col key={i} lg={2} className="cursor-hand">
                    <div className="annonce_container box-shadow-interimaire">
                      <div onClick={() => onSelectMission(annonce)}>
                        <div className="annonce_header_container pb-0">
                          <h2 className="annonce_header_title">
                            {annonce.vacancyTitle}
                          </h2>
                        </div>
                        <div className="annonce_body_container py-3">
                          <div className="annonce_body_item">
                            <i className="flaticon-map-location annonce_body_item_icon" />
                            <div>
                              {annonce.vacancyBusinessAddressCity} (
                              {annonce.vacancyBusinessAddressPostalCode})
                            </div>
                          </div>
                          <div className="annonce_body_item">
                            <i className="flaticon-calendar-2 annonce_body_item_icon" />
                            <div>
                              {new Date(
                                annonce.vacancyContractualVacancyEmploymentContractTypeStartDate
                              ).toLocaleDateString("fr-FR")}{" "}
                              -{" "}
                              {new Date(
                                annonce.vacancyContractualVacancyEmploymentContractTypeEndDate
                              ).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                          <div className="annonce_body_item">
                            <i className="flaticon-coins annonce_body_item_icon" />
                            <div>
                              <div>
                                {annonce.missionHourlyGrossSalary.toFixed(2)} €
                              </div>
                              <div className="annonce_body_salary_text">
                                <FormattedMessage id="DISPLAY.IFM.CP" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="annonce_footer_container">
                        <i
                          className={
                            annonce.isFavorite
                              ? "fas flaticon-star icon-xxl mx-2 heart-icon-color"
                              : "far flaticon-star icon-xxl mx-2"
                          }
                          onClick={() => {
                            handleFavorites(annonce.id, !annonce.isFavorite);
                          }}
                        />
                        {/* <label
                          className="custom-checkbox star-checkbox"
                          style={{
                            top: "-0.12em",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={annonce.isFavorite}
                            onClick={() => {
                              handleFavorites(annonce.id, !annonce.isFavorite);
                            }}
                          />
                          <i className="flaticon flaticon-star"></i>
                        </label> */}
                        <Link
                          className="annonce_footer_showmore mx-2 text-white"
                          to={`/matching/approve/${annonce.id}`}
                        >
                          <i className="flaticon2-send-1 annonce_footer_showmore_icon" />
                          <FormattedMessage id="TEXT.APPLY" />
                        </Link>
                        <Link
                          className="annonce_footer_showmore mx-2 bg-light-danger"
                          to={`/matching/remove/${annonce.id}`}
                        >
                          <i className="flaticon2-cross annonce_footer_cancel_icon" />
                        </Link>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
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
              )}
            </Row>
            <div style={{ marginTop: 30 }}>
              <RemotePagination
                data={missions}
                page={pageNumber}
                sizePerPage={pageSize}
                totalSize={totalCount}
                onTableChange={handleTableChange}
              />
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
}

export default InterimaireMatchingTable;

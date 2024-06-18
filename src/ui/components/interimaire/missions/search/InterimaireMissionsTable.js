/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";

import BootstrapTable from "react-bootstrap-table-next";

import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import { Col, Row } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";

import { useInterimaireMissionsUIContext as useMissionsUIContext } from "./InterimaireMissionsUIContext";
//import ActionsColumnFormatter from "../../column-formatters/MissionsActionsColumnFormatter";
//import DateColumnFormatter from "../../column-formatters/MissionsDateColumnFormatter";
//import SalaryColumnFormatter from "../../column-formatters/MissionsSalaryColumnFormatter";
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
import {
  searchMission,
  addFavorite,
  removeFavorite
} from "../../../../../business/actions/client/MissionsActions";
import { resetMissionIndicator } from "actions/client/MissionsActions";

import { getJobTitles } from "actions/shared/ListsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { parseResume } from "../../../../../business/api/interimaire/InterimairesApi";
import "../style.css";
import "./styles.scss";

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
  const history = useHistory();
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedStartDate, setSetelectedStartDate] = useState(null);
  const [selectedEndDate, setSetelectedEndDate] = useState(null);
  const [selectedSalary, setSetelectedSalary] = useState("");
  const [selectedCity, setSetelectedCity] = useState("");
  const [titleList, setTitleList] = useState([]);
  const [pageSize, setPageSize] = useState(12);
  const [pageNumber, setPageNumber] = useState(1);
  const [items, setItems] = useState([]);

  const clearFilter = () => {
    setSetelectedStartDate(null);
    setSetelectedEndDate(null);
    setSelectedTitles(null);
    setTitleList(null);
    setSetelectedSalary("");
    setSetelectedCity("");
  };

  let {
    missions,
    loadingMission,
    jobTitles,
    totalCount,
    refreshMissionsList,
    user
  } = useSelector(
    state => ({
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loading,
      jobTitles: state.lists.jobTitles,
      refreshMissionsList: state.applicants.refreshMissionsList,
      user: state.auth.user
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(resetMissionIndicator.request());
    localStorage.setItem("pageNumber", pageNumber);
    localStorage.setItem("pageSize", pageSize);
    let searchMissionsFilter = localStorage.getItem("searchMissionsFilter");
    if (searchMissionsFilter) {
      searchMissionsFilter = JSON.parse(searchMissionsFilter);
      const filtredStartDate = searchMissionsFilter.selectedStartDate
        ? moment(searchMissionsFilter.selectedStartDate)._d
        : searchMissionsFilter.selectedStartDate;
      const filtredEndDate = searchMissionsFilter.selectedEndDate
        ? moment(searchMissionsFilter.selectedEndDate)._d
        : searchMissionsFilter.selectedEndDate;
      setSelectedTitles(searchMissionsFilter.selectedTitles);
      setSetelectedStartDate(filtredStartDate);
      setSetelectedEndDate(filtredEndDate);
      setSetelectedSalary(searchMissionsFilter.selectedSalary);
      setSetelectedCity(searchMissionsFilter.selectedCity);
      dispatch(
        searchMission.request({
          tenantID,
          missionJobTitles: !isNullOrEmpty(searchMissionsFilter.selectedTitles)
            ? reduceData(searchMissionsFilter.selectedTitles)
            : null,
          startDate: !isNullOrEmpty(searchMissionsFilter.selectedStartDate)
            ? moment(filtredStartDate).format("YYYY-MM-DD")
            : null,
          endDate: !isNullOrEmpty(searchMissionsFilter.selectedEndDate)
            ? moment(filtredEndDate).format("YYYY-MM-DD")
            : null,
          isMatchingOnly: false,
          isApplicationsOnly: false,
          hourlySalary: !isNullOrEmpty(searchMissionsFilter.selectedSalary)
            ? parseFloat(searchMissionsFilter.selectedSalary)
            : 0,
          city: !isNullOrEmpty(searchMissionsFilter.selectedCity)
            ? searchMissionsFilter.selectedCity
            : null,
          pageSize: pageSize,
          pageNumber: 1,
          loadMissionApplications: false
        })
      );
    } else {
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
          pageSize: pageSize,
          pageNumber: pageNumber,
          loadMissionApplications: false
        })
      );
    }
  }, [missions]);

  useEffect(() => {
    localStorage.setItem("searchCount", totalCount);
  }, [totalCount]);

  const onSelectMission = annonce => {
    history.push(`/search/display/${annonce.id}`);
  };

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
  }, [refresh, refreshMissionsList, missions]);

  useEffect(() => {
    dispatch(resetMissionIndicator.request());
    localStorage.setItem("pageNumber", pageNumber);
    localStorage.setItem("pageSize", pageSize);
    let searchMissionsFilter = localStorage.getItem("searchMissionsFilter");
    if (searchMissionsFilter) {
      searchMissionsFilter = JSON.parse(searchMissionsFilter);
      const filtredStartDate = searchMissionsFilter.selectedStartDate
        ? moment(searchMissionsFilter.selectedStartDate)._d
        : searchMissionsFilter.selectedStartDate;
      const filtredEndDate = searchMissionsFilter.selectedEndDate
        ? moment(searchMissionsFilter.selectedEndDate)._d
        : searchMissionsFilter.selectedEndDate;
      setSelectedTitles(searchMissionsFilter.selectedTitles);
      setSetelectedStartDate(filtredStartDate);
      setSetelectedEndDate(filtredEndDate);
      setSetelectedSalary(searchMissionsFilter.selectedSalary);
      setSetelectedCity(searchMissionsFilter.selectedCity);
      dispatch(
        searchMission.request({
          tenantID,
          missionJobTitles: !isNullOrEmpty(searchMissionsFilter.selectedTitles)
            ? reduceData(searchMissionsFilter.selectedTitles)
            : null,
          startDate: !isNullOrEmpty(searchMissionsFilter.selectedStartDate)
            ? moment(filtredStartDate).format("YYYY-MM-DD")
            : null,
          endDate: !isNullOrEmpty(searchMissionsFilter.selectedEndDate)
            ? moment(filtredEndDate).format("YYYY-MM-DD")
            : null,
          isMatchingOnly: false,
          isApplicationsOnly: false,
          hourlySalary: !isNullOrEmpty(searchMissionsFilter.selectedSalary)
            ? parseFloat(searchMissionsFilter.selectedSalary)
            : 0,
          city: !isNullOrEmpty(searchMissionsFilter.selectedCity)
            ? searchMissionsFilter.selectedCity
            : null,
          pageSize: pageSize,
          pageNumber: 1,
          loadMissionApplications: false
        })
      );
    } else {
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
          pageSize: pageSize,
          pageNumber: pageNumber,
          loadMissionApplications: false
        })
      );
    }
  }, [refreshMissionsList]);

  const getData = () => {
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
        pageSize: pageSize,
        pageNumber: pageNumber,
        loadMissionApplications: false
      })
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
    /*dispatch(
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
        loadMissionApplications: false,
      })
    );*/
  };

  const onChangeStartDate = e => {
    {
      /*dispatch(
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
    );*/
    }
  };

  const onChangeEndDate = e => {
    {
      /*dispatch(
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
        loadMissionApplications: false,
      })
    );*/
    }
  };

  const onChangeSalary = e => {
    {
      /*dispatch(
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
        loadMissionApplications: false,
      })
    );*/
    }
  };

  const onChangeCity = e => {
    {
      /*dispatch(
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
        loadMissionApplications: false,
      })
    );*/
    }
  };

  const handleFavorites = (id, value) => {
    if (value) {
      let body = {
        tenantID: user.tenantID,
        userID: user.userID,
        vacancyID: id
      };
      addFavorite(body, dispatch, getData);
    } else {
      removeFavorite(id, dispatch, getData);
    }
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
    localStorage.setItem("pageNumber", page);
    localStorage.setItem("pageSize", sizePerPage);
  };

  const onSearchFilteredMissions = () => {
    const dataForStorage = {
      selectedTitles,
      selectedStartDate,
      selectedEndDate,
      selectedSalary,
      selectedCity
    };
    localStorage.setItem(
      "searchMissionsFilter",
      JSON.stringify(dataForStorage)
    );
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
        pageSize: pageSize,
        pageNumber: 1,
        loadMissionApplications: false
      })
    );
  };

  return (
    <>
      <div className="row mb-5 search_filter_container">
        {renderTitleFilter()}
        {renderStartDateFilter()}
        {renderEndDateFilter()}
        {renderSalaryFilter()}
        {renderCityFilter()}
        <button
          onClick={onSearchFilteredMissions}
          className="btn btn-success font-weight-bold ml-10 mb-10 px-10 search_filter_button"
        >
          <i className="fa fa-search mr-5"></i>
          <span>
            <FormattedMessage id="BUTTON.SEARCH" />
          </span>
        </button>
      </div>
      {loadingMission ? (
        <div className="d-flex justify-content-center align-items-center">
          <span className="colmx-auto spinner spinner-primary"></span>
        </div>
      ) : (
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
                        to={`/search/approve/${annonce.id}`}
                      >
                        <i className="flaticon2-send-1 annonce_footer_showmore_icon" />
                        <FormattedMessage id="TEXT.APPLY" />
                      </Link>
                      <Link
                        className="annonce_footer_showmore mx-2 bg-light-danger"
                        to={`/search/remove/${annonce.id}`}
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
      )}
    </>
  );
}

export default InterimaireMissionsTable;

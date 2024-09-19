import React, { useEffect, useState } from "react";

import {
  getDashboardDatas,
  goToNextStep,
  getUserStartGuide
} from "actions/client/dashboardActions";
import { Pagination } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "react-avatar";
import { Route } from "react-router-dom";
import { checkFields } from "actions/client/companiesActions";
import {
  getInvoicesTypes as getInvoicesTypesActions,
  getAccountGroups as getAccountGroupsActions,
  getPaymentChoices as getPaymentChoicesActions
} from "actions/shared/listsActions";
import { MissionsUIProvider } from "./tables/MissionsUIContext";

import { NavLink } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import CompanyEditModal from "../companies/companiesModals/CompanyEditModal";

import ContractsTable from "./tables/ContractsTable";
import SearchsTable from "./tables/SearchTable";
import { getMission } from "api/client/MissionsApi";
import { getMission as getMissionAction } from "actions/client/missionsActions";
import MissionHeaderDropdown from "../../shared/MissionHeaderDropdown";
import SimulatorModalEmpty from "../missions/missionForms/SimulatorModalEmpty";
import "./styles.scss";

import {
  FirstTooltip,
  SecondTooltip,
  ThirdTooltip,
  FourthTooltip,
  FifthTooltip,
  SixthTooltip
} from "./tooltips";
function DashboardPage({ intl, history }) {
  const dispatch = useDispatch();

  const {
    dashboard,
    contracts,
    user,
    searchs,
    userDetails,
    companies,
    currentCompanyID,
    step
  } = useSelector(
    state => ({
      dashboard: state.dashboard.dashboard,
      contracts: state.dashboard.dashboard.contracts,
      searchs: state.dashboard.dashboard.searchs,
      user: state.contacts.user,
      userDetails: state.auth.user,
      companies: state.companies.companies,
      currentCompanyID: state.auth.user.accountID,
      step: state.dashboard.step
    }),
    shallowEqual
  );
  const [type, setType] = useState(user && user.displayChoice);
  const [windowWidth, setWindowWidth] = useState(null);
  const [toggleSimulator, setToogleSimilator] = useState(false);
  useEffect(() => {
    dispatch(
      getDashboardDatas.request({
        displayChoice: type,
        tenantID: userDetails.tenantID
      })
    );
    dispatch(checkFields.request());
    dispatch(getInvoicesTypesActions.request());
    dispatch(getPaymentChoicesActions.request());
    dispatch(getAccountGroupsActions.request());
    getUserStartGuide(user, dispatch);
    setWindowWidth(window.innerWidth);
    if (windowWidth && windowWidth <= 768 && step < 14) {
      goToNextStep(user, 13, dispatch, true);
    }
  }, [dispatch, type, userDetails, user, windowWidth]);

  const renderStatus = () => {
    return user && user.isAdmin ? "Administrateur" : "Utilisateur";
  };

  let currentCompany = companies.filter(
    worksite => worksite.id === currentCompanyID
  );
  const openWorksiteEdit = () => {
    history.push(`/dashboard/${currentCompanyID}/edit`, currentCompany[0]);
  };
  const missionsUIEvents = {
    openDisplayDialog: data => {
      getMission(data)
        .then(res => dispatch(getMissionAction.success(res)))
        .then(
          setTimeout(() => {
            localStorage.setItem("isPreview", true);
            history.push("/mission-create/final-step");
          }, 1000)
        );
    }
  };

  const showSimulator = () => {
    setToogleSimilator(true);
  };

  const hideSimulator = () => {
    setToogleSimilator(false);
  };
  return (
    <MissionsUIProvider missionsUIEvents={missionsUIEvents} history={history}>
      <Route path="/dashboard/:id/edit">
        {({ history, match }) => (
          <CompanyEditModal
            show={match != null}
            id={match && match.params.id}
            history={history}
            onHide={() => {
              history.goBack();
              dispatch(checkFields.request());
            }}
          />
        )}
      </Route>
      {windowWidth && windowWidth > 768 && step !== 13 && step < 14 && (
        <div
          onClick={() => goToNextStep(user, step, dispatch, false)}
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            margin: 0,
            width: "100%",
            height: "76.5px",
            zIndex: 500,
            position: "fixed",
            top: 0,
            left: 0,
            overflowX: "hidden",
            overflowY: "hidden"
          }}
        />
      )}
      {windowWidth && windowWidth > 768 && step < 15 && (
        <div
          onClick={() => goToNextStep(user, step, dispatch, false)}
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            height: "100%",
            margin: 0,
            width: "100%",
            zIndex: 100,
            position: "fixed",
            top: "63.5px",
            left: 0,
            overflowX: "hidden",
            overflowY: "hidden"
          }}
        />
      )}
      {step === 9 && windowWidth && windowWidth > 768 && (
        <FirstTooltip
          goToNextStep={goToNextStep}
          user={user}
          dispatch={dispatch}
        />
      )}
      {step === 10 && windowWidth && windowWidth > 768 && (
        <SecondTooltip
          goToNextStep={goToNextStep}
          user={user}
          dispatch={dispatch}
        />
      )}
      {step === 11 && windowWidth && windowWidth > 768 && (
        <ThirdTooltip
          goToNextStep={goToNextStep}
          user={user}
          dispatch={dispatch}
        />
      )}
      {step === 12 && windowWidth && windowWidth > 768 && (
        <FourthTooltip
          goToNextStep={goToNextStep}
          user={user}
          dispatch={dispatch}
        />
      )}
      {step === 13 && windowWidth && windowWidth > 768 && (
        <FifthTooltip
          goToNextStep={goToNextStep}
          user={user}
          dispatch={dispatch}
        />
      )}
      {step === 14 && windowWidth && windowWidth > 768 && (
        <SixthTooltip
          goToNextStep={goToNextStep}
          user={user}
          dispatch={dispatch}
        />
      )}
      <div className="d-flex flex-row">
        {toggleSimulator && (
          <SimulatorModalEmpty hideSimulator={hideSimulator} />
        )}
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px dashboard_client_top_menu_responsive">
          <div
            className="card card-custom "
            style={{ backgroundColor: "#2e63a7" }}
          >
            <div className="card-body pt-4">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                  {user && (
                    <Avatar
                      className="symbol-label"
                      color="#3699FF"
                      maxInitials={2}
                      name={
                        user &&
                        user.firstname &&
                        user.firstname.concat(" ", user.lastname)
                      }
                    />
                  )}
                  <i className="symbol-badge bg-success"></i>
                </div>
                <div>
                  {user && (
                    <span className="font-weight-bolder font-size-h5 text-white text-hover-primary">
                      {user &&
                        user.firstname &&
                        user.firstname.concat(" ", user.lastname)}
                    </span>
                  )}
                  <div className="text-muted">{user && renderStatus()}</div>
                  <div className="mt-2">
                    {user.isAdmin && (
                      <div className="d-flex flex-fill">
                        <Pagination className="dashboard-toggle">
                          <Pagination.Item
                            className="dashboard-toggle-item"
                            onClick={() => setType(0)}
                            key={0}
                            active={0 === type}
                          >
                            {intl.formatMessage({
                              id: "DASHBOARD.ALL.DEMANDS"
                            })}
                          </Pagination.Item>
                          <Pagination.Item
                            className="dashboard-toggle-item"
                            onClick={() => setType(1)}
                            key={1}
                            active={1 === type}
                          >
                            {intl.formatMessage({ id: "DASHBOARD.MY.DEMANDS" })}
                          </Pagination.Item>
                        </Pagination>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <MissionHeaderDropdown />
            </div>
          </div>
          <div
            className="navi navi-bold navi-hover navi-active navi-link-rounded"
            style={{
              zIndex: step === 10 ? 200 : 1,
              position: "relative"
            }}
          >
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/mission">
                <span className="navi-icon mr-2">
                  <i className="flaticon-add-label-button text-info"></i>
                </span>
                <span className="navi-text font-size-h5 text-primary">
                  <FormattedMessage id="MISSION.CREATE.BUTTON" />
                </span>
              </NavLink>
            </div>
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/missions">
                <span className="navi-icon mr-2">
                  <i className="fas fa-list-ul text-info mr-5 menu-icone-width"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  Offres
                </span>
              </NavLink>
            </div>
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/templates">
                <span className="navi-icon mr-2">
                  <i className="fas fa-copy text-info mr-5 menu-icone-width"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  Mes modèles d'offres
                </span>
              </NavLink>
            </div>
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/profiles">
                <span className="navi-icon mr-2">
                  <i className="fas fa-user-friends text-info mr-5 menu-icone-width"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  Mes profils
                </span>
              </NavLink>
            </div>
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/cra">
                <span className="navi-icon mr-2">
                  <i className="fas fa-user-friends text-info mr-5 menu-icone-width"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  <FormattedMessage id="BUTTON.ADMIN.SPACE" />
                </span>
              </NavLink>
            </div>
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/companies">
                <span className="navi-icon mr-2">
                  <i className="fas fa-building text-info"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  <FormattedMessage id="USER.MENU.NAV.SITES" />
                </span>
              </NavLink>
            </div>

            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/remunerations">
                <span className="navi-icon mr-2">
                  <i className="fas fa-euro-sign text-info"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  <FormattedMessage id="USER.MENU.NAV.MANAGE_PAYMENTS" />
                </span>
              </NavLink>
            </div>

            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/commercial-agreement">
                <span className="navi-icon mr-2">
                  <i className="fas fa-handshake text-info"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  <FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />
                </span>
              </NavLink>
            </div>

            <div className="navi-item mt-5 box-shadow-primary">
              <div
                className="navi-link py-4"
                style={{ cursor: "pointer" }}
                onClick={showSimulator}
              >
                <span className="navi-icon mr-2">
                  <i className="far fa-chart-bar text-info"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  <FormattedMessage id="BUTTON.SIMULATE.COST" />
                </span>
              </div>
            </div>
            <div className="navi-item mt-5 box-shadow-primary">
              <NavLink className="navi-link py-4" to="/factures">
                <span className="navi-icon mr-2">
                  <i className="fas fa-file-alt text-info"></i>
                </span>
                <span className="navi-text font-size-lg text-primary">
                  <FormattedMessage id="BUTTON.RECIEPTS" />
                </span>
              </NavLink>
            </div>
          </div>
        </div>

        <div className="flex-row-fluid ml-lg-8">
          <div
            className="row"
            style={{
              zIndex: step === 11 ? 200 : 1,
              position: "relative",
              margin: "0px -24px"
            }}
          >
            <Link className="col-lg-3 mw-300" to="/missions/encours">
              <div className="card card-custom card-stretch gutter-b box-shadow-info">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-info svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/General/Search.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-info">
                        {dashboard ? dashboard.nbrSearch : 0}
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.ITEM.SEARCH" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.ITEM.SEARCH_DESC" />
                    </span>
                  </div>
                  <div className="gif-wrapper">
                    <img
                      src="/media/elements/search.gif"
                      alt=""
                      className="align-self-end h-100px static-gif"
                    />
                    <img
                      src="/media/elements/search-loop.gif"
                      alt=""
                      className="align-self-end h-100px"
                    />
                  </div>
                </div>
              </div>
            </Link>
            <Link className="col-lg-3 mw-300" to="/contrats">
              <div className="card card-custom card-stretch gutter-b box-shadow-primary">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-rose svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Home/Book-open.svg"
                          )}
                        ></SVG>
                      </span>
                      <span
                        className="custom-counter "
                        style={{ color: "#fc69a6" }}
                      >
                        {dashboard ? dashboard.nbrContract : 0}
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.ITEM.CONTRACTS" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.ITEM.CONTRACTS_DESC" />
                    </span>
                  </div>
                  <div className="gif-wrapper">
                    <img
                      src="/media/elements/contract.gif"
                      alt=""
                      className="align-self-end h-100px static-gif"
                    />
                    <img
                      src="/media/elements/contract-loop.gif"
                      alt=""
                      className="align-self-end h-100px"
                    />
                  </div>
                </div>
              </div>
            </Link>
            <Link className="col-lg-3 mw-300" to="/prolongations">
              <div className="card card-custom card-stretch gutter-b box-shadow-primary">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-jaune svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Design/Union.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-jaune">
                        {dashboard ? dashboard.nbrProlongation : 0}
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.ITEM.EXTEND" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.ITEM.EXTEND_DESC" />
                    </span>
                  </div>
                  <div className="gif-wrapper">
                    <img
                      src="/media/elements/extend.gif"
                      alt=""
                      className="align-self-end h-100px static-gif"
                    />
                    <img
                      src="/media/elements/extend-loop.gif"
                      alt=""
                      className="align-self-end h-100px"
                    />
                  </div>
                </div>
              </div>
            </Link>
            <Link className="col-lg-3 mw-300" to="/cra">
              <div className="card card-custom card-stretch gutter-b box-shadow-primary">
                <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                  <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                    <div className="d-flex mb-5">
                      <span className="svg-icon svg-icon-primary svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Home/Timer.svg")}
                        ></SVG>
                      </span>
                      {/*<span className="text-primary ml-5">
                        Bientôt disponible
                      </span>*/}
                      <span className="custom-counter text-primary">
                        {dashboard ? dashboard.nbrRH : 0}
                      </span>
                    </div>
                    <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                      <FormattedMessage id="DASHBOARD.ITEM.RH" />
                    </span>
                    <span className="font-weight-bold text-muted font-size-lg">
                      <FormattedMessage id="DASHBOARD.ITEM.RH_DESC" />
                    </span>
                  </div>
                  <div className="gif-wrapper">
                    <img
                      src="/media/elements/rh.gif"
                      alt=""
                      className="align-self-end h-100px static-gif"
                    />
                    <img
                      src="/media/elements/rh-loop.gif"
                      alt=""
                      className="align-self-end h-100px"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>
          <div
            className="row"
            style={{
              zIndex: step === 12 ? 200 : 1,
              position: "relative"
            }}
          >
            <SearchsTable dashboard={dashboard} searchs={searchs} />
          </div>
          <div
            className="row"
            style={{
              zIndex: step === 12 ? 200 : 1,
              position: "relative"
            }}
          >
            <ContractsTable dashboard={dashboard} contracts={contracts} />
          </div>
        </div>
      </div>
      <div className="dashboard_client_bottom_menu_responsive mb-20">
        <div
          className="card card-custom "
          style={{ backgroundColor: "#2e63a7" }}
        >
          <div className="card-body pt-4">
            <div className="d-flex align-items-center">
              <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                {user && (
                  <Avatar
                    className="symbol-label"
                    color="#3699FF"
                    maxInitials={2}
                    name={
                      user &&
                      user.firstname &&
                      user.firstname.concat(" ", user.lastname)
                    }
                  />
                )}
                <i className="symbol-badge bg-success"></i>
              </div>
              <div>
                {user && (
                  <span className="font-weight-bolder font-size-h5 text-white text-hover-primary">
                    {user &&
                      user.firstname &&
                      user.firstname.concat(" ", user.lastname)}
                  </span>
                )}
                <div className="text-muted">{user && renderStatus()}</div>
                <div className="mt-2">
                  {user.isAdmin && (
                    <div className="d-flex flex-fill">
                      <Pagination className="dashboard-toggle">
                        <Pagination.Item
                          className="dashboard-toggle-item"
                          onClick={() => setType(0)}
                          key={0}
                          active={0 === type}
                        >
                          {intl.formatMessage({
                            id: "DASHBOARD.ALL.DEMANDS"
                          })}
                        </Pagination.Item>
                        <Pagination.Item
                          className="dashboard-toggle-item"
                          onClick={() => setType(1)}
                          key={1}
                          active={1 === type}
                        >
                          {intl.formatMessage({ id: "DASHBOARD.MY.DEMANDS" })}
                        </Pagination.Item>
                      </Pagination>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <MissionHeaderDropdown />
          </div>
        </div>
        <div
          className="navi navi-bold navi-hover navi-active navi-link-rounded"
          style={{
            zIndex: step === 10 ? 200 : 1,
            position: "relative"
          }}
        >
          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/mission">
              <span className="navi-icon mr-2">
                <i className="flaticon-add-label-button text-info"></i>
              </span>
              <span className="navi-text font-size-h5 text-primary">
                <FormattedMessage id="MISSION.CREATE.BUTTON" />
              </span>
            </NavLink>
          </div>
          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/missions">
              <span className="navi-icon mr-2">
                <i className="fas fa-list-ul text-info mr-5 menu-icone-width"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                Offres
              </span>
            </NavLink>
          </div>
          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/templates">
              <span className="navi-icon mr-2">
                <i className="fas fa-copy text-info mr-5 menu-icone-width"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                Mes modèles d'offres
              </span>
            </NavLink>
          </div>
          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/profiles">
              <span className="navi-icon mr-2">
                <i className="fas fa-user-friends text-info mr-5 menu-icone-width"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                Mes profils
              </span>
            </NavLink>
          </div>
          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/cra">
              <span className="navi-icon mr-2">
                <i className="fas fa-user-friends text-info mr-5 menu-icone-width"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                <FormattedMessage id="BUTTON.ADMIN.SPACE" />
              </span>
            </NavLink>
          </div>
          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/companies">
              <span className="navi-icon mr-2">
                <i className="fas fa-building text-info"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                <FormattedMessage id="USER.MENU.NAV.SITES" />
              </span>
            </NavLink>
          </div>

          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/remunerations">
              <span className="navi-icon mr-2">
                <i className="fas fa-euro-sign text-info"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                <FormattedMessage id="USER.MENU.NAV.MANAGE_PAYMENTS" />
              </span>
            </NavLink>
          </div>

          <div className="navi-item mt-5 box-shadow-primary">
            <NavLink className="navi-link py-4" to="/commercial-agreement">
              <span className="navi-icon mr-2">
                <i className="fas fa-handshake text-info"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                <FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />
              </span>
            </NavLink>
          </div>

          <div className="navi-item mt-5 box-shadow-primary">
            <div
              className="navi-link py-4"
              style={{ cursor: "pointer" }}
              onClick={showSimulator}
            >
              <span className="navi-icon mr-2">
                <i className="far fa-chart-bar text-info"></i>
              </span>
              <span className="navi-text font-size-lg text-primary">
                <FormattedMessage id="BUTTON.SIMULATE.COST" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </MissionsUIProvider>
  );
}

export default injectIntl(connect()(DashboardPage));

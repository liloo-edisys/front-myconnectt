import React, { useEffect, useState } from "react";

import { getBackOfficeDashboardDatas } from "actions/backoffice/DashboardActions";
import { Pagination } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, shallowEqual, useDispatch, useSelector } from "react-redux";
import { setSignalRBackoffice } from "actions/backoffice/UserActions";
import { Link } from "react-router-dom";
import Avatar from "react-avatar";
import { Route } from "react-router-dom";
import axios from "axios";
import "./styles.scss";

import { NavLink } from "react-router-dom";

import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

function BackOfficeDashboardPageNew({ intl, history }) {
  const dispatch = useDispatch();

  const { backofficeData, user, userDetails, statistics } = useSelector(
    state => ({
      backofficeData: state.backOfficeDashboardReducerData,
      statistics: state.backOfficeDashboardReducerData.statistics,
      user: state.auth.user,
      userDetails: state.auth.user,
      authToken: state.auth.authToken
    }),
    shallowEqual
  );

  const [windowWidth, setWindowWidth] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  useEffect(() => {
    dispatch(getBackOfficeDashboardDatas.request());
    setWindowWidth(window.innerWidth);
  }, [dispatch, userDetails]);

  const renderStatus = () => {
    return (
      user &&
      (user.backofficeRole === 1
        ? "Super Administrateur"
        : user.backofficeRole === 2
        ? "Administrateur"
        : "Utilisateur")
    );
  };

  return (
    <div className="d-flex flex-row">
      <div className="flex-row-auto offcanvas-mobile w-450px w-xl-550px">
        <div className="card card-custom ">
          <div className="card-body pt-4">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Link
                to="/statistiques"
                className="btn btn-light-primary font-weight-bold"
              >
                Détails
              </Link>
              <button
                onClick={() => dispatch(getBackOfficeDashboardDatas.request())}
                className="btn btn-icon btn-light-primary pulse pulse-primary"
              >
                <i className="flaticon-refresh"></i>
                <span className="pulse-ring"></span>
              </button>
            </div>
            <div className="mt-10">
              <div className="statistics_inscriptions_container">
                <div className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2">
                  Nouveaux inscrits
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Clients
                    </div>
                    <div className="custom_counter_stats text-primary">
                      {statistics.newAccounts}
                    </div>
                  </div>
                  <div className="font-weight-bold text-muted font-size-lg mb-2">
                    <div>Intérimaires</div>
                    <div className="custom_counter_stats text-primary">
                      {statistics.newApplicants}
                    </div>
                  </div>
                </div>
              </div>
              <div className="statistics_missions_container">
                <div className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2">
                  Transformation offres
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Nombre de contrats mensuels
                    </div>
                    <div className="custom_counter_stats text-success">
                      {statistics.nbrMonthlyContracts}
                    </div>
                  </div>
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Profils demandés/fournis
                    </div>
                    <div className="custom_counter_stats text-success">
                      {statistics.profilesRate}
                    </div>
                  </div>
                </div>
              </div>
              <div className="statistics_contracts_container">
                <div className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2">
                  Contrats/Avenants
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Contrats réalisés
                    </div>
                    <div className="custom_counter_stats text-warning">
                      {statistics.nbrContracts}
                    </div>
                  </div>
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Contrats signés
                    </div>
                    <div className="custom_counter_stats text-warning">
                      {statistics.nbrSignedContracts}
                    </div>
                  </div>
                </div>
              </div>
              <div className="statistics_applicants_container">
                <div className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2">
                  Suppression Intérimaire
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Suppression intérimaire
                    </div>
                    <div className="custom_counter_stats color_green">
                      {statistics.nbrDeletedApplicants}
                    </div>
                  </div>
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Taux de suppression
                    </div>
                    <div className="custom_counter_stats color_green">
                      {statistics.rateDeletedApplicants} %
                    </div>
                  </div>
                </div>
              </div>
              <div className="statistics_clients_container">
                <div className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2">
                  Suppression client
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Suppression client
                    </div>
                    <div className="custom_counter_stats text-info">
                      {statistics.nbrDeletedAccounts}
                    </div>
                  </div>
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Taux de suppression
                    </div>
                    <div className="custom_counter_stats text-info">
                      {statistics.rateDeletedAccounts} %
                    </div>
                  </div>
                </div>
              </div>
              <div className="statistics_connexions_container">
                <div className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2">
                  Taux de Reconnexion
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Connexion client
                    </div>
                    <div className="custom_counter_stats text-danger">
                      {statistics.rateLoginAccounts} %
                    </div>
                  </div>
                  <div>
                    <div className="font-weight-bold text-muted font-size-lg mb-2">
                      Connexion intérimaire
                    </div>
                    <div className="custom_counter_stats text-danger">
                      {statistics.rateLoginApplicants} %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-row-fluid ml-lg-8">
        <div
          className="row"
          style={{
            position: "relative"
          }}
        >
          <Link className="col-lg-4 mw-300" to="/missions">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-info svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/General/Search.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-info">
                        {statistics.nbrMissions}
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
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.VACANCIES" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.VACANCIES.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/contracts">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
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
                        {statistics.nbrContracts}
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
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.CONTRACTS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.CUSTOMERS.CONTRACTS" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/prolongations">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-jaune svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Design/Union.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-jaune">
                        {statistics.nbrExtensions}
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
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.EXTENSIONS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.EXTENSIONS.REQUESTS" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/cra">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-primary svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Home/Timer.svg")}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-primary">
                        {statistics.nbrRH}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/rh2.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/rh2-loop.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="MODEL.CONTACT.SHIFTS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="MODEL.CONTACT.SHIFTS.DESCRIPTION" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/interimaires">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-success svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Communication/Group.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-success">
                        {statistics.nbrApplicants}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/applicants2.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/applicants2-loop.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.APPLICANTS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.INTERIMAIRES.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/interimaires-to-check">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-danger svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Communication/Delete-user.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-danger">
                        {statistics.nbrApplicantsToControl}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/applicants-to-check.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/applicants-to-check-loop.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.APPLICANTS.TO.CHECK" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.INTERIMAIRES.TO.CHECK.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/customers">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-warning svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Home/Building.svg"
                          )}
                        ></SVG>
                      </span>
                      <span className="custom-counter text-warning">
                        {statistics.nbrAccounts}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/clients.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/clients-loop.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="TEXT.CUSTOMERS" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.CUSTOMERS.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/commercialagreements">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-green svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Files/File.svg")}
                        ></SVG>
                      </span>
                      <span
                        className="custom-counter "
                        style={{ color: "#078000" }}
                      >
                        {statistics.nbrCommercialAgreements}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/agreements.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/agreements-loop.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    <FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.COMMERCIAL.AGREEMENTS.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/messenger/applicant">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-applicant-message svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Files/File.svg")}
                        ></SVG>
                      </span>
                      <span
                        className="custom-counter "
                        style={{ color: "#FF9966" }}
                      >
                        {statistics.nbrMsgApplicants}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/message-applicant.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/message-applicant.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    {/*<FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />*/}
                    Messagerie intérimaires
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.APPLICANT.MESSENGER.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/messenger/client">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-client-message svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Files/File.svg")}
                        ></SVG>
                      </span>
                      <span
                        className="custom-counter "
                        style={{ color: "#00FFFF" }}
                      >
                        {statistics.nbrMsgAccounts}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/message-client.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/message-client.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    {/*<FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />*/}
                    Messagerie clients
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="DESC.CLIENT.MESSENGER.LIST" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/decline/client">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-application-offer svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Files/File.svg")}
                        ></SVG>
                      </span>
                      <span
                        className="custom-counter "
                        style={{ color: "#665D1E" }}
                      >
                        {statistics.nbrRefusAccounts}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/application-offer.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/application-offer.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    {/*<FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />*/}
                    Refus candidatures
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="Accéder à la liste des refus par les clients" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <Link className="col-lg-4 mw-300" to="/decline/applicant">
            <div className="card card-custom card-stretch gutter-b box-shadow-primary">
              <div className="card-body gif-container d-flex align-items-center py-0 pr-1">
                <div className="d-flex flex-column flex-grow-1 py-2 py-lg-5">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <span className="svg-icon svg-icon-decline-offer svg-icon-3x ml-n1">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Files/File.svg")}
                        ></SVG>
                      </span>
                      <span
                        className="custom-counter "
                        style={{ color: "#A52A2A" }}
                      >
                        {statistics.nbrRefusApplicants}
                      </span>
                    </div>
                    <div className="gif-wrapper">
                      <img
                        src="/media/elements/decline-offer.gif"
                        alt=""
                        className="align-self-end h-100px static-gif"
                      />
                      <img
                        src="/media/elements/decline-offer.gif"
                        alt=""
                        className="align-self-end h-100px"
                      />
                    </div>
                  </div>
                  <span className="card-title font-weight-bolder text-dark-75 font-size-h5 mb-2 text-hover-primary">
                    {/*<FormattedMessage id="USER.COMMERCIAL.AGREEMENT" />*/}
                    Refus invitations
                  </span>
                  <span className="font-weight-bold text-muted font-size-lg">
                    <FormattedMessage id="Accéder à la liste des refus par les intérimaires" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
          {/* <ContractsTable dashboard={dashboard} contracts={contracts} /> */}
        </div>
      </div>
    </div>
  );
}

export default injectIntl(connect()(BackOfficeDashboardPageNew));

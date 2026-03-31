import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { getDashboardDatas } from "actions/interimaire/dashboardActions";
import { Fade } from "react-reveal";
import { FormattedMessage } from "react-intl";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers/index.js";
import { Link, useHistory } from "react-router-dom";
import "./styles.scss";
import { MissionDisplayDialog } from "../../../missions/modals/missionDisplayDialog.jsx";
import {
  searchMission,
  addFavorite,
  removeFavorite
} from "../../../../../../business/actions/client/missionsActions.js";
//import axios from "axios";
import { setContractsCount } from "../../../../../../business/actions/interimaire/interimairesActions.js";

function AnnoncesList(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const tenantID = +process.env.REACT_APP_TENANT_ID;
  const [showDialog, setShowDialog] = useState(false);
  const { interimaire } = useSelector(state => state.interimairesReducerData);
  let {
    missions,
    totalCount,
    loadingMission,
    userDetails,
    dashboard
  } = useSelector(
    state => ({
      user: state.contacts.user,
      missions: state.missionsReducerData.missions.list,
      totalCount: state.missionsReducerData.missions.totalcount,
      loadingMission: state.missionsReducerData.loadingSearchMission,
      userDetails: state.auth.user,
      dashboard: state.dashboardReducerData.dashboard
    }),
    shallowEqual
  );
  useEffect(() => {
    getData();
  }, [interimaire]);

  useEffect(() => {
    setContractsCount(dashboard.nbrContract, dispatch);
  }, [dashboard]);

  const onSelectMission = annonce => {
    history.push(`/int-dashboard/mission/${annonce.id}`);
  };

  const getData = () => {
    let searchOptions = null;
    dispatch(getDashboardDatas.request({ tenantID: tenantID }));
    if (interimaire.actionZoneStep === 0) {
      searchOptions = {
        isMatchingOnly: false,
        isPropositionsOnly: false,
        isApplicationsOnly: false
      };
    } else if (interimaire.actionZoneStep === 1) {
      searchOptions = {
        isMatchingOnly: true,
        isPropositionsOnly: false,
        isApplicationsOnly: false
      };
    } else if (interimaire.actionZoneStep === 2) {
      searchOptions = {
        isMatchingOnly: false,
        isPropositionsOnly: true,
        isApplicationsOnly: false,
        applicationStatus: [1]
      };
    } else if (interimaire.actionZoneStep === 3) {
      searchOptions = {
        isMatchingOnly: false,
        isPropositionsOnly: false,
        isApplicationsOnly: true,
        ApprovedByApplicant: [2]
      };
    }

    dispatch(
      searchMission.request({
        ...searchOptions,
        tenantID,
        pageSize: 6,
        pageNumber: 1,
        loadMissionApplications: false,
        applicantID: userDetails.applicantID
      })
    );
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
    <div style={{ margin: 10 }}>
      {selectedAnnonce && (
        <MissionDisplayDialog setSelectedAnnonce={setSelectedAnnonce} />
      )}
      <div className="card card-custom title_container_radius">
        <div className="card-home border-top-auth ribbon ribbon-top ribbon-ver">
          <h2>
            <span className="svg-icon svg-icon-3x svg-icon-danger document_icon">
              <SVG
                className="h-75 align-self-end"
                src={toAbsoluteUrl("/media/svg/icons/General/Shield-check.svg")}
              ></SVG>
            </span>
            {interimaire.actionZoneStep === 1 ? (
              <span>
                <FormattedMessage id="DASHBOARD.INTERIMAIRE.LIST.MISSIONS.TITLE" />
              </span>
            ) : interimaire.actionZoneStep === 2 ? (
              <span>
                <FormattedMessage id="DISPLAY.MY.PROPOSITIONS" />
              </span>
            ) : (
              interimaire.actionZoneStep === 3 && (
                <span>
                  <FormattedMessage id="DASHBOARD.INTERIMAIRE.LIST.APPLICATIONS.TITLE" />
                </span>
              )
            )}
          </h2>
        </div>
      </div>
      <Fade duration={1000} bottom cascade>
        <div className="annonces_main_container">
          {loadingMission ? (
            <div className="d-flex justify-content-center align-items-center my-20">
              <span className="colmx-auto spinner spinner-primary font-size-50"></span>
            </div>
          ) : (
            <Row>
              {missions && missions.length > 0 ? (
                missions.map(
                  (annonce, i) =>
                    i <= 5 && (
                      <Col key={i} xl={4} lg={6} md={6} className="cursor-hand">
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
                                    {annonce.missionHourlyGrossSalary.toFixed(
                                      2
                                    )}{" "}
                                    €
                                  </div>
                                  <div className="annonce_body_salary_text">
                                    <FormattedMessage id="DISPLAY.IFM.CP" />
                                  </div>
                                </div>
                              </div>
                              {/*interimaire.actionZoneStep === 3 && (
                                <>
                                  {annonce.applicationStatus === 5 ? (
                                    <div style={{ height: 35 }}></div>
                                  ) : (
                                    <div className="annonce_footer_showmore mx-2 mt-2 bg-light-primary">
                                      <span className="text-primary">
                                        En attente de la réponse de l'entreprise
                                      </span>
                                    </div>
                                  )}
                                </>
                              )*/}
                            </div>
                          </div>
                          <div className="annonce_footer_container">
                            {interimaire.actionZoneStep === 1 ? (
                              <>
                                <i
                                  className={
                                    annonce.isFavorite
                                      ? "fas flaticon-star icon-xxl mx-2 heart-icon-color"
                                      : "far flaticon-star icon-xxl mx-2"
                                  }
                                  onClick={() => {
                                    handleFavorites(
                                      annonce.id,
                                      !annonce.isFavorite
                                    );
                                  }}
                                />
                                <Link
                                  className="annonce_footer_showmore mx-2 text-white"
                                  to={`/int-dashboard/approve/${annonce.id}`}
                                >
                                  <i className="flaticon2-send-1 annonce_footer_showmore_icon" />
                                  <FormattedMessage id="TEXT.APPLY" />
                                </Link>
                              </>
                            ) : (
                              interimaire.actionZoneStep === 2 && (
                                <Link
                                  className="annonce_footer_showmore mx-2 text-white"
                                  to={`/int-dashboard/approve/${annonce.id}`}
                                >
                                  <i className="far fa-handshake annonce_footer_showmore_icon" />
                                  <FormattedMessage id="CANDIDATE.ACCEPT.TITLE" />
                                </Link>
                              )
                            )}
                            {interimaire.actionZoneStep === 3 ? (
                              <>
                                {annonce.applicationStatus === 5 ? (
                                  <div className="annonce_footer_showmore mx-2 px-10 py-2 bg-light-success">
                                    <i className="fas fa-handshake text-success" />
                                    <span className="text-success ml-5">
                                      <FormattedMessage id="STATUS.SELECTED" />
                                    </span>
                                  </div>
                                ) : annonce.applicationStatus === 3 ? (
                                  <div className="annonce_footer_showmore mx-2 py-2 bg-light-danger">
                                    <i className="fas fa-handshake-alt-slash text-danger" />
                                    <span className="text-danger ml-5">
                                      <FormattedMessage id="STATUS.NOT.SELECTED" />
                                    </span>
                                  </div>
                                ) : (
                                  <Link
                                    className="annonce_footer_showmore bg-light-danger"
                                    to={`/int-dashboard/decline/${annonce.id}`}
                                  >
                                    <i className="flaticon2-cross text-danger" />
                                    <span className="text-danger ml-2">
                                      <FormattedMessage id="TEXT.CANCEL.APPLICATION" />
                                    </span>
                                  </Link>
                                )}
                              </>
                            ) : interimaire.actionZoneStep === 1 ? (
                              <Link
                                className="annonce_footer_showmore mx-2 bg-light-danger"
                                to={`/int-dashboard/remove/${annonce.id}`}
                              >
                                <i className="flaticon2-cross annonce_footer_cancel_icon" />
                              </Link>
                            ) : (
                              <Link
                                className="annonce_footer_showmore mx-2 bg-light-danger"
                                to={`/int-dashboard/decline/${annonce.id}`}
                              >
                                <i className="flaticon2-cross annonce_footer_cancel_icon" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </Col>
                    )
                )
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
          )}
        </div>
      </Fade>
    </div>
  );
}

export default AnnoncesList;

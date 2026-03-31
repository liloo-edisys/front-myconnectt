import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useParams, useLocation, Link } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "metronic/_helpers";
import Moment from "moment";
import {
  getMissionRemuneration,
  getMissionEquipment,
  getDriverLicences,
  getMissionReasons,
  getJobSkills
} from "actions/shared/listsActions";
import {
  getHabilitationsList,
  getMission,
  addFavorite,
  removeFavorite
} from "actions/client/missionsActions";

import "./styles.scss";
import "../style.css";
import axios from "axios";

export function MissionDisplayDialog({ show, onHide, history }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const pathname = location;
  const [applicationStep, setApplicationStep] = useState(null);
  const [currentPath, setSurrentPath] = useState("");

  const {
    missionToDisplay,
    loadingMission,
    missionsReasons,
    missionRemuneration,
    missionEquipment,
    driverLicenses,
    missionSkills,
    interimaire,
    habilitations,
    user,
    jobSkills
  } = useSelector(
    state => ({
      missionToDisplay: state.missionsReducerData.mission,
      loadingMission: state.missionsReducerData.loadingMission,
      missionsReasons: state.lists.missionsReasons,
      missionRemuneration: state.lists.missionRemuneration,
      missionEquipment: state.lists.missionEquipment,
      driverLicenses: state.lists.driverLicenses,
      missionSkills: state.lists.jobSkills,
      interimaire: state.interimairesReducerData.interimaire,
      habilitations: state.missionsReducerData.habilitations,
      user: state.auth.user,
      jobSkills: state.lists.jobSkills
    }),
    shallowEqual
  );
  const [toogleRemunerationItems, setToogleRemunerationItems] = useState(false);
  /*const useMountEffect = (fun) => useEffect(fun, [id, pathname]);
  useEffect(() => {}, []);*/
  useEffect(() => {
    setSurrentPath(pathname.pathname.split("/")[1]);
    dispatch(getMissionRemuneration.request());
    dispatch(getMissionEquipment.request());
    dispatch(getDriverLicences.request());
    dispatch(getMissionReasons.request());
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    getHabilitationsList(dispatch);
    if (id) {
      dispatch(getMission.request(id));
      if (interimaire) {
        const body = {
          id1: parseInt(id),
          id2: interimaire.id
        };

        const APPLICATION_STATUS_URL =
          process.env.REACT_APP_WEBAPI_URL +
          "api/missionapplication/applicationstatus";
        axios
          .post(APPLICATION_STATUS_URL, body)
          .then(res => setApplicationStep(res.data))
          .catch(err => console.log(err));
      }
    }
  }, [dispatch, id, pathname, interimaire]);
  const calculateSalary = () => {
    let salary = 0;
    if (missionToDisplay.vacancyContractualProposedHourlySalary) {
      let first =
        missionToDisplay.vacancyContractualProposedHourlySalary +
        missionToDisplay.vacancyContractualProposedHourlySalary * 0.1;
      salary = first + first * 0.1;
    }

    return Math.round(salary * 100) / 100;
  };
  const formatReason = () => {
    let reason = missionsReasons.filter(
      reason => reason.id === missionToDisplay.missionReasonID
    );
    return reason.length && reason[0].name;
  };
  const formatRemuneration = () => {
    if (missionToDisplay && missionToDisplay.missionRemunerationItems) {
      return missionToDisplay.missionRemunerationItems.map(salary => {
        let label = missionRemuneration.filter(
          remuneration => remuneration.id === salary.missionRemunerationID
        );
        return (
          <div className="d-flex col-lg-12">
            <p className="d-flex col-lg-12">
              <span className="font-weight-bolder">
                {label && label.length && label[0].label} :
              </span>
              <span className="font-weight-bolder ml-2">
                {label && salary.amount} €/J
              </span>
            </p>
          </div>
        );
      });
    }
  };
  const handleFavorites = (id, value) => {
    if (value) {
      let body = {
        tenantID: user.tenantID,
        userID: user.userID,
        vacancyID: id
      };
      addFavorite(body, dispatch, null);
    } else {
      removeFavorite(id, dispatch, null);
    }
  };
  const formatEquipment = () => {
    let equipements = [];
    var outStr = "";

    if (
      !isNullOrEmpty(missionToDisplay) &&
      missionToDisplay.missionArrayEquipments
    ) {
      missionToDisplay.missionArrayEquipments.map(skill => {
        let label = missionEquipment.filter(jobSkill => jobSkill.id === skill);
        return equipements.push(label.length && label[0].name);
      });
    }
    outStr = equipements.join(" - ");
    return outStr;
  };

  const formatSkills = () => {
    let skills = [];
    var outStr = "";

    if (
      !isNullOrEmpty(missionToDisplay) &&
      missionToDisplay.vacancyApplicationCriteriaArrayComputerSkills
    ) {
      missionToDisplay.vacancyApplicationCriteriaArrayComputerSkills.map(
        skill => {
          let label = missionSkills.filter(jobSkill => jobSkill.id === skill);
          return skills.push(label.length && label[0].name);
        }
      );
    }
    outStr = skills.join(" - ");
    return outStr;
  };

  const formatHabilitations = () => {
    let skills = [];
    var outStr = "";

    if (
      !isNullOrEmpty(missionToDisplay) &&
      missionToDisplay.missionArrayHabilitations
    ) {
      missionToDisplay.missionArrayHabilitations.map(skill => {
        let label = habilitations.filter(jobSkill => jobSkill.id === skill);
        return skills.push(label.length && label[0].name);
      });
    }
    outStr = skills.join(" - ");
    return outStr;
  };

  const formatLicenses = () => {
    let licenses = [];
    var outStr = "";

    if (
      !isNullOrEmpty(missionToDisplay) &&
      missionToDisplay.missionArrayDriverLicenses
    ) {
      missionToDisplay.missionArrayDriverLicenses.map(skill => {
        let label = driverLicenses.filter(jobSkill => jobSkill.id === skill);
        return licenses.push(label.length && label[0].name);
      });
    }
    outStr = licenses.join(" - ");
    return outStr;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      size="xl"
    >
      <Modal.Header closeButton>
        <Modal.Title
          id="example-modal-sizes-title-lg"
          style={{ width: "100%" }}
        >
          <div className="d-flex align-items-space-between pr-10">
            <div className="pageSubtitle pageModalSubtitle">
              {loadingMission ? "--" : missionToDisplay.vacancyTitle}
              <i className="flaticon2-correct text-success font-size-h5 ml-2"></i>
            </div>
            <div className="d-flex align-items-center">
              {applicationStep === 2 ? (
                <Link
                  to={`/${currentPath}/decline/${id}`}
                  className="btn btn-light-danger btn-shadow font-weight-bold py-2 mx-2"
                >
                  <span className="text-danger">
                    <FormattedMessage id="TEXT.CANCEL.APPLICATION" />
                  </span>
                </Link>
              ) : applicationStep === 1 ? (
                <div>
                  <Link
                    to={`/${currentPath}/approve/${id}`}
                    className="btn btn-primary btn-shadow font-weight-bold py-2 mx-2"
                  >
                    <span>
                      <FormattedMessage id="CANDIDATE.ACCEPT.TITLE" />
                    </span>
                  </Link>
                  <Link
                    to={`/${currentPath}/remove/${id}`}
                    className="btn bg-light-danger btn-shadow font-weight-bold py-2 mx-2"
                  >
                    <span className="text-danger">
                      <FormattedMessage id="DECLINE.BUTTON" />
                    </span>
                  </Link>
                </div>
              ) : (
                applicationStep === -1 && (
                  <div className="row mobile_annonce_header">
                    <div className="mt-2 mobile_annonce_header_item">
                      <i
                        className={
                          missionToDisplay.isFavorite
                            ? "fas flaticon-star icon-xxl mx-2 heart-icon-color"
                            : "far flaticon-star icon-xxl mx-2"
                        }
                        onClick={() => {
                          handleFavorites(
                            missionToDisplay.id,
                            !missionToDisplay.isFavorite
                          );
                        }}
                      />
                    </div>
                    <Link
                      to={`/${currentPath}/approve/${id}`}
                      className="btn btn-primary btn-shadow font-weight-bold py-2 mx-2 mobile_annonce_header_item"
                    >
                      <span>
                        <FormattedMessage id="TEXT.APPLY" />
                      </span>
                    </Link>
                    <Link
                      to={`/${currentPath}/remove/${id}`}
                      className="btn bg-light-danger btn-shadow font-weight-bold py-2 mx-2"
                    >
                      <span className="text-danger">
                        <FormattedMessage id="TEXT.DENY" />
                      </span>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="separator separator-solid mt-4"></div>
          <div className="d-flex align-items-space-around flex-wrap mt-4">
            <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
              <span className="mr-4">
                <i className="display-4 text-primary flaticon-calendar-with-a-clock-time-tools"></i>
              </span>
              <div className="d-flex flex-column text-dark-75">
                <span className="font-weight-bolder font-size-h5">
                  <span className="font-weight-bolder font-size-sm">du </span>
                  {!isNullOrEmpty(
                    missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
                  )
                    ? Moment(
                        missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
                      )
                        .locale("fr")
                        .format("DD/MM/YYYY")
                    : null}{" "}
                </span>
                <span className="font-weight-bolder font-size-h5">
                  <span className="font-weight-bolder font-size-sm">au </span>
                  {!isNullOrEmpty(
                    missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
                  )
                    ? Moment(
                        missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
                      )
                        .locale("fr")
                        .format("DD/MM/YYYY")
                    : null}
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
              <span className="mr-4">
                <i className="display-4 text-primary flaticon-map-location"></i>
              </span>
              <div className="d-flex flex-column text-dark-75">
                <span className="font-weight-bolder font-size-sm">
                  <FormattedMessage id="MODEL.VACANCY.LOCATION" />
                </span>
                <span className="font-weight-bolder font-size-h5">
                  {missionToDisplay.vacancyBusinessAddressCity}
                  <span className="ml-1">
                    ({missionToDisplay.vacancyBusinessAddressPostalCode})
                  </span>
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
              <span className="mr-4">
                <i className="display-4 text-primary flaticon-coins"></i>
              </span>
              <div className="d-flex flex-column text-dark-75">
                <span className="font-weight-bolder font-size-sm">
                  <FormattedMessage id="DISPLAY.HOURLY.SALARY" />
                </span>
                <span className="font-weight-400 font-size-sm">
                  <FormattedMessage id="DISPLAY.IFM.CP" />
                </span>
                <span className="font-weight-bolder font-size-h5">
                  {calculateSalary()}
                  <span className="text-dark-50 font-weight-bold ml-1">€</span>
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
              <span className="mr-4">
                <i className="display-4 text-primary flaticon-time-1"></i>
              </span>
              <div className="d-flex flex-column text-dark-75">
                <span className="font-weight-bolder font-size-sm">
                  <FormattedMessage id="SCHEDULE" />
                </span>
                <span className="font-weight-bolder">
                  <span className="font-weight-bolder font-size-sm">de </span>
                  {missionToDisplay.missionStartHour}
                  <span className="font-weight-bolder font-size-sm"> à </span>
                  {missionToDisplay.missionEndHour}
                </span>
              </div>
            </div>
          </div>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={onHide}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body className="py-0 background-gray pt-5">
        {loadingMission ? (
          <div className="d-flex justify-content-center align-items-center">
            <span className="colmx-auto spinner spinner-primary"></span>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="row">
              <div
                className={`mb-5 ${
                  missionToDisplay &&
                  missionToDisplay.missionRemunerationItems &&
                  missionToDisplay.missionRemunerationItems.length > 0
                    ? "col-lg-6 col-xl-6"
                    : "col-lg-12 col-xl-12"
                }`}
              >
                <div className="card card-custom gutter-b bg-diagonal bg-diagonal-light-primary">
                  <div className="card-body p-2">
                    <div className="d-flex align-items-left justify-content-between p-4 flex-lg-wrap flex-xl-nowrap">
                      <div className="d-flex flex-column mr-5">
                        <span className="h4 text-dark text-hover-primary mb-5">
                          Caractéristiques du poste
                        </span>
                        <span className="text-muted mb-3 font-weight-bold font-size-sm">
                          Informations détaillées sur la mission.
                        </span>
                        <p className="text-dark">
                          {missionToDisplay.vacancyMissionDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {missionToDisplay &&
                missionToDisplay.missionRemunerationItems &&
                missionToDisplay.missionRemunerationItems.length > 0 && (
                  <div className="col-lg-6 col-xl-6 mb-5">
                    <div className="card card-custom wave wave-animate wave-danger mb-8 mb-lg-0">
                      <div className="card-body p-2">
                        <div className="d-flex align-items-left p-5">
                          <div className="mr-6">
                            <span className="svg-icon svg-icon-danger svg-icon-4x">
                              <SVG
                                className=""
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Shopping/Euro.svg"
                                )}
                              />
                            </span>
                          </div>
                          <div className="d-flex flex-column">
                            <span className="text-dark text-hover-primary font-weight-bold font-size-h4 mb-3">
                              Prime et indemnités
                            </span>
                            <span className="text-muted mb-3 font-weight-bold font-size-sm">
                              Complément et autres éléments de remunération.
                            </span>
                            <div className="text-dark">
                              {formatRemuneration()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="card card-custom card-stretch gutter-b ribbon ribbon-top ribbon-ver">
              <div className="ribbon-target bg-int ribbon-right">
                <i className="fas fa-exclamation-triangle text-white"></i>
              </div>
              <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                  <span className="card-label font-weight-bolder text-dark">
                    Pré-requis de la mission
                  </span>
                  <span className="text-muted mt-3 font-weight-bold font-size-sm">
                    Informations obligatoires et équipements nécessaires pour la
                    réalisation de la mission.
                  </span>
                </h3>
              </div>
              <div className="separator separator-solid"></div>
              <div className="card-body p-5">
                <div className="d-flex flex-row col-lg-12 mb-5">
                  <span className="label label-outline-primary label-inline mr-2 p-5">
                    <span className="font-weight-bolder mr-2">Véhicule :</span>{" "}
                    {missionToDisplay.missionHasVehicle ? "Oui" : "Non"}
                  </span>

                  {missionToDisplay &&
                    missionToDisplay.missionArrayDriverLicenses &&
                    missionToDisplay.missionArrayDriverLicenses.length > 0 && (
                      <span className="label label-outline-info label-inline mr-2 p-5">
                        <span className="font-weight-bolder mr-2">
                          <FormattedMessage id="MODEL.VACANCY.DRIVERLICENCE" />{" "}
                          :
                        </span>{" "}
                        {formatLicenses()}
                      </span>
                    )}
                </div>
                <div className="d-flex flex-row col-lg-12 mb-5">
                  {missionToDisplay &&
                    missionToDisplay.missionArrayHabilitations &&
                    missionToDisplay.missionArrayHabilitations.length > 0 && (
                      <span className="label label-outline-warning label-inline mr-2 p-5">
                        <span className="font-weight-bolder mr-2">
                          Habilitations :
                        </span>{" "}
                        {formatHabilitations()}
                      </span>
                    )}
                </div>
                <div className="d-flex flex-row col-lg-12 mb-5">
                  {missionToDisplay &&
                    missionToDisplay.missionArrayEquipments &&
                    missionToDisplay.missionArrayEquipments.length > 0 && (
                      <span className="label label-outline-dark label-inline mr-2 p-5">
                        <span className="font-weight-bolder mr-2">
                          <FormattedMessage id="MODEL.VACANCY.EQUIPMENT" /> :
                        </span>{" "}
                        {formatEquipment()}
                      </span>
                    )}
                </div>
                <div className="d-flex flex-row col-lg-12 mb-5">
                  {missionToDisplay &&
                    missionToDisplay.vacancyApplicationCriteriaArrayComputerSkills &&
                    missionToDisplay
                      .vacancyApplicationCriteriaArrayComputerSkills.length >
                      0 && (
                      <span className="label label-outline-danger label-inline mr-2 p-5">
                        <span className="font-weight-bolder mr-2">
                          <FormattedMessage id="MODEL.COMPETENCES" /> :
                        </span>{" "}
                        {formatSkills()}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

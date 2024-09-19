import React, { useEffect, useState } from "react";

import Moment from "moment";
import { FormattedMessage } from "react-intl";
import {
  validateMission,
  resetMission,
  getHabilitationsList
} from "actions/client/missionsActions";
import { Redirect } from "react-router";

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  getJobTitles,
  getMissionExperiences,
  getMissionReasons,
  getDriverLicences,
  getMissionRemuneration,
  getEducationLevels,
  getLanguages,
  getJobSkills,
  getJobTags,
  getMissionEquipment
} from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getMission } from "api/client/MissionsApi";
import {
  deleteCurrentDuplicate,
  deleteCurrentTemplate
} from "actions/client/missionsActions";
import { deleteFromStorage } from "../../../shared/DeleteFromStorage";
import SimulatorModal from "./SimulatorModal";
import axios from "axios";
function FinalStep(props) {
  const dispatch = useDispatch();
  const {
    updateMissionSuccess,
    missionExperiences,
    missionEquipment,
    jobSkills,
    jobTags,
    missionsReasons,
    languages,
    driverLicenses,
    educationLevels,
    missionRemuneration,
    missionToDisplay,
    loading,
    habilitations
  } = useSelector(
    state => ({
      updateMissionSuccess: state.missionsReducerData.updateMissionSuccess,
      missionExperiences: state.lists.missionExperiences,
      missionsReasons: state.lists.missionsReasons,
      driverLicenses: state.lists.driverLicenses,
      missionRemuneration: state.lists.missionRemuneration,
      educationLevels: state.lists.educationLevels,
      languages: state.lists.languages,
      jobSkills: state.lists.jobSkills,
      jobTags: state.lists.jobTags,
      missionEquipment: state.lists.missionEquipment,
      missionToDisplay: state.missionsReducerData.lastCreatedMission,
      loading: state.missionsReducerData.loading,
      habilitations: state.missionsReducerData.habilitations
    }),
    shallowEqual
  );
  const [agreementValidated, setAgreementValidated] = useState(false);
  const [toggleSimulator, setToogleSimilator] = useState(false);
  let isPreview = localStorage.getItem("isPreview");
  const useMountEffect = fun => useEffect(fun, []);
  useEffect(() => {
    //mouse moves
    return () => {
      resetMission.request(); //whenever the component removes it will executes
    };
  }, []);
  useMountEffect(() => {
    dispatch(getJobTitles.request());
    dispatch(getMissionExperiences.request());
    dispatch(getMissionReasons.request());
    dispatch(getDriverLicences.request());
    dispatch(getMissionRemuneration.request());
    dispatch(getEducationLevels.request());
    dispatch(getLanguages.request());
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    dispatch(getJobTags.request());
    dispatch(getMissionEquipment.request());
    getHabilitationsList(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (missionToDisplay) {
      let body = {
        id1: missionToDisplay.accountID,
        id2: missionToDisplay.jobTitleID
      };
      axios
        .post(
          `${process.env.REACT_APP_WEBAPI_URL}api/CommercialAgreement/GetCommercialAgreement`,
          body
        )
        .then(res => {
          if (res.data.isValidated) {
            setAgreementValidated(true);
          }
        });
    }
  }, [missionToDisplay]);

  const formatReason = () => {
    let reason = missionsReasons.filter(
      reason => reason.id === missionToDisplay.missionReasonID
    );
    return reason.length && reason[0].name;
  };
  const deleteItems = () => {
    var result = {};
    for (var type in window.localStorage)
      if (!type.includes("persist")) result[type] = window.localStorage[type];
    for (var item in result) deleteFromStorage(item);
    return;
  };
  const handleClickEdit = () => {
    deleteItems();
    dispatch(deleteCurrentDuplicate.request());
    dispatch(deleteCurrentTemplate.request());
    getMission(missionToDisplay.id)
      .then(localStorage.setItem("id", missionToDisplay.id))
      .then(deleteItems())
      .then(props.history.push("/mission-create/step-one"));
  };

  const formatExperiences = () => {
    let xp = missionExperiences.filter(
      xp => xp.id === missionToDisplay.missionExperienceID
    );
    return xp.length ? xp[0].name : null;
  };

  const formatEducation = () => {
    let diplomas = "";
    if (
      missionToDisplay.vacancyApplicationCriteriaArrayRequiredEducationLevels
    ) {
      missionToDisplay.vacancyApplicationCriteriaArrayRequiredEducationLevels.map(
        diploma => {
          let label = educationLevels.filter(l => l.id === diploma);
          return (diplomas = diplomas.concat(
            label.length && label[0].name + " - "
          ));
        }
      );
    }
    return diplomas;
  };

  const formatLangages = () => {
    let langs = "";
    if (missionToDisplay.vacancyApplicationCriteriaArrayLanguagesWithLevel) {
      missionToDisplay.vacancyApplicationCriteriaArrayLanguagesWithLevel.map(
        language => {
          let label = languages.filter(l => l.id === language);
          return (langs = langs.concat(
            label.length && label[0].frenchName + " - "
          ));
        }
      );
    }
    return langs;
  };

  const formatSkills = () => {
    let skills = "";
    if (missionToDisplay.vacancyApplicationCriteriaArrayComputerSkills) {
      missionToDisplay.vacancyApplicationCriteriaArrayComputerSkills.map(
        skill => {
          let label = jobSkills.filter(jobSkill => jobSkill.id === skill);
          return (skills = skills.concat(
            label.length && label[0].name + " - "
          ));
        }
      );
    }
    return skills;
  };

  const formatTags = () => {
    let tags = "";
    if (missionToDisplay.vacancyApplicationCriteriaArrayJobTags) {
      missionToDisplay.vacancyApplicationCriteriaArrayJobTags.map(tag => {
        let label = jobTags.filter(jobTag => jobTag.id === tag);
        return (tags = tags.concat(label.length && label[0].name + " - "));
      });
    }
    return tags;
  };

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

  const formatRemuneration = () => {
    if (missionToDisplay && missionToDisplay.missionRemunerationItems) {
      return missionToDisplay.missionRemunerationItems.map(salary => {
        let label = missionRemuneration.filter(
          remuneration => remuneration.id === salary.missionRemunerationID
        );
        return (
          <div className="d-flex col-lg-12">
            <p className="d-flex col-lg-5">
              <span className="font-weight-bolder">
                {label && label.length && label[0].label}
              </span>
            </p>
            <p className="d-flex col-lg-3">
              <span className="font-weight-bolder">
                {label && salary.amount}€
              </span>
            </p>
            <p className="d-flex col-lg-3">
              Base :&nbsp;
              <span className="font-weight-bolder">{label && salary.base}</span>
            </p>
          </div>
        );
      });
    }
  };

  const formatEquipment = () => {
    let equipements = "";
    if (missionToDisplay.missionArrayEquipments) {
      missionToDisplay.missionArrayEquipments.map(eq => {
        let label = missionEquipment.filter(equipement => equipement.id === eq);
        return (equipements = equipements.concat(
          label.length && label[0].name + " - "
        ));
      });
    }
    return equipements;
  };

  const formatLicenses = () => {
    let licenses = "";
    if (missionToDisplay.missionArrayDriverLicenses) {
      missionToDisplay.missionArrayDriverLicenses.map(license => {
        let label = driverLicenses.filter(lic => lic.id === license);
        return (licenses = licenses.concat(
          label.length && label[0].name + " - "
        ));
      });
    }
    return licenses;
  };

  const onValidateMissionModel = () => {
    if (!agreementValidated) {
      return showSimulator();
    } else {
      dispatch(
        validateMission.request(
          {
            ...missionToDisplay,
            MissionIsValidated: true,
            IsCreateTemplate: true
          },
          { id: missionToDisplay.id }
        )
      );
    }
  };

  const onValidateMission = () => {
    if (!agreementValidated) {
      return showSimulator();
    } else {
      dispatch(
        validateMission.request(
          {
            ...missionToDisplay,
            MissionIsValidated: true,
            IsCreateTemplate: false
          },
          { id: missionToDisplay.id }
        )
      );
    }
  };

  const showSimulator = () => {
    setToogleSimilator(true);
  };

  const hideSimulator = () => {
    setToogleSimilator(false);
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

  if (loading) {
    return (
      <div className="card card-custom gutter-b">
        <div className="card-body">
          <div className="d-flex mb-9">
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between flex-wrap mt-1">
                <div className="mission-form d-flex mr-3">
                  <div className="spinner spinner-primary mr-15"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (missionToDisplay === null || updateMissionSuccess) {
    return <Redirect to="/missions" />;
  } else {
    return (
      <>
        <div className="card card-custom gutter-b">
          {toggleSimulator && (
            <SimulatorModal
              hideSimulator={hideSimulator}
              hourlySalary={
                missionToDisplay.vacancyContractualProposedHourlySalary
              }
              startDate={
                missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
              }
              endDate={
                missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
              }
              startHour={missionToDisplay.missionStartHour}
              endHour={missionToDisplay.missionEndHour}
              accountID={missionToDisplay.accountID}
              //accountID={missionToDisplay.workSiteID}
              jobTitleID={missionToDisplay.jobTitleID}
              setAgreementValidated={setAgreementValidated}
              similatorStatus=""
              weeklyHours={missionToDisplay.missionWeeklyWorkHours}
            />
          )}
          <div className="card-body">
            <div className="d-flex mb-9">
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between flex-wrap mt-1">
                  <div className="mission-form d-flex mr-3">
                    <h3 className="group-title mr-3">
                      {missionToDisplay.vacancyTitle} du{" "}
                      {!isNullOrEmpty(
                        missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
                      )
                        ? Moment(
                            missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
                          )
                            .locale("fr")
                            .format("DD MMMM YYYY")
                        : null}{" "}
                      au{" "}
                      {!isNullOrEmpty(
                        missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
                      )
                        ? Moment(
                            missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
                          )
                            .locale("fr")
                            .format("DD MMMM YYYY")
                        : null}
                    </h3>
                    <i className="flaticon2-correct text-success font-size-h5"></i>
                  </div>
                  {(!missionToDisplay.missionIsValidated &&
                    isPreview === "true") ||
                  isPreview !== "true" ? (
                    <div className="my-lg-0 my-3">
                      <button
                        onClick={() => handleClickEdit()}
                        type="button"
                        className="btn btn-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.EDIT" />
                      </button>
                      <button
                        onClick={showSimulator}
                        type="button"
                        className="btn btn-warning btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.SIMULATE.COST" />
                      </button>
                      <button
                        onClick={onValidateMissionModel}
                        type="button"
                        className="btn btn-success btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.VALIDATE_MODEL" />
                      </button>

                      <button
                        onClick={onValidateMission}
                        type="button"
                        className="btn btn-info btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.VALIDATE" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={showSimulator}
                        type="button"
                        className="btn btn-warning btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        <FormattedMessage id="BUTTON.SIMULATE.COST" />
                      </button>
                      <button
                        onClick={() => {
                          props.history.goBack();
                          localStorage.setItem("isPreview", false);
                        }}
                        type="button"
                        className="btn btn-info btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                      >
                        Retour
                      </button>
                    </div>
                  )}
                </div>
                <div className="d-flex flex-wrap justify-content-between mt-1">
                  <div className="d-flex flex-column flex-grow-1 pr-8">
                    <span className="font-weight-bolder font-size-sm mb-2">
                      Caractéristiques du poste
                    </span>
                    <p className="m-0 ml-3text-justify">
                      {missionToDisplay.vacancyMissionDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="separator separator-solid"></div>
            <div className="d-flex align-items-center flex-wrap mt-8">
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
                  <i className="display-4 text-primary flaticon-graphic-1"></i>
                </span>
                <div className="d-flex flex-column text-dark-75">
                  <span className="font-weight-bolder font-size-sm">
                    <FormattedMessage id="MODEL.VACANCY.MOTIF" />
                  </span>
                  <span className="font-weight-bolder font-size-h5">
                    {formatReason()}
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
                    <span className="text-dark-50 font-weight-bold ml-1">
                      €
                    </span>
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
                    {"de " +
                      missionToDisplay.missionStartHour +
                      " à " +
                      missionToDisplay.missionEndHour}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
                <span className="mr-4">
                  <i className="display-4 text-primary flaticon-calendar-with-a-clock-time-tools"></i>
                </span>
                <div className="d-flex flex-column text-dark-75">
                  <span className="font-weight-bolder font-size-sm">
                    <FormattedMessage id="DISPLAY.WEEKLY.SCHEDULE" />
                  </span>
                  <span className="font-weight-bolder font-size-h5">
                    {missionToDisplay.missionWeeklyWorkHours}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center flex-lg-fill mr-5 mb-2">
                <span className="mr-4">
                  <i className="display-4 text-primary flaticon-users"></i>
                </span>
                <div className="d-flex flex-column text-dark-75">
                  <span className="font-weight-bolder font-size-sm">
                    <FormattedMessage id="DISPLAY.JOBS.COUNT" />
                  </span>
                  <span className="font-weight-bolder font-size-h5">
                    {missionToDisplay.vacancyNumberOfJobs}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card card-custom card-stretch gutter-b">
              <div className="card-header border-0 pt-5">
                <h3 className="card-title align-items-start flex-column">
                  <span className="card-label font-weight-bolder text-dark">
                    <FormattedMessage id="DISPLAY.MISSION.DETAILS" />
                  </span>
                </h3>
              </div>
              <div className="card-body pt-2 pb-0 mt-n3">
                {/* Rémunération et salaire */}
                <div className=" row d-flex flex-column col-lg-12 justifify-content-center">
                  <div className="d-flex flex-row mt-5">
                    <div>
                      <i className="fas fa-euro-sign icon-xl icon-blue"></i>
                    </div>
                    <div className="d-flex flex-column ml-3">
                      <h3 className="group-title">
                        <FormattedMessage id="DISPLAY.MISSION.SALARY.EXCEPT.IFM" />
                      </h3>
                    </div>
                  </div>

                  <div className="d-flex flex-row col-lg-12  ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Rémunération</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {
                          missionToDisplay.vacancyContractualProposedHourlySalary
                        }{" "}
                        <FormattedMessage id="DISPLAY.UNIT.PER.HOUR" />
                      </p>
                    </div>
                  </div>

                  <div className="d-flex flex-row col-lg-12  ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Complément</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionSalarySupplement}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex flex-row col-lg-12 ml-3">
                    <div className="col-lg-4">
                      <p className="block-title">
                        <FormattedMessage id="DISPLAY.OTHER.REMUNERATION" />
                      </p>
                    </div>
                    <div className="col-lg-8">{formatRemuneration()}</div>
                  </div>
                </div>
                {/* Fin Rémunération et salaire */}
                {/* Horaire pour la mission */}

                <div className="row d-flex flex-column col-lg-12 justifify-content-center">
                  <div className="d-flex flex-row mt-5">
                    <div>
                      <i className="far fa-clock icon-xl icon-blue"></i>
                    </div>
                    <div className="d-flex flex-column ml-3">
                      <h3 className="group-title">Horaire pour la mission</h3>
                    </div>
                  </div>

                  <div className="d-flex flex-row col-lg-12 justify-content-around ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Date de début</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {!isNullOrEmpty(
                          missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
                        )
                          ? Moment(
                              missionToDisplay.vacancyContractualVacancyEmploymentContractTypeStartDate
                            )
                              .locale("fr")
                              .format("DD MMMM YYYY")
                          : null}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">Date de fin</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {!isNullOrEmpty(
                          missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
                        )
                          ? Moment(
                              missionToDisplay.vacancyContractualVacancyEmploymentContractTypeEndDate
                            )
                              .locale("fr")
                              .format("DD MMMM YYYY")
                          : null}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex flex-row col-lg-12 justify-content-around ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Horaire de début</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionStartHour}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">Horaire de fin</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionEndHour}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">
                        Nombre d'heure hebdomadaires
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionWeeklyWorkHours}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="DISPLAY.COMPLEMENT.HOUR" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionHourlySupplement &&
                          missionToDisplay.missionHourlySupplement}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Fin Horaire pour la mission */}
                {/* Précision pour la mission */}
                <div className="row d-flex flex-column col-lg-12 justifify-content-center">
                  <div className="d-flex flex-row mt-5">
                    <div>
                      <i className="fas fa-bars icon-xl icon-blue"></i>
                    </div>
                    <div className="d-flex flex-column ml-3">
                      <h3 className="group-title">
                        <FormattedMessage id="TEXT.MISSIONS_DETAILS" />
                      </h3>
                    </div>
                  </div>

                  <div className="d-flex flex-row col-lg-12 justify-content-around ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="MODEL.VACANCY.CONTACT_NAME" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionContactName}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="MODEL.VACANCY.EQUIPMENT" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">{formatEquipment()}</p>
                    </div>
                  </div>
                  <div className="d-flex flex-row col-lg-12 justify-content-around ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="MODEL.VACANCY.MOTIF" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">{formatReason()}</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="DISPLAY.REASON.PROOF" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionReasonJustification}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="DISPLAY.35H.INFOS" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.mission35HInformation}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Véhicule</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionHasVehicle ? "Oui" : "Non"}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="MODEL.VACANCY.DRIVERLICENCE" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">{formatLicenses()}</p>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="TEXT.HABILITATIONS" />
                      </p>
                    </div>
                    <div className="col-lg-9">
                      <p className="font-weight-bolder">
                        {formatHabilitations()}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Distance</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay?.matchingPostalCodeDistance
                          ? missionToDisplay.matchingPostalCodeDistance
                          : "0"}
                        km
                      </p>
                    </div>
                  </div>
                </div>
                {/* Fin Précision pour la mission */}
                {/* Premier Jour */}
                <div className="row d-flex flex-column col-lg-12 justifify-content-center">
                  <div className="d-flex flex-row mt-5">
                    <div>
                      <i className="far fa-user icon-xl icon-blue"></i>
                    </div>
                    <div className="d-flex flex-column ml-3">
                      <h3 className="group-title">
                        <FormattedMessage id="DISPLAY.FIRST.DAY.INFOS" />
                      </h3>
                    </div>
                  </div>

                  <div className="d-flex flex-row col-lg-12 justify-content-around ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Contact sur place</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionFirstDayContactName}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="DISPLAY.CONTACT.CONTACT.INFOS" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionFirstDayContactPhone &&
                          missionToDisplay.missionFirstDayContactPhone.replace(
                            /(.{2})(?!$)/g,
                            "$1 "
                          )}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex flex-row col-lg-12 justify-content-around ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Lieu du rendez-vous</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionFirstDayAddress}
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="block-title">Complément d'adresse</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionFirstDayAdditionalAddress}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">
                        <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                      </p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {missionToDisplay.missionFirstDayPostalCode}
                      </p>
                    </div>
                    <div className="d-flex col-lg-12 flex-row ">
                      <div className="col-lg-3">
                        <p className="block-title">
                          <FormattedMessage id="MODEL.ACCOUNT.CITY" />
                        </p>
                      </div>
                      <div className="col-lg-3">
                        <p className="font-weight-bolder">
                          {missionToDisplay.missionFirstDayCity}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex col-lg-12 flex-row ml-3">
                    <div className="col-lg-3">
                      <p className="block-title">Heure de rendez-vous</p>
                    </div>
                    <div className="col-lg-3">
                      <p className="font-weight-bolder">
                        {!isNullOrEmpty(
                          missionToDisplay.missionFirstDayAddress
                        ) && missionToDisplay.missionFirstDayMeetingTime}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Fin Premier Jour */}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card card-custom card-stretch gutter-b">
              <div className="card-header border-0">
                <h3 className="card-title font-weight-bolder text-dark">
                  Profil recherché
                </h3>
              </div>
              <div className="card-body pt-0">
                <div className="d-flex align-items-center mb-9 bg-light-primary rounded p-5">
                  <span className="mr-4">
                    <i className="display-4 text-primary flaticon-layers"></i>
                  </span>
                  <div className="d-flex flex-column flex-grow-1 mr-2">
                    <span className="font-weight-bold text-dark-75 text-hover-primary font-size-lg mb-1">
                      Experience
                    </span>
                    <p className="text-muted font-weight-bold">
                      {formatExperiences()}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-light-info rounded p-5 mb-9">
                  <span className="mr-4">
                    <i className="display-4 text-primary flaticon-book"></i>
                  </span>
                  <div className="d-flex flex-column flex-grow-1 mr-2">
                    <span className="font-weight-bold text-dark-75 text-hover-primary font-size-lg mb-1">
                      <FormattedMessage id="DISPLAY.FORMATION" />
                    </span>
                    <p className="text-muted font-weight-bold">
                      {formatEducation()}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-light-primary rounded p-5 mb-9">
                  <span className="mr-4">
                    <i className="display-4 text-primary flaticon-businesswoman"></i>
                  </span>
                  <div className="d-flex flex-column flex-grow-1 mr-2">
                    <span className="font-weight-bold text-dark-75 text-hover-primary font-size-lg mb-1">
                      Langues
                    </span>
                    <p className="text-muted font-weight-bold">
                      {formatLangages()}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-light-info rounded p-5 mb-9">
                  <span className="mr-4">
                    <i className="display-4 text-primary flaticon-like"></i>
                  </span>
                  <div className="d-flex flex-column flex-grow-1 mr-2">
                    <span className="font-weight-bold text-dark-75 text-hover-primary font-size-lg mb-1">
                      <FormattedMessage id="MODEL.COMPETENCES" />
                    </span>
                    <p className="text-muted font-weight-bold">
                      {formatSkills()}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-light-primary rounded p-5 mb-9">
                  <span className="mr-4">
                    <i className="display-4 text-primary flaticon-notes"></i>
                  </span>
                  <div className="d-flex flex-column flex-grow-1 mr-2">
                    <span className="font-weight-bold text-dark-75 text-hover-primary font-size-lg mb-1">
                      Tags
                    </span>
                    <p className="text-muted font-weight-bold">
                      {formatTags()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default FinalStep;

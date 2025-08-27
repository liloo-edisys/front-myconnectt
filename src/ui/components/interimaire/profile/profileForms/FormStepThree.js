/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";

import { Row, Col, Modal, Button, Alert, ProgressBar } from "react-bootstrap";
import _ from "lodash";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import { DeleteExperienceModal } from "../profileModals/DeleteExperienceModal";
import { updateApplicant } from "actions/client/ApplicantsActions";
import { parseResume as parseResumeActions } from "actions/interimaire/InterimairesActions";
import { parseResume } from "api/interimaire/InterimairesApi";
import { getMissionEquipment } from "../../../../../business/actions/shared/ListsActions";
import { getHabilitationsList } from "actions/client/MissionsActions";
import uuid from "react-uuid";
import NewExperience from "../../home/fieldsets/new-experience/NewExperience";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import CVModificationModal from "./CVModificationModal";
import { getApplicantById } from "actions/client/ApplicantsActions";

// =============================================
// IMPORT DU CVDrawer
// =============================================
import CVDrawer, { useCVDrawer } from "../../../shared/CVDrawer/CVDrawer";

// =============================================
// COMPOSANT MODAL DE MODIFICATION DE CV (INLINE)
// =============================================

function FormStepThree(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = process.env.REACT_APP_TENANT_ID;

  // =============================================
  // HOOK CVDrawer
  // =============================================
  const { isOpen, currentPdfUrl, openDrawer, closeDrawer } = useCVDrawer();

  const optionsTime = {
    month: "short",
    year: "numeric"
  };

  const { parsed, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      companies: state.companies.companies,
      parsed: state.interimairesReducerData.interimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );

  const [experience, setExperience] = useLocalStorage(
    "experience",
    parsed && parsed.applicantExperiences ? parsed.applicantExperiences : []
  );
  const [files, setFiles] = useLocalStorage("resume", []);
  const [show, setShow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorArray, setErrorArray] = useState([]);
  const [url, setUrl] = useState(null);
  const [toogleExperienceForm, setToogleExperienceForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [emptyArrayError, setEmptyArrayError] = useState(false);
  const [resume, setResume] = useState(
    parsed && parsed.primaryCurriculumVitaeUrl
      ? parsed.primaryCurriculumVitaeUrl
      : null
  );

  // =============================================
  // ÉTAT POUR LA MODAL DE MODIFICATION DE CV
  // =============================================
  const [showCVModal, setShowCVModal] = useState(false);

  const [currentRow, setCurrentRow] = useState([]);

  // =============================================
  // HANDLER POUR OUVRIR LE CVDrawer
  // =============================================
  const handleViewCV = e => {
    e.preventDefault();
    if (url) {
      console.log("🔍 Ouverture CVDrawer avec URL:", url);
      openDrawer(url);
    } else {
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        "Aucun CV disponible pour l'affichage"
      );
    }
  };

  // =============================================
  // HANDLERS POUR LA MODAL DE MODIFICATION DE CV
  // =============================================
  const handleModifyCV = () => {
    setShowCVModal(true);
  };

  const handleCloseCVModal = () => {
    setShowCVModal(false);
  };

  const onHide = () => {
    setShow(false);
    setShowDelete(false);
    setShowEdit(false);
    setCurrentRow([]);
  };

  const handleDataUpdate = async updateResult => {
    try {
      console.log("Mise à jour terminée, refresh des données...", updateResult);

      if (updateResult.success && updateResult.applicantId) {
        // Utiliser l'action existante pour re-fetch les données de l'applicant
        dispatch(getApplicantById.request(updateResult.applicantId));

        // Optionnel : mettre à jour aussi les expériences locales immédiatement
        if (updateResult.experiences) {
          setExperiences(updateResult.experiences);
          props.formik &&
            props.formik.setFieldValue(
              "applicantExperiences",
              updateResult.experiences
            );
        }

        console.log(
          "Données refresh déclenchées pour l'applicant:",
          updateResult.applicantId
        );
      }
    } catch (error) {
      console.error("Erreur lors du refresh des données:", error);
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        "Erreur lors de la synchronisation"
      );
    }
  };

  const [experiences, setExperiences] = useState(
    parsed && parsed.applicantExperiences ? parsed.applicantExperiences : []
  );

  const saveArrayActivityDomains = newMissionArrayDesiredJobTitles => {
    localStorage.setItem(
      "missionArrayDesiredJobTitles",
      JSON.stringify(newMissionArrayDesiredJobTitles)
    );
  };

  saveArrayActivityDomains(parsed.missionArrayDesiredJobTitles || []);

  useEffect(() => {
    const saveArrayActivityDomains = newMissionArrayDesiredJobTitles => {
      localStorage.setItem(
        "missionArrayDesiredJobTitles",
        JSON.stringify(newMissionArrayDesiredJobTitles)
      );
    };
    saveArrayActivityDomains();
    console.log("parsed value ------->", parsed.missionArrayDesiredJobTitles);
  }, [parsed]);

  useEffect(() => {
    parsed &&
      parsed.primaryCurriculumVitaeUrl &&
      isNullOrEmpty(resume) &&
      setResume(parsed.primaryCurriculumVitaeUrl);
    isNullOrEmpty(url) &&
      parsed &&
      !isNullOrEmpty(parsed.primaryCurriculumVitaeUrl) &&
      setUrl(encoreUrl(parsed.primaryCurriculumVitaeUrl));
    if (parsed && parsed.applicantExperiences) {
      let errorArrayTemp = [];
      const { applicantExperiences } = parsed;
      for (let i = 0; i < experiences.length; i++) {
        if (
          !experiences[i].jobTitle ||
          !experiences[i].employerNameAndPlace ||
          !experiences[i].startDate ||
          (!experiences[i].endDate && experiences[i].isCurrentItem === "False")
        ) {
          if (experiences[i].id) {
            errorArrayTemp.push(experiences[i].id);
          } else {
            errorArrayTemp.push(experiences[i].id_temp);
          }
        }
      }
      if (errorArrayTemp.length > 0) {
        setErrorArray(errorArrayTemp);
      }
    }

    props.formik &&
      props.formik.values &&
      !isNullOrEmpty(experiences) &&
      props.formik.setFieldValue("applicantExperiences", experiences);
  }, [parsed, experiences]);

  useEffect(() => {
    dispatch(getMissionEquipment.request());
    getHabilitationsList(dispatch);

    props.formik &&
      props.formik.values &&
      isNullOrEmpty(props.formik.values.applicantExperiences) &&
      !isNullOrEmpty(experiences) &&
      props.formik.setFieldValue("applicantExperiences", experiences);
  }, [parsed]);

  let formattedXp = () => {
    let xp = experiences.map((val, ix) => {
      val.keyField = ix;
      return val;
    });
    return xp;
  };

  const deleteExperience = () => {
    let xp = formattedXp();
    const updatedHero = xp.filter(
      item => item.keyField !== currentRow.keyField
    );
    setExperiences(updatedHero);
    props.formik.setFieldValue("applicantExperiences", updatedHero);
  };
  useFormikContext();

  const openDeleteModal = row => {
    setShowDelete(true);
    setCurrentRow(row);
  };

  const getBase64 = file => {
    return new Promise(resolve => {
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  const handleChangePage = () => {
    const { applicantExperiences } = parsed;
    if (experiences.length === 0) {
      return toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        intl.formatMessage({ id: "TEXT.EXPERIENCE.MIN.ERROR" })
      );
    }
    if (errorArray.length > 0) {
      return toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        intl.formatMessage({ id: "TEXT.EXPERIENCE.ERROR" })
      );
    }

    // Préparer les données à envoyer avec missionArrayDesiredJobTitles
    const dataToSend = {
      ...props.formik.values,
      missionArrayDesiredJobTitles: parsed.missionArrayDesiredJobTitles || []
    };

    dispatch(updateApplicant.request(dataToSend));
  };

  // =============================================
  // FONCTION DE MISE À JOUR DU CV POUR LA MODAL
  // =============================================
  const handleCVUpdate = async file => {
    setLoading(true);
    setUrl(null);

    try {
      const base64Result = await getBase64(file);
      file["base64"] = base64Result;
      let stringBase64 = base64Result.split(",")[1];

      const data = await parseResume({
        tenantID: parseInt(TENANTID),
        applicantID: parsed.id,
        document: stringBase64,
        Filename: file.name
      });

      let newExperiencesArray = [];
      const { applicantExperiences } = data.data;

      for (let i = 0; i < applicantExperiences?.length; i++) {
        if (applicantExperiences[i]?.id === 0) {
          let newObject = {
            ...applicantExperiences[i],
            id_temp: uuid()
          };
          delete newObject.id;
          newExperiencesArray.push(newObject);
        }
      }

      data.data.applicantExperiences = newExperiencesArray;
      dispatch(parseResumeActions.success(data));
      setUrl(encoreUrl(data.data.primaryCurriculumVitaeUrl));

      toastr.success("Succès", "CV mis à jour avec succès");

      return data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du CV:", err);
      // toastr.error(
      //   intl.formatMessage({ id: "ERROR" }),
      //   "Erreur lors de la mise à jour du CV"
      // );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  function encoreUrl(str) {
    let newUrl = "";
    const len = str && str.length;
    let url;
    for (let i = 0; i < len; i++) {
      let c = str.charAt(i);
      let code = str.charCodeAt(i);

      if (c === " ") {
        newUrl += "+";
      } else if (
        (code < 48 && code !== 45 && code !== 46) ||
        (code < 65 && code > 57) ||
        (code > 90 && code < 97 && code !== 95) ||
        code > 122
      ) {
        newUrl += "%" + code.toString(16);
      } else {
        newUrl += c;
      }
    }
    if (newUrl.indexOf(".doc") > 0 || newUrl.indexOf(".docx") > 0) {
      url = "https://view.officeapps.live.com/op/embed.aspx?src=" + newUrl;
    } else {
      url =
        "https://docs.google.com/gview?url=" +
        newUrl +
        "&embedded=true&SameSite=None";
    }
    setLoading(false);
    return url;
  }

  const onSelectExperience = experience => {
    // setErrorArray([]);
    setToogleExperienceForm(true);
    let newExperience = {
      id: experience.id,
      id_temp: experience.id_temp,
      jobTitle: experience.jobTitle === null ? "" : experience.jobTitle,
      employerNameAndPlace:
        experience.employerNameAndPlace === null
          ? ""
          : experience.employerNameAndPlace,
      startDate:
        experience.startDate === null || experience.startDate === ""
          ? ""
          : new Date(experience.startDate),
      endDate:
        experience.endDate === null || experience.endDate === ""
          ? ""
          : new Date(experience.endDate),
      isCurrentItem: experience.isCurrentItem
    };

    setSelectedExperience(newExperience);
  };

  const showExperienceForm = () => {
    // setErrorArray([]);
    setToogleExperienceForm(true);
  };

  const hideExperienceForm = () => {
    setToogleExperienceForm(false);
  };

  const onDeleteExperience = value => {
    setErrorArray(value);
  };

  return (
    <>
      <div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px display_top_menu_profile">
          <MissionWizzardHeader props={props} />
        </div>
        <div className="flex-row-fluid ml-lg-8">
          <div className="card card-custom">
            <div className="card-body p-0">
              <div className="wizard wizard-2">
                <div
                  className="wizard-body py-8 px-8"
                  style={{ overflowX: "auto" }}
                >
                  <div className="border-bottom mb-5 row pb-3">
                    <div className="col-lg-12 col-xl-4 align-left">
                      <div
                        className={
                          parsed && parsed.primaryCurriculumVitaeFilename
                            ? "btn card card-custom font-weight-bolder bg-success "
                            : "btn card card-custom font-weight-bolder"
                        }
                        style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
                      >
                        <div className="flex-space-between">
                          <i
                            className={
                              parsed && parsed.primaryCurriculumVitaeFilename
                                ? "fas fa-file-alt icon-xxl font-weight-bold label-inline ml-5 white"
                                : "fas fa-file-alt icon-xxl font-weight-bold label-inline ml-5"
                            }
                          ></i>
                          <div>
                            {/* =============================================
                                BOUTON POUR VOIR LE CV
                                ============================================= */}
                            <button
                              className="btn btn-light-primary"
                              onClick={handleViewCV}
                              disabled={!url}
                              type="button"
                            >
                              <i className="fas fa-eye mr-2"></i>
                              Voir mon CV
                            </button>

                            {/* =============================================
                                BOUTON POUR MODIFIER LE CV (MODAL)
                                ============================================= */}
                            <button
                              className="btn btn-light-primary ml-5"
                              onClick={handleModifyCV}
                              type="button"
                            >
                              <i className="fas fa-edit mr-2"></i>
                              <FormattedMessage
                                id="TEXT.CHANGE_CV.TITLE"
                                defaultMessage="Modifier mon CV"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-12 col-xl-4">
                      <div
                        onClick={showExperienceForm}
                        className="btn-responsive btn btn-warning font-weight-bold btn-shadow my-3 mx-4"
                      >
                        <span>
                          <FormattedMessage id="TEXT.ADD.XP" />
                        </span>
                      </div>
                    </div>
                    <div className="col-sm-12 col-xl-4 align-right">
                      <button
                        type="button"
                        className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                        onClick={handleChangePage}
                        disabled={updateInterimaireIdentityLoading}
                      >
                        <span>
                          <FormattedMessage id="BUTTON.SAVE" />
                        </span>
                        {updateInterimaireIdentityLoading && (
                          <span className="ml-3 spinner spinner-white"></span>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="row mx-10-responsive">
                    <div className="pb-5 width-full">
                      <NewExperience
                        selectedExperience={selectedExperience}
                        hideExperienceForm={hideExperienceForm}
                        toogleExperienceForm={toogleExperienceForm}
                        setSelectedExperience={setSelectedExperience}
                        setEmptyArrayError={setEmptyArrayError}
                        errorArray={errorArray}
                        setErrorArray={setErrorArray}
                      />
                      <DeleteExperienceModal
                        row={currentRow}
                        deleteExperience={deleteExperience}
                        show={showDelete}
                        onHide={onHide}
                        errorArray={errorArray}
                        onDeleteExperience={onDeleteExperience}
                        setEmptyArrayError={setEmptyArrayError}
                      />
                      <Row className="pt-5 ">
                        {formattedXp().map(experience => (
                          <Col
                            xl={4}
                            lg={12}
                            key={
                              experience.id ? experience.id : experience.id_temp
                            }
                          >
                            <div
                              className="card card-custom  gutter-b py-5"
                              style={{
                                boxShadow:
                                  errorArray.includes(experience.id) ||
                                  errorArray.includes(experience.id_temp)
                                    ? `3px 3px 3px 3px #f76775`
                                    : `3px 3px 3px 3px lightgrey`
                              }}
                            >
                              <div className="card-header border-0">
                                <div className="experience-title-container">
                                  <h3 className="card-title font-weight-bolder text-dark ">
                                    <div className="job_title_experience">
                                      {experience.jobTitle}
                                    </div>
                                  </h3>
                                  <div className="experience-button-container">
                                    <div
                                      className="input-group-text bg-light-info action-button edit-button"
                                      onClick={() =>
                                        onSelectExperience(experience)
                                      }
                                    >
                                      <i className="icon-l flaticon-edit-1 text-info"></i>
                                    </div>
                                    <div
                                      className="input-group-text bg-light-danger action-button"
                                      onClick={() =>
                                        openDeleteModal(experience)
                                      }
                                    >
                                      <i className="icon-l flaticon-delete text-danger"></i>
                                    </div>
                                  </div>
                                </div>
                                <div>{experience.employerNameAndPlace}</div>
                              </div>
                              <div className="card-body pt-2">
                                <div>
                                  {new Date(
                                    experience.startDate
                                  ).toLocaleString("fr-FR", optionsTime)}{" "}
                                  -{" "}
                                  {experience.endDate &&
                                    new Date(experience.endDate).toLocaleString(
                                      "fr-FR",
                                      optionsTime
                                    )}
                                </div>
                                <div className="pt-2">
                                  En poste:{" "}
                                  {experience.isCurrentItem === "False"
                                    ? "Non"
                                    : "Oui"}
                                </div>
                                <div className="experience-button-container-bottom mt-5">
                                  <div
                                    className="input-group-text bg-light-info action-button edit-button"
                                    onClick={() =>
                                      onSelectExperience(experience)
                                    }
                                  >
                                    <i className="icon-l flaticon-edit-1 text-info"></i>
                                  </div>
                                  <div
                                    className="input-group-text bg-light-danger action-button"
                                    onClick={() => openDeleteModal(experience)}
                                  >
                                    <i className="icon-l flaticon-delete text-danger"></i>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                      <div className="h-30">
                        {errorArray.length > 0 && (
                          <div
                            style={{
                              color: "#F64E60",
                              textAlign: "center",
                              fontSize: "15px"
                            }}
                          >
                            <i className="flaticon-warning-sign  text-danger mr-5 icon-lg"></i>
                            <FormattedMessage id="TEXT.EXPERIENCE.ERROR" />
                          </div>
                        )}
                      </div>
                      <div className="h-30">
                        {emptyArrayError && (
                          <div
                            style={{
                              color: "#F64E60",
                              textAlign: "center",
                              fontSize: "15px"
                            }}
                          >
                            <i className="flaticon-warning-sign  text-danger mr-5 icon-lg"></i>
                            <FormattedMessage id="TEXT.EXPERIENCE.MIN.ERROR" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="display_bottom_menu_profile">
        <MissionWizzardHeader props={props} />
      </div>

      {/* =============================================
          CVDrawer INTÉGRÉ
          ============================================= */}
      <CVDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        pdfUrl={currentPdfUrl}
        title="Mon CV"
        width="70%"
        position="left"
        downloadFileName={parsed?.primaryCurriculumVitaeFilename || "CV.pdf"}
        showControls={true}
        backdrop={true}
        onError={error => {
          console.error("Erreur CVDrawer:", error);
          toastr.error(
            intl.formatMessage({ id: "ERROR" }),
            "Erreur lors de l'affichage du CV"
          );
        }}
        onLoad={data => {
          console.log("CV chargé avec succès:", data);
        }}
      />

      {/* =============================================
          MODAL DE MODIFICATION DE CV - TEMPORAIREMENT COMMENTÉE
          ============================================= */}

      <CVModificationModal
        show={showCVModal}
        onHide={handleCloseCVModal}
        onCVUpdate={handleCVUpdate}
        onDataUpdate={handleDataUpdate}
        intl={intl}
        loading={loading}
        currentCVFilename={parsed?.primaryCurriculumVitaeFilename}
      />
    </>
  );
}

export default injectIntl(FormStepThree);

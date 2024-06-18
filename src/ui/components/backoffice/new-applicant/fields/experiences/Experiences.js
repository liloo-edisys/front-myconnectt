/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Field } from "formik";
import { Row, Col } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { Zoom } from "react-reveal";
import _ from "lodash";
import { Input } from "metronic/_partials/controls";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { countMatching } from "actions/client/ApplicantsActions";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../../shared/PersistState";
import MissionWizzardHeader from "../../MissionWizzardHeader";
import moment from "moment";
import BootstrapTable from "react-bootstrap-table-next";
import DateColumnFormatter from "./DateColumnFormatter";
import ActionsColumnFormatter from "./ActionsColumnFormatter";
import { updateApplicant } from "actions/client/ApplicantsActions";
import { parseResume as parseResumeActions } from "actions/interimaire/InterimairesActions";
import { parseResume } from "api/interimaire/InterimairesApi";
import { getMissionEquipment } from "../../../../../../business/actions/shared/ListsActions";
import { getHabilitationsList } from "actions/client/MissionsActions";
import uuid from "react-uuid";
import {
  NewExperience,
  DeleteExperienceModal,
  ProfileExperiencesModal
} from "./experience-actions";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import axios from "axios";
import { updateSelectedApplicant } from "../../../../../../business/actions/backoffice/ApplicantActions";
import { toastr } from "react-redux-toastr";
import { getApplicantById } from "actions/client/ApplicantsActions";
import { getSelectedApplicantById } from "../../../../../../business/actions/backoffice/ApplicantActions";

function Experiences(props, formik) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { intl } = props;
  const TENANTID = process.env.REACT_APP_TENANT_ID;

  const optionsTime = {
    month: "short",
    year: "numeric"
  };

  /*const { companies, interimaire } = useSelector(
    (state) => ({
      companies: state.companies.companies,
      interimaire: state.interimairesReducerData.interimaire,
    }),
    shallowEqual
  );*/
  const { companies, interimaire } = useSelector(
    state => ({
      companies: state.companies.companies,
      interimaire: state.accountsReducerData.activeInterimaire
    }),
    shallowEqual
  );

  const [experience, setExperience] = useState([]);
  const [files, setFiles] = useState([]);
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
    interimaire && interimaire.primaryCurriculumVitaeUrl
      ? interimaire.primaryCurriculumVitaeUrl
      : null
  );

  const [currentRow, setCurrentRow] = useState([]);
  const [cvLoading, setCvLoading] = useState(false);

  const createOption = (label, value) => ({
    label,
    value
  });
  const onHide = () => {
    setShow(false);
    setShowDelete(false);
    setShowEdit(false);
    setCurrentRow([]);
  };
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (interimaire && interimaire.applicantExperiences) {
      setExperiences(interimaire.applicantExperiences);
    }
    interimaire &&
      interimaire.primaryCurriculumVitaeUrl &&
      isNullOrEmpty(resume) &&
      setResume(interimaire.primaryCurriculumVitaeUrl);
    isNullOrEmpty(url) &&
      interimaire &&
      !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl) &&
      setUrl(encoreUrl(interimaire.primaryCurriculumVitaeUrl));
    if (interimaire && interimaire.applicantExperiences) {
      let errorArrayTemp = [];
      const { applicantExperiences } = interimaire;
      for (let i = 0; i < applicantExperiences.length; i++) {
        if (
          !applicantExperiences[i].jobTitle ||
          !applicantExperiences[i].employerNameAndPlace ||
          !applicantExperiences[i].startDate ||
          (!applicantExperiences[i].endDate &&
            applicantExperiences[i].isCurrentItem === "False")
        ) {
          if (applicantExperiences[i].id) {
            errorArrayTemp.push(applicantExperiences[i].id);
          } else {
            errorArrayTemp.push(applicantExperiences[i].id_temp);
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
  }, [interimaire]);

  useEffect(() => {
    dispatch(getMissionEquipment.request());
    getHabilitationsList(dispatch);

    props.formik &&
      props.formik.values &&
      isNullOrEmpty(props.formik.values.applicantExperiences) &&
      !isNullOrEmpty(experiences) &&
      props.formik.setFieldValue("applicantExperiences", experiences);
  }, [interimaire]);
  const useMountEffect = fun => useEffect(fun, []);
  const filterXp = value => {
    let filtered = _.filter(value, function(o) {
      return o.isDeleted !== true;
    });
    return filtered;
  };
  let formattedXp = () => {
    let xp = experiences.map((val, ix) => {
      val.keyField = ix;
      return val;
    });
    return xp;
  };
  const handleEditExperience = xp => {
    let newExperiences =
      interimaire && !isNullOrEmpty(interimaire.applicantExperiences)
        ? interimaire.applicantExperiences
        : [];
    newExperiences.push({ ...xp, id: isNaN(xp.id) ? 0 : 0 });
    props.formik.setFieldValue("applicantExperiences", newExperiences);
    setExperiences(interimaire.applicantExperiences);
  };

  const handleUpdateExperience = (xp, row) => {
    let newExperiences = experiences;
    newExperiences[row] = xp;
    props.formik.setFieldValue("applicantExperiences", newExperiences);
    setExperiences(newExperiences);
  };
  const deleteExperience = row => {
    let xp = formattedXp();
    const updatedHero = xp.filter(
      item => item.keyField !== currentRow.keyField
    );
    setExperiences(updatedHero);
    //props.formik.setFieldValue("applicantExperiences", updatedHero);
  };
  //const { errors, touched } = useFormikContext();

  const NoDataIndication = () => {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div
          className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
          role="alert"
        >
          <div className="alert-icon">
            <i className="flaticon-warning"></i>
          </div>
          <div className="alert-text">
            <FormattedMessage id="MESSAGE.NO.EXPERIENCE" />
          </div>
        </div>
      </div>
    );
  };

  const openDeleteModal = row => {
    setShowDelete(true);
    setCurrentRow(row);
  };

  const openEditModal = (row, rowIndex) => {
    setShowEdit(true);
    setCurrentRow({ ...row, index: rowIndex });
  };

  const getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";
      let reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  const handleChangePage = () => {
    let errorArrayTemp = [];
    const { applicantExperiences } = interimaire;
    for (let i = 0; i < applicantExperiences.length; i++) {
      if (
        !applicantExperiences[i].jobTitle ||
        !applicantExperiences[i].employerNameAndPlace ||
        !applicantExperiences[i].startDate ||
        (!applicantExperiences[i].endDate &&
          applicantExperiences[i].isCurrentItem === "False")
      ) {
        if (applicantExperiences[i].id) {
          errorArrayTemp.push(applicantExperiences[i].id);
        } else {
          errorArrayTemp.push(applicantExperiences[i].id_temp);
        }
      }
    }
    if (errorArrayTemp.length > 0) {
      return setErrorArray(errorArrayTemp);
    } else {
      dispatch(updateApplicant.request(props.formik.values));
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx",
    onDrop: acceptedFiles => {
      setCvLoading(true);
      let { file } = files;
      setUrl(null);
      file = acceptedFiles[0];
      getBase64(file)
        .then(result => {
          setCvLoading(true);
          file["base64"] = result;
          let stringBase64 = result.split(",")[1];

          let body = {
            tenantID: parseInt(TENANTID),
            applicantID: interimaire.id,
            document: stringBase64,
            Filename: file.name
          };

          axios
            .post(
              process.env.REACT_APP_WEBAPI_URL +
                "api/Applicant/ExtractApplicantCV",
              body
            )
            .then(data => {
              let newExperiencesArray = [];
              const { applicantExperiences } = data.data;
              for (let i = 0; i < applicantExperiences.length; i++) {
                if (applicantExperiences[i].id === 0) {
                  let newObject = {
                    ...applicantExperiences[i],
                    id_temp: uuid()
                  };
                  delete newObject.id;
                  newExperiencesArray.push(newObject);
                }
              }
              data.data.applicantExperiences = newExperiencesArray;
              updateSelectedApplicant(data.data, dispatch);
              //getSelectedApplicantById(data.data.id, dispatch);
              setUrl(encoreUrl(data.data.primaryCurriculumVitaeUrl));
              setCvLoading(false);
              /*dispatch(parseResumeActions.success(data));
            setUrl(encoreUrl(data.data.primaryCurriculumVitaeUrl));*/
            });
          return file;
        })
        .catch(err => {
          console.log(err);
          setCvLoading(false);
        });
    }
  });

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
    setErrorArray([]);
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
    setErrorArray([]);
    setToogleExperienceForm(true);
  };

  const hideExperienceForm = () => {
    setToogleExperienceForm(false);
  };

  const onSaveExperience = () => {
    if (errorArray.length > 0) {
      toastr.error(
        "Erreur",
        intl.formatMessage({ id: "TEXT.EXPERIENCE.ERROR" })
      );
    } else {
      const body = interimaire;
      setLoading(true);
      axios
        .put(process.env.REACT_APP_WEBAPI_URL + "api/Applicant", body)
        .then(res => {
          setLoading(false);
          toastr.success(
            intl.formatMessage({ id: "TITLE.INTERIMAIRE.CREATION" }),
            intl.formatMessage({ id: "MESSAGE.INTERIMAIRE.EDIT.SUCCESS" })
          );
        })
        .catch(err => {
          setLoading(false);
          let message = err.response.data.message && err.response.data.message;
          toastr.error(intl.formatMessage({ id: "ERROR" }), message);
        });
    }
  };
  return (
    <>
      <div className="wizard-body py-8 px-8" style={{ overflowX: "auto" }}>
        <div className="border-bottom mb-5 row pb-3">
          <div className="col-lg-12 col-xl-4 align-left">
            <div
              className={
                interimaire && interimaire.primaryCurriculumVitaeFilename
                  ? "btn card card-custom font-weight-bolder bg-success "
                  : "btn card card-custom font-weight-bolder"
              }
              style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
            >
              <div className="flex-space-between">
                <i
                  className={
                    interimaire && interimaire.primaryCurriculumVitaeFilename
                      ? "fas fa-file-alt icon-xxl font-weight-bold label-inline ml-5 white"
                      : "fas fa-file-alt icon-xxl font-weight-bold label-inline ml-5"
                  }
                ></i>
                <div>
                  <a
                    className="btn btn-light-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/document/display/${url}`}
                  >
                    Voir le CV
                  </a>
                  {/*<a
                    className="btn btn-light-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={url}
                  >
                    Voir mon CV
                  </a>*/}
                  <div
                    {...getRootProps()}
                    className="btn btn-light-primary ml-5 px-5"
                    style={{ minWidth: 160 }}
                  >
                    <input {...getInputProps()} />
                    {interimaire &&
                    interimaire.primaryCurriculumVitaeFilename ? (
                      <>
                        <FormattedMessage id="TEXT.CHANGE_CV.TITLE" />
                        {cvLoading && (
                          <span className="ml-3 spinner spinner-white"></span>
                        )}
                      </>
                    ) : (
                      <>
                        <FormattedMessage id="TEXT.LOAD_CV.TITLE" />
                        {cvLoading && (
                          <span className="ml-3 spinner spinner-white"></span>
                        )}
                      </>
                    )}
                  </div>
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
            <div
              className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              onClick={() => history.goBack()}
            >
              <span>
                <FormattedMessage id="BUTTON.BACK" />
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              onClick={onSaveExperience}
              disabled={loading}
            >
              <span>
                <FormattedMessage id="BUTTON.SAVE" />
              </span>
              {loading && <span className="ml-3 spinner spinner-white"></span>}
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
            />
            <DeleteExperienceModal
              row={currentRow}
              deleteExperience={deleteExperience}
              show={showDelete}
              onHide={onHide}
            />
            <Row className="pt-5 ">
              {formattedXp().map((experience, i) => (
                <Col
                  xl={4}
                  lg={12}
                  key={experience.id ? experience.id : experience.id_temp}
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
                            onClick={() => onSelectExperience(experience)}
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
                      <div>{experience.employerNameAndPlace}</div>
                    </div>
                    <div className="card-body pt-2">
                      <div>
                        {new Date(experience.startDate).toLocaleString(
                          "fr-FR",
                          optionsTime
                        )}{" "}
                        -{" "}
                        {experience.endDate &&
                          new Date(experience.endDate).toLocaleString(
                            "fr-FR",
                            optionsTime
                          )}
                      </div>
                      <div className="pt-2">
                        En poste:{" "}
                        {experience.isCurrentItem === "False" ? "Non" : "Oui"}
                      </div>
                      <div className="experience-button-container-bottom mt-5">
                        <button className="input-group-text bg-light-info action-button edit-button">
                          <i className="icon-l flaticon-edit-1 text-info"></i>
                        </button>
                        <button className="input-group-text bg-light-danger action-button">
                          <i className="icon-l flaticon-delete text-danger"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}

export default injectIntl(Experiences);

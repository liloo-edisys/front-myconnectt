import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import SVG from "react-inlinesvg";
import { Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormattedMessage, useIntl, injectIntl } from "react-intl";
import { Zoom } from "react-reveal";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import uuid from "react-uuid";
import { useDropzone } from "react-dropzone";
import "./styles.scss";
import {
  goToNextStep,
  removeExperience
} from "../../../../../../business/actions/interimaire/interimairesActions";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import useLocalStorage from "../../../../shared/persistState";
import isNullOrEmpty from "../../../../../../utils/isNullOrEmpty";
import { parseResume as parseResumeActions } from "actions/interimaire/interimairesActions";
import { parseResume } from "api/interimaire/interimairesApi";
import IframeGoogleDocs from "../../../../../../utils/googleHacks";
import { NewExperience } from "../new-experience";
import Moment from "moment";

function Experiences(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const { isLoading, interimaire, parsed, step } = useSelector(
    state => ({
      companies: state.companies.companies,
      interimaire: state.interimairesReducerData.interimaire,
      step: state.interimairesReducerData.step,
      parsed: state.interimairesReducerData.parsedInterimaire,
      isLoading: state.interimairesReducerData.loading
    }),
    shallowEqual
  );

  const { applicantExperiences } = interimaire;
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState(
    interimaire && interimaire.primaryCurriculumVitaeUrl
      ? interimaire.primaryCurriculumVitaeUrl
      : null
  );
  const [toogleExperienceForm, setToogleExperienceForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [errorArray, setErrorArray] = useState([]);
  const [emptyArrayError, setEmptyArrayError] = useState(false);
  const [limitSetted, setLimitSetted] = useState(true);

  const initialValues = {
    email: "",
    address: ""
  };

  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 16,
    height: 500,
    width: "100%",
    overflowY: "hidden"
  };

  const optionsTime = {
    month: "short",
    year: "numeric"
  };

  useEffect(() => {
    interimaire &&
      interimaire.primaryCurriculumVitaeUrl &&
      isNullOrEmpty(resume) &&
      setResume(interimaire.primaryCurriculumVitaeUrl);
    isNullOrEmpty(url) &&
      interimaire &&
      !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl) &&
      setUrl(encoreUrl(interimaire.primaryCurriculumVitaeUrl));
  }, [interimaire, url]);

  const RegistrationSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  const getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
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

  const [files, setFiles] = useLocalStorage("resume", []);
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .doc, .docx",
    onDrop: acceptedFiles => {
      setLoading(true);
      setEmptyArrayError(false);
      let { file } = files;
      setUrl(null);
      file = acceptedFiles[0];
      getBase64(file)
        .then(result => {
          setLoading(true);
          file["base64"] = result;
          let stringBase64 = result.split(",")[1];
          parseResume({
            tenantID: TENANTID,
            applicantID: interimaire.id,
            document: stringBase64,
            Filename: file.name
          }).then(data => {
            let newExperiencesArray = [];
            let errorArrayTemp = [];
            const { applicantExperiences } = data.data;
            for (let i = 0; i < applicantExperiences.length; i++) {
              if (applicantExperiences[i].id === 0) {
                let newObject = {
                  ...applicantExperiences[i],
                  id_temp: uuid()
                };
                delete newObject.id;

                if (
                  !newObject.jobTitle ||
                  !newObject.employerNameAndPlace ||
                  !newObject.startDate ||
                  (!newObject.endDate && newObject.isCurrentItem === "False")
                ) {
                  errorArrayTemp.push(newObject.id_temp);
                }
                newExperiencesArray.push(newObject);
              }
            }
            if (errorArrayTemp.length > 0) {
              setErrorArray(errorArrayTemp);
            }
            data.data.applicantExperiences = newExperiencesArray;
            dispatch(parseResumeActions.success(data));
            setUrl(encoreUrl(data.data.primaryCurriculumVitaeUrl));
          });
          return file;
        })
        /*.then(res => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          setFiles(res);
        })*/
        .catch(err => {
          console.log(err);
          setLoading(false);
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

  const valueRef = useRef();

  if (valueRef.current !== url) {
    valueRef.current = url;
  }

  const showExperienceForm = () => {
    setErrorArray([]);
    setToogleExperienceForm(true);
  };

  const hideExperienceForm = () => {
    setToogleExperienceForm(false);
  };

  const onSelectExperience = experience => {
    //setErrorArray([]);
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

  const onRemoveExperience = experience => {
    const experienceId = experience.id ? experience.id : experience.id_temp;

    const tempErrorArray = errorArray;
    const index = tempErrorArray.indexOf(experienceId);
    if (index > -1) {
      tempErrorArray.splice(index, 1);
      setErrorArray(tempErrorArray);
    }

    removeExperience(experienceId, dispatch);
  };

  const goToIdentityDocuement = () => {
    let errorArrayTemp = [];
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
    } else if (applicantExperiences.length <= 0) {
      return setEmptyArrayError(true);
    } else {
      goToNextStep(interimaire, step, dispatch);
    }
  };

  window.onscroll = () => {
    if (limitSetted) {
      setLimitSetted(false);
    }
  };

  const renderAnnoncesList = () => {
    if (applicantExperiences.length > 0) {
      applicantExperiences.sort(
        (b, a) =>
          new Moment(a.startDate).format("YYYYMMDD") -
          new Moment(b.startDate).format("YYYYMMDD")
      );
    }

    return (
      <Zoom duration={1000}>
        <Row className="pt-5 experiences-scroll">
          {applicantExperiences.map((experience, i) => (
            <Col
              xl={6}
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
                      <button
                        onClick={() => onSelectExperience(experience)}
                        className="input-group-text bg-light-info action-button edit-button"
                      >
                        <i className="icon-l flaticon-edit-1 text-info"></i>
                      </button>
                      <button
                        onClick={() => onRemoveExperience(experience)}
                        className="input-group-text bg-light-danger action-button"
                      >
                        <i className="icon-l flaticon-delete text-danger"></i>
                      </button>
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
                    <button
                      onClick={() => onSelectExperience(experience)}
                      className="input-group-text bg-light-info action-button edit-button"
                    >
                      <i className="icon-l flaticon-edit-1 text-info"></i>
                    </button>
                    <button
                      onClick={() => onRemoveExperience(experience)}
                      className="input-group-text bg-light-danger action-button"
                    >
                      <i className="icon-l flaticon-delete text-danger"></i>
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Zoom>
    );
  };

  return (
    <div style={{ margin: 10 }}>
      <NewExperience
        selectedExperience={selectedExperience}
        hideExperienceForm={hideExperienceForm}
        toogleExperienceForm={toogleExperienceForm}
        setSelectedExperience={setSelectedExperience}
        setEmptyArrayError={setEmptyArrayError}
        errorArray={errorArray}
        setErrorArray={setErrorArray}
      />
      <div className="card card-custom title_container_radius">
        <div className="card-home border-top-auth ribbon ribbon-top ribbon-ver">
          <h2>
            <span className="svg-icon svg-icon-3x svg-icon-danger document_icon">
              <SVG
                className="h-75 align-self-end"
                src={toAbsoluteUrl("/media/svg/icons/General/Shield-check.svg")}
              ></SVG>
            </span>
            <span>
              <FormattedMessage id="BUTTON.INTERIMAIRE.COMPLETE" />
            </span>
          </h2>
        </div>
      </div>
      <div className="row gutter-20"></div>
      <div className="card card-custom card-stretch gutter-b mt-10 p-5">
        <div className="p-5 card card-custom bg-primary white font-weight-bolder">
          <div className=" flex-space-between">
            <div className="flex-space-between">
              <i className="flaticon-information icon-xxl mr-5 white" />
              <FormattedMessage id="TEXT.INFORM.EXPERIENCES" />
            </div>
            <div>
              <i className="flaticon2-cross icon-l white" />
            </div>
          </div>
        </div>
        <div>
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={RegistrationSchema}
            setFieldValue
            onSubmit={(values, { setSubmitting }) => {
              goToNextStep();
            }}
          >
            {({ values, touched, errors, status, handleSubmit }) => (
              <Form
                id="kt_login_signin_form"
                className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
                onSubmit={handleSubmit}
              >
                <div className="padding-horizontal-20 pt-10">
                  {applicantExperiences && applicantExperiences.length > 0 ? (
                    renderAnnoncesList()
                  ) : (
                    <section
                      style={{ height: "400px" }}
                      className={
                        !isNullOrEmpty(interimaire) &&
                        !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl)
                          ? "filled-dropzone dropzone-container"
                          : "dropzone-container-sm d-flex justify-content-center"
                      }
                    >
                      {!isNullOrEmpty(interimaire) &&
                      !isNullOrEmpty(interimaire.primaryCurriculumVitaeUrl) ? (
                        <>
                          {" "}
                          <div
                            {...getRootProps({
                              className:
                                "custom-dropzone w-500 h-500 d-flex justify-content-center"
                            })}
                          >
                            <input {...getInputProps()} />
                          </div>{" "}
                          <aside id="frame" style={thumbsContainer}>
                            {loading || isLoading ? (
                              <span className="ml-3 spinner spinner-primary"></span>
                            ) : (
                              <IframeGoogleDocs loading={loading} url={url} />
                            )}
                          </aside>
                        </>
                      ) : (
                        <div
                          {...getRootProps({
                            className:
                              "custom-dropzone w-500 h-500 d-flex justify-content-center"
                          })}
                        >
                          <input {...getInputProps()} />
                          <h3 className="file-input-button loadcv_button bg-danger p-5">
                            <FormattedMessage id="TEXT.LOAD_CV.TITLE" />
                            {loading === true && (
                              <span className="ml-3 spinner spinner-secondary"></span>
                            )}
                          </h3>
                        </div>
                      )}
                    </section>
                  )}
                </div>
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
                <div className="flex-space-between-button">
                  <div>
                    {interimaire.primaryCurriculumVitaeUrl && (
                      <div
                        {...getRootProps({
                          className:
                            "custom-dropzone w-500 h-500 d-flex justify-content-center"
                        })}
                      >
                        <input {...getInputProps()} />
                        <h3 className="btn-responsive-edit btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow">
                          <FormattedMessage id="TEXT.CHANGE_CV.TITLE" />
                        </h3>
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={showExperienceForm}
                      className="btn-responsive btn btn-warning font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                    >
                      <span>
                        <FormattedMessage id="TEXT.ADD.XP" />
                      </span>
                    </button>
                    <button
                      onClick={goToIdentityDocuement}
                      className="btn-responsive btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                    >
                      <span>
                        <FormattedMessage id="BUTTON.NEXT" />
                      </span>
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(Experiences);

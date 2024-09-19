/* eslint-disable jsx-a11y/anchor-is-valid */
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
import _ from "lodash";
import { Input } from "metronic/_partials/controls";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { countMatching } from "actions/client/applicantsActions";
import { useFormikContext } from "formik";
import useLocalStorage from "../../../shared/PersistState";
import MissionWizzardHeader from "./MissionWizzardHeader";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import moment from "moment";
import { Button, Collapse } from "react-bootstrap";
import SVG from "react-inlinesvg";
import BootstrapTable from "react-bootstrap-table-next";
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
import { getHabilitationsList } from "actions/client/missionsActions";
import DateColumnFormatter from "./DateColumnFormatter";
import { toAbsoluteUrl } from "metronic/_helpers";
import DocTypes from "../../../../../utils/DocumentTypes.json";
import { PreviewDocumentModal } from "../profileModals/PreviewDocumentModal";

function FinalStep(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const {
    parsed,
    missionExperiences,
    missionEquipment,
    jobSkills,
    jobTags,
    missionsReasons,
    languages,
    driverLicenses,
    educationLevels,
    missionRemuneration,
    jobTitles
  } = useSelector(
    state => ({
      parsed: state.interimairesReducerData.interimaire,
      missionExperiences: state.lists.missionExperiences,
      missionsReasons: state.lists.missionsReasons,
      driverLicenses: state.lists.driverLicenses,
      missionRemuneration: state.lists.missionRemuneration,
      educationLevels: state.lists.educationLevels,
      languages: state.lists.languages,
      jobSkills: state.lists.jobSkills,
      jobTags: state.lists.jobTags,
      jobTitles: state.lists.jobTitles,

      missionEquipment: state.lists.missionEquipment
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);
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
  const [experience, setExperience] = useLocalStorage("experience", null);
  const [personal, setPersonal] = useState(true);
  const [complement, setComplement] = useState(false);
  const [xp, setXp] = useState(false);
  const [docs, setDocs] = useState(false);
  const [matching, setMatching] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openId, setOpenId] = useState(true);
  const [openHealth, setOpenHealth] = useState(true);
  const [openHome, setOpenHome] = useState(false);
  const [openBank, setOpenBank] = useState(false);
  const [openOthers, setOpenOthers] = useState(false);

  const [currentRow, setCurrentRow] = useState([]);

  const createOption = (label, value) => ({
    label,
    value
  });

  useEffect(() => {}, []);
  const formatEquipment = () => {
    let equipements = [];
    var outStr = "";

    if (!isNullOrEmpty(parsed) && parsed.missionArrayEquipments) {
      parsed.missionArrayEquipments.map(skill => {
        let label = missionEquipment.filter(jobSkill => jobSkill.id === skill);
        return equipements.push(label.length && label[0].name);
      });
    }
    outStr = equipements.join(" - ");
    return outStr;
  };

  const formatWantedJobs = () => {
    let jobs = [];
    var outStr = "";

    if (!isNullOrEmpty(parsed) && parsed.missionArrayDesiredJobTitles) {
      parsed.missionArrayDesiredJobTitles.map(skill => {
        let label = jobTitles.filter(jobSkill => jobSkill.id === skill);
        return jobs.push(label.length && label[0].name);
      });
    }
    outStr = jobs.join(" - ");
    return outStr;
  };

  const formatSkills = () => {
    let jobs = [];
    var outStr = "";

    if (!isNullOrEmpty(parsed) && parsed.applicantArraySkills) {
      parsed.applicantArraySkills.map(skill => {
        let label = jobSkills.filter(jobSkill => jobSkill.id === skill);
        return jobs.push(label.length && label[0].name);
      });
    }
    outStr = jobs.join(" - ");
    return outStr;
  };

  const renderReferences = () => {
    return parsed.applicantReferences.map(ref => {
      return (
        <div className="row ml-5">
          <div className=" col-lg-12 d-flex flex-row justify-content-between">
            <div className="col-lg-2">
              <p>{ref.contactName}</p>
            </div>
            <div className="col-lg-2">
              {" "}
              <p>{ref.contactEmail}</p>
            </div>
            <div className="col-lg-2">
              <p>{ref.contactPhone}</p>
            </div>
            <div className="col-lg-2">
              <p>{ref.companyName}</p>
            </div>
            <div className="col-lg-2">
              <p>{ref.city}</p>
            </div>
            <div className="col-lg-2">
              <p>{ref.jobTitle}</p>
            </div>
            <div className="col-lg-3">
              <p>{ref.contractTypeID}</p>
            </div>
          </div>
        </div>
      );
    });
  };
  const renderDocuments = () => {
    return parsed.applicantDocuments.map(ref => {
      if (ref.docType === "8" || ref.docType === "9") {
        <div className="row">
          <div className=" col-lg-12 d-flex flex-row justify-content-between">
            <div className="col-lg-3">
              <p>{ref.Filename}</p>
            </div>
            <div className="col-lg-3">
              {" "}
              <p>{ref.IssueDate}</p>
            </div>
            <div className="col-lg-3">
              <p>{ref.ExpirationDate}</p>
            </div>
            <div className="col-lg-3">
              <p>{ref.DocumentNumber}</p>
            </div>
          </div>
        </div>;
      }
      if (ref.docType === "10") {
        <div className="row">
          <div className=" col-lg-12 d-flex flex-row justify-content-between">
            <div className="col-lg-3">
              <p>{ref.Filename}</p>
            </div>
            <div className="col-lg-3">
              {" "}
              <p>{ref.DocumentNumber}</p>
            </div>
            <div className="col-lg-3">
              <p>{ref.birthDate}</p>
            </div>
            <div className="col-lg-3">
              <p>{ref.birthLoaction}</p>
            </div>
            <div className="col-lg-3">
              <p>{ref.birthDepartment}</p>
            </div>
          </div>
        </div>;
      } else {
        <div className="row">
          <div className=" col-lg-12 d-flex flex-row justify-content-between">
            <div className="col-lg-3">
              <p>{ref.Filename}</p>
            </div>
          </div>
        </div>;
      }
    });
  };
  let homeColumns = [
    {
      dataField: "filename",
      text: intl.formatMessage({ id: "TEXT.FILENAME" }),
      sort: true
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatter: (value, row) => (
        <a
          onClick={(row, rowIndex) => {
            setShowPreview(true);
            setCurrentRow({ ...row, index: rowIndex });
          }}
          title="Voir"
          className="btn btn-icon btn-light-info mr-2"
        >
          <i className="far fa-eye"></i>
        </a>
      ),
      formatExtraData: {
        openPreviewModal: (row, rowIndex) => {
          setShowPreview(true);
          setCurrentRow({ ...row, index: rowIndex });
        }
      }
    }
  ];
  const renderXp = () => {
    return parsed.applicantExperiences.map(ref => {
      return (
        <div className="row ml-5">
          <div className=" col-lg-12 d-flex flex-row justify-content-between">
            <div className="col-lg-4">
              <p>{ref.jobTitle}</p>
            </div>

            <div className="col-lg-2">
              <p>
                {moment(ref.startDate)
                  .locale("fr")
                  .format("DD/MM/YYYY")}
              </p>
            </div>

            <div className="col-lg-2">
              <p>
                {moment(ref.endDate)
                  .locale("fr")
                  .format("DD/MM/YYYY")}
              </p>
            </div>
            <div className="col-lg-2">
              <p>{ref.employerNameAndPlace}</p>
            </div>
          </div>
        </div>
      );
    });
  };
  const formatDocumentText = value => {
    let data = DocTypes.filter(l => l.id === parseInt(value));
    return data[0].name;
  };
  let idColumns = [
    {
      dataField: "documentNumber",
      text: intl.formatMessage({ id: "TEXT.NUMBER" }),
      sort: true
    },
    {
      dataField: "issueDate",
      text: intl.formatMessage({ id: "MODEL.ID.STARTDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "expirationDate",
      text: intl.formatMessage({ id: "MODEL.ID.ENDDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "documentType",
      text: intl.formatMessage({ id: "MODEL.DOCUMENT.TYPE" }),
      sort: true,
      formatter: (value, row) => <span>{formatDocumentText(value)}</span>
    },
    {
      dataField: "action",
      text: intl.formatMessage({ id: "MENU.ACTIONS" }),
      classes: "text-right pr-0",
      headerClasses: "text-right pr-3",
      style: {
        minWidth: "100px"
      },
      formatter: (value, row, rowIndex) => (
        <a
          onClick={() => {
            setShowPreview(true);
            setCurrentRow({ ...row, index: rowIndex });
          }}
          title="Voir"
          className="btn btn-icon btn-light-info mr-2"
        >
          <i className="far fa-eye"></i>
        </a>
      ),
      formatExtraData: {
        openPreviewModal: (row, rowIndex) => {
          setShowPreview(true);
          setCurrentRow({ ...row, index: rowIndex });
        }
      }
    }
  ];

  const filterID = value => {
    let data =
      parsed.applicantDocuments !== null &&
      parsed.applicantDocuments.filter(
        x => x.documentType === 8 || x.documentType === 9
      );
    return data && data;
  };
  const renderIDs = () => {
    let ids =
      parsed &&
      parsed.applicantDocuments.filter(
        doc => doc.documentType === 8 || doc.documentType === 9
      );
    return (
      ids && (
        <div className="row ml-5">
          <BootstrapTable
            remote
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="manager"
            data={!isNullOrEmpty(ids) ? filterID(ids) : []}
            columns={idColumns}
            noDataIndication={() => <NoDataIndication />}
          />
        </div>
      )
    );
  };
  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16
  };

  const thumb = {
    display: "inline-flex",
    borderRadius: 2,
    border: "1px solid #eaeaea",
    marginBottom: 8,
    marginRight: 8,
    width: 400,
    height: 200,
    padding: 4,
    boxSizing: "border-box"
  };

  const thumbInner = {
    display: "flex",
    minWidth: 0,
    overflow: "hidden"
  };

  const img = {
    display: "block",
    width: "auto",
    height: "100%"
  };
  const thumbs = file => {
    return (
      !isNullOrEmpty(file) && (
        <div style={thumb} key={!isNullOrEmpty(file) && file.filename}>
          <div style={thumbInner}>
            {/* <img src={!isNullOrEmpty(files) && files.base64} style={img} alt="preview" /> */}
            <embed
              src={
                !isNullOrEmpty(file) && "data:image/jpeg;base64," + file.base64
              }
              type={file.type}
              style={img}
              width="100%"
              height="auto"
            />
          </div>
        </div>
      )
    );
  };

  const renderHome = () => {
    let home =
      parsed &&
      parsed.applicantDocuments.filter(doc => doc.documentType === 11);
    return (
      home && (
        <div className="row ml-5">
          <BootstrapTable
            remote
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="manager"
            data={!isNullOrEmpty(home) ? home : []}
            columns={homeColumns}
            noDataIndication={() => <NoDataIndication />}
          />
        </div>
      )
    );
  };

  const renderBank = () => {
    let bank =
      parsed &&
      parsed.applicantDocuments.filter(doc => doc.documentType === 12);
    return (
      bank && (
        <div className="row ml-5">
          <BootstrapTable
            remote
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="manager"
            data={!isNullOrEmpty(bank) ? bank : []}
            columns={homeColumns}
            noDataIndication={() => <NoDataIndication />}
          />
        </div>
      )
    );
  };

  const renderOthers = () => {
    let others =
      parsed && parsed.applicantDocuments.filter(doc => doc.documentType === 7);
    return (
      others && (
        <div className="row ml-5">
          <BootstrapTable
            remote
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden"
            bootstrap4
            keyField="manager"
            data={!isNullOrEmpty(others) ? others : []}
            columns={homeColumns}
            noDataIndication={() => <NoDataIndication />}
          />
        </div>
      )
    );
  };
  const filterHealth = value => {
    let data =
      parsed.applicantDocuments !== null &&
      parsed.applicantDocuments.filter(x => x.documentType === 10);
    return data && data[0];
  };
  let formattedXp = () => {
    let xp = parsed.applicantExperiences.map((val, ix) => {
      val.keyField = ix;
      return val;
    });
    return xp;
  };
  const renderHealth = () => {
    let ids =
      parsed &&
      parsed.applicantDocuments.filter(doc => doc.documentType === 10);
    return (
      ids &&
      ids.length &&
      ids.map(doc => {
        return (
          <div className="row ml-5">
            <div className=" col-lg-12 d-flex flex-row justify-content-between">
              <div className="col-lg-3">
                <p>{doc.filename}</p>
              </div>
            </div>
          </div>
        );
      })
    );
  };

  const formatJobTitle = value => {
    let res = jobTitles.filter(job => job.id === value);
    return res.length ? res[0].name : null;
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
        <div className="alert-text">Aucun document chargé !</div>
      </div>
    </div>
  );

  const NoRefsIndication = () => (
    <div className="d-flex justify-content-center mt-5">
      <div
        className="alert alert-custom alert-notice alert-light-danger fade show px-5 py-0"
        role="alert"
      >
        <div className="alert-icon">
          <i className="flaticon-warning"></i>
        </div>
        <div className="alert-text">Aucune référence !</div>
      </div>
    </div>
  );

  let columns = [
    {
      dataField: "contactName",
      text: intl.formatMessage({ id: "MODEL.MANAGER" }),
      sort: true
    },
    {
      dataField: "contactEmail",
      text: intl.formatMessage({ id: "MODEL.EMAIL" }),
      sort: true
    },
    {
      dataField: "contactPhone",
      text: intl.formatMessage({ id: "MODEL.PHONE" }),
      sort: true
    },
    {
      dataField: "companyName",
      text: intl.formatMessage({ id: "TEXT.COMPANY" }),
      sort: true
    },
    {
      dataField: "city",
      text: intl.formatMessage({ id: "TEXT.LOCATION" }),
      sort: true
    },
    {
      dataField: "jobTitle",
      text: intl.formatMessage({ id: "TEXT.PAST.JOB" }),
      sort: true
    },
    {
      dataField: "contractTypeID",
      text: intl.formatMessage({ id: "MODEL.CONTRACT.TYPE" }),
      sort: true,
      formatter: (value, row) => formatJobTitle(value)
    }
  ];

  const onHidePreview = () => {
    setShowPreview(false);
  };
  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <MissionWizzardHeader />
          <div className="wizard-body mt-20pfina py-8 px-8">
            <div className="row mx-10">
              <div className="pb-5 width-full">
                <div className="mission-form mt-10 mb-10 p-0">
                  <h3 className="group-title">Mon profil</h3>
                </div>
                <PreviewDocumentModal
                  row={currentRow}
                  show={showPreview}
                  onHide={onHidePreview}
                />
                <div className="row mb-5">
                  <>
                    <div
                      onClick={() => setPersonal(!personal)}
                      aria-controls="example-collapse-text"
                      aria-expanded={personal}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <div className="wizard-icon">
                          <span className="svg-icon svg-icon svg-icon-primary mr-5">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/General/User.svg"
                              )}
                            ></SVG>
                          </span>
                        </div>
                        <h3>Informations personnelles</h3>
                      </div>
                      {personal ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={personal}>
                      <div className="col-xl-12 my-5">
                        <div className="row ml-5 mb-3">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">Nom :</span>{" "}
                              {parsed && parsed.firstname}{" "}
                              {parsed && parsed.lastname}{" "}
                              {parsed && parsed.maidenName}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5 mb-3">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Email :
                              </span>{" "}
                              {parsed && parsed.email}
                            </p>
                          </div>
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Téléphone :
                              </span>{" "}
                              {parsed && parsed.mobilePhoneNumber}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5 mb-3">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Numéro de sécurité sociale :
                              </span>{" "}
                              {parsed && parsed.socialSecurityNumber}
                            </p>
                          </div>

                          <div className="col-xl-3 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Date de naissance :
                              </span>{" "}
                              {!isNullOrEmpty(parsed)
                                ? moment(parsed.birthDate)
                                    .locale("fr")
                                    .format("DD/MM/YYYY")
                                : null}
                            </p>
                          </div>
                        </div>

                        <div className="row ml-5 mb-3">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Ville de naissance :
                              </span>{" "}
                              {parsed && parsed.birthPlace}
                            </p>
                          </div>
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Département de naissance :
                              </span>{" "}
                              {parsed && parsed.birthDepartment}
                            </p>
                          </div>
                        </div>

                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Adresse :
                              </span>{" "}
                              {parsed && parsed.address}{" "}
                              {parsed && parsed.additionalAddress}{" "}
                              {parsed && parsed.postalCode}{" "}
                              {parsed && parsed.city}{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>

                <div className="row mb-5">
                  <>
                    <div
                      onClick={() => setComplement(!complement)}
                      aria-controls="example-collapse-text"
                      aria-expanded={complement}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <div className="wizard-icon">
                          <span className="svg-icon svg-icon svg-icon-primary mr-5">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Code/Info-circle.svg"
                              )}
                            ></SVG>
                          </span>
                        </div>
                        <div className="wizard-label">
                          <h3>Informations complémentaires</h3>
                        </div>{" "}
                      </div>
                      {complement ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={complement}>
                      <div className="col-xl-12 my-5">
                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Equipements :
                              </span>{" "}
                              {formatEquipment()}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                Références :{" "}
                                {parsed &&
                                  isNullOrEmpty(parsed.applicantReferences) &&
                                  intl.formatMessage({ id: "TEXT.EMPTY" })}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="ml-5">
                          {parsed && parsed.applicantReferences && (
                            <BootstrapTable
                              remote
                              wrapperClasses="table-responsive"
                              bordered={false}
                              classes="table table-head-custom table-vertical-center overflow-hidden"
                              bootstrap4
                              keyField="manager"
                              data={
                                parsed && parsed.applicantReferences
                                  ? parsed.applicantReferences
                                  : []
                              }
                              columns={columns}
                              noDataIndication={() => <NoRefsIndication />}
                            />
                          )}
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>

                <div className="row mb-5">
                  <>
                    <div
                      onClick={() => setXp(!xp)}
                      aria-controls="example-collapse-text"
                      aria-expanded={xp}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <span className="svg-icon svg-icon svg-icon-primary mr-5">
                          <SVG
                            src={toAbsoluteUrl(
                              "/media/svg/icons/Clothes/Briefcase.svg"
                            )}
                          ></SVG>
                        </span>
                        <div className="wizard-label">
                          <h3>Mes expériences</h3>
                        </div>
                      </div>
                      {xp ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={xp}>
                      <div className="col-xl-12 my-5">
                        <div>
                          <div className="row ml-5 ">
                            <div className=" col-lg-12 mb-5 d-flex flex-row justify-content-between">
                              <div className="col-lg-4">
                                <span className="font-weight-bolder">
                                  Intitulé du poste
                                </span>
                              </div>

                              <div className="col-lg-2">
                                <span className="font-weight-bolder">
                                  Date de debut
                                </span>
                              </div>

                              <div className="col-lg-2">
                                <span className="font-weight-bolder">
                                  Date de fin
                                </span>
                              </div>
                              <div className="col-lg-2">
                                <span className="font-weight-bolder">
                                  <FormattedMessage id="TEXT.MANAGER" />
                                </span>
                              </div>
                            </div>
                          </div>
                          {parsed && parsed.applicantExperiences && renderXp()}
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>

                <div className="row mb-5">
                  <>
                    <div
                      onClick={() => setDocs(!docs)}
                      aria-controls="example-collapse-text"
                      aria-expanded={docs}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <div className="wizard-icon">
                          <span className="svg-icon svg-icon svg-icon-primary mr-5">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Files/Group-folders.svg"
                              )}
                            ></SVG>
                          </span>
                        </div>
                        <h3>Mes documents</h3>
                      </div>
                      {docs ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={docs}>
                      <div className="col-xl-12 my-5">
                        <div className="row ml-5">
                          <div
                            onClick={() => setOpenId(!openId)}
                            aria-controls="example-collapse-text"
                            aria-expanded={openId}
                            className="col-lg-12 d-flex flex-row justify-content-between"
                          >
                            <div className="col-lg-8 d-flex flex-row ">
                              <span className="font-weight-bolder">
                                Document d'identité
                              </span>
                            </div>
                            {openId ? (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-down.svg"
                                )}
                              />
                            ) : (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-right.svg"
                                )}
                              />
                            )}
                          </div>
                          <Collapse in={openId}>
                            <div className="row mx-10">
                              <div className="pb-5 width-full"></div>
                              {renderIDs()}
                            </div>
                          </Collapse>
                        </div>

                        <div className="row ml-5">
                          <div
                            onClick={() => setOpenHealth(!openHealth)}
                            aria-controls="example-collapse-text"
                            aria-expanded={openHealth}
                            className="col-lg-12 d-flex flex-row justify-content-between"
                          >
                            <div className="col-lg-8 d-flex flex-row ">
                              <span className="font-weight-bolder">
                                <FormattedMessage id="VITAL.CARD" />
                              </span>
                            </div>
                            {openHealth ? (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-down.svg"
                                )}
                              />
                            ) : (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-right.svg"
                                )}
                              />
                            )}
                          </div>
                          <Collapse in={openHealth}>
                            <div id="health" className="col-lg-12 ">
                              <div className="d-flex flex-row mx-10">
                                <div className="d-flex flex-row pb-5 width-full">
                                  <div className="col-lg-6 ">
                                    {!isNullOrEmpty(parsed) &&
                                      !isNullOrEmpty(
                                        parsed.applicantDocuments
                                      ) && (
                                        <aside style={thumbsContainer}>
                                          {thumbs(
                                            filterHealth(
                                              parsed.applicantDocuments
                                            )
                                          )}
                                        </aside>
                                      )}
                                  </div>

                                  <div className="col-lg-6 d-flex flex-column">
                                    <div className="mt-2 d-flex flex-row justify-content-between">
                                      <p>
                                        <span className="font-weight-bolder font-size-sm">
                                          Numéro de sécurité sociale :
                                        </span>{" "}
                                        {parsed && parsed.socialSecurityNumber}
                                      </p>
                                    </div>
                                    <div className="mt-2 d-flex flex-row justify-content-between">
                                      <p>
                                        <span className="font-weight-bolder font-size-sm">
                                          Date de naissance :
                                        </span>{" "}
                                        {!isNullOrEmpty(parsed)
                                          ? moment(parsed.birthDate)
                                              .locale("fr")
                                              .format("DD/MM/YYYY")
                                          : null}
                                      </p>
                                    </div>
                                    <div className="mt-2 d-flex flex-row justify-content-between">
                                      <p>
                                        <span className="font-weight-bolder font-size-sm">
                                          Ville de naissance :
                                        </span>{" "}
                                        {parsed && parsed.birthPlace}
                                      </p>
                                    </div>
                                    <div className="mt-2 d-flex flex-row justify-content-between">
                                      <p>
                                        <span className="font-weight-bolder font-size-sm">
                                          Département de naissance :
                                        </span>{" "}
                                        {parsed && parsed.birthDepartment}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Collapse>
                        </div>

                        <div className="row ml-5">
                          <div
                            onClick={() => setOpenHome(!openHome)}
                            aria-controls="example-collapse-text"
                            aria-expanded={openHome}
                            className="col-lg-12 d-flex flex-row justify-content-between"
                          >
                            <div className="col-lg-8 d-flex flex-row ">
                              <span className="font-weight-bolder">
                                Justificatif de domicile
                              </span>
                            </div>
                            {openHome ? (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-down.svg"
                                )}
                              />
                            ) : (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-right.svg"
                                )}
                              />
                            )}
                          </div>
                          <Collapse in={openHome}>
                            <div className="row mx-10">
                              <div className="pb-5 width-full"></div>
                              {renderHome()}
                            </div>
                          </Collapse>
                        </div>

                        <div className="row ml-5">
                          <div
                            onClick={() => setOpenBank(!openBank)}
                            aria-controls="example-collapse-text"
                            aria-expanded={openBank}
                            className="col-lg-12 d-flex flex-row justify-content-between"
                          >
                            <div className="col-lg-8 d-flex flex-row ">
                              <span className="font-weight-bolder">RIB</span>
                            </div>
                            {openBank ? (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-down.svg"
                                )}
                              />
                            ) : (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-right.svg"
                                )}
                              />
                            )}
                          </div>
                          <Collapse in={openBank}>
                            <div className="row mx-10">
                              <div className="pb-5 width-full"></div>
                              {renderBank()}
                            </div>
                          </Collapse>
                        </div>
                        <div className="row ml-5">
                          <div
                            onClick={() => setOpenOthers(!openOthers)}
                            aria-controls="example-collapse-text"
                            aria-expanded={openOthers}
                            className="col-lg-12 d-flex flex-row justify-content-between"
                          >
                            <div className="col-lg-8 d-flex flex-row ">
                              <span className="font-weight-bolder">
                                Autres documents
                              </span>
                            </div>
                            {openOthers ? (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-down.svg"
                                )}
                              />
                            ) : (
                              <SVG
                                src={toAbsoluteUrl(
                                  "/media/svg/icons/Navigation/Angle-right.svg"
                                )}
                              />
                            )}
                          </div>
                          <Collapse in={openOthers}>
                            <div className="row mx-10">
                              <div className="pb-5 width-full"></div>
                              {renderOthers()}
                            </div>
                          </Collapse>
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>

                <div className="row mb-5">
                  <>
                    <div
                      onClick={() => setMatching(!matching)}
                      aria-controls="example-collapse-text"
                      aria-expanded={matching}
                      className="col-lg-12 d-flex flex-row justify-content-between"
                    >
                      <div className="col-lg-8 d-flex flex-row ">
                        <div className="wizard-icon">
                          <span className="svg-icon svg-icon svg-icon-primary mr-5">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Design/Select.svg"
                              )}
                            ></SVG>
                          </span>
                        </div>
                        <h3>Matching</h3>
                      </div>
                      {matching ? (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-down.svg"
                          )}
                        />
                      ) : (
                        <SVG
                          src={toAbsoluteUrl(
                            "/media/svg/icons/Navigation/Angle-right.svg"
                          )}
                        />
                      )}
                    </div>
                    <Collapse in={matching}>
                      <div className="col-xl-12 my-5">
                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="TEXT.WANTED.JOB" /> :
                              </span>{" "}
                              {formatWantedJobs()}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="MODEL.COMPETENCES" /> :
                              </span>{" "}
                              {formatSkills()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(FinalStep);

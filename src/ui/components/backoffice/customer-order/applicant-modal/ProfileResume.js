/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import _ from "lodash";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import useLocalStorage from "../../../shared/PersistState";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import moment from "moment";
import { Collapse } from "react-bootstrap";
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
import { getHabilitationsList } from "../../../../../business/actions/client/missionsActions";
import { toAbsoluteUrl } from "metronic/_helpers";
import DocTypes from "../../../../../utils/DocumentTypes.json";
import DateColumnFormatter from "../formatters/DateColumnFormatter";

function ProfileResume(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;

  const {
    parsed,
    missionEquipment,
    jobSkills,
    jobTitles
  } = useSelector(
    state => ({
      parsed: state.applicants.currentCandidate,
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
      formatter: () => (
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
      formatter: (value) => <span>{formatDocumentText(value)}</span>
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

  const filterID = () => {
    let data =
      parsed.applicantDocuments !== null &&
      parsed.applicantDocuments.filter(
        x => x.documentType === 8 || x.documentType === 9
      );
    return data && data;
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
        <div className="alert-text">
          <FormattedMessage id="PROFILE.TABLE.EMPTY" />
        </div>
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
      formatter: (value) => formatJobTitle(value)
    }
  ];
  let xpColumns = [
    {
      dataField: "jobTitle",
      text: intl.formatMessage({ id: "TEXT.PAST.JOB" }),
      sort: true,
      headerStyle: () => {
        return { width: "180px" };
      }
    },
    {
      dataField: "startDate",
      text: intl.formatMessage({ id: "TEXT.STARTDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "endDate",
      text: intl.formatMessage({ id: "TEXT.ENDDATE" }),
      sort: true,
      formatter: DateColumnFormatter
    },
    {
      dataField: "employerNameAndPlace",
      text: intl.formatMessage({ id: "TEXT.COMPANY" }),
      sort: true
    },
    {
      dataField: "place",
      text: intl.formatMessage({ id: "MODEL.LOCATION" }),
      sort: true
    },
    {
      dataField: "isCurrentItem",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.CURRENT" }),
      formatter: (row) => <span>{row === "true" ? "oui" : "non"} </span>,
      sort: true
    },
    {
      dataField: "description",
      text: intl.formatMessage({ id: "MODEL.ACCOUNT.DESCRIPTION" }),
      sort: true
    }
  ];
  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <div className="wizard-body mt-20pfina py-8 px-8">
            <div className="row mx-10">
              <div className="pb-5 width-full">
                {/* <PreviewDocumentModal
                  row={currentRow}
                  show={showPreview}
                  onHide={onHidePreview}
                /> */}
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
                        <h3>
                          {" "}
                          <FormattedMessage id="PROFILE.PERSONNAL.INFO" />
                        </h3>
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
                              <span className="font-weight-bolder">
                                <FormattedMessage id="MODEL.LASTNAME" />
                              </span>{" "}
                              {parsed && parsed.firstname}{" "}
                              {parsed && parsed.lastname}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5 mb-3">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="MODEL.EMAIL" />
                              </span>{" "}
                              {parsed && parsed.email}
                            </p>
                          </div>
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="MODEL.PHONE" />
                              </span>{" "}
                              {parsed && parsed.mobilePhoneNumber}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5 mb-3">
                          <div className="col-xl-3 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="TEXT.BIRTHDATE" />
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
                                <FormattedMessage id="TEXT.BIRTH.CITY" />
                              </span>{" "}
                              {parsed && parsed.birthPlace}
                            </p>
                          </div>
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="TEXT.BIRTH.DEP" />
                              </span>{" "}
                              {parsed && parsed.birthDepartment}
                            </p>
                          </div>
                        </div>

                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="MODEL.ACCOUNT.ADDRESS" />
                              </span>{" "}
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
                          <h3>
                            {" "}
                            <FormattedMessage id="TEXT.EXTRA.INFOS" />
                          </h3>
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
                                <FormattedMessage id="MODEL.EQUIPMENT" />
                              </span>{" "}
                              {formatEquipment()}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="TEXT.REF" />

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
                              noDataIndication={() => <NoDataIndication />}
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
                          <h3>
                            {" "}
                            <FormattedMessage id="MODEL.XP" />
                          </h3>
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
                          <BootstrapTable
                            wrapperClasses="table-responsive"
                            bordered={false}
                            classes="table table-head-custom table-vertical-center overflow-hidden"
                            bootstrap4
                            keyField="keyField"
                            data={parsed.applicantExperiences}
                            columns={xpColumns}
                            noDataIndication={() => <NoDataIndication />}
                          />
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
                        <h3>
                          {" "}
                          <FormattedMessage id="TEXT.DOCUMENTS" />
                        </h3>
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
                            onClick={() => setOpenOthers(!openOthers)}
                            aria-controls="example-collapse-text"
                            aria-expanded={openOthers}
                            className="col-lg-12 d-flex flex-row justify-content-between"
                          >
                            <div className="col-lg-8 d-flex flex-row ">
                              <span className="font-weight-bolder">
                                <FormattedMessage id="TEXT.OTHER.DOCUMENTS" />
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
                        <h3>
                          {" "}
                          <FormattedMessage id="TEXT.MATCHING" />
                        </h3>
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
                                <FormattedMessage id="TEXT.WANTED.JOB" />
                              </span>{" "}
                              {formatWantedJobs()}
                            </p>
                          </div>
                        </div>
                        <div className="row ml-5">
                          <div className="col-xl-6 d-flex flex-row justify-content-between">
                            <p>
                              <span className="font-weight-bolder">
                                <FormattedMessage id="MODEL.COMPETENCES" />
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

export default injectIntl(ProfileResume);

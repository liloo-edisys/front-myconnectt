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
import useLocalStorage from "../../../shared/persistState";
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
import { getHabilitationsList } from "actions/client/missionsActions";
import { toAbsoluteUrl } from "metronic/_helpers";
import DocTypes from "../../../../../utils/DocumentTypes.json";
import MissionsDateColumnFormatter from "../column-formatters/MissionsDateColumnFormatter";

function ProfileResume(props, formik) {
  const dispatch = useDispatch();
  const { intl } = props;
  const TENANTID = process.env.REACT_APP_TENANT_ID;

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
  const [xp, setXp] = useState(true);
  const [docs, setDocs] = useState(false);
  const [matching, setMatching] = useState(true);
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
      formatter: MissionsDateColumnFormatter
    },
    {
      dataField: "expirationDate",
      text: intl.formatMessage({ id: "MODEL.ID.ENDDATE" }),
      sort: true,
      formatter: MissionsDateColumnFormatter
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

  return (
    <div className="card card-custom">
      <div className="card-body p-0">
        <div className="wizard wizard-2">
          <div className="wizard-body mt-20pfina py-8">
            <div className="row mx-1 my-5">
              <div className="pb-5 width-full">
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
                          <FormattedMessage id="TEXT.RANDOM.DOCUMENTS" />
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
                        <div className="row ml-5">{renderOthers()}</div>
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

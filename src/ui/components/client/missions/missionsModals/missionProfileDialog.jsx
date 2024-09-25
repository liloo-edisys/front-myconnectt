/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getMatching } from "actions/client/applicantsActions";
import { getMission } from "actions/client/missionsActions";
import Avatar from "react-avatar";
import moment from "moment";
import ApplicationsStatusColumnFormatter from "components/client/missions/column-formatters/applicationsStatusColumnFormatter.jsx";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { getJobTitles } from "../../../../../business/actions/shared/listsActions";
import { getJobSkills } from "../../../../../business/actions/shared/listsActions";
import axios from "axios";
import {
  declineMatching,
  approveByCustomer,
  getApplicantById,
  getFormattedCV
} from "actions/client/applicantsActions";
import "./styles.scss";

export function MissionProfileDialog({
  show,
  onHide,
  history,
  resumeOpen,
  onOpenResume,
  onCloseResume,
  resumeRow,
  currentApplicant
}) {
  const { state } = history.location;
  const TENANTID = process.env.REACT_APP_TENANT_ID;

  const dispatch = useDispatch();
  const intl = useIntl();
  const {
    candidates,
    mission,
    applicant,
    jobTitles,
    jobSkills,
    resume
  } = useSelector(
    state => ({
      mission: state.missionsReducerData.mission,
      candidates: state.applicants.matchingCandidates,
      applicant: state.applicants.currentCandidate,
      jobSkills: state.lists.jobSkills,
      jobTitles: state.lists.jobTitles,
      resume: state.applicants.resume
    }),
    shallowEqual
  );
  const [user, setUser] = useState(null);
  const [activityDomainsList, setActivityDomainsList] = useState(null);
  const [listLimit, setListLimit] = useState(3);
  const [jobTitlesLimit, setJobTitlesLimit] = useState(3);
  useEffect(() => {
    isNullOrEmpty(jobTitles) && dispatch(getJobTitles.request());
    isNullOrEmpty(jobSkills) && dispatch(getJobSkills.request());
    let URL = `${process.env.REACT_APP_WEBAPI_URL}api/ActivityDomain`;
    isNullOrEmpty(activityDomainsList) &&
      axios.get(URL).then(res => {
        setActivityDomainsList(res.data);
      });
  }, [dispatch, jobTitles, jobSkills]);
  useEffect(() => {
    show === true &&
      currentApplicant !== (applicant && applicant.id) &&
      dispatch(getApplicantById.request(currentApplicant));
    applicant && user === null && setUser(applicant);
    if (applicant) {
      dispatch(
        getFormattedCV.request({
          id1: parseInt(TENANTID),
          id2: applicant.id
        })
      );
    }
  }, [show, dispatch, currentApplicant, applicant, user]);

  const handleDeny = (missionID, candidateID, mission) => {
    dispatch(
      declineMatching.request({ id1: missionID, id2: candidateID }, mission)
    );
    dispatch(getMatching.request(mission));
  };

  const handleAccept = (missionID, candidateID, mission) => {
    dispatch(
      approveByCustomer.request({ id1: missionID, id2: candidateID }, mission)
    );
    dispatch(getMatching.request(mission));
  };
  let missionId = state && state.id;

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  const prevCandidates = usePrevious(candidates);
  useEffect(() => {
    show && mission.id !== missionId && dispatch(getMission.request(missionId));
  }, [show, mission, candidates, dispatch, missionId, prevCandidates]);

  useEffect(() => {
    show && mission && dispatch(getMatching.request(mission));
  }, [show, mission, dispatch]);

  const handleClose = () => {
    setUser(null);
    onHide();
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
    return url;
  }

  const renderXp = () => {
    return (
      <>
        {applicant.applicantExperiences.map((ref, i) => {
          if (i < listLimit) {
            return (
              <tr>
                <td className="py-8">
                  <span className="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg">
                    {ref.jobTitle}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(ref.startDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(ref.endDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {ref.employerNameAndPlace}
                  </span>
                </td>
              </tr>
            );
          }
        })}
        {applicant.applicantExperiences.length > 3 && listLimit === 3 ? (
          <button
            className="btn btn-light-warning mr-2"
            onClick={() => setListLimit(applicant.applicantExperiences.length)}
          >
            <FormattedMessage id="BUTTON.SEE.MORE" />
          </button>
        ) : (
          listLimit !== 3 && (
            <button
              className="btn btn-light-warning mr-2"
              onClick={() => setListLimit(3)}
            >
              <FormattedMessage id="BUTTON.HIDE" />
            </button>
          )
        )}
      </>
    );
  };

  const renderDocuments = () => {
    return (
      <>
        {applicant.applicantDocuments.map((document, i) => {
          if (
            (document.documentType === 8 &&
              document.filename === "IdentityCardFront") ||
            (document.documentType === 16 &&
              document.filename === "ReceiptCardFront") ||
            document.documentType === 14 ||
            (document.documentType === 9 &&
              document.filename === "ResidentCardFront")
          ) {
            const expirationDate = new Date(applicant.idCardExpirationDate);
            const now = new Date();
            let isActive = false;
            if (expirationDate > now) {
              isActive = true;
            }
            let url = encoreUrl(document.documentUrl);
            return (
              <tr>
                <td className="py-8">
                  <span className="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg">
                    {isActive ? (
                      <i className="far fa-check-circle mr-2 text-success" />
                    ) : (
                      <i className="far fa-window-close mr-2 text-danger" />
                    )}
                    {document.documentType === 8
                      ? intl.formatMessage({ id: "DOCUMENT.ID.CARD" }) +
                        " - " +
                        intl.formatMessage({ id: "FRONT" })
                      : document.documentType === 9
                      ? intl.formatMessage({
                          id: "DOCUMENT.RESIDENCE.PERMIT"
                        }) +
                        " - " +
                        intl.formatMessage({ id: "FRONT" })
                      : document.documentType === 16
                      ? "Document d'identité - " +
                        intl.formatMessage({ id: "FRONT" })
                      : document.documentType === 14 && "Passport"}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(applicant.idCardIssueDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(applicant.idCardExpirationDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                {applicant && state && state.status === 5 && (
                  <td>
                    <span className="text-dark-75 d-block font-size-lg">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/document/display/${document.documentUrl}`}
                        className="btn btn-light-primary"
                      >
                        <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                      </a>
                    </span>
                  </td>
                )}
              </tr>
            );
          }
        })}
        {applicant.applicantDocuments.map((document, i) => {
          if (
            (document.documentType === 8 &&
              document.filename === "IdentityCardBack") ||
            (document.documentType === 16 &&
              document.filename === "ReceiptCardBack") ||
            (document.documentType === 9 &&
              document.filename === "ResidentCardBack")
          ) {
            const expirationDate = new Date(applicant.idCardExpirationDate);
            const now = new Date();
            let isActive = false;
            if (expirationDate > now) {
              isActive = true;
            }
            let url = encoreUrl(document.documentUrl);
            return (
              <tr>
                <td className="py-8">
                  <span className="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg">
                    {isActive ? (
                      <i className="far fa-check-circle mr-2 text-success" />
                    ) : (
                      <i className="far fa-window-close mr-2 text-danger" />
                    )}
                    {document.documentType === 8
                      ? intl.formatMessage({ id: "DOCUMENT.ID.CARD" }) +
                        " - " +
                        intl.formatMessage({ id: "FRONT" })
                      : document.documentType === 16
                      ? intl.formatMessage({ id: "DOCUMENT.RECEIPT" })
                      : document.documentType === 9 &&
                        intl.formatMessage({
                          id: "DOCUMENT.RESIDENCE.PERMIT"
                        }) +
                          " - " +
                          intl.formatMessage({ id: "FRONT" })}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(applicant.idCardIssueDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(applicant.idCardExpirationDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                {applicant && state && state.status === 5 && (
                  <td>
                    <span className="text-dark-75 d-block font-size-lg">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/document/display/${document.documentUrl}`}
                        className="btn btn-light-primary"
                      >
                        <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                      </a>
                    </span>
                  </td>
                )}
              </tr>
            );
          }
        })}
        {applicant.applicantDocuments.map((document, i) => {
          const expirationDate = new Date(document.expirationDate);
          const now = new Date();
          let isActive = false;
          if (expirationDate > now) {
            isActive = true;
          }
          if (document.documentType === 13) {
            let title = "";
            let titleList = document.habilitations;
            for (let j = 0; j < titleList.length; j++) {
              if (j !== 0) {
                title = title + ", " + titleList[j].name;
              } else {
                title = title + titleList[j].name;
              }
            }
            let url = encoreUrl(document.documentUrl);
            return (
              <tr>
                <td className="py-8">
                  <span className="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg">
                    {isActive ? (
                      <i className="far fa-check-circle mr-2 text-success" />
                    ) : (
                      <i className="far fa-window-close mr-2 text-danger" />
                    )}
                    {title}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(document.issueDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                <td>
                  <span className="text-dark-75 d-block font-size-lg">
                    {moment(document.expirationDate)
                      .locale("fr")
                      .format("DD/MM/YYYY")}
                  </span>
                </td>
                {applicant && state && state.status === 5 && (
                  <td>
                    <span className="text-dark-75 d-block font-size-lg">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/document/display/${document.documentUrl}`}
                        className="btn btn-light-primary"
                      >
                        <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                      </a>
                    </span>
                  </td>
                )}
              </tr>
            );
          }
        })}
      </>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop pr-5">
          <div className=" ml-5 align-items-center d-flex flex-row ">
            <div className=" ml-5 align-items-center d-flex flex-row ">
              {applicant && state && state.status === 5 ? (
                <p className="pageDetails">
                  Profil de{" "}
                  {applicant && applicant.firstname + " " + applicant.lastname}
                </p>
              ) : (
                <p className="pageDetails">Profil anonyme du candidat</p>
              )}
            </div>
            <div className="mb-5 ml-5 align-items-center d-flex flex-row ">
              {ApplicationsStatusColumnFormatter(
                null,
                { status: state && state.status },
                null
              )}
            </div>
          </div>
          <div className="mb-5 ml-5 align-items-center d-flex flex-row">
            <a
              className="btn btn-light-info btn-shadow font-weight-bold px-9 py-4 m-2"
              target="_blank"
              rel="noopener noreferrer"
              href={
                applicant && state && state.status === 5
                  ? `/document/display/${encoreUrl(
                      applicant.primaryCurriculumVitaeUrl
                    )}`
                  : resume && `/document/display/${encoreUrl(resume)}`
              }
              /*href={
                applicant && state && state.status === 5
                  ? encoreUrl(applicant.primaryCurriculumVitaeUrl)
                  : resume
                  ? encoreUrl(resume)
                  : null
              }*/
              //href={encoreUrl(resume)}
            >
              <span className="navi-icon mr-2">
                <i className="fas fa-id-badge"></i>
              </span>
              <span className="menu-text">
                <FormattedMessage id="BUTTON.SHOW.CV" />
              </span>
            </a>
            {state && state.status === 1 ? (
              <a
                onClick={e => {
                  e.stopPropagation();
                  history.push(`/missions/delete-application`, state);
                }}
                title="Annuler l'invitation"
                className="btn btn-light-danger btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              >
                Annuler l'invitation
              </a>
            ) : null}
            {state && state.status === 2 ? (
              <>
                <a
                  onClick={e => {
                    e.stopPropagation();
                    history.push(`/missions/approve`, state);
                  }}
                  title={intl.formatMessage({ id: "BUTTON.VALIDATE" })}
                  className="btn btn-light-success btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                >
                  <FormattedMessage id="CANDIDATE.ACCEPT.TITLE" />
                </a>
                <a
                  onClick={e => {
                    e.stopPropagation();
                    history.push(`/missions/decline`, state);
                  }}
                  title="Décliner"
                  className="btn  btn-light-danger btn-shadow font-weight-bold px-9 py-4 m-2"
                >
                  <FormattedMessage id="TEXT.DENY" />
                </a>
              </>
            ) : null}
          </div>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={() => handleClose()}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
        <Modal.Title className="pageSubtitle w-100 responsive_header_mobile">
          <div className=" ml-5 align-items-center">
            {applicant && state && state.status === 5 ? (
              <p className="pageDetails">
                Profil de{" "}
                {applicant && applicant.firstname + " " + applicant.lastname}
              </p>
            ) : (
              <p className="pageDetails">Profil anonyme du candidat</p>
            )}
          </div>
          <div className="mb-5 ml-5 align-items-center">
            {ApplicationsStatusColumnFormatter(
              null,
              { status: state && state.status },
              null
            )}
          </div>
          <div>
            {state && state.status === 1 ? (
              <a
                onClick={e => {
                  e.stopPropagation();
                  history.push(`/missions/delete-application`, state);
                }}
                title="Annuler l'invitation"
                className="btn btn-light-danger btn-shadow font-weight-bold my-3 mx-4"
              >
                Annuler l'invitation
              </a>
            ) : null}
            {state && state.status === 2 ? (
              <>
                <a
                  onClick={e => {
                    e.stopPropagation();
                    history.push(`/missions/approve`, state);
                  }}
                  title={intl.formatMessage({ id: "BUTTON.VALIDATE" })}
                  className="btn btn-light-success btn-shadow font-weight-bold my-3 mx-4"
                >
                  <FormattedMessage id="CANDIDATE.ACCEPT.TITLE" />
                </a>
                <a
                  onClick={e => {
                    e.stopPropagation();
                    history.push(`/missions/decline`, state);
                  }}
                  title="Décliner"
                  className="btn  btn-light-danger btn-shadow font-weight-bold m-2"
                >
                  <FormattedMessage id="TEXT.DENY" />
                </a>
              </>
            ) : null}
            <a
              className="btn btn-light-info btn-shadow font-weight-bold m-2"
              target="_blank"
              rel="noopener noreferrer"
              href={
                applicant && state && state.status === 5
                  ? `/document/display/${encoreUrl(
                      applicant.primaryCurriculumVitaeUrl
                    )}`
                  : resume && `/document/display/${encoreUrl(resume)}`
              }
              /*href={
                applicant && state && state.status === 5
                  ? encoreUrl(applicant.primaryCurriculumVitaeUrl)
                  : resume
                  ? encoreUrl(resume)
                  : null
              }*/
              //href={encoreUrl(resume)}
            >
              <span className="navi-icon mr-2">
                <i className="fas fa-id-badge"></i>
              </span>
              <span className="menu-text">
                <FormattedMessage id="BUTTON.SHOW.CV" />
              </span>
            </a>
          </div>
        </Modal.Title>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Fermer"
          onClick={() => handleClose()}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px"
          }}
        >
          <i aria-hidden="true" className="ki ki-close"></i>
        </button>
      </Modal.Header>
      <Modal.Body className="pt-5 py-0 background-gray">
        <div className="d-flex flex-row pb-10">
          <div
            className="flex-row-auto offcanvas-mobile w-300px w-xl-350px"
            id="kt_profile_aside"
          >
            <div className="card card-custom gutter-b">
              <div className="card-body pt-4">
                <div className="d-flex align-items-left">
                  <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                    {!isNullOrEmpty(applicant) &&
                    !isNullOrEmpty(applicant.applicantPicture) ? (
                      <Avatar
                        className="symbol-label"
                        color="#3699FF"
                        src={
                          "data:image/" +
                          applicant.applicantPicture.filename.split(".")[1] +
                          ";base64," +
                          applicant.applicantPicture.base64
                        }
                      />
                    ) : (
                      <Avatar
                        className="symbol-label"
                        color="#3699FF"
                        maxInitials={2}
                        name={
                          applicant &&
                          applicant.firstname &&
                          applicant.firstname.concat(" ", applicant.lastname)
                        }
                      />
                    )}
                    <i className="symbol-badge bg-success"></i>
                  </div>
                  <div>
                    <p className="pageSubtitle mx-2 font-weight-bold font-size-h5 text-dark-75 text-hover-primary">
                      {applicant && state && state.status === 5
                        ? `${applicant.firstname} ${applicant.lastname}`
                        : applicant
                        ? `${applicant.firstname}`
                        : "candidat"}
                    </p>
                    <div>
                      <div className="align-items-center d-flex flex-row">
                        <img
                          style={{ height: "50px" }}
                          alt="logo"
                          src="/media/logos/logo-color.png"
                        />
                        <p className="pageDetails">
                          <span>
                            {applicant
                              ? applicant.tenantNumberOfMissions
                              : null}{" "}
                            Missions
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-8 pb-6">
                  <div className="d-flex align-items-left mb-2">
                    <span className="font-weight-bold mr-2">Habite à :</span>
                    <span className="text-hover-primary">
                      {applicant ? applicant.city : null}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card card-custom bg-radial-gradient-primary mb-5">
              <div className="card-header border-0 py-5">
                <h3 className="card-title font-weight-bolder text-white">
                  <FormattedMessage id="TEXT.WANTED.JOB" />
                </h3>
              </div>
              <div className="card-body d-flex flex-column p-0">
                <div className="card-spacer bg-white card-rounded flex-grow-1">
                  {applicant &&
                    jobTitles &&
                    !isNullOrEmpty(applicant.missionArrayDesiredJobTitles) &&
                    applicant.missionArrayDesiredJobTitles.map((skill, i) => {
                      if (i < jobTitlesLimit) {
                        let label =
                          jobTitles &&
                          jobTitles.filter(
                            activityDomain => activityDomain.id === skill
                          );
                        return (
                          label && (
                            <div className="d-flex align-items-center flex-grow-1">
                              <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
                                <div className="d-flex flex-column align-items-cente py-2 w-75">
                                  <span className="text-dark-75 font-weight-bold text-hover-primary font-size-lg mb-1">
                                    {label[0].name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        );
                      }
                    })}
                  {applicant &&
                  applicant.missionArrayDesiredJobTitles &&
                  applicant.missionArrayDesiredJobTitles.length > 3 &&
                  jobTitlesLimit === 3 ? (
                    <button
                      className="btn btn-light-warning mr-2 mt-5"
                      onClick={() =>
                        setJobTitlesLimit(
                          applicant.missionArrayDesiredJobTitles.length
                        )
                      }
                    >
                      <FormattedMessage id="BUTTON.SEE.MORE" />
                    </button>
                  ) : (
                    jobTitlesLimit !== 3 && (
                      <button
                        className="btn btn-light-warning mr-2"
                        onClick={() => setJobTitlesLimit(3)}
                      >
                        <FormattedMessage id="BUTTON.HIDE" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="card card-custom bg-radial-gradient-primary">
              <div className="card-header border-0 py-5">
                <h3 className="card-title font-weight-bolder text-white">
                  <FormattedMessage id="MODEL.COMPETENCES" />
                </h3>
              </div>
              <div className="card-body d-flex flex-column p-0">
                <div className="card-spacer bg-white card-rounded flex-grow-1">
                  {applicant &&
                    !isNullOrEmpty(applicant.applicantArraySkills) &&
                    applicant.applicantArraySkills.map(skill => {
                      let label =
                        jobSkills &&
                        jobSkills.filter(jobSkill => jobSkill.id === skill);
                      return (
                        label && (
                          <div className="d-flex align-items-center flex-grow-1">
                            <div className="d-flex flex-wrap align-items-center justify-content-between w-100">
                              <div className="d-flex flex-column align-items-cente py-2 w-75">
                                <span className="text-dark-75 font-weight-bold text-hover-primary font-size-lg mb-1">
                                  {label[0].name}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-row-fluid ml-lg-8">
            <div className="card card-custom gutter-b">
              <div className="card-header border-0 py-5">
                <h3 className="card-title align-items-start flex-column">
                  <span className="card-label font-weight-bolder text-dark">
                    <FormattedMessage id="APPLICANT.EXPERIENCES" />
                  </span>
                  <span className="text-muted mt-3 font-weight-bold font-size-sm">
                    <FormattedMessage id="APPLICANT.LAST.EXPERIENCES" />
                  </span>
                </h3>
              </div>
              <div className="card-body pt-0 pb-3">
                <div className="table-responsive">
                  <table className="table table-head-custom table-head-bg table-vertical-center table-borderless">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th>
                          <FormattedMessage id="MODEL.JOBNAME" />
                        </th>
                        <th>
                          <FormattedMessage id="TEXT.STARTDATE" />
                        </th>
                        <th>
                          <FormattedMessage id="TEXT.ENDDATE" />
                        </th>
                        <th>
                          <FormattedMessage id="TEXT.MANAGER" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicant &&
                        applicant.applicantExperiences &&
                        renderXp()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card card-custom gutter-b">
              <div className="card-header border-0 py-5">
                <h3 className="card-title align-items-start flex-column">
                  <span className="card-label font-weight-bolder text-dark">
                    <FormattedMessage id="TEXT.CHECK.DOCUMENTS" />
                  </span>
                </h3>
              </div>
              <div className="card-body pt-0 pb-3">
                <div className="table-responsive">
                  <table className="table table-head-custom table-head-bg table-vertical-center table-borderless">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th>
                          <FormattedMessage id="COLUMN.DOCUMENT" />
                        </th>
                        <th>
                          <FormattedMessage id="TEXT.STARTDATE" />
                        </th>
                        <th>
                          <FormattedMessage id="TEXT.ENDDATE" />
                        </th>
                        {applicant && state && state.status === 5 && (
                          <th>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {applicant &&
                        applicant.applicantExperiences &&
                        renderDocuments()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

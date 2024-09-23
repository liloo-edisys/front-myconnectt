import React from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import { Link } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import Avatar from "react-avatar";
import { injectIntl } from "react-intl";
import { MixedWidgetProfile } from "../../../../../_metronic/_partials/widgets";

const MissionWizzardHeader = () => {
  const currentStep = window.location.href.substring(
    window.location.href.lastIndexOf("-") + 1
  );
  const { interimaire } = useSelector(
    state => ({
      interimaire: state.interimairesReducerData.interimaire
    }),
    shallowEqual
  );

  const manageClass = (step, has) => {
    if (currentStep === step && has === true) {
      return "isCurrentFilled";
    }
    if (currentStep === step && has !== true) {
      return "current";
    }
    if (currentStep !== step && has === true) {
      return "isFilled";
    } else return;
  };

  return (
    <div>
      <div className="card card-custom card-stretch">
        <div className="card-body pt-4">
          <div className="d-flex align-items-left">
            <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
              {!isNullOrEmpty(interimaire) &&
              !isNullOrEmpty(interimaire.applicantPicture) ? (
                <Avatar
                  className="symbol-label"
                  color="#3699FF"
                  src={
                    "data:image/" +
                    interimaire.applicantPicture.filename.split(".")[1] +
                    ";base64," +
                    interimaire.applicantPicture.base64
                  }
                />
              ) : (
                <Avatar
                  className="symbol-label"
                  color="#3699FF"
                  maxInitials={2}
                  name={
                    interimaire &&
                    interimaire.firstname &&
                    interimaire.firstname.concat(" ", interimaire.lastname)
                  }
                />
              )}
              <i className="symbol-badge bg-success"></i>
            </div>
            <div>
              {interimaire && (
                <span className="font-weight-bolder font-size-h5 text-dark-75 text-hover-primary">
                  {interimaire &&
                    interimaire.firstname &&
                    interimaire.firstname.concat(" ", interimaire.lastname)}
                </span>
              )}
              <div className="d-flex mb-2">
                <span>
                  {interimaire &&
                    interimaire.mobilePhoneNumber &&
                    interimaire.mobilePhoneNumber.replace(
                      /(.{2})(?!$)/g,
                      "$1 "
                    )}
                </span>
              </div>
            </div>
          </div>
          <div className="separator separator-solid-primary my-10 mx-30"></div>

          <div className="wizard wizard-2">
            <div className="wizard-nav">
              <div className="wizard-steps">
                <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass(
                      "two",
                      interimaire && interimaire.hasPersonalInfo
                    )}
                  >
                    <Link
                      to="/int-profile-edit/step-two"
                      className="d-flex pl-5"
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/General/User.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Informations personnelles
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass(
                      "three",
                      interimaire && interimaire.hasExperience
                    )}
                  >
                    <Link
                      to="/int-profile-edit/step-three"
                      className="d-flex pl-5"
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Clothes/Briefcase.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Mes expériences
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass(
                      "five",
                      interimaire && interimaire.hasDocuments
                    )}
                  >
                    <Link
                      to="/int-profile-edit/step-five"
                      className="d-flex pl-5"
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Files/Group-folders.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Mes documents
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass(
                      "six",
                      interimaire && interimaire.hasMatching
                    )}
                  >
                    <Link
                      to="/int-profile-edit/step-six"
                      className="d-flex pl-5"
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Design/Select.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Matching
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="separator separator-solid-primary my-10 mx-30"></div>
          <MixedWidgetProfile className="card-stretch gutter-b" />
        </div>
      </div>
    </div>
  );
};

export default injectIntl(MissionWizzardHeader);

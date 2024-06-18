import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import { Link, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import Avatar from "react-avatar";
import { FormattedMessage, useIntl, injectIntl } from "react-intl";
import { MixedWidgetProfile } from "../../../../../_metronic/_partials/widgets";

const ClientWizzardHeader = props => {
  const { interimaireId } = useParams();
  const currentStep = window.location.href.substring(
    window.location.href.lastIndexOf("-") + 1
  );

  const { activeInterimaire, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      activeInterimaire: state.accountsReducerData.activeInterimaire,
      updateInterimaireIdentityLoading:
        state.accountsReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );
  const { step, onChangeStep } = props;
  const [interimaire, setInterimaire] = useState(null);

  useEffect(() => {
    setInterimaire(activeInterimaire);
  }, [activeInterimaire]);

  const manageClass = selectedStep => {
    if (step === selectedStep) {
      return "isFilled";
    } else {
      return;
    }
  };

  return (
    <div>
      <div className="card card-custom card-stretch">
        <div className="card-body pt-4">
          <div className="wizard wizard-2">
            <div className="wizard-nav">
              <div className="wizard-steps">
                <div className="navi navi-bold navi-hover navi-active navi-link-rounded">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("edit")}
                  >
                    <div
                      onClick={() => onChangeStep("edit")}
                      //to="/int-profile-edit/step-two"
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
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
                          <FormattedMessage id="TITLE.MODIFY.ENTREPRISE" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("commercialAgreements")}
                  >
                    <div
                      onClick={() => onChangeStep("commercialAgreements")}
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
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
                          Accords commerciaux
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("contacts")}
                  >
                    <div
                      onClick={() => onChangeStep("contacts")}
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Communication/Group.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Contacts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("missions")}
                  >
                    <div
                      onClick={() => onChangeStep("missions")}
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Files/Selected-file.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Offres
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("contracts")}
                  >
                    <div
                      onClick={() => onChangeStep("contracts")}
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Communication/Write.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          Contrats
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("vacancy")}
                  >
                    <div
                      //to="/int-profile-edit/step-six"
                      onClick={() => onChangeStep("vacancy")}
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/General/Duplicate.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          <FormattedMessage id="TITLE.VACANCY.TEMPLATES" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="navi navi-bold navi-hover navi-active navi-link-rounded mt-2">
                  <div
                    className="navi-item wizard-step"
                    data-wizard-type="step"
                    data-wizard-state={manageClass("emails")}
                  >
                    <div
                      //to="/int-profile-edit/step-six"
                      onClick={() => onChangeStep("emails")}
                      className="d-flex pl-5"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="wizard-icon">
                        <span className="navi-icon mr-2">
                          <span className="svg-icon svg-icon-primary">
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Communication/Mail-at.svg"
                              )}
                            ></SVG>
                          </span>
                        </span>
                      </div>
                      <div className="wizard-label">
                        <span className="navi-text font-size-lg wizard-title">
                          <FormattedMessage id="MESSAGE.CENTER" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(ClientWizzardHeader);

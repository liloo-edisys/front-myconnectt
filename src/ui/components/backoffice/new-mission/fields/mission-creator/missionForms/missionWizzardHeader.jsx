import React from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../../../_metronic/_helpers";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";

const MissionWizzardHeader = () => {
  const currentStep = window.location.href.substring(
    window.location.href.lastIndexOf("-") + 1
  );

  let { matches } = useSelector(
    state => ({
      matches: state.applicants.matches
    }),
    shallowEqual
  );

  return (
    <div className="wizard-nav border-right py-8 px-8 py-lg-20 px-lg-10">
      <div className="wizard-steps">
        <div
          className="wizard-step mb-2 p-3"
          data-wizard-type="step"
          data-wizard-state={currentStep === "one" && "current"}
        >
          <div className="wizard-wrapper">
            <div className="wizard-icon">
              <span className="svg-icon svg-icon-2x svg-icon-primary">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/Home/Library.svg")}
                ></SVG>
              </span>
            </div>
            <div className="wizard-label">
              <h3 className="wizard-title">
                <FormattedMessage id="WIZZARD.GENERAL.TITLE" />
              </h3>
              <div className="wizard-desc">
                <FormattedMessage id="WIZZARD.GENERAL.DESC" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="wizard-step mb-2 p-3"
          data-wizard-type="step"
          data-wizard-state={currentStep === "two" && "current"}
        >
          <div className="wizard-wrapper">
            <div className="wizard-icon">
              <span className="svg-icon svg-icon-2x svg-icon-primary">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/Shopping/Euro.svg")}
                ></SVG>
              </span>
            </div>
            <div className="wizard-label">
              <h3 className="wizard-title">
                <FormattedMessage id="WIZZARD.SALARY.TITLE" />
              </h3>
              <div className="wizard-desc">
                <FormattedMessage id="WIZZARD.SALARY.DESC" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="wizard-step mb-2 p-3"
          data-wizard-type="step"
          data-wizard-state={currentStep === "three" && "current"}
        >
          <div className="wizard-wrapper">
            <div className="wizard-icon">
              <span className="svg-icon svg-icon-2x svg-icon-primary">
                <SVG
                  src={toAbsoluteUrl("/media/svg/icons/Home/Clock.svg")}
                ></SVG>
              </span>
            </div>
            <div className="wizard-label">
              <h3 className="wizard-title">
                <FormattedMessage id="WIZZARD.TIME.TITLE" />
              </h3>
              <div className="wizard-desc">
                <FormattedMessage id="WIZZARD.TIME.DESC" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="wizard-step mb-2 p-3"
          data-wizard-type="step"
          data-wizard-state={currentStep === "four" && "current"}
        >
          <div className="wizard-wrapper">
            <div className="wizard-icon">
              <span className="svg-icon svg-icon-2x svg-icon-primary">
                <SVG
                  src={toAbsoluteUrl(
                    "/media/svg/icons/Files/Selected-file.svg"
                  )}
                ></SVG>
              </span>
            </div>
            <div className="wizard-label">
              <h3 className="wizard-title">
                <FormattedMessage id="WIZZARD.DETAILS.TITLE" />
              </h3>
              <div className="wizard-desc">
                <FormattedMessage id="WIZZARD.DETAILS.DESC" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card card-custom wave wave-animate-slow wave-primary mb-8 mb-lg-0 mt-10 box-shadow-primary">
        <div className="card-body">
          <div className="d-flex align-items-center p-5">
            <div className="mr-6">
              <span className="svg-icon svg-icon-success svg-icon-4x">
                <SVG
                  src={toAbsoluteUrl(
                    "/media/svg/icons/Communication/Group.svg"
                  )}
                ></SVG>
              </span>
            </div>
            <div className="d-flex flex-column">
              <span className="custom-counter text-success">
                {matches ? matches : 0}
              </span>
              <div className="text-dark-75">
                <FormattedMessage id="MISSION.CREATE.MATCHING.COUNT" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(MissionWizzardHeader);

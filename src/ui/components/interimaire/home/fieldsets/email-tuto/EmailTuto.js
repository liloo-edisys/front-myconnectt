import React from "react";
import SVG from "react-inlinesvg";
import { Formik, Form, Field } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { Zoom } from "react-reveal";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import { goToNextStep } from "../../../../../../business/actions/interimaire/InterimairesActions";
import "./styles.scss";

function EmailTuto(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { interimaire, step } = useSelector(
    state => state.interimairesReducerData
  );

  return (
    <div
      style={{
        margin: 10,
        zIndex: 10000,
        position: "absolute",
        width: "97.3%"
      }}
      onClick={() => goToNextStep(interimaire, step, dispatch)}
    >
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
      <div className="card card-custom card-stretch gutter-b mt-10 p-5">
        <Zoom duration={1000}>
          <div className="p-5 card card-custom bg-primary white font-weight-bolder">
            <div className=" flex-space-between">
              <div className="flex-space-between">
                <i className="flaticon-information icon-xxl mr-5 white" />
                <FormattedMessage id="TEXT.COMPLETE.PROFILE" />
              </div>
              <div>
                <i className="flaticon2-cross icon-l white" />
              </div>
            </div>
          </div>
          <div>
            <div
              id="kt_login_signin_form"
              className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            >
              <div className="padding-info-container">
                <div className="mb-10">
                  <label htmlFor="lastname">
                    <FormattedMessage id="MODEL.LASTNAME" />
                    <span className="required_asterix">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far fa-envelope text-primary"></i>
                      </span>
                    </div>
                    <div
                      placeholder={intl.formatMessage({
                        id: "MODEL.LASTNAME"
                      })}
                      type="lastname"
                      className={`form-control py-7 px-6`}
                      name="lastname"
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <label htmlFor="firstname">
                    <FormattedMessage id="MODEL.FIRSTNAME" />
                    <span className="required_asterix">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far fa-envelope text-primary"></i>
                      </span>
                    </div>
                    <div
                      placeholder={intl.formatMessage({
                        id: "MODEL.FIRSTNAME"
                      })}
                      type="firstname"
                      className={`form-control py-7 px-6`}
                      name="firstname"
                    />
                  </div>
                </div>
                <div className="mb-10">
                  <label htmlFor="email">
                    <FormattedMessage id="MODEL.EMAIL" />
                    <span className="required_asterix">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far fa-envelope text-primary"></i>
                      </span>
                    </div>
                    <div
                      placeholder={intl.formatMessage({
                        id: "MODEL.EMAIL"
                      })}
                      type="email"
                      className={`form-control py-7 px-6`}
                      name="email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address">
                    <FormattedMessage id="MODEL.ACCOUNT.ADDRESS" />
                    <span className="required_asterix">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far flaticon-home-2 text-primary"></i>
                      </span>
                    </div>
                    <div
                      placeholder={intl.formatMessage({
                        id: "MODEL.ACCOUNT.ADDRESS"
                      })}
                      type="text"
                      className={`form-control py-7 px-6`}
                      name="address"
                    />
                  </div>
                  <div className="h-30"></div>
                </div>
              </div>
              <div className="text-right">
                <button className="btn btn-primary font-weight-bold px-9 py-4 mx-4 btn-shadow">
                  <span>
                    <FormattedMessage id="BUTTON.NEXT" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Zoom>
      </div>
    </div>
  );
}

export default EmailTuto;

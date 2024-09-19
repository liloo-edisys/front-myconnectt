import React, { useState } from "react";

import { Fade } from "react-reveal";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, useDispatch, useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import * as Yup from "yup";
import {
  checkSmsCode,
  getUserWithMobile
} from "../../../../business/actions/interimaire/interimairesActions";

/*
  INTL (i18n) docs:
  https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattedmessage
*/

/*
  Formik+YUP:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
*/

const initialValues = {
  mobilePhone: "",
  smsCode: ""
};

function LoginInterimaire(props) {
  const { intl } = props;
  const dispatch = useDispatch();
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const { interimaire } = useSelector(
    state => ({
      interimaire: state.interimairesReducerData.interimaire
    }),
    shallowEqual
  );

  const LoginSchema = Yup.object().shape({
    mobilePhone: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
  });

  const LoginWithSms = Yup.object().shape({
    smsCode: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^[0-9]+$/,
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIVE_DIGITS" })
      )
      .min(5, intl.formatMessage({ id: "VALIDATION.REQUIRED_FIVE_DIGITS" }))
      .max(5, intl.formatMessage({ id: "VALIDATION.REQUIRED_FIVE_DIGITS" }))
  });

  const getInputClasses = fieldname => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return "is-invalid";
    }

    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return "is-valid";
    }

    return "";
  };
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: interimaire ? LoginWithSms : LoginSchema,
    onSubmit: values => {
      enableLoading();
      if (interimaire) {
        const body = {
          smsCode: values.smsCode,
          mobilePhone: interimaire.username,
          userID: interimaire.id
        };
        checkSmsCode(body, dispatch, "login")
          .then(() => {
            disableLoading();
          })
          .catch(() => {
            disableLoading();
          });
      } else {
        values = { mobilePhone: values.mobilePhone };
        getUserWithMobile(values, dispatch, "login")
          .then(() => {
            disableLoading();
            setShowMobileInput(!showMobileInput);
          })
          .catch(() => {
            disableLoading();
            toastr.error(
              "Compte inexistant",
              "Impossible de vous connecter avec ce numéro de téléphone. Merci de vous inscrire pour avoir un compte MyConnectt."
            );
          });
      }
    }
  });

  const enableLoading = () => {
    setLoading(true);
  };

  const disableLoading = () => {
    setLoading(false);
  };

  return (
    <>
      <div className="login-form login-signin pb-11" id="kt_login_signin_form">
        {/* begin::Head */}
        <div className="text-center mb-10 mb-lg-20">
          <h3 className="font-size-h1 pageTitle">
            <FormattedMessage id="AUTH.LOGIN.INT.TITLE" />
          </h3>
          <p className="text-muted font-weight-bold">
            <FormattedMessage id="AUTH.LOGIN.TITLE.DESC" />
          </p>
        </div>
        {/* end::Head */}

        {/*begin::Form*/}
        <Fade duration={1000} bottom>
          <div>
            <form
              onSubmit={formik.handleSubmit}
              className="form fv-plugins-bootstrap fv-plugins-framework"
            >
              {formik.status && (
                <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
                  <div className="alert-text font-weight-bold">
                    {formik.status}
                  </div>
                </div>
              )}
              {interimaire ? (
                <Fade left opposite when={!showMobileInput}>
                  <div className="row d-flex justify-content-center hide-input">
                    <div className="form-group fv-plugins-icon-container col-lg-10">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text cursor-hand">
                            <i
                              className="icon-xl fas fa-sms text-primary"
                              onClick={() =>
                                setIsRevealPwd(prevState => !prevState)
                              }
                            ></i>
                          </span>
                        </div>
                        <input
                          placeholder={intl.formatMessage({
                            id: "MODEL.CODE.SMS"
                          })}
                          type="text"
                          className={`form-control h-auto py-5 px-6 ${getInputClasses(
                            "smsCode"
                          )}`}
                          name="smsCode"
                          {...formik.getFieldProps("smsCode")}
                        />
                      </div>
                      {formik.touched.smsCode && formik.errors.smsCode ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {formik.errors.smsCode}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Fade>
              ) : (
                <Fade left opposite when={showMobileInput}>
                  <div className="row d-flex justify-content-center">
                    <div className="form-group fv-plugins-icon-container col-lg-10">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-mobile-alt text-primary"></i>
                          </span>
                        </div>
                        <input
                          placeholder={intl.formatMessage({
                            id: "MODEL.MOBILE"
                          })}
                          type="text"
                          className={`form-control h-auto py-5 px-6 ${getInputClasses(
                            "mobilePhone"
                          )}`}
                          name="mobilePhone"
                          {...formik.getFieldProps("mobilePhone")}
                        />
                      </div>
                      {formik.touched.mobilePhone &&
                      formik.errors.mobilePhone ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {formik.errors.mobilePhone}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Fade>
              )}
              <div className="form-group d-flex flex-wrap justify-content-between align-items-center">
                {/*<Link
                  to="/auth/int-forgot-password"
                  className="text-dark-50 text-hover-primary my-3 mr-2"
                  id="kt_login_forgot"
                >
                  <FormattedMessage id="BUTTON.FORGOT" />
                </Link>*/}
                {interimaire ? (
                  <Fade left opposite when={!showMobileInput}>
                    <button
                      id="kt_login_signin_submit"
                      type="submit"
                      disabled={!(formik.isValid && formik.dirty)}
                      className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
                    >
                      <span>
                        <FormattedMessage id="BUTTON.LOGIN" />
                      </span>
                      {loading && (
                        <span className="ml-3 spinner spinner-white"></span>
                      )}
                    </button>
                  </Fade>
                ) : (
                  <Fade left opposite when={showMobileInput}>
                    <button
                      id="kt_login_signin_submit"
                      type="submit"
                      className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
                    >
                      <span>
                        <FormattedMessage id="BUTTON.ASK.CODE" />
                      </span>
                      {loading && (
                        <span className="ml-3 spinner spinner-white"></span>
                      )}
                    </button>
                  </Fade>
                )}
              </div>
            </form>
            {/*end::Form*/}
            <div className="mt-10">
              <span className="opacity-40 mr-4 text-dark">
                <FormattedMessage id="TEXT.DONT.HAVE.MYCONNECTT.ACCOUNT" />
              </span>
              <Link
                to="/auth/int-register"
                className="text-black font-weight-normal"
              >
                <FormattedMessage id="TEXT.CREATE.ACCOUNT" />
              </Link>
            </div>
          </div>
        </Fade>
      </div>
    </>
  );
}

export default injectIntl(connect(null, null)(LoginInterimaire));

import React, { useState } from "react";

import { Fade } from "react-reveal";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import {
  getUserWithMobile
} from "../../../../business/actions/interimaire/interimairesActions";

function RegisterInterimaire(props) {
  const dispatch = useDispatch();
  const initialValues = {
    mobilePhone: "",
    acceptTerms: false,
    legalAgeTerms: false
  };
  const { intl, history } = props;
  const [loading, setLoading] = useState(false);
  const RegistrationSchema = Yup.object().shape({
    mobilePhone: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      ),
    acceptTerms: Yup.boolean().required(
      intl.formatMessage({ id: "AUTH.REGISTER.TERMS_REQUIRED" })
    ),
    legalAgeTerms: Yup.boolean().required(
      intl.formatMessage({ id: "AUTH.REGISTER.TERMS_REQUIRED" })
    )
  });

  const enableLoading = () => {
    setLoading(true);
  };

  const disableLoading = () => {
    setLoading(false);
  };

  return (
    <div
      className="register-form login-signin pb-11"
      style={{ display: "block" }}
    >
      <div className="text-center mb-10 mt-lg-10">
        <h3 className="pageTitle">
          <FormattedMessage id="AUTH.REGISTER.TITLE" />
        </h3>
        <p className="text-muted font-weight-bold col-lg-8 offset-lg-2">
          <FormattedMessage id="AUTH.REGISTER.INTERIMAIRE_MOBILE" />
        </p>
      </div>
      <Fade duration={1000} bottom>
        <div>
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={RegistrationSchema}
            setFieldValue
            onSubmit={(values, { setSubmitting }) => {
              enableLoading();
              getUserWithMobile(values, dispatch, "register")
                .then(response => {
                  disableLoading();
                  response && history.push("/int-register-confirm-code");
                })
                .catch(() => {
                  setSubmitting(true);
                  disableLoading();
                });
            }}
          >
            {({ values, touched, errors, status, handleSubmit }) => (
              <Form
                id="kt_login_signin_form"
                className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
                onSubmit={handleSubmit}
                disabled={loading}
              >
                {status && (
                  <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
                    <div className="alert-text font-weight-bold">{status}</div>
                  </div>
                )}

                <div className="row d-flex justify-content-center">
                  {/* begin: Email */}
                  <div className="form-group col-lg-10">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-mobile-alt text-primary"></i>
                        </span>
                      </div>
                      <Field
                        placeholder={intl.formatMessage({
                          id: "MODEL.MOBILE"
                        })}
                        className={`form-control h-auto py-5 px-6`}
                        name="mobilePhone"
                        disabled={loading}
                      />
                    </div>
                    {touched.mobilePhone && errors.mobilePhone ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.mobilePhone}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  {/* end: Email */}
                </div>
                {/* begin: Terms and Conditions */}
                <div className="row d-flex justify-content-center">
                  <div className="form-group col-lg-10">
                    <label className="checkbox ">
                      <Field
                        type="checkbox"
                        name="acceptTerms"
                        className="m-1"
                        disabled={loading}
                      />
                      <span />
                      <div className="mr-1 ml-2 mt-3">
                        <FormattedMessage id="AUTH.REGISTER.RGPD" />
                        <span>
                          <a
                            href="https://connectt.fr/mentions-legales/"
                            target="_blank"
                            className="mr-1 ml-2 mt-3"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "underline" }}
                          >
                            Lire +
                          </a>
                        </span>
                      </div>
                    </label>
                    {touched.acceptTerms && errors.acceptTerms ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.acceptTerms}
                        </div>
                      </div>
                    ) : null}
                    <label className="checkbox ">
                      <Field
                        type="checkbox"
                        name="legalAgeTerms"
                        className="m-1"
                        disabled={loading}
                      />
                      <span />
                      <div className="mr-1 ml-2 mt-3">
                        <FormattedMessage id="AUTH.REGISTER.LEGAL_AGE.TERMS" />
                      </div>
                    </label>
                    {touched.legalAgeTerms && errors.legalAgeTerms ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.legalAgeTerms}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* end: Terms and Conditions */}
                <div className="form-group d-flex flex-wrap flex-center">
                  <Link to="/auth/int-login">
                    <button
                      type="button"
                      className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                    >
                      <FormattedMessage id="BUTTON.CANCEL" />
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={
                      !values.acceptTerms ||
                      !values.legalAgeTerms ||
                      !values.mobilePhone
                    }
                    className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                  >
                    <span>
                      <FormattedMessage id="BUTTON.REGISTER" />
                    </span>
                    {loading && (
                      <span className="ml-3 spinner spinner-white"></span>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          <div className="mt-10">
            <span className="opacity-40 mr-4 text-dark">
              <FormattedMessage id="TEXT.HAVE.MYCONNECTT.ACCOUNT" />
            </span>
            <Link
              to="/auth/int-login"
              className="text-black font-weight-normal"
            >
              <FormattedMessage id="TEXT.LOGIN.ACCOUNT" />
            </Link>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export default injectIntl(connect(null, null)(RegisterInterimaire));

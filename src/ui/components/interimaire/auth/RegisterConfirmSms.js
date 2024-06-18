import React, { useEffect, useState } from "react";

import { registerInterimaire } from "api/shared/AuthApi";
import { Fade } from "react-reveal";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { checkSmsCode } from "../../../../business/actions/interimaire/InterimairesActions";

function RegisterConfirmSms(props) {
  const dispatch = useDispatch();
  const interimaire = useSelector(
    state => state.interimairesReducerData.interimaire
  );
  const initialValues = {
    smsCode: ""
  };
  const { intl, history } = props;
  const [loading, setLoading] = useState(false);
  const RegistrationSchema = Yup.object().shape({
    smsCode: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^[0-9]+$/,
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIVE_DIGITS" })
      )
      .min(5, intl.formatMessage({ id: "VALIDATION.REQUIRED_FIVE_DIGITS" }))
      .max(5, intl.formatMessage({ id: "VALIDATION.REQUIRED_FIVE_DIGITS" }))
  });

  useEffect(() => {
    if (!interimaire) {
      history.push("/auth/int-login");
    }
  }, []);

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
          <FormattedMessage id="AUTH.REGISTER.INTERIMAIRE_DESC" />
        </p>
      </div>

      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={RegistrationSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          const body = {
            ...values,
            mobilePhone: interimaire.username,
            userID: interimaire.id
          };
          enableLoading();
          checkSmsCode(body, dispatch, "register")
            .then(response => {
              disableLoading();
              response && history.push("/");
            })
            .catch(() => {
              setSubmitting(true);
              disableLoading();
            });
        }}
      >
        {({ values, touched, errors, status, handleSubmit }) => (
          <Fade duration={1000} bottom>
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
                <div className="form-group col-lg-10">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl fas fa-sms text-primary"></i>
                      </span>
                    </div>
                    <Field
                      placeholder={intl.formatMessage({
                        id: "MODEL.CODE.SMS"
                      })}
                      className={`form-control h-auto py-5 px-6`}
                      name="smsCode"
                      disabled={loading}
                    />
                  </div>
                  {touched.smsCode && errors.smsCode ? (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.smsCode}</div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="form-group d-flex flex-wrap flex-center">
                <Link to="/auth/int-register">
                  <button
                    type="button"
                    className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                  >
                    <FormattedMessage id="BUTTON.CANCEL" />
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={!values.smsCode}
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
          </Fade>
        )}
      </Formik>
      <div className="mt-10">
        <span className="opacity-40 mr-4 text-dark">
          <FormattedMessage id="TEXT.HAVE.MYCONNECTT.ACCOUNT" />
        </span>
        <Link to="/auth/int-login" className="text-black font-weight-normal">
          <FormattedMessage id="TEXT.LOGIN.ACCOUNT" />
        </Link>
      </div>
    </div>
  );
}

export default injectIntl(connect(null, null)(RegisterConfirmSms));

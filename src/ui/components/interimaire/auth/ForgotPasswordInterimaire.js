import React, { useState } from "react";

import { requestPassword } from "api/shared/AuthApi";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, Redirect } from "react-router-dom";
import * as Yup from "yup";

const initialValues = {
  email: ""
};

function ForgotPasswordInterimaire(props) {
  const { intl } = props;
  const [isRequested, setIsRequested] = useState(false);
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
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
    validationSchema: ForgotPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting, history }) => {
      requestPassword(values.email)
        .then(() => setIsRequested(true))
        .then(
          toastr.success(
            intl.formatMessage({ id: "AUTH.REGISTER.TITLE" }),
            intl.formatMessage({ id: "AUTH.REGISTER.SUCCESS_DESC" })
          )
        )
        .then(history.push("/"))
        .catch(() => {
          setIsRequested(false);
          setSubmitting(false);
          setStatus(intl.formatMessage({ id: "TEXT.ERROR.FRIENDLY" }));
        });
    }
  });

  return (
    <>
      {isRequested && <Redirect to="/auth" />}
      {!isRequested && (
        <div className="login-form login-forgot" style={{ display: "block" }}>
          <div className="text-center mb-10 mb-lg-20">
            <h3 className="font-size-h1 pageTitle">
              <FormattedMessage id="AUTH.FORGOT.TITLE" />
            </h3>
            <div className="text-muted font-weight-bold">
              <FormattedMessage id="AUTH.FORGOT.DESC" />
            </div>
          </div>
          <form
            onSubmit={formik.handleSubmit}
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
          >
            {formik.status && (
              <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
                <div className="alert-text font-weight-bold">
                  {formik.status}
                </div>
              </div>
            )}
            <div className="row d-flex justify-content-center">
              <div className="form-group fv-plugins-icon-container col-lg-10">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl far fa-envelope text-primary"></i>
                    </span>
                  </div>
                  <input
                    placeholder={intl.formatMessage({ id: "MODEL.EMAIL" })}
                    type="email"
                    className={`form-control h-auto py-5 px-6 ${getInputClasses(
                      "email"
                    )}`}
                    name="email"
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{formik.errors.email}</div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-group d-flex flex-wrap flex-center">
              <Link to="/auth">
                <button
                  type="button"
                  id="kt_login_forgot_cancel"
                  className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4"
                >
                  <FormattedMessage id="BUTTON.CANCEL" />
                </button>
              </Link>
              <button
                id="kt_login_forgot_submit"
                type="submit"
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4"
                disabled={formik.isSubmitting}
              >
                <FormattedMessage id="BUTTON.SUBMIT" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default injectIntl(connect(null, null)(ForgotPasswordInterimaire));

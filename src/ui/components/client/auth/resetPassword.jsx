import React, { useState } from "react";

import { resetPassword } from "api/shared/authApi";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, Redirect } from "react-router-dom";
import * as Yup from "yup";

const token = window.location.href.substring(
  window.location.href.lastIndexOf("/") + 1
);

const initialValues = {
  password: "",
  confirmPassword: ""
};

function ResetPassword(props) {
  const { intl } = props;
  const [isRequested, setIsRequested] = useState(false);
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [isRevealConfirm, setIsRevealConfirm] = useState(false);

  const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .label("Password")
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        intl.formatMessage({ id: "VALIDATION.PASSWORD.FORMAT" })
      ),
    confirmPassword: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .when("password", {
        is: val => (val && val.length > 0 ? true : false),
        then: Yup.string().oneOf(
          [Yup.ref("password")],
          intl.formatMessage({ id: "VALIDATION.CONFIRM_MATCH_PASSWORD" })
        )
      })
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
    validationSchema: ResetPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting, history }) => {
      resetPassword(token, values.password)
        .then(() => setIsRequested(true))
        .then(
          toastr.success(
            intl.formatMessage({ id: "AUTH.RESET.SUCCESS_TITLE" }),
            intl.formatMessage({ id: "AUTH.RESET.SUCCESS_DESC" })
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
              <FormattedMessage id="AUTH.RESET.TITLE" />
            </h3>
            <div className="text-muted font-weight-bold">
              <FormattedMessage id="AUTH.RESET.DESC" />
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
                      <i
                        className={
                          isRevealPwd
                            ? "icon-xl far fa-eye-slash text-primary"
                            : "icon-xl far fa-eye text-primary"
                        }
                        onClick={() => setIsRevealPwd(prevState => !prevState)}
                      ></i>
                    </span>
                  </div>
                  <input
                    type={isRevealPwd ? "text" : "password"}
                    placeholder="Mot de passe"
                    className={`form-control h-auto py-5 px-6 ${getInputClasses(
                      "password"
                    )}`}
                    name="password"
                    {...formik.getFieldProps("password")}
                  />
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.password}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="row d-flex justify-content-center">
              <div className="form-group fv-plugins-icon-container col-lg-10">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i
                        className={
                          isRevealConfirm
                            ? "icon-xl far fa-eye-slash text-primary"
                            : "icon-xl far fa-eye text-primary"
                        }
                        onClick={() =>
                          setIsRevealConfirm(prevState => !prevState)
                        }
                      ></i>
                    </span>
                  </div>
                  <input
                    type={isRevealConfirm ? "text" : "password"}
                    placeholder="Confirmation"
                    className={`form-control h-auto py-5 px-6 ${getInputClasses(
                      "password"
                    )}`}
                    name="confirmPassword"
                    {...formik.getFieldProps("confirmPassword")}
                  />
                </div>
                {formik.touched.confirmPassword &&
                formik.errors.confirmPassword ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      {formik.errors.confirmPassword}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="form-group d-flex flex-wrap flex-center">
              <Link to="/auth">
                <button
                  type="button"
                  id="kt_login_forgot_cancel"
                  className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                >
                  <FormattedMessage id="BUTTON.CANCEL" />
                </button>
              </Link>
              <button
                id="kt_login_forgot_submit"
                type="submit"
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
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

export default injectIntl(connect(null, null)(ResetPassword));

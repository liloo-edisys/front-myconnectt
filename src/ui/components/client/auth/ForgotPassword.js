import React, { useState } from "react";
import { requestPassword } from "api/shared/AuthApi";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, Redirect } from "react-router-dom";
import * as Yup from "yup";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

const initialValues = {
  email: ""
};

function ForgotPassword(props) {
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
    onSubmit: (values, { setStatus, setSubmitting }) => {
      requestPassword(values.email)
        .then(() => setIsRequested(true))
        .catch(error => {
          setIsRequested(false);
          setSubmitting(false);
          setStatus(intl.formatMessage({ id: "TEXT.ERROR.EMAIL" }));
          toastr.error(
            intl.formatMessage({ id: "TEXT.RESET.PASSWORD.TITLE" }),
            intl.formatMessage({ id: "TEXT.ERROR.EMAIL" })
          );
          return error;
        })
        .then(error => {
          !error &&
            toastr.success(
              intl.formatMessage({ id: "TEXT.RESET.PASSWORD.TITLE" }),
              intl.formatMessage({ id: "TEXT.RESET.PASSWORD.DESCRIPTION" })
            );
        });
    }
  });

  return (
    <>
      {isRequested && <Redirect to="/auth" />}
      {!isRequested && (
        <div className="d-flex flex-column flex-root">
          <div className="login login-1 login-forgot-on d-flex flex-column flex-lg-row flex-column-fluid bg-primary h-100">
            <div className="login-content flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7">
              <div className="d-flex flex-column-fluid flex-center">
                <div
                  className="login-form login-forgot bg-white shadow-sm p-10"
                  style={{
                    width: "100%",
                    maxWidth: "600px",
                    borderRadius: "34px"
                  }}
                >
                  <div className="text-center mb-10">
                    <Link to="/">
                      <img
                        alt="Logo"
                        src={toAbsoluteUrl(
                          "/media/logos/logo-myconnectt-color.png"
                        )}
                        className="max-h-80px"
                      />
                    </Link>
                    <h3 className="font-size-h1 text-primary font-weight-bolder">
                      Mot de passe oublié ?
                    </h3>
                    <div className="text-muted font-weight-bold">
                      Veuillez saisir votre mail de connexion afin de recevoir
                      le lien de réinitialisation de votre mot de passe.
                    </div>
                  </div>

                  <form
                    onSubmit={formik.handleSubmit}
                    className="form fv-plugins-bootstrap fv-plugins-framework animate__animated animate__backInUp"
                  >
                    {formik.status && (
                      <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
                        <div className="alert-text font-weight-bold">
                          {formik.status}
                        </div>
                      </div>
                    )}

                    <div className="form-group fv-plugins-icon-container">
                      <label className="font-size-h6 font-weight-bold text-primary">
                        Nom d'utilisateur ou Email
                      </label>
                      <input
                        type="email"
                        placeholder="Nom d'utilisateur ou Email"
                        className={`form-control form-control-solid h-auto py-5 px-6 rounded-pill ${getInputClasses(
                          "email"
                        )}`}
                        name="email"
                        {...formik.getFieldProps("email")}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {formik.errors.email}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group d-flex flex-column align-items-center">
                      <button
                        id="kt_login_forgot_submit"
                        type="submit"
                        className="btn btn-primary font-weight-bold px-9 py-4 my-3 w-50 rounded-pill"
                        disabled={formik.isSubmitting}
                      >
                        Recevoir le lien
                      </button>

                      <Link
                        to="/auth"
                        className="text-muted text-hover-primary font-weight-bold"
                      >
                        Retour à la page de connexion
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default injectIntl(connect(null, null)(ForgotPassword));

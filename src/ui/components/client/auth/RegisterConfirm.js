import React, { useEffect, useState } from "react";

import { login } from "actions/shared/AuthActions";
import { confirmInvite } from "api/client/ContactsApi";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";

import { getUserByToken } from "../../../../business/actions/client/UserActions";

const token = window.location.href.substring(
  window.location.href.lastIndexOf("/") + 1
);

function RegisterConfirm(props) {
  const { intl } = props;
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [isRevealConfirm, setIsRevealConfirm] = useState(false);
  const [email] = useState(localStorage.getItem("userEmail") || "");

  const [loading, setLoading] = useState(false);
  const { user } = useSelector(
    state => ({ user: state.user.user }),
    shallowEqual
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserByToken.request({ tenantId: 1, token }));
  }, [dispatch]);

  const initialValues = {
    tenantID: TENANTID,
    firstname: user.firstname ? user.firstname : "",
    lastname: user.lastname ? user.lastname : "",
    token: token,
    password: "",
    mobilePhoneNumber: user.mobilePhoneNumber ? user.mobilePhoneNumber : "",
    homePhoneNumber: user.homePhoneNumber ? user.homePhoneNumber : "",
    poste: user.poste ? user.poste : "",
    acceptTerms: false,
    confirm: "",
    email: user.email ? user.email : ""
  };

  const RegistrationSchema = Yup.object().shape(
    {
      firstname: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      lastname: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      mobilePhoneNumber: Yup.string().when(["homePhoneNumber"], {
        is: val => !!val,
        then: Yup.string().matches(
          /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
          intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
        ),
        otherwise: Yup.string()
          .matches(
            /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
            intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
          )
          .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      }),

      homePhoneNumber: Yup.string()
        .matches(
          /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
          intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
        )
        .when("mobilePhoneNumber", {
          is: val => !!val,
          then: Yup.string().matches(
            /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
            intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
          ),
          otherwise: Yup.string()
            .matches(
              /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
              intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
            )
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
        }),

      poste: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      password: Yup.string()
        .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
          intl.formatMessage({ id: "VALIDATION.PASSWORD.FORMAT" })
        ),
      confirm: Yup.string()
        .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
        .when("password", {
          is: val => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf(
            [Yup.ref("password")],
            intl.formatMessage({ id: "VALIDATION.CONFIRM_MATCH_PASSWORD" })
          )
        }),
      acceptTerms: Yup.bool().required(
        "You must accept the terms and conditions"
      )
    },
    [["mobilePhoneNumber", "homePhoneNumber"], ["homePhoneNumber"]]
  );

  const enableLoading = () => {
    setLoading(true);
  };

  const disableLoading = () => {
    setLoading(false);
  };

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
    validationSchema: RegistrationSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      enableLoading();
      confirmInvite(values)
        .then(data => {
          disableLoading();
          dispatch(login.request(values));
        })
        .catch(() => {
          setSubmitting(false);
          setStatus(
            intl.formatMessage({
              id: "TEXT.ERROR.FRIENDLY"
            })
          );
          disableLoading();
        });
    }
  });

  return (
    <div className="register-form-improved">
      <div className="register-container">
        {/* Header Section */}
        <div className="register-header">
          <h1 className="register-title">
            <FormattedMessage id="AUTH.REGISTER.TITLE" />
          </h1>
          <p className="register-subtitle">
            <FormattedMessage id="CONTACTS.REGISTER.DESC" />
          </p>
        </div>

        <form
          className="register-form-content"
          onSubmit={formik.handleSubmit}
          noValidate
        >
          {/* Alert Section */}
          {formik.status && (
            <div className="alert-container">
              <div className="alert alert-danger">
                <div className="alert-text">{formik.status}</div>
              </div>
            </div>
          )}

          {/* Sections de formulaire */}
          <div className="form-sections">
            {/* Section Informations personnelles */}
            <div className="form-section">
              <h3 className="section-title">Informations personnelles</h3>
              <div className="form-row">
                {/* Prénom */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.FIRSTNAME" />
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({
                        id: "MODEL.FIRSTNAME"
                      })}
                      type="text"
                      className={`form-control ${getInputClasses("firstname")}`}
                      name="firstname"
                      {...formik.getFieldProps("firstname")}
                    />
                  </div>
                  {formik.touched.firstname && formik.errors.firstname && (
                    <div className="error-message">
                      {formik.errors.firstname}
                    </div>
                  )}
                </div>

                {/* Nom */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.LASTNAME" />
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({ id: "MODEL.LASTNAME" })}
                      type="text"
                      className={`form-control ${getInputClasses("lastname")}`}
                      name="lastname"
                      {...formik.getFieldProps("lastname")}
                    />
                  </div>
                  {formik.touched.lastname && formik.errors.lastname && (
                    <div className="error-message">
                      {formik.errors.lastname}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Contact */}
            <div className="form-section">
              <h3 className="section-title">Informations de contact</h3>
              <div className="form-row">
                {/* Téléphone mobile */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.MOBILE" />
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-mobile-alt"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({
                        id: "MODEL.MOBILE"
                      })}
                      type="text"
                      className={`form-control ${getInputClasses(
                        "mobilePhoneNumber"
                      )}`}
                      name="mobilePhoneNumber"
                      {...formik.getFieldProps("mobilePhoneNumber")}
                    />
                  </div>
                  {formik.touched.mobilePhoneNumber &&
                    formik.errors.mobilePhoneNumber && (
                      <div className="error-message">
                        {formik.errors.mobilePhoneNumber}
                      </div>
                    )}
                </div>

                {/* Téléphone fixe */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.PHONE" />
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({
                        id: "MODEL.PHONE"
                      })}
                      type="text"
                      className={`form-control ${getInputClasses(
                        "homePhoneNumber"
                      )}`}
                      name="homePhoneNumber"
                      {...formik.getFieldProps("homePhoneNumber")}
                    />
                  </div>
                  {formik.touched.homePhoneNumber &&
                    formik.errors.homePhoneNumber && (
                      <div className="error-message">
                        {formik.errors.homePhoneNumber}
                      </div>
                    )}
                </div>
              </div>

              <div className="form-row">
                {/* Email */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.EMAIL" />
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="far fa-envelope"></i>
                    </div>
                    <input
                      placeholder={formik.values.email}
                      type="email"
                      className={`form-control disabled ${getInputClasses(
                        "email"
                      )}`}
                      name="email"
                      disabled
                      {...formik.getFieldProps("email")}
                    />
                  </div>
                </div>

                {/* Poste */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.JOBTITLE" />
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <i className="fas fa-briefcase"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({ id: "MODEL.JOBTITLE" })}
                      type="text"
                      className={`form-control ${getInputClasses("poste")}`}
                      name="poste"
                      {...formik.getFieldProps("poste")}
                    />
                  </div>
                  {formik.touched.poste && formik.errors.poste && (
                    <div className="error-message">{formik.errors.poste}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Sécurité */}
            <div className="form-section">
              <h3 className="section-title">Sécurité</h3>
              <div className="form-row">
                {/* Mot de passe */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.PASSWORD" />
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper password-input">
                    <div className="input-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({ id: "MODEL.PASSWORD" })}
                      type={isRevealPwd ? "text" : "password"}
                      className={`form-control ${getInputClasses("password")}`}
                      name="password"
                      {...formik.getFieldProps("password")}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setIsRevealPwd(prevState => !prevState)}
                    >
                      <i
                        className={
                          isRevealPwd ? "far fa-eye-slash" : "far fa-eye"
                        }
                      ></i>
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="error-message">
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div className="form-group">
                  <label className="form-label">
                    <FormattedMessage id="MODEL.PASSWORDCONFIRM" />
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper password-input">
                    <div className="input-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      placeholder={intl.formatMessage({
                        id: "MODEL.PASSWORDCONFIRM"
                      })}
                      type={isRevealConfirm ? "text" : "password"}
                      className={`form-control ${getInputClasses("confirm")}`}
                      name="confirm"
                      {...formik.getFieldProps("confirm")}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() =>
                        setIsRevealConfirm(prevState => !prevState)
                      }
                    >
                      <i
                        className={
                          isRevealConfirm ? "far fa-eye-slash" : "far fa-eye"
                        }
                      ></i>
                    </button>
                  </div>
                  {formik.touched.confirm && formik.errors.confirm && (
                    <div className="error-message">{formik.errors.confirm}</div>
                  )}
                </div>
              </div>

              {/* Note de sécurité */}
              <div className="security-note">
                <i className="fas fa-info-circle"></i>
                <p>
                  Le mot de passe doit contenir au moins 8 caractères, incluant
                  une lettre, un chiffre et un caractère spécial.
                </p>
              </div>
            </div>

            {/* Conditions d'utilisation */}
            <div className="form-section terms-section">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  {...formik.getFieldProps("acceptTerms")}
                />
                <label htmlFor="acceptTerms" className="checkbox-label">
                  <span className="checkbox-text">
                    J'accepte les{" "}
                    <a
                      href="https://myconnectt.fr/mentions-legales/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terms-link"
                    >
                      conditions d'utilisation
                    </a>
                  </span>
                </label>
              </div>
              {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                <div className="error-message">{formik.errors.acceptTerms}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link to="/auth/login" className="cancel-link">
              <button type="button" className="btn btn-secondary">
                <FormattedMessage id="BUTTON.CANCEL" />
              </button>
            </Link>
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.values.acceptTerms}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                </span>
              ) : (
                <span>
                  <FormattedMessage id="BUTTON.REGISTER" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .register-form-improved {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          background-color: #f8f9fa;
          padding: 2rem;
          overflow-y: auto;
        }

        .register-container {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 900px;
          padding: 3rem;
          margin: auto 0;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .register-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .register-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: rgb(47, 151, 255);
          margin-bottom: 0.5rem;
        }

        .register-subtitle {
          font-size: 1.125rem;
          color: #6c757d;
          margin: 0;
        }

        .alert-container {
          margin-bottom: 2rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .alert-danger {
          background-color: #fff5f5;
          border-color: #dc3545;
          color: #721c24;
        }

        .alert-text {
          font-weight: 500;
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .form-section {
          padding: 1.5rem;
          background-color: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e9ecef;
          transition: border-color 0.3s ease;
        }

        .form-section:hover {
          border-color: #dee2e6;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e9ecef;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-row:last-child {
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .required {
          color: #dc3545;
          margin-left: 0.25rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #6c757d;
          font-size: 1.1rem;
          pointer-events: none;
          z-index: 10;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          font-size: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          outline: none;
          background-color: #ffffff;
        }

        .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .form-control.is-invalid {
          border-color: #dc3545;
          padding-right: 3rem;
        }

        .form-control.is-valid {
          border-color: #28a745;
          padding-right: 3rem;
        }

        .form-control.disabled {
          background-color: #e9ecef;
          cursor: not-allowed;
          color: #6c757d;
        }

        .password-input {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 0.5rem;
          font-size: 1.1rem;
          z-index: 10;
          transition: color 0.3s ease;
        }

        .toggle-password:hover {
          color: #495057;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .security-note {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background-color: #e3f2fd;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .security-note i {
          color: #1976d2;
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .security-note p {
          margin: 0;
          color: #1565c0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .terms-section {
          background-color: transparent;
          border: none;
          padding: 0;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        #acceptTerms {
          width: 20px;
          height: 20px;
          margin-top: 0.125rem;
          cursor: pointer;
          accent-color: #007bff;
        }

        .checkbox-label {
          cursor: pointer;
          user-select: none;
          line-height: 1.5;
        }

        .checkbox-text {
          color: #495057;
          font-size: 1rem;
        }

        .terms-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .terms-link:hover {
          color: rgb(51, 145, 246);
          text-decoration: underline;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #e9ecef;
        }

        .btn {
          padding: 0.875rem 2.5rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background-color: #007bff;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }

        .btn-primary:disabled {
          background-color: #6c757d;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.65;
        }

        .btn-secondary {
          background-color: #f8f9fa;
          color: #495057;
          border: 2px solid #dee2e6;
        }

        .btn-secondary:hover {
          background-color: #e9ecef;
          border-color: #adb5bd;
        }

        .cancel-link {
          text-decoration: none;
        }

        .loading-spinner {
          font-size: 1.125rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .register-container {
            padding: 2rem;
          }

          .register-title {
            font-size: 2rem;
          }

          .register-subtitle {
            font-size: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .register-container {
            padding: 1.5rem;
          }

          .section-title {
            font-size: 1.125rem;
          }

          .form-control {
            padding: 0.625rem 0.875rem 0.625rem 2.5rem;
          }

          .input-icon {
            font-size: 1rem;
            left: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default injectIntl(RegisterConfirm);

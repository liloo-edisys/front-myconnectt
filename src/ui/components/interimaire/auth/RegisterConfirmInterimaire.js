import React, { useEffect, useState } from "react";

import { login } from "actions/shared/authActions";
import { confirmSubscription } from "api/interimaire/interimairesApi";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";

import { getUserByToken } from "../../../../business/actions/client/userActions";
import { getTitlesTypes } from "../../../../business/actions/shared/listsActions";

const token = window.location.href.substring(
  window.location.href.lastIndexOf("/") + 1
);

function RegisterConfirmInterimaire(props) {
  const { intl } = props;
  const [loading, setLoading] = useState(false);
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [isRevealConfirm, setIsRevealConfirm] = useState(false);

  const { user, titleTypes } = useSelector(
    state => ({
      user: state.user.user,
      titleTypes: state.lists.titleTypes
    }),
    shallowEqual
  );

  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUserByToken.request({ tenantId: 1, token }));
    dispatch(getTitlesTypes.request());
  }, [dispatch]);

  const initialValues = {
    tenantID: TENANTID,
    email: user.email ? user.email : "",
    postalCode: "",
    city: "",
    titleTypeID: 1,
    firstname: user.firstname ? user.firstname : "",
    lastname: user.lastname ? user.lastname : "",
    token: token,
    password: "",
    mobilePhoneNumber: user.mobilePhoneNumber ? user.mobilePhoneNumber : "",
    acceptTerms: false,
    legalAgeTerms: false,
    confirm: ""
  };

  const RegistrationSchema = Yup.object().shape({
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    mobilePhoneNumber: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      ),
    titleTypeID: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    postalCode: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    city: Yup.string().required(
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
      intl.formatMessage({ id: "AUTH.REGISTER.TERMS_REQUIRED" })
    ),
    legalAgeTerms: Yup.bool().required(
      intl.formatMessage({ id: "AUTH.REGISTER.LEGAL_AGE.TERMS_REQUIRED" })
    )
  });

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
      confirmSubscription(values)
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
    // !user.email ? null :
    <div className="register-form login-signin" style={{ display: "block" }}>
      <div className="text-center mb-10 mb-lg-20">
        <h3 className="font-size-h1 pageTitle">
          <FormattedMessage id="AUTH.REGISTER.TITLE" />
        </h3>
        <p className="text-muted font-weight-bold">
          <FormattedMessage id="CONTACTS.REGISTER.DESC" />
        </p>
      </div>

      <form
        id="kt_login_signin_form"
        className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
        onSubmit={formik.handleSubmit}
      >
        {/* begin: Alert */}
        {formik.status && (
          <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
            <div className="alert-text font-weight-bold">{formik.status}</div>
          </div>
        )}
        {/* end: Alert */}
        <div className="row">
          {/* Civilité */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-genderless text-primary"></i>
                </span>
              </div>
              <select
                className="form-control h-auto py-5 px-6"
                name="titleTypeID"
                onChange={e => {
                  formik.setFieldValue("titleTypeID", parseInt(e.target.value));
                }}
              >
                {titleTypes.map(xp => (
                  <option key={xp.id} value={xp.id}>
                    {xp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="row">
          {/* begin: firstName */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fas fa-user-tie text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({
                  id: "MODEL.FIRSTNAME"
                })}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "firstname"
                )}`}
                name="firstname"
                {...formik.getFieldProps("firstname")}
              />
            </div>
            {formik.touched.firstname && formik.errors.firstname ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.firstname}</div>
              </div>
            ) : null}
          </div>
          {/* end: firstName */}

          {/* begin: lastName */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-user-tie text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({ id: "MODEL.LASTNAME" })}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "lastname"
                )}`}
                name="lastname"
                {...formik.getFieldProps("lastname")}
              />
            </div>
            {formik.touched.lastname && formik.errors.lastname ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.lastname}</div>
              </div>
            ) : null}
          </div>
          {/* end: lastName */}
        </div>

        <div className="row">
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-map-marker-alt text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({
                  id: "MODEL.ACCOUNT.CITY"
                })}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "city"
                )}`}
                name="city"
                {...formik.getFieldProps("city")}
              />
            </div>
            {formik.touched.city && formik.errors.city ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.city}</div>
              </div>
            ) : null}
          </div>
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-map-marker-alt text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({
                  id: "MODEL.ACCOUNT.POSTALCODE"
                })}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "postalCode"
                )}`}
                name="postalCode"
                {...formik.getFieldProps("postalCode")}
              />
            </div>
            {formik.touched.postalCode && formik.errors.postalCode ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.postalCode}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="row">
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl far fa-envelope text-primary"></i>
                </span>
              </div>
              <input
                placeholder={formik.values.email}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "email"
                )}`}
                name="email"
                disabled
                {...formik.getFieldProps("email")}
              />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.email}</div>
              </div>
            ) : null}
          </div>
          <div className="form-group col-lg-6">
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
                  "mobilePhoneNumber"
                )}`}
                name="mobilePhoneNumber"
                {...formik.getFieldProps("mobilePhoneNumber")}
              />
            </div>
            {formik.touched.mobilePhoneNumber &&
            formik.errors.mobilePhoneNumber ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  {formik.errors.mobilePhoneNumber}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="row">
          {/* begin: Password */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text cursor-hand">
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
                placeholder={intl.formatMessage({ id: "MODEL.PASSWORD" })}
                type={isRevealPwd ? "text" : "password"}
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "password"
                )}`}
                name="password"
                {...formik.getFieldProps("password")}
              />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.password}</div>
              </div>
            ) : null}
          </div>
          {/* end: Password */}

          {/* begin: Confirm Password */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text cursor-hand">
                  <i
                    className={
                      isRevealConfirm
                        ? "icon-xl far fa-eye-slash text-primary"
                        : "icon-xl far fa-eye text-primary"
                    }
                    onClick={() => setIsRevealConfirm(prevState => !prevState)}
                  ></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({
                  id: "MODEL.PASSWORDCONFIRM"
                })}
                type={isRevealConfirm ? "text" : "password"}
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "confirm"
                )}`}
                name="confirm"
                {...formik.getFieldProps("confirm")}
              />
            </div>
            {formik.touched.confirm && formik.errors.confirm ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.confirm}</div>
              </div>
            ) : null}
          </div>
          {/* end: Confirm Password */}
        </div>
        {/* begin: Terms and Conditions */}
        <div className="row d-flex justify-content-center">
          <div className="form-group col-lg-12">
            <label className="checkbox">
              <input
                type="checkbox"
                name="acceptTerms"
                className="m-1"
                {...formik.getFieldProps("acceptTerms")}
              />
              <span />
              <a
                href="https://connectt.fr/mentions-legales/"
                target="_blank"
                className="mr-1 ml-2 mt-3"
                rel="noopener noreferrer"
              >
                <FormattedMessage id="AUTH.REGISTER.RGPD" />
              </a>
            </label>
            {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.acceptTerms}</div>
              </div>
            ) : null}
            <label className="checkbox mt-3">
              <input
                type="checkbox"
                name="legalAgeTerms"
                className="m-1"
                {...formik.getFieldProps("legalAgeTerms")}
              />
              <span />
              <p className="mr-1 ml-2 mt-3">
                <FormattedMessage id="AUTH.REGISTER.LEGAL_AGE.TERMS" />
              </p>
            </label>
            {formik.touched.legalAgeTerms && formik.errors.legalAgeTerms ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  {formik.errors.legalAgeTerms}
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
              formik.isSubmitting ||
              !formik.values.acceptTerms ||
              !formik.values.legalAgeTerms
            }
            className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
          >
            <span>
              <FormattedMessage id="BUTTON.REGISTER" />
            </span>
            {loading && <span className="ml-3 spinner spinner-white"></span>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default injectIntl(RegisterConfirmInterimaire);

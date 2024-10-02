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
          {/* begin: firstName */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-user-tie text-primary"></i>
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
          {/* begin: Email */}
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
          {/* end: Email */}

          {/* begin: mobile */}
          <div className="form-group col-lg-6">
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="icon-xl fas fa-phone text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({
                  id: "MODEL.PHONE"
                })}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "homePhoneNumber"
                )}`}
                name="homePhoneNumber"
                {...formik.getFieldProps("homePhoneNumber")}
              />
            </div>
            {formik.touched.homePhoneNumber && formik.errors.homePhoneNumber ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  {formik.errors.homePhoneNumber}
                </div>
              </div>
            ) : null}
          </div>
          {/* end: mobile */}
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
                  <i className="icon-xl fas fa-laptop-code text-primary"></i>
                </span>
              </div>
              <input
                placeholder={intl.formatMessage({ id: "MODEL.JOBTITLE" })}
                type="text"
                className={`form-control h-auto py-5 px-6 ${getInputClasses(
                  "poste"
                )}`}
                name="poste"
                {...formik.getFieldProps("poste")}
              />
            </div>
            {formik.touched.poste && formik.errors.poste ? (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">{formik.errors.poste}</div>
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
        <div className="form-group">
          <label className="checkbox">
            <input
              type="checkbox"
              name="acceptTerms"
              className="m-1"
              {...formik.getFieldProps("acceptTerms")}
            />
            <a
              href="https://myconnectt.fr/mentions-legales/"
              target="_blank"
              className="mr-1"
              rel="noopener noreferrer"
            >
              <FormattedMessage id="AUTH.REGISTER.TERMS" />
            </a>
            <span />
          </label>
          {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.acceptTerms}</div>
            </div>
          ) : null}
        </div>
        {/* end: Terms and Conditions */}
        <div className="form-group d-flex flex-wrap flex-center">
          <Link to="/auth/login">
            <button
              type="button"
              className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
            >
              <FormattedMessage id="BUTTON.CANCEL" />
            </button>
          </Link>
          <button
            type="submit"
            disabled={formik.isSubmitting || !formik.values.acceptTerms}
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

export default injectIntl(RegisterConfirm);

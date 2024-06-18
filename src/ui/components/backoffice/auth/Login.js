import React, { useState, useEffect } from "react";

import { login } from "actions/shared/AuthActions";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, useDispatch, useSelector, shallowEqual } from "react-redux";
import { Link } from "react-router-dom";
import { persistor } from "../../../../business/store";
import * as Yup from "yup";

/*
  INTL (i18n) docs:
  https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattedmessage
*/

/*
  Formik+YUP:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
*/

const initialValues = {
  email: "",
  password: ""
};

function Login(props) {
  const { intl } = props;
  const dispatch = useDispatch();
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const { loading } = useSelector(
    state => ({
      loading: state.auth.loading
    }),
    shallowEqual
  );

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    password: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
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
    validationSchema: LoginSchema,
    onSubmit: values => {
      dispatch(login.request(values));
    }
  });

  useEffect(() => {
    persistor.flush();
  }, []);

  return (
    <div className="login-form login-signin pb-11">
      {/* begin::Head */}
      <div className="text-center pb-8">
        <h2 className="font-size-h1 pageTitle">
          <FormattedMessage id="AUTH.LOGIN.ADMIN.TITLE" />
        </h2>
        <p className="text-muted font-weight-bold">
          <FormattedMessage id="AUTH.LOGIN.TITLE.DESC" />
        </p>
      </div>
      {/* end::Head */}

      {/*begin::Form*/}
      <form onSubmit={formik.handleSubmit} className="form">
        {formik.status && (
          <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
            <div className="alert-text font-weight-bold">{formik.status}</div>
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
        <div className="row d-flex justify-content-center">
          <div className="form-group fv-plugins-icon-container pwd-container col-lg-10">
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
        </div>
        <div className="form-group d-flex flex-wrap justify-content-between align-items-left">
          <Link
            to="/auth/backoffice-forgot-password"
            className="text-dark-50 text-hover-primary my-3 mr-2"
            id="kt_login_forgot"
          >
            <FormattedMessage id="BUTTON.FORGOT" />
          </Link>
          <div className="my-3 mr-2"></div>
          <button
            id="kt_login_signin_submit"
            type="submit"
            disabled={!(formik.isValid && formik.dirty)}
            className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
          >
            <span>
              <FormattedMessage id="BUTTON.LOGIN" />
            </span>
            {loading && <span className="ml-3 spinner spinner-white"></span>}
          </button>
        </div>
      </form>
      {/*end::Form*/}
    </div>
  );
}

export default injectIntl(connect(null, null)(Login));

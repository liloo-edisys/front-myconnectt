import React, { useState } from "react";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { login } from "actions/shared/AuthActions";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

const Login = ({ intl }) => {
  const dispatch = useDispatch();
  const [isRevealPwd, setIsRevealPwd] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email invalide")
      .required("Ce champ est requis"),
    password: Yup.string().required("Ce champ est requis"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      dispatch(login.request(values));
    },
  });

  return (
    <div className="d-flex flex-column flex-root h-100" style={{ margin: 0 }}>
      <div
        className="d-flex flex-column flex-lg-row flex-column-fluid w-100 h-100"
        style={{ margin: 0 }}
      >
        {/* Left side */}
        <div
          className="d-flex flex-column w-100 w-lg-50 p-5 p-lg-25"
          style={{ backgroundColor: "#F3F6F9" }}
        >
          <div className="text-center mb-15">
            <h1
              className="font-weight-bolder text-primary mb-3"
              style={{
                fontSize: "2.75rem",
                color: "#1994DA",
                textAlign: "center",
                fontWeight: "800",
              }}
            >
              Connexion à votre Espace
              <br />
              Entreprise
            </h1>
          </div>

          <form className="form w-100" onSubmit={formik.handleSubmit}>
            {/* Email */}
            <div className="form-group mb-8">
              <label className="text-primary ml-8">
                Nom d'utilisateur ou Email
              </label>
              <input
                placeholder="Nom d'utilisateur ou Email"
                type="email"
                {...formik.getFieldProps("email")}
                className="form-control form-control-lg bg-light-primary border-0 h-auto py-7 px-6 rounded-pill"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback d-block">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group mb-8">
              <label className="text-primary ml-8">Mot de passe</label>
              <div className="input-group bg-light-primary rounded-pill">
                <input
                  placeholder="Mot de passe"
                  type={isRevealPwd ? "text" : "password"}
                  {...formik.getFieldProps("password")}
                  className="form-control form-control-lg border-0 h-auto py-7 px-6 bg-transparent rounded-pill"
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text border-0 bg-transparent"
                    style={{ cursor: "pointer" }}
                    onClick={() => setIsRevealPwd((prev) => !prev)}
                  >
                    <i
                      className={`far ${
                        isRevealPwd ? "fa-eye-slash" : "fa-eye"
                      }`}
                    />
                  </span>
                </div>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="invalid-feedback d-block">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div className="text-center position-relative my-8">
              <div
                className="border-bottom w-100 position-absolute"
                style={{ top: "50%" }}
              ></div>
              <span className="px-4 bg-white text-dark-50 position-relative">
                ou
              </span>
            </div>

            <div className="d-flex justify-content-center mb-10 background-white">
              <button
                type="button"
                className="btn btn-light font-weight-bold py-4 px-6 d-flex align-items-center justify-content-center mx-2"
                style={{ border: "1px solid #ddd", borderRadius: "50px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                <img
                  src={toAbsoluteUrl("/media/logos/google.png")}
                  className="h-20px"
                  alt="Google"
                />
                <span className="ml-3">Google</span>
              </button>
              <button
                type="button"
                className="btn btn-light font-weight-bold py-4 px-6 d-flex align-items-center justify-content-center mx-2"
                style={{ border: "1px solid #ddd", borderRadius: "50px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                <img
                  src={toAbsoluteUrl("/media/logos/Facebook.png")}
                  className="h-20px"
                  alt="Facebook"
                />
                <span className="ml-3">Facebook</span>
              </button>
              <button
                type="button"
                className="btn btn-light font-weight-bold py-4 px-6 d-flex align-items-center justify-content-center mx-2"
                style={{ border: "1px solid #ddd", borderRadius: "50px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
              >
                <img
                  src={toAbsoluteUrl("/media/logos/Apple.png")}
                  className="h-20px"
                  alt="Apple"
                />
                <span className="ml-3">Apple</span>
              </button>
            </div>

            {/* Submit and Forgot Password */}
            <div className="d-flex flex-column align-items-center">
              <button
                type="submit"
                className="btn btn-primary font-weight-bold py-4 px-6 w-50 mb-5 rounded-pill"
                style={{ border: "1px solid #ddd" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0056b3";
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
                disabled={!formik.isValid || !formik.dirty}
              >
                Connexion
              </button>
              <Link
                to="/auth/forgot-password"
                className="text-dark-50 text-hover-primary"
              >
                J'ai oublié mon mot de passe
              </Link>
            </div>
          </form>
        </div>
        {/* Right side */}
        <div
          className="d-none d-lg-flex flex-column w-50 p-10"
          style={{
            backgroundImage:
              "linear-gradient(to bottom left, #2FAAF0, #0580C6)",
            margin: 0,
          }}
        >
          <div className="d-flex flex-column flex-center w-100 h-100 p-20">
            <div className="text-center">
              <h1
                className="text-white font-weight-bolder mb-8"
                style={{ fontSize: "2.5rem" }}
              >
                Pas encore de compte ?
              </h1>
              <p
                className="text-white font-size-h4 mb-10"
                style={{ fontSize: "1.5rem" }}
              >
                Inscrivez vous pour découvrir l'effet{" "}
                <img
                  src={toAbsoluteUrl("/media/logos/wow.png")}
                  className="h-20px"
                  alt="Facebook"
                />
                {" "}
                de MyConnectt !
              </p>
              <a
                href="/auth/registration"
                className="btn btn-light font-weight-bold font-size-h4 py-3 px-8 text-primary rounded-pill"
              >
                Inscription
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(connect(null, null)(Login));

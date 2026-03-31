import React, { useEffect } from "react";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { sendOtpRequest } from "actions/shared/OTPAuthActions";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

const OTPRequest = ({ intl }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { loading, otpSent, error } = useSelector(
    state => ({
      loading: state.otpAuth?.loading || false,
      otpSent: state.otpAuth?.otpSent || false,
      error: state.otpAuth?.error || null
    }),
    shallowEqual
  );

  const OTPRequestSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email invalide")
      .required("Ce champ est requis")
  });

  const formik = useFormik({
    initialValues: {
      email: ""
    },
    validationSchema: OTPRequestSchema,
    onSubmit: values => {
      dispatch(sendOtpRequest(values.email));
    }
  });

  // Redirect to verification page when OTP is sent
  useEffect(() => {
    if (otpSent) {
      history.push("/auth/otp-verify");
    }
  }, [otpSent, history]);

  return (
    <div className="d-flex flex-column flex-root h-100" style={{ margin: 0 }}>
      <div
        className="d-flex flex-column flex-lg-row flex-column-fluid w-100 h-100"
        style={{ margin: 0 }}
      >
        {/* Left side - Form */}
        <div
          className="d-flex flex-column justify-content-center w-100 w-lg-50 p-5 p-lg-15"
          style={{ 
            backgroundColor: "#F3F6F9",
            minHeight: "100vh"
          }}
        >
          <div className="w-100" style={{ maxWidth: "500px", margin: "0 auto" }}>
            {/* Header Section */}
            <div className="text-center mb-10">
              <div 
                className="mb-5 d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#E1F0FF",
                  boxShadow: "0 4px 20px rgba(25, 148, 218, 0.15)"
                }}
              >
                <i className="fas fa-envelope-open-text" style={{ fontSize: "2.5rem", color: "#1994DA" }}></i>
              </div>
              <h1
                className="font-weight-bolder mb-3"
                style={{
                  fontSize: "2.5rem",
                  color: "#1E1E2D",
                  fontWeight: "700",
                  letterSpacing: "-0.5px"
                }}
              >
                Authentification OTP
              </h1>
              <p className="text-muted font-weight-normal font-size-lg" style={{ lineHeight: "1.6" }}>
                Entrez votre adresse email pour recevoir
                <br />
                un code de vérification sécurisé
              </p>
            </div>

            {/* Form Card */}
            <div 
              className="bg-white rounded p-8 mb-5"
              style={{
                boxShadow: "0 0 40px rgba(82, 63, 105, 0.1)",
                border: "1px solid #E4E6EF"
              }}
            >
              <form className="form w-100" onSubmit={formik.handleSubmit}>
                {/* Email Input */}
                <div className="form-group mb-6">
                  <label className="font-weight-bold font-size-lg mb-3" style={{ color: "#181C32" }}>
                    <i className="fas fa-envelope mr-2" style={{ color: "#1994DA" }}></i>
                    Adresse Email
                  </label>
                  <input
                    placeholder="exemple@email.com"
                    type="email"
                    {...formik.getFieldProps("email")}
                    className={`form-control form-control-lg form-control-solid h-auto py-4 px-6 ${
                      formik.touched.email && formik.errors.email ? 'is-invalid' : ''
                    }`}
                    style={{
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      border: "2px solid #E4E6EF",
                      transition: "all 0.3s ease"
                    }}
                    disabled={loading}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="invalid-feedback d-block mt-2" style={{ fontSize: "0.95rem" }}>
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {formik.errors.email}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-6" style={{ borderRadius: "12px" }}>
                    <i className="fas fa-exclamation-triangle mr-3" style={{ fontSize: "1.3rem" }}></i>
                    <span>{error.message || "Une erreur s'est produite"}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="form-group mb-0">
                  <button
                    type="submit"
                    disabled={loading || formik.isSubmitting || !formik.isValid}
                    className="btn btn-primary btn-lg font-weight-bolder w-100 py-4"
                    style={{
                      borderRadius: "12px",
                      fontSize: "1.1rem",
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(25, 148, 218, 0.3)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-3"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Envoyer le code OTP
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Info Section */}
            <div 
              className="bg-light-primary rounded p-6 text-center"
              style={{
                border: "1px dashed #1994DA",
                borderRadius: "12px"
              }}
            >
              <div className="d-flex align-items-center justify-content-center mb-3">
                <i className="fas fa-info-circle mr-2" style={{ color: "#1994DA", fontSize: "1.2rem" }}></i>
                <span className="font-weight-bold" style={{ color: "#1994DA" }}>
                  À savoir
                </span>
              </div>
              <p className="text-muted font-size-sm mb-0" style={{ lineHeight: "1.6" }}>
                Un code à 6 chiffres sera envoyé à votre adresse email.
                <br />
                <i className="far fa-clock mr-1"></i> Le code expire après <strong>5 minutes</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div
          className="d-none d-lg-flex flex-column-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
          style={{
            backgroundImage: `url(${toAbsoluteUrl(
              "/media/bg/bg-otp-auth.jpg"
            )})`,
            position: "relative"
          }}
        >
          <div 
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(25, 148, 218, 0.85) 0%, rgba(14, 86, 124, 0.9) 100%)"
            }}
          ></div>
          <div className="d-flex flex-column justify-content-center align-items-center h-100 p-15" style={{ position: "relative", zIndex: 1 }}>
            <div 
              className="mb-8 d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)"
              }}
            >
              <i className="fas fa-shield-alt" style={{ fontSize: "4rem", color: "white" }}></i>
            </div>
            <h3 className="font-size-h1 mb-5 text-white font-weight-boldest text-center" style={{ fontSize: "2.75rem" }}>
              Sécurité Renforcée
            </h3>
            <p className="font-weight-normal text-white font-size-h4 text-center px-10" style={{ lineHeight: "1.8", opacity: "0.95" }}>
              L'authentification à deux facteurs protège
              <br />
              votre compte contre les accès non autorisés
            </p>
            <div className="mt-10 d-flex align-items-center">
              <div className="text-white text-center mx-5">
                <i className="fas fa-lock fa-2x mb-3"></i>
                <p className="font-size-sm">Cryptage SSL</p>
              </div>
              <div className="text-white text-center mx-5">
                <i className="fas fa-user-shield fa-2x mb-3"></i>
                <p className="font-size-sm">Données Protégées</p>
              </div>
              <div className="text-white text-center mx-5">
                <i className="fas fa-check-circle fa-2x mb-3"></i>
                <p className="font-size-sm">Accès Sécurisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(OTPRequest);

import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import {
  authenticateOtpRequest,
  sendOtpRequest,
  clearOtpState
} from "actions/shared/OTPAuthActions";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

const OTPVerify = ({ intl }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef()
  ];

  const { loading, email, isAuthenticated, error, user } = useSelector(
    state => ({
      loading: state.otpAuth?.loading || false,
      email: state.otpAuth?.email || "",
      isAuthenticated: state.otpAuth?.isAuthenticated || false,
      error: state.otpAuth?.error || null,
      user: state.auth?.user || null
    }),
    shallowEqual
  );

  // Redirect if no email (user came directly to this page)
  useEffect(() => {
    if (!email) {
      history.push("/auth/otp-request");
    }
  }, [email, history]);

  // Redirect on successful authentication based on userType
  useEffect(() => {
    if (isAuthenticated && user) {
      // Clear OTP state after successful auth
      dispatch(clearOtpState());
      
      // Normalize userType field (API returns UserType, state may use userType)
      const userType = user.UserType ?? user.userType;
      
      // Redirect based on userType
      // userType 0: Interimaire -> handled by Routes.js
      // userType 1: Client -> /dashboard
      // userType 2: BackOffice -> /backoffice-dashboard
      if (userType === 2) {
        // BackOffice user
        history.push("/backoffice-dashboard");
      } else if (userType === 1) {
        // Client user
        history.push("/dashboard");
      } else {
        // Fallback - let Routes.js handle the redirect
        history.push("/");
      }
    }
  }, [isAuthenticated, user, history, dispatch]);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value && newOtp.every(digit => digit)) {
      handleSubmit(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handlePaste = e => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only allow 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpCode(digits);
      inputRefs[5].current.focus();

      // Auto-submit
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = (code = null) => {
    const otpValue = code || otpCode.join("");

    if (otpValue.length === 6 && /^\d{6}$/.test(otpValue)) {
      dispatch(
        authenticateOtpRequest({
          email,
          otp: otpValue
        })
      );
    }
  };

  const handleResendOtp = () => {
    // Clear current OTP inputs
    setOtpCode(["", "", "", "", "", ""]);
    inputRefs[0].current.focus();

    // Resend OTP
    dispatch(sendOtpRequest(email));
  };

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
          <div
            className="w-100"
            style={{ maxWidth: "550px", margin: "0 auto" }}
          >
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
                <i
                  className="fas fa-shield-check"
                  style={{ fontSize: "2.5rem", color: "#1994DA" }}
                ></i>
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
                Vérification OTP
              </h1>
              <p
                className="text-muted font-weight-normal font-size-lg mb-2"
                style={{ lineHeight: "1.6" }}
              >
                Entrez le code à 6 chiffres envoyé à
              </p>
              <div
                className="d-inline-block bg-light-primary px-4 py-2 rounded"
                style={{
                  border: "1px solid #B5E3FF"
                }}
              >
                <i
                  className="fas fa-envelope mr-2"
                  style={{ color: "#1994DA" }}
                ></i>
                <span
                  className="font-weight-bold"
                  style={{ color: "#1994DA", fontSize: "1.05rem" }}
                >
                  {email}
                </span>
              </div>
            </div>

            {/* Form Card */}
            <div
              className="bg-white rounded p-8 mb-5"
              style={{
                boxShadow: "0 0 40px rgba(82, 63, 105, 0.1)",
                border: "1px solid #E4E6EF"
              }}
            >
              {/* OTP Input Boxes */}
              <div className="form-group mb-6">
                <div
                  className="d-flex justify-content-center mb-5"
                  style={{ gap: "8px" }}
                >
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={e => handleInputChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="form-control text-center font-weight-boldest"
                      style={{
                        width: "55px",
                        height: "65px",
                        fontSize: "1.8rem",
                        borderRadius: "12px",
                        border: `2px solid ${digit ? "#1994DA" : "#E4E6EF"}`,
                        backgroundColor: digit ? "#F0F8FF" : "white",
                        transition: "all 0.3s ease",
                        boxShadow: digit
                          ? "0 0 0 3px rgba(25, 148, 218, 0.1)"
                          : "none"
                      }}
                      disabled={loading}
                    />
                  ))}
                </div>

                {error && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    style={{
                      borderRadius: "12px",
                      animation: "shake 0.5s"
                    }}
                  >
                    <i
                      className="fas fa-exclamation-triangle mr-3"
                      style={{ fontSize: "1.3rem" }}
                    ></i>
                    <span>
                      {error.message ||
                        "Code OTP invalide. Veuillez réessayer."}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-group mb-0">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={
                    loading ||
                    otpCode.some(digit => !digit) ||
                    otpCode.join("").length !== 6
                  }
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
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Vérifier le code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Resend Section */}
            <div
              className="bg-white rounded p-6 mb-5 text-center"
              style={{
                boxShadow: "0 0 20px rgba(82, 63, 105, 0.05)",
                border: "1px solid #E4E6EF"
              }}
            >
              <p className="text-muted font-size-sm mb-3">
                <i className="far fa-question-circle mr-2"></i>
                Vous n'avez pas reçu le code ?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="btn btn-light-primary font-weight-bold px-6 py-3"
                style={{
                  borderRadius: "10px",
                  transition: "all 0.3s ease"
                }}
              >
                <i className="fas fa-redo mr-2"></i>
                Renvoyer le code
              </button>
            </div>

            {/* Info Section */}
            <div
              className="bg-light-warning rounded p-6 text-center"
              style={{
                border: "1px dashed #FFA800",
                borderRadius: "12px"
              }}
            >
              <div className="d-flex align-items-center justify-content-center mb-3">
                <i
                  className="fas fa-clock mr-2"
                  style={{ color: "#FFA800", fontSize: "1.2rem" }}
                ></i>
                <span className="font-weight-bold" style={{ color: "#FFA800" }}>
                  Attention
                </span>
              </div>
              <p
                className="text-muted font-size-sm mb-0"
                style={{ lineHeight: "1.6" }}
              >
                Le code expire après <strong>5 minutes</strong>.
                <br />
                <i className="far fa-envelope mr-1"></i> Vérifiez également
                votre dossier <strong>spam</strong>.
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
              background:
                "linear-gradient(135deg, rgba(25, 148, 218, 0.85) 0%, rgba(14, 86, 124, 0.9) 100%)"
            }}
          ></div>
          <div
            className="d-flex flex-column justify-content-center align-items-center h-100 p-15"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div
              className="mb-8 d-inline-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)"
              }}
            >
              <i
                className="fas fa-user-lock"
                style={{ fontSize: "4rem", color: "white" }}
              ></i>
            </div>
            <h3
              className="font-size-h1 mb-5 text-white font-weight-boldest text-center"
              style={{ fontSize: "2.75rem" }}
            >
              Protection Maximale
            </h3>
            <p
              className="font-weight-normal text-white font-size-h4 text-center px-10"
              style={{ lineHeight: "1.8", opacity: "0.95" }}
            >
              Votre code OTP garantit que seul vous
              <br />
              pouvez accéder à votre compte
            </p>
            <div className="mt-10">
              <div className="d-flex align-items-center text-white mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mr-4"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <i className="fas fa-check fa-lg"></i>
                </div>
                <div className="text-left">
                  <h5 className="font-weight-bold mb-0">Code à usage unique</h5>
                  <p className="mb-0 font-size-sm opacity-80">
                    Valide pendant 5 minutes
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center text-white mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mr-4"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <i className="fas fa-check fa-lg"></i>
                </div>
                <div className="text-left">
                  <h5 className="font-weight-bold mb-0">
                    Cryptage de bout en bout
                  </h5>
                  <p className="mb-0 font-size-sm opacity-80">
                    Vos données sont protégées
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center text-white">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mr-4"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <i className="fas fa-check fa-lg"></i>
                </div>
                <div className="text-left">
                  <h5 className="font-weight-bold mb-0">
                    Authentification sécurisée
                  </h5>
                  <p className="mb-0 font-size-sm opacity-80">
                    Conforme aux normes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(OTPVerify);

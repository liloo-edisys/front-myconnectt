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

  const { loading, email, isAuthenticated, error } = useSelector(
    state => ({
      loading: state.otpAuth?.loading || false,
      email: state.otpAuth?.email || "",
      isAuthenticated: state.otpAuth?.isAuthenticated || false,
      error: state.otpAuth?.error || null
    }),
    shallowEqual
  );

  // Redirect if no email (user came directly to this page)
  useEffect(() => {
    if (!email) {
      history.push("/auth/otp-request");
    }
  }, [email, history]);

  // Redirect on successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Clear OTP state after successful auth
      dispatch(clearOtpState());
      history.push("/dashboard");
    }
  }, [isAuthenticated, history, dispatch]);

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
                fontWeight: "800"
              }}
            >
              Vérification OTP
            </h1>
            <p className="text-muted font-weight-bold font-size-h4">
              Entrez le code à 6 chiffres envoyé à
            </p>
            <p className="text-primary font-weight-bolder font-size-h4">
              {email}
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="form-group mb-8">
            <div className="d-flex justify-content-center gap-3 mb-5">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="form-control text-center font-size-h1 font-weight-boldest"
                  style={{
                    width: "60px",
                    height: "70px",
                    fontSize: "2rem",
                    margin: "0 5px",
                    borderRadius: "10px",
                    border: "2px solid #1994DA"
                  }}
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div className="alert alert-danger text-center mt-4">
                {error.message || "Code OTP invalide. Veuillez réessayer."}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-group d-flex flex-wrap justify-content-center pb-lg-0">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={
                loading || otpCode.some(digit => !digit) || otpCode.join("").length !== 6
              }
              className="btn btn-primary btn-lg font-weight-bolder font-size-h6 px-15 py-6 my-3 rounded-pill"
              style={{ minWidth: "250px" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-3"></span>
                  Vérification...
                </>
              ) : (
                "Vérifier le code"
              )}
            </button>
          </div>

          {/* Resend Button */}
          <div className="text-center mt-5">
            <p className="text-muted font-size-sm mb-3">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="btn btn-link text-primary font-weight-bolder"
            >
              Renvoyer le code
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-5">
            <p className="text-muted font-size-sm">
              Le code expire après 5 minutes.
              <br />
              Vérifiez également votre dossier spam.
            </p>
          </div>
        </div>

        {/* Right side - Image */}
        <div
          className="d-flex flex-column-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
          style={{
            backgroundImage: `url(${toAbsoluteUrl(
              "/media/bg/bg-otp-auth.jpg"
            )})`
          }}
        >
          <div className="d-flex flex-column justify-content-center align-items-center h-100 p-10">
            <h3 className="font-size-h1 mb-5 text-white font-weight-boldest">
              Protection Maximale
            </h3>
            <p className="font-weight-lighter text-white opacity-80 font-size-h4 text-center">
              Votre code OTP garantit que seul vous
              <br />
              pouvez accéder à votre compte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(OTPVerify);

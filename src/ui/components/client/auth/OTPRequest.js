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
              Authentification par OTP
            </h1>
            <p className="text-muted font-weight-bold font-size-h4">
              Entrez votre adresse email pour recevoir un code de vérification
            </p>
          </div>

          <form className="form w-100" onSubmit={formik.handleSubmit}>
            {/* Email */}
            <div className="form-group mb-8">
              <label className="text-primary ml-8">Adresse Email</label>
              <input
                placeholder="votre@email.com"
                type="email"
                {...formik.getFieldProps("email")}
                className="form-control form-control-lg bg-light-primary border-0 h-auto py-7 px-6 rounded-pill"
                disabled={loading}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback d-block">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-group d-flex flex-wrap justify-content-center pb-lg-0">
              <button
                type="submit"
                disabled={loading || formik.isSubmitting}
                className="btn btn-primary btn-lg font-weight-bolder font-size-h6 px-15 py-6 my-3 rounded-pill"
                style={{ minWidth: "250px" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-3"></span>
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le code OTP"
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center mt-5">
              <p className="text-muted font-size-sm">
                Un code à 6 chiffres sera envoyé à votre adresse email.
                <br />
                Le code expire après 5 minutes.
              </p>
            </div>
          </form>
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
              Sécurité Renforcée
            </h3>
            <p className="font-weight-lighter text-white opacity-80 font-size-h4 text-center">
              L'authentification à deux facteurs protège votre compte
              <br />
              contre les accès non autorisés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(OTPRequest);

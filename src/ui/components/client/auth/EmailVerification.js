import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

function EmailVerification() {
  const [email] = useState(
    localStorage.getItem("userEmail") || "your_email@example.com"
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = () => {
    setResendLoading(true);
    // Simuler l'envoi d'email (à remplacer par votre API)
    setTimeout(() => {
      setResendLoading(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between pt-10 px-10">
        <Link to="/">
          <img
            alt="Logo"
            src={toAbsoluteUrl("/media/logos/logo-myconnectt-color.png")}
            className="max-h-80px"
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="d-flex flex-column flex-center flex-grow-1 p-10">
        <div className="max-w-650px w-100 text-center">
          {/* Email Icon with animation */}
          <div className="mb-10 position-relative" style={{ height: "200px" }}>
            <div
              className="position-absolute w-100"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }}
            >
              <div className="rounded-circle bg-light-primary p-10 d-inline-block shadow-lg animate-pulse">
                <i
                  className="far fa-envelope text-primary"
                  style={{ fontSize: "5rem" }}
                ></i>
              </div>
              <div
                className="position-absolute"
                style={{ top: "-10px", right: "40%" }}
              >
                <div
                  className="bg-success rounded-circle"
                  style={{
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <i className="fas fa-check text-white"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-weight-bold text-dark mb-5 display-4">
            Vérifiez votre email !
          </h1>

          {/* Description */}
          <p className="text-muted font-size-lg mb-3">
            Nous avons envoyé un email de vérification à :
          </p>
          <p className="font-weight-bold text-primary font-size-h3 mb-7">
            {email}
          </p>

          <p className="text-muted font-size-lg mb-10">
            Cliquez sur le lien dans l'email pour activer votre compte. Si vous
            ne voyez pas l'email, vérifiez votre dossier spam.
          </p>

          {/* CTA Buttons */}
          <div className="mb-10">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg font-weight-bold px-8 py-4 mb-5"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Ouvrir ma boîte email
            </a>

            <div className="mt-5">
              {resendSuccess ? (
                <div className="alert alert-success d-inline-block">
                  <i className="fas fa-check-circle mr-2"></i>
                  Email renvoyé avec succès !
                </div>
              ) : (
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="btn btn-light btn-lg font-weight-bold px-6 py-3"
                >
                  {resendLoading ? (
                    <>
                      <span className="spinner spinner-primary spinner-sm mr-2"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo mr-2"></i>
                      Renvoyer l'email
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Help section */}
          <div className="text-left bg-light rounded p-8 mt-10">
            <h4 className="font-weight-bold mb-5">
              <i className="fas fa-lightbulb text-warning mr-2"></i>
              Conseils utiles
            </h4>
            <ul className="mb-0">
              <li className="mb-3">
                <span>L'email peut prendre quelques minutes à arriver</span>
              </li>
              <li className="mb-3">
                <span>Vérifiez votre dossier spam ou courrier indésirable</span>
              </li>
              <li className="mb-3">
                <span>Assurez-vous que l'adresse email est correcte</span>
              </li>
              <li>
                <span>Le lien de vérification expire après 24 heures</span>
              </li>
            </ul>
          </div>

          {/* Contact support */}
          <div className="mt-10">
            <p className="text-muted">
              Besoin d'aide ?
              <a href="/support" className="text-primary font-weight-bold ml-2">
                Contactez notre support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-5 border-top">
        <span className="text-muted">
          © 2024 MyConnectt. Tous droits réservés.
        </span>
      </div>
    </div>
  );
}

export default EmailVerification;

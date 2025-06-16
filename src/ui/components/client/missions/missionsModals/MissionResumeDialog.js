/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { getFormattedCV } from "actions/client/ApplicantsActions";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import CVDrawer, { useCVDrawer } from "../../../shared/CVDrawer/CVDrawer";
import { toastr } from "react-redux-toastr";

export function MissionResumeDialog({ show, onHide, history, resumeRow }) {
  const intl = useIntl();
  const TENANTID = process.env.REACT_APP_TENANT_ID;
  const userID = history.location.state
    ? history.location.state.applicantID
    : "";
  const resumeUserID = resumeRow && resumeRow.id;

  const dispatch = useDispatch();

  // Hook CVDrawer
  const { isOpen, currentPdfUrl, openDrawer, closeDrawer } = useCVDrawer();

  // Fonction pour encoder les URLs
  function encodeUrl(str) {
    if (!str) return "";

    let newUrl = "";
    const len = str.length;

    for (let i = 0; i < len; i++) {
      let c = str.charAt(i);
      let code = str.charCodeAt(i);

      if (c === " ") {
        newUrl += "+";
      } else if (
        (code < 48 && code !== 45 && code !== 46) ||
        (code < 65 && code > 57) ||
        (code > 90 && code < 97 && code !== 95) ||
        code > 122
      ) {
        newUrl += "%" + code.toString(16);
      } else {
        newUrl += c;
      }
    }

    if (newUrl.indexOf(".doc") > 0 || newUrl.indexOf(".docx") > 0) {
      return "https://view.officeapps.live.com/op/embed.aspx?src=" + newUrl;
    } else {
      return (
        "https://docs.google.com/gview?url=" +
        newUrl +
        "&embedded=true&SameSite=None"
      );
    }
  }

  const { url } = useSelector(
    state => ({
      url: state.applicants.resume
    }),
    shallowEqual
  );

  // Effet pour charger le CV quand le composant s'affiche
  useEffect(() => {
    if (show === true) {
      dispatch(
        getFormattedCV.request({
          id1: parseInt(TENANTID),
          id2: userID || resumeUserID
        })
      );
    }
  }, [show, dispatch]);

  // Effet pour ouvrir le drawer quand l'URL est disponible
  useEffect(() => {
    if (show && url) {
      const encodedUrl = encodeUrl(url);
      if (encodedUrl) {
        console.log("🔍 Ouverture CVDrawer avec URL:", encodedUrl);
        openDrawer(encodedUrl);
      }
    }
  }, [show, url]);

  // Effet pour fermer le drawer quand show devient false
  useEffect(() => {
    if (!show && isOpen) {
      closeDrawer();
    }
  }, [show]);

  // Gérer la fermeture du drawer
  const handleCloseDrawer = () => {
    closeDrawer();
    if (onHide) {
      onHide();
    }
  };

  // Obtenir le nom du candidat pour le titre
  const getCandidateName = () => {
    if (resumeRow) {
      return (
        `${resumeRow.firstname || ""} ${resumeRow.lastname || ""}`.trim() ||
        "Candidat"
      );
    }
    return "CV Candidat";
  };

  return (
    <CVDrawer
      isOpen={show && isOpen}
      onClose={handleCloseDrawer}
      pdfUrl={currentPdfUrl}
      title={`CV - ${getCandidateName()}`}
      width="100%"
      position="left"
      downloadFileName={`CV_${getCandidateName().replace(/\s+/g, "_")}.pdf`}
      showControls={true}
      backdrop={true}
      overlay={true}
      // Gestion des erreurs
      onError={error => {
        console.error("❌ Erreur CVDrawer:", error);
        toastr.error(
          intl.formatMessage({ id: "ERROR" }),
          "Impossible d'afficher le CV. Tentative avec une méthode alternative..."
        );
      }}
      // Callback de succès
      onLoad={data => {
        console.log("✅ CV chargé avec succès:", data);
        toastr.success(
          intl.formatMessage({ id: "TEXT.SHOW_CV.TITLE" }),
          `CV affiché (${data.numPages || 1} page${
            data.numPages > 1 ? "s" : ""
          })`
        );
      }}
    />
  );
}

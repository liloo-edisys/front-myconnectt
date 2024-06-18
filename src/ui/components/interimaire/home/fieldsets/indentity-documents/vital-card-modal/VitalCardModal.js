import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import VitalCardSelector from "./vital-card-selector";
import VitalCardInformations from "./vital-card-informations";

function VitalCardModal(props) {
  const { interimaire, updateInterimaireIdentityLoading } = useSelector(
    state => state.interimairesReducerData
  );
  const { activeModal, hideModal, isDeleted } = props;
  const [formStep, setFormStep] = useState("selector");
  const [loading, setLoading] = useState(false);
  const [rectoBase64, setRectoBase64] = useState("");
  const [filename, setFilename] = useState("");
  const [savedRectoImage, setSavedRectoImage] = useState({
    documentType: null,
    imageUrl: null
  });
  const [vitalCardData, setVitalCardData] = useState({
    birthDepartment: "",
    socialSecurityNumber: ""
  });

  useEffect(() => {
    const { applicantDocuments } = interimaire;
    for (let i = 0; i < applicantDocuments.length; i++) {
      if (applicantDocuments[i].documentType === 10) {
        return setSavedRectoImage({
          documentType: applicantDocuments[i].documentType,
          imageUrl: applicantDocuments[i].documentUrl
        });
      } else {
        setSavedRectoImage({
          documentType: null,
          imageUrl: null
        });
      }
    }
  }, [interimaire, isDeleted]);

  return (
    <>
      <VitalCardSelector
        activeModal={activeModal}
        hideModal={hideModal}
        formStep={formStep}
        setFormStep={setFormStep}
        setVitalCardData={setVitalCardData}
        setRectoBase64={setRectoBase64}
        rectoBase64={rectoBase64}
        savedRectoImage={savedRectoImage}
        setFilename={setFilename}
      />
      <VitalCardInformations
        activeModal={activeModal}
        hideModal={hideModal}
        formStep={formStep}
        vitalCardData={vitalCardData}
        setFormStep={setFormStep}
        rectoBase64={rectoBase64}
        filename={filename}
      />
    </>
  );
}

export default VitalCardModal;

import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import RibSelector from "./rib-selector";
import RibInformations from "./rib-informations";

function RibModal(props) {
  const { interimaire, updateInterimaireIdentityLoading } = useSelector(
    state => state.interimairesReducerData
  );
  const { activeModal, hideModal, isDeleted } = props;
  const [formStep, setFormStep] = useState("selector");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [rectoBase64, setRectoBase64] = useState("");
  const [savedRectoImage, setSavedRectoImage] = useState({
    documentType: null,
    imageUrl: null
  });
  const [RibData, setRibData] = useState({
    birthDepartment: "",
    socialSecurityNumber: ""
  });

  useEffect(() => {
    const { applicantDocuments } = interimaire;
    for (let i = 0; i < applicantDocuments.length; i++) {
      if (applicantDocuments[i].documentType === 12) {
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
      <RibSelector
        activeModal={activeModal}
        hideModal={hideModal}
        formStep={formStep}
        setFormStep={setFormStep}
        setRibData={setRibData}
        setRectoBase64={setRectoBase64}
        rectoBase64={rectoBase64}
        savedRectoImage={savedRectoImage}
        setFilename={setFilename}
      />
      <RibInformations
        activeModal={activeModal}
        hideModal={hideModal}
        formStep={formStep}
        RibData={RibData}
        setFormStep={setFormStep}
        rectoBase64={rectoBase64}
        filename={filename}
      />
    </>
  );
}

export default RibModal;

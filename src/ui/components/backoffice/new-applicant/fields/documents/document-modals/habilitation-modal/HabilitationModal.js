import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { useSelector, shallowEqual } from "react-redux";
import HabilitationSelector from "./habilitation-selector";
import HabilitationInformations from "./habitilitation-informations";

function HabilitationModal(props) {
  const { interimaire, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );
  const { activeModal, hideModal, isDeleted } = props;
  const [formStep, setFormStep] = useState("selector");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [rectoBase64, setRectoBase64] = useState("");
  const [savedImageArray, setSavedImageArray] = useState([]);
  const [vitalCardData, setVitalCardData] = useState({
    birthDepartment: "",
    socialSecurityNumber: ""
  });

  useEffect(() => {
    const applicantDocuments = interimaire && interimaire.applicantDocuments;

    let newImageArray = [];
    for (let i = 0; i < applicantDocuments.length; i++) {
      if (applicantDocuments[i].documentType === 13) {
        let title = "";
        let titleList = applicantDocuments[i].habilitations;
        for (let j = 0; j < titleList.length; j++) {
          if (j !== 0) {
            title = title + ", " + titleList[j].name;
          } else {
            title = title + titleList[j].name;
          }
        }
        newImageArray.push({
          id: applicantDocuments[i].id,
          documentType: applicantDocuments[i].documentType,
          imageUrl: applicantDocuments[i].documentUrl,
          expirationDate: applicantDocuments[i].expirationDate,
          issueDate: applicantDocuments[i].issueDate,
          title: title
        });
      }
    }
    setSavedImageArray(newImageArray);
  }, [isDeleted]);

  return (
    <>
      <HabilitationSelector
        activeModal={activeModal}
        hideModal={hideModal}
        formStep={formStep}
        setFormStep={setFormStep}
        setVitalCardData={setVitalCardData}
        setRectoBase64={setRectoBase64}
        rectoBase64={rectoBase64}
        savedImageArray={savedImageArray}
        setSavedImageArray={setSavedImageArray}
        setFilename={setFilename}
      />
      <HabilitationInformations
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

export default HabilitationModal;

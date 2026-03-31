import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import DocumentSelector from "./document-selector";
import IdentityInformations from "./identity-informations";
import { getNationalitiesList } from "../../../../../../../../business/actions/interimaire/interimairesActions";

function DocumentsModal(props) {
  const dispatch = useDispatch();
  const { activeModal, hideModal, isDeleted } = props;
  const intl = useIntl();

  const { interimaire, nationalitiesList } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire,
      nationalitiesList: state.interimairesReducerData.nationalitiesList
    }),
    shallowEqual
  );
  const [savedRectoImage, setSavedRectoImage] = useState({
    documentType: null,
    imageUrl: null
  });
  const [savedVersoImage, setSavedVersoImage] = useState({
    documentType: null,
    imageUrl: null
  });
  const [formStep, setFormStep] = useState("document");
  const [fileTypeFront, setFileTypeFront] = useState("");
  const [fileTypeBack, setFileTypeBack] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [rectoBase64, setRectoBase64] = useState("");
  const [versoBase64, setVersoBase64] = useState("");
  const [identityInfo, setIdentityInfo] = useState({
    idCardNumber: "",
    lastname: "",
    firstname: "",
    birthDate: "",
    idCardIssueDate: "",
    idCardExpirationDate: ""
  });

  useEffect(() => {
    const applicantDocuments =
      interimaire && interimaire.applicantDocuments
        ? interimaire.applicantDocuments
        : [];
    for (let i = 0; i < applicantDocuments.length; i++) {
      if (
        applicantDocuments[i].filename.includes("IdentityCardFront") ||
        applicantDocuments[i].filename.includes("ResidentCardFront") ||
        applicantDocuments[i].filename.includes("ReceiptCardFront") ||
        applicantDocuments[i].filename.includes("PassportFront")
      ) {
        setSavedRectoImage({
          documentType: applicantDocuments[i].documentType,
          imageUrl: applicantDocuments[i].documentUrl
        });
        break;
      } else {
        setSavedRectoImage({
          documentType: null,
          imageUrl: null
        });
      }
    }

    for (let i = 0; i < applicantDocuments.length; i++) {
      if (
        applicantDocuments[i].filename.includes("IdentityCardBack") ||
        applicantDocuments[i].filename.includes("ResidentCardBack") ||
        applicantDocuments[i].filename.includes("ReceiptCardBack")
      ) {
        setSavedVersoImage({
          documentType: applicantDocuments[i].documentType,
          imageUrl: applicantDocuments[i].documentUrl
        });
        break;
      } else {
        setSavedVersoImage({
          documentType: null,
          imageUrl: null
        });
      }
    }
    if (nationalitiesList.length === 0) {
      getNationalitiesList(dispatch);
    }
  }, [interimaire, isDeleted]);

  return (
    <>
      <DocumentSelector
        activeModal={activeModal}
        hideModal={hideModal}
        formStep={formStep}
        setFormStep={setFormStep}
        setIdentityInfo={setIdentityInfo}
        documentType={documentType}
        setDocumentType={setDocumentType}
        setRectoBase64={setRectoBase64}
        setVersoBase64={setVersoBase64}
        savedRectoImage={savedRectoImage}
        savedVersoImage={savedVersoImage}
        setFileTypeFront={setFileTypeFront}
        setFileTypeBack={setFileTypeBack}
      />
      <IdentityInformations
        hideModal={hideModal}
        formStep={formStep}
        setFormStep={setFormStep}
        setIdentityInfo={setIdentityInfo}
        identityInfo={identityInfo}
        documentType={documentType}
        rectoBase64={rectoBase64}
        versoBase64={versoBase64}
        fileTypeFront={fileTypeFront}
        fileTypeBack={fileTypeBack}
      />
    </>
  );
}

export default DocumentsModal;

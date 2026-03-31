import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import "./styles.scss";
import { getNationalitiesList } from "../../../../../../business/actions/interimaire/interimairesActions";
import { deleteSelectedApplicantDocumentt } from "../../../../../../business/actions/backoffice/applicantActions";
import { getTitlesTypes } from "../../../../../../business/actions/shared/listsActions";
//import { DocumentsModal } from "../../home/fieldsets/indentity-documents/documents-modal";
//import VitalCardModal from "../../home/fieldsets/indentity-documents/vital-card-modal";
//import RibModal from "../../home/fieldsets/indentity-documents/rib-modal";
import {
  ProofOfAddressModal,
  HabilitationModal,
  OtherDocumentModal,
  DocumentsModal,
  VitalCardModal,
  RibModal
} from "./document-modals";

function Documents(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    companies,
    interimaire,
    loading,
    stepFiveModal,
    nationalitiesList
  } = useSelector(
    state => ({
      companies: state.companies.companies,
      interimaire: state.accountsReducerData.activeInterimaire,
      loading: state.interimairesReducerData.loading,
      stepFiveModal: state.accountsReducerData.stepFiveModal,
      nationalitiesList: state.interimairesReducerData.nationalitiesList
    }),
    shallowEqual
  );
  const [activeModal, setActiveModal] = useState(null);
  const [identityDocumentType, setIdentityDocumentType] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isProofOfAdreess, setIsProofOfAddress] = useState(false);
  const [isHabilitation, setIsHabilitation] = useState(false);
  const [isOtherDocument, setIsOtherDocument] = useState(false);
  const now = new Date();

  const initialValues = {
    email: "",
    address: ""
  };
  const RegistrationSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    if (stepFiveModal) {
      setActiveModal(stepFiveModal);
    }
    if (interimaire) {
      dispatch(getTitlesTypes.request());
      const applicantDocuments =
        interimaire && interimaire.applicantDocuments
          ? interimaire.applicantDocuments
          : [];
      for (let i = 0; i < applicantDocuments.length; i++) {
        if (
          applicantDocuments[i].filename.includes("IdentityCardFront") ||
          applicantDocuments[i].filename.includes("PassportFront") ||
          applicantDocuments[i].filename.includes("ResidentCardFront") ||
          applicantDocuments[i].filename.includes("ReceiptCardFront")
        ) {
          setIdentityDocumentType(applicantDocuments[i].documentType);
          break;
        } else {
          setIdentityDocumentType(null);
        }
      }
      for (let i = 0; i < applicantDocuments.length; i++) {
        if (applicantDocuments[i].documentType === 11) {
          setIsProofOfAddress(true);
          break;
        } else {
          setIsProofOfAddress(false);
        }
      }
      for (let i = 0; i < applicantDocuments.length; i++) {
        if (applicantDocuments[i].documentType === 13) {
          setIsHabilitation(true);
          break;
        } else {
          setIsHabilitation(false);
        }
      }
      for (let i = 0; i < applicantDocuments.length; i++) {
        if (applicantDocuments[i].documentType === 7) {
          setIsOtherDocument(true);
          break;
        } else {
          setIsOtherDocument(false);
        }
      }
    }
    if (nationalitiesList.length === 0) {
      getNationalitiesList(dispatch);
    }
  }, [interimaire, isDeleted]);

  const showDocumentModal = () => {
    setActiveModal("documents");
  };

  const showVitalCardModal = () => {
    setActiveModal("vitalCard");
  };

  const showRibModal = () => {
    setActiveModal("rib");
  };

  const showProofOfAddressModal = () => {
    setActiveModal("proofOfAddress");
  };

  const showHabilitationModal = () => {
    setActiveModal("habilitation");
  };

  const showOtherDocumentModal = () => {
    setActiveModal("otherDocument");
  };

  const hideModal = () => {
    setActiveModal(null);
  };

  const deleteIdCard = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: identityDocumentType
    };
    deleteSelectedApplicantDocumentt(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteVitalCard = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 10
    };
    deleteSelectedApplicantDocumentt(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteRib = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 12
    };
    deleteSelectedApplicantDocumentt(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteProofOfAddressModal = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 11
    };
    deleteSelectedApplicantDocumentt(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteHabilitationModal = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 13
    };
    deleteSelectedApplicantDocumentt(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteOtherDocumentModal = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 7
    };
    deleteSelectedApplicantDocumentt(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  return (
    <div className="wizard-body py-8 px-8">
      {activeModal === "documents" ? (
        <DocumentsModal
          activeModal={activeModal}
          hideModal={hideModal}
          isDeleted={isDeleted}
        />
      ) : activeModal === "proofOfAddress" ? (
        <ProofOfAddressModal
          activeModal={activeModal}
          hideModal={hideModal}
          isDeleted={isDeleted}
        />
      ) : activeModal === "habilitation" ? (
        <HabilitationModal
          activeModal={activeModal}
          hideModal={hideModal}
          isDeleted={isDeleted}
        />
      ) : activeModal === "otherDocument" ? (
        <OtherDocumentModal
          activeModal={activeModal}
          hideModal={hideModal}
          isDeleted={isDeleted}
        />
      ) : activeModal === "vitalCard" ? (
        <VitalCardModal
          activeModal={activeModal}
          hideModal={hideModal}
          isDeleted={isDeleted}
        />
      ) : (
        activeModal === "rib" && (
          <RibModal
            activeModal={activeModal}
            hideModal={hideModal}
            isDeleted={isDeleted}
          />
        )
      )}
      <div className="padding-button-container document_button_responsive">
        <div
          className={
            interimaire &&
            identityDocumentType != 8 &&
            interimaire.idCardExpirationDate &&
            now > new Date(interimaire.idCardExpirationDate)
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-light-danger"
              : interimaire && interimaire.hasIDCard
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
              : "btn card card-custom font-weight-bolder margin-button my-10"
          }
          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
        >
          <div className="flex-space-between px-5">
            <div
              className={
                interimaire &&
                identityDocumentType != 8 &&
                interimaire.idCardExpirationDate &&
                now > new Date(interimaire.idCardExpirationDate)
                  ? "text-danger flex-space-between"
                  : interimaire && interimaire.hasIDCard
                  ? "white flex-space-between"
                  : "flex-space-between"
              }
              onClick={showDocumentModal}
            >
              <i
                className={
                  interimaire &&
                  identityDocumentType != 8 &&
                  interimaire.idCardExpirationDate &&
                  now > new Date(interimaire.idCardExpirationDate)
                    ? "far fa-address-card icon-xxl text-danger"
                    : interimaire && interimaire.hasIDCard
                    ? "far fa-address-card icon-xxl white"
                    : "far fa-address-card icon-xxl"
                }
              />
              <div className="mx-2">
                <FormattedMessage id="BUTTON.ADD.IDENTITY.CARD" />
              </div>
            </div>
            {interimaire &&
            identityDocumentType != 8 &&
            interimaire.idCardExpirationDate &&
            now > new Date(interimaire.idCardExpirationDate) ? (
              <div style={{ zIndex: 10 }} onClick={deleteIdCard}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold label-danger label-inline"></i>
              </div>
            ) : interimaire && interimaire.hasIDCard ? (
              <div style={{ zIndex: 10 }} onClick={deleteIdCard}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold label-light-danger label-inline"></i>
              </div>
            ) : (
              <i
                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                onClick={showDocumentModal}
              ></i>
            )}
          </div>
        </div>
        <div
          className={
            interimaire && interimaire.hasVitalCard
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
              : "btn card card-custom font-weight-bolder margin-button my-10"
          }
          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
        >
          <div className="flex-space-between px-5">
            <div
              className={
                interimaire && interimaire.hasVitalCard
                  ? "white flex-space-between"
                  : "flex-space-between"
              }
              onClick={showVitalCardModal}
            >
              <i
                className={
                  interimaire && interimaire.hasVitalCard
                    ? "far fa-address-card mr-5 icon-xxl white"
                    : "far fa-address-card mr-5 icon-xxl"
                }
              />
              <div className="mx-2">
                <FormattedMessage id="BUTTON.ADD.VITALE.CARD" />
              </div>
            </div>
            {interimaire && interimaire.hasVitalCard ? (
              <div style={{ zIndex: 10 }} onClick={deleteVitalCard}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
              </div>
            ) : (
              <i
                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                onClick={showVitalCardModal}
              ></i>
            )}
          </div>
        </div>
        <div
          className={
            interimaire && interimaire.bic
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
              : "btn card card-custom font-weight-bolder margin-button my-10"
          }
          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
        >
          <div className="flex-space-between px-5">
            <div
              className={
                interimaire && interimaire.bic
                  ? "white flex-space-between"
                  : "flex-space-between"
              }
              onClick={showRibModal}
            >
              <i
                className={
                  interimaire && interimaire.bic
                    ? "far fa-money-bill-alt mr-5 icon-xxl white"
                    : "far fa-money-bill-alt mr-5 icon-xxl"
                }
              />
              <div className="mx-2">
                <FormattedMessage id="BUTTON.ADD.RICE" />
              </div>
            </div>
            {interimaire && interimaire.bic ? (
              <div style={{ zIndex: 10 }} onClick={deleteRib}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
              </div>
            ) : (
              <i
                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                onClick={showRibModal}
              ></i>
            )}
          </div>
        </div>
        <div
          className={
            isProofOfAdreess
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
              : "btn card card-custom font-weight-bolder margin-button my-10"
          }
          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
        >
          <div className="flex-space-between px-5">
            <div
              className={
                isProofOfAdreess
                  ? "white flex-space-between"
                  : "flex-space-between"
              }
              onClick={showProofOfAddressModal}
            >
              <i
                className={
                  isProofOfAdreess
                    ? "far fa-money-bill-alt mr-5 icon-xxl white"
                    : "far fa-money-bill-alt mr-5 icon-xxl"
                }
              />
              <div className="mx-2">
                <FormattedMessage id="BUTTON.ADD.PROOFOFADDRESS" />
              </div>
            </div>
            {isProofOfAdreess ? (
              <div style={{ zIndex: 10 }} onClick={deleteProofOfAddressModal}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
              </div>
            ) : (
              <i
                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                onClick={showProofOfAddressModal}
              ></i>
            )}
          </div>
        </div>
        <div
          className={
            isHabilitation
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
              : "btn card card-custom font-weight-bolder margin-button my-10"
          }
          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
        >
          <div className="flex-space-between px-5">
            <div
              className={
                isHabilitation
                  ? "white flex-space-between"
                  : "flex-space-between"
              }
              onClick={showHabilitationModal}
            >
              <i
                className={
                  isHabilitation
                    ? "far fa-money-bill-alt mr-5 icon-xxl white"
                    : "far fa-money-bill-alt mr-5 icon-xxl"
                }
              />
              <div className="mx-2">
                <FormattedMessage id="BUTTON.ADD.HABILITATIONS" />
              </div>
            </div>
            {isHabilitation ? (
              <div style={{ zIndex: 10 }} onClick={deleteHabilitationModal}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
              </div>
            ) : (
              <i
                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                onClick={showHabilitationModal}
              ></i>
            )}
          </div>
        </div>
        <div
          className={
            isOtherDocument
              ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
              : "btn card card-custom font-weight-bolder margin-button my-10"
          }
          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
        >
          <div className="flex-space-between px-5">
            <div
              className={
                isOtherDocument
                  ? "white flex-space-between"
                  : "flex-space-between"
              }
              onClick={showOtherDocumentModal}
            >
              <i
                className={
                  isOtherDocument
                    ? "far fa-money-bill-alt mr-5 icon-xxl white"
                    : "far fa-money-bill-alt mr-5 icon-xxl"
                }
              />
              <div className="mx-2">
                <FormattedMessage id="BUTTON.ADD.OTHERDOCUMENTS" />
              </div>
            </div>
            {isOtherDocument ? (
              <div style={{ zIndex: 10 }} onClick={deleteOtherDocumentModal}>
                <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
              </div>
            ) : (
              <i
                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                onClick={showOtherDocumentModal}
              ></i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;

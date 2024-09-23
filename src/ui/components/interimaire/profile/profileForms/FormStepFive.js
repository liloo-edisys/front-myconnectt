import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import MissionWizzardHeader from "./missionWizzardHeader.jsx";
import LoadingOverlay from "react-loading-overlay";
import { FormattedMessage, useIntl } from "react-intl";
import { Zoom } from "react-reveal";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import "./styles.scss";
import {
  goToNextStep,
  deleteIdDocument,
  clearStepFiveModal,
  getNationalitiesList
} from "../../../../../business/actions/interimaire/interimairesActions";
import { getTitlesTypes } from "../../../../../business/actions/shared/listsActions";
import { DocumentsModal } from "../../home/fieldsets/indentity-documents/documents-modal";
import VitalCardModal from "../../home/fieldsets/indentity-documents/vital-card-modal";
import RibModal from "../../home/fieldsets/indentity-documents/rib-modal";
import {
  ProofOfAddressModal,
  HabilitationModal,
  OtherDocumentModal
} from "./document-modals";

function FormStepFive(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    companies,
    interimaire,
    parsed,
    loading,
    stepFiveModal,
    nationalitiesList
  } = useSelector(
    state => ({
      companies: state.companies.companies,
      interimaire: state.interimairesReducerData.interimaire,
      parsed: state.interimairesReducerData.interimaire,
      nationalitiesList: state.interimairesReducerData.nationalitiesList,
      loading: state.interimairesReducerData.loading,
      stepFiveModal: state.interimairesReducerData.stepFiveModal
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
      const { applicantDocuments } = interimaire;
      for (let i = 0; i < applicantDocuments.length; i++) {
        const filenameWithoutExtension =
          applicantDocuments[i].filename &&
          applicantDocuments[i].filename.split(".")[0];
        if (
          filenameWithoutExtension === "IdentityCardFront" ||
          filenameWithoutExtension === "PassportFront" ||
          filenameWithoutExtension === "ResidentCardFront" ||
          filenameWithoutExtension === "ReceiptCardFront"
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
    deleteIdDocument(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteVitalCard = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 10
    };
    deleteIdDocument(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteRib = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 12
    };
    deleteIdDocument(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteProofOfAddressModal = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 11
    };
    deleteIdDocument(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteHabilitationModal = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 13
    };
    deleteIdDocument(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  const deleteOtherDocumentModal = () => {
    let body = {
      tenantid: +process.env.REACT_APP_TENANT_ID,
      applicantID: interimaire.id,
      documentType: 7
    };
    deleteIdDocument(body, dispatch);
    setIsDeleted(!isDeleted);
  };

  return (
    <LoadingOverlay active={loading} spinner>
      <div className="d-flex flex-row">
        <div className="flex-row-auto offcanvas-mobile w-300px w-xl-350px display_top_menu_profile">
          <MissionWizzardHeader props={props} />
        </div>
        <div className="flex-row-fluid ml-lg-8">
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
          <div className="card card-custom card-stretch gutter-b p-5">
            <div>
              <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={RegistrationSchema}
                setFieldValue
                onSubmit={(values, { setSubmitting }) => {
                  goToNextStep();
                  /*enableLoading();
                                registerAccount(values)
                                  .then(response => {
                                    disableLoading();
                                    response && history.push("/");
                                  })
                                  .catch(() => {
                                    setSubmitting(true);
                                    disableLoading();
                                  });*/
                }}
              >
                {({ values, touched, errors, status, handleSubmit }) => (
                  <Form
                    id="kt_login_signin_form"
                    className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
                    onSubmit={handleSubmit}
                  >
                    <div className="padding-button-container document_button_responsive">
                      <div className="my-10">
                        <div
                          className={
                            interimaire &&
                            identityDocumentType !== 8 &&
                            now > new Date(interimaire.idCardExpirationDate)
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-light-danger"
                              : interimaire && interimaire.hasIDCard
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                              : "btn card card-custom font-weight-bolder margin-button mb-5"
                          }
                          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
                        >
                          <div className="flex-space-between px-5">
                            <div
                              className={
                                interimaire &&
                                identityDocumentType !== 8 &&
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
                                  identityDocumentType !== 8 &&
                                  now >
                                    new Date(interimaire.idCardExpirationDate)
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
                            identityDocumentType !== 8 &&
                            now > new Date(interimaire.idCardExpirationDate) ? (
                              <div
                                style={{ zIndex: 10 }}
                                onClick={deleteIdCard}
                              >
                                <i className="flaticon-delete icon-xl label label-lg font-weight-bold label-danger label-inline"></i>
                              </div>
                            ) : interimaire && interimaire.hasIDCard ? (
                              <div
                                style={{ zIndex: 10 }}
                                onClick={deleteIdCard}
                              >
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
                        <small className="ml-10">
                          <strong>
                            <FormattedMessage id="MESSAGE.FILL.IN.INDENTITY.DOCUMENT.1" />
                          </strong>{" "}
                          <FormattedMessage id="MESSAGE.FILL.IN.INDENTITY.DOCUMENT.2" />
                          <span style={{ color: "red" }}>(Obligatoire)</span>
                        </small>
                      </div>
                      {/*<div
                        className={
                          interimaire && interimaire.socialSecurityNumber
                            ? "btn card card-custom font-weight-bolder margin-button my-10 bg-success"
                            : "btn card card-custom font-weight-bolder margin-button my-10"
                        }
                        style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
                      >
                        <div className="flex-space-between px-5">
                          <div
                            className={
                              interimaire && interimaire.socialSecurityNumber
                                ? "white flex-space-between"
                                : "flex-space-between"
                            }
                            onClick={showVitalCardModal}
                          >
                            <i
                              className={
                                interimaire && interimaire.socialSecurityNumber
                                  ? "far fa-address-card mr-5 icon-xxl white"
                                  : "far fa-address-card mr-5 icon-xxl"
                              }
                            />
                            <div className="mx-2">
                              <FormattedMessage id="BUTTON.ADD.VITALE.CARD" />
                            </div>
                          </div>
                          {interimaire && interimaire.socialSecurityNumber ? (
                            <div
                              style={{ zIndex: 10 }}
                              onClick={deleteVitalCard}
                            >
                              <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
                            </div>
                          ) : (
                            <i
                              className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                              onClick={showVitalCardModal}
                            ></i>
                          )}
                        </div>
                      </div>*/}
                      <div className="my-10">
                        <div
                          className={
                            interimaire && interimaire.socialSecurityNumber
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                              : "btn card card-custom font-weight-bolder margin-button mb-5"
                          }
                          style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
                        >
                          <div className="flex-space-between px-5">
                            <div
                              className={
                                interimaire && interimaire.socialSecurityNumber
                                  ? "white flex-space-between"
                                  : "flex-space-between"
                              }
                              onClick={showVitalCardModal}
                            >
                              <i
                                className={
                                  interimaire &&
                                  interimaire.socialSecurityNumber
                                    ? "far fa-address-card mr-5 icon-xxl white"
                                    : "far fa-address-card mr-5 icon-xxl"
                                }
                              />
                              <div className="mx-2">
                                <FormattedMessage id="BUTTON.ADD.VITALE.CARD" />
                              </div>
                            </div>
                            {interimaire && interimaire.socialSecurityNumber ? (
                              <div
                                style={{ zIndex: 10 }}
                                onClick={deleteVitalCard}
                              >
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
                        <small className="ml-10">
                          <strong>Renseignez votre carte vitale</strong> pour
                          que l'on puisse rédiger votre contrat.
                        </small>
                      </div>
                      <div className="my-10">
                        <div
                          className={
                            interimaire && interimaire.bic
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                              : "btn card card-custom font-weight-bolder margin-button mb-5"
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
                        <small className="ml-10">
                          <strong>
                            Renseignez votre Relevé d'Identité Bancaire
                          </strong>{" "}
                          pour être payé à la fin de votre mission.
                        </small>
                      </div>
                      <div className="my-10">
                        <div
                          className={
                            isProofOfAdreess
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                              : "btn card card-custom font-weight-bolder margin-button mb-5"
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
                              <div
                                style={{ zIndex: 10 }}
                                onClick={deleteProofOfAddressModal}
                              >
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
                        <small className="ml-10">
                          <strong>
                            Renseignez votre justificatif de domicile
                          </strong>{" "}
                          pour vous faire rembourser vos éventuels frais de
                          transport.
                        </small>
                      </div>
                      <div className="my-10">
                        <div
                          className={
                            isHabilitation
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                              : "btn card card-custom font-weight-bolder margin-button mb-5"
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
                              <div
                                style={{ zIndex: 10 }}
                                onClick={deleteHabilitationModal}
                              >
                                <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
                              </div>
                            ) : (
                              <i
                                className="flaticon-download icon-xl label label-lg font-weight-bold label-primary label-inline"
                                onClick={showHabilitationModal}
                              ></i>
                            )}
                          </div>
                        </div>{" "}
                        <small className="ml-10">
                          <strong>Renseignez vos habilitations</strong> pour que
                          l'on puisse mieux connaître votre profil.
                        </small>
                      </div>
                      <div className="my-10">
                        <div
                          className={
                            isOtherDocument
                              ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                              : "btn card card-custom font-weight-bolder margin-button mb-5"
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
                              <div
                                style={{ zIndex: 10 }}
                                onClick={deleteOtherDocumentModal}
                              >
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
                        <small className="ml-10">
                          En fonction de votre profil, vous devez nous fournir
                          d'autres documents comme des{" "}
                          <strong>certifications ou des dîplomes.</strong>
                        </small>
                      </div>
                    </div>
                    {/*<div className="text-right">
                      <button
                        onClick={() => goToNextStep(dispatch)}
                        className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                      >
                        <span>
                          <FormattedMessage id="BUTTON.NEXT" />
                        </span>
                      </button>
                    </div>*/}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
      <div className="display_bottom_menu_profile">
        <MissionWizzardHeader props={props} />
      </div>
    </LoadingOverlay>
  );
}

export default FormStepFive;

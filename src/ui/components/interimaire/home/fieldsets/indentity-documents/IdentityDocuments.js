import React, { useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { Zoom } from "react-reveal";
import { useDispatch, useSelector } from "react-redux";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import "./styles.scss";
import {
  goToNextStep,
  deleteIdDocument
} from "../../../../../../business/actions/interimaire/InterimairesActions";
import { getTitlesTypes } from "../../../../../../business/actions/shared/ListsActions";
import { DocumentsModal } from "./documents-modal";
import VitalCardModal from "./vital-card-modal";
import RibModal from "./rib-modal";

function IdentityDocuments(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { interimaire } = useSelector(state => state.interimairesReducerData);
  const [activeModal, setActiveModal] = useState(null);
  const [identityDocumentType, setIdentityDocumentType] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);

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
    if (interimaire) {
      dispatch(getTitlesTypes.request());
      const { applicantDocuments } = interimaire;
      for (let i = 0; i < applicantDocuments.length; i++) {
        if (
          applicantDocuments[i].filename.includes("IdentityCardFront") ||
          applicantDocuments[i].filename.includes("PassportFront") ||
          applicantDocuments[i].filename.includes("ResidentCardFront") ||
          applicantDocuments[i].filename.includes("ReceiptCardFront")
        ) {
          return setIdentityDocumentType(applicantDocuments[i].documentType);
        } else {
          setIdentityDocumentType(null);
        }
      }
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

  return (
    <div style={{ margin: 10 }}>
      {activeModal === "documents" ? (
        <DocumentsModal
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
      <div className="card card-custom title_container_radius">
        <div className="card-home border-top-auth ribbon ribbon-top ribbon-ver">
          <h2>
            <span className="svg-icon svg-icon-3x svg-icon-danger document_icon">
              <SVG
                className="h-75 align-self-end"
                src={toAbsoluteUrl("/media/svg/icons/General/Shield-check.svg")}
              ></SVG>
            </span>
            <span>
              <FormattedMessage id="BUTTON.INTERIMAIRE.COMPLETE" />
            </span>
          </h2>
        </div>
      </div>
      <Zoom duration={1000}>
        <div className="card card-custom card-stretch gutter-b mt-10 p-5">
          <div className="p-5 card card-custom bg-primary white font-weight-bolder">
            <div className=" flex-space-between">
              <div className="flex-space-between">
                <i className="flaticon-information icon-xxl mr-5 white" />
                <FormattedMessage id="TEXT.ADD.IDENTITY.DOCUMENT" />
              </div>
              <div>
                <i className="flaticon2-cross icon-l white" />
              </div>
            </div>
          </div>
          <div>
            <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={RegistrationSchema}
              setFieldValue
              onSubmit={(values, { setSubmitting }) => {
                goToNextStep();
              }}
            >
              {({ values, touched, errors, status, handleSubmit }) => (
                <Form
                  id="kt_login_signin_form"
                  className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
                  onSubmit={handleSubmit}
                >
                  <div className="padding-button-container">
                    <div className="my-10">
                      <div
                        className={
                          interimaire && interimaire.hasIDCard
                            ? "btn card card-custom font-weight-bolder margin-button mb-5 bg-success"
                            : "btn card card-custom font-weight-bolder margin-button mb-5"
                        }
                        style={{ boxShadow: `5px 5px 5px 5px lightgrey` }}
                      >
                        <div className="flex-space-between px-5">
                          <div
                            className={
                              interimaire && interimaire.hasIDCard
                                ? "white flex-space-between"
                                : "flex-space-between"
                            }
                            onClick={showDocumentModal}
                          >
                            <i
                              className={
                                interimaire && interimaire.hasIDCard
                                  ? "far fa-address-card icon-xxl white"
                                  : "far fa-address-card icon-xxl"
                              }
                            />
                            <div className="mx-2">
                              <FormattedMessage id="BUTTON.ADD.IDENTITY.CARD" />
                            </div>
                          </div>
                          {interimaire && interimaire.hasIDCard ? (
                            <div style={{ zIndex: 10 }} onClick={deleteIdCard}>
                              <i className="flaticon-delete icon-xl label label-lg font-weight-bold  label-light-danger label-inline"></i>
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
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Zoom>
    </div>
  );
}

export default IdentityDocuments;

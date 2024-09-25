import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { Formik, Form, Field } from "formik";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import * as Yup from "yup";
//import { updateInterimaireIdentity } from "../../../../../../../../business/actions/interimaire/InterimairesActions";
import { updateSelectedApplicantIdentity } from "../../../../../../../../../business/actions/backoffice/applicantActions";
import { smellsLikeIban } from "./checkers";

function RibInformations(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    hideModal,
    formStep,
    RibData,
    setFormStep,
    rectoBase64,
    filename
  } = props;
  const { interimaire, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );
  const [iban, setIban] = useState("");
  const [ibanError, setIbanError] = useState(null);
  const [bic, setBic] = useState("");
  const [bicError, setBicError] = useState(null);
  const [bicCountry, setBicCountry] = useState("");
  const [ibanCountry, setIbanCountry] = useState("");
  const [ibanBicError, setIbanBicError] = useState(null);

  const initialValuesIdentityData = RibData;

  const IdentityDataSchema = Yup.object().shape({
    bankName: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    setIban(RibData.iban);
    setBic(RibData.bic);
    RibData.iban && setIbanCountry(RibData.iban.slice(0, 2).toUpperCase());
    RibData.bic && setBicCountry(RibData.bic.slice(4, 6).toUpperCase());
  }, [RibData]);

  const closeRibInformationsModal = () => {
    hideModal();
    setFormStep("selector");
    setIbanError("");
  };

  const onChangeBic = e => {
    setBic(e);
    setBicCountry(e.slice(4, 6).toUpperCase());
    setIbanBicError(null);
    let value = e.match(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/);
    if (value === null) {
      setBicError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
    } else {
      setBicError(null);
    }
  };

  const onChangeIban = e => {
    let isValidIban = smellsLikeIban(e);
    setIban(e);
    setIbanCountry(e.slice(0, 2).toUpperCase());
    setIbanBicError(null);
    if (!isValidIban) {
      return setIbanError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
    } else {
      setIbanError(null);
    }
  };

  return (
    <Modal
      size="lg"
      show={formStep === "informations"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.BANK.INFORMATIONS" />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesIdentityData}
        validationSchema={IdentityDataSchema}
        setFieldValue
        onSubmit={values => {
          let isValidIban = smellsLikeIban(iban);
          let isValidBic = bic.match(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/);
          if (!isValidIban || !isValidBic) {
            if (!isValidIban) {
              setIbanError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
            } else {
              setIbanError(null);
            }
            if (!isValidBic) {
              setBicError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }));
            } else {
              setBicError(null);
            }
          } else if (bicCountry !== ibanCountry) {
            setIbanBicError(
              intl.formatMessage({ id: "MESSAGE.ERROR.BIC.IBAN" })
            );
          } else {
            setIbanError(null);
            setBicError(null);
            const newInterimaire = {
              ...interimaire,
              bankName: values.bankName,
              bic,
              iban
            };
            const imageArray = [
              {
                documentType: 12,
                applicantID: interimaire.id,
                tenantID: +process.env.REACT_APP_TENANT_ID,
                document: rectoBase64,
                fileName: filename
              }
            ];
            updateSelectedApplicantIdentity(
              newInterimaire,
              imageArray,
              dispatch
            ).then(() => hideModal());
          }
        }}
      >
        {({ touched, errors, handleSubmit }) => (
          <Form
            id="kt_login_signin_form"
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            onSubmit={handleSubmit}
          >
            <Modal.Body>
              <div className="my-10">
                <label htmlFor="jobTitle">
                  <FormattedMessage id="MODEL.BANK" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l far fa-id-card text-primary"></i>
                    </span>
                  </div>
                  <Field
                    placeholder={intl.formatMessage({
                      id: "MODEL.BANK"
                    })}
                    type="text"
                    className={`form-control h-auto py-5 px-6`}
                    name="bankName"
                  />
                </div>
                {touched.bankName && errors.bankName ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.bankName}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-10">
                <label htmlFor="jobTitle">
                  <FormattedMessage id="MODEL.BIC" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l far fa-id-card text-primary"></i>
                    </span>
                  </div>
                  <input
                    placeholder={intl.formatMessage({
                      id: "MODEL.BIC"
                    })}
                    type="text"
                    className={`form-control h-auto py-5 px-6`}
                    value={bic}
                    onChange={e => {
                      onChangeBic(e.target.value);
                    }}
                  />
                </div>
                {ibanBicError ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{ibanBicError}</div>
                  </div>
                ) : bicError ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{bicError}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-10">
                <label htmlFor="jobTitle">
                  <FormattedMessage id="MODEL.IBAN" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l flaticon-map-location text-primary"></i>
                    </span>
                  </div>
                  <input
                    placeholder={intl.formatMessage({
                      id: "MODEL.RIB"
                    })}
                    type="text"
                    className={`form-control h-auto py-5 px-6`}
                    value={iban}
                    onChange={e => {
                      onChangeIban(e.target.value);
                    }}
                  />
                </div>
                {ibanBicError ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{ibanBicError}</div>
                  </div>
                ) : ibanError ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{ibanError}</div>
                  </div>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={closeRibInformationsModal}
              >
                <span>
                  <FormattedMessage id="BUTTON.CANCEL" />
                </span>
              </div>
              <button
                id="kt_login_signin_submit"
                type="submit"
                className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
              >
                <span>
                  <FormattedMessage id="BUTTON.SAVE" />
                </span>
                {updateInterimaireIdentityLoading && (
                  <span className="ml-3 spinner spinner-white"></span>
                )}
              </button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default RibInformations;

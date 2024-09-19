import React, { useState, useEffect } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import { smellsLikeIban } from "../rib-informations/Checkers";
import { updateSelectedApplicantIdentity } from "../../../../../../../../../business/actions/backoffice/applicantActions";

function RibSelector(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { interimaire } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire
    }),
    shallowEqual
  );
  const {
    activeModal,
    hideModal,
    setRectoBase64,
    formStep,
    setFormStep,
    savedRectoImage,
    setRibData,
    setFilename
  } = props;
  const [loading, setLoading] = useState(false);
  const [iban, setIban] = useState("");
  const [ibanError, setIbanError] = useState(null);
  const [bic, setBic] = useState("");
  const [bicError, setBicError] = useState(null);
  const [bicCountry, setBicCountry] = useState("");
  const [ibanCountry, setIbanCountry] = useState("");
  const [ibanBicError, setIbanBicError] = useState(null);

  const initialValuesRib = interimaire.iban
    ? {
        bic: interimaire.bic,
        iban: interimaire.iban,
        bankName: interimaire.bankName
      }
    : {
        rectoBase64: ""
      };

  const RibSchema = Yup.object().shape(
    interimaire.iban
      ? {
          bankName: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          )
        }
      : {
          rectoBase64: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          )
        }
  );

  useEffect(() => {
    interimaire.iban && setIban(interimaire.iban);
    interimaire.bic && setBic(interimaire.bic);
    interimaire.iban &&
      setIbanCountry(interimaire.iban.slice(0, 2).toUpperCase());
    interimaire.bic && setBicCountry(interimaire.bic.slice(4, 6).toUpperCase());
  }, []);

  const getBase64 = file => {
    return new Promise(resolve => {
      let baseURL = "";
      let reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };

  const onChangeRectoBase64 = (setFieldValue, acceptedFiles) => {
    let file = acceptedFiles[0];
    const pieces = file.path.split(/[\s.]+/);
    const type = pieces[pieces.length - 1].toLowerCase();
    if (type === "jpg" || type === "jpeg" || type === "png") {
      getBase64(file)
        .then(result => {
          file["base64"] = result;
          let stringBase64 = result.split(",")[1];
          file["index"] =
            file.filename +
            Math.floor(Math.random() * Math.floor(100)) +
            "." +
            type;
          file["formatedBase64"] = stringBase64;
          setFilename("RibFront." + type);
          setRectoBase64(file.formatedBase64);
          setFieldValue("rectoBase64", file.formatedBase64);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      toastr.error(
        intl.formatMessage({ id: "ERROR" }),
        intl.formatMessage({ id: "MESSAGE.DOCUMENTS.FILETYPE" })
      );
    }
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
      show={formStep === "selector"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {savedRectoImage.documentType ? (
            <div>Rib</div>
          ) : (
            <FormattedMessage id="TEXT.SELECT.RICE" />
          )}
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesRib}
        validationSchema={RibSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          if (!interimaire.iban) {
            setLoading(true);
            let body = {
              documentType: 12,
              tenantid: +process.env.REACT_APP_TENANT_ID,
              rectoBase64: values.rectoBase64
            };

            axios
              .post(process.env.REACT_APP_WEBAPI_URL + "api/ApplicantOcr", body)
              .then(res => {
                const user = res.data;
                setRibData({
                  bic: user.bic,
                  iban: user.iban,
                  bankName: ""
                });
                setLoading(false);
                setFormStep("informations");
              })
              .catch(err => {
                setLoading(false);
                console.log(err);
              });
          } else {
            setLoading(true);
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
              updateSelectedApplicantIdentity(newInterimaire, null, dispatch)
                .then(() => {
                  setLoading(false);
                  hideModal();
                })
                .then(err => setLoading(false));
            }
          }
        }}
      >
        {({ values, touched, errors, status, handleSubmit, setFieldValue }) => (
          <Form
            id="kt_login_signin_form"
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            onSubmit={handleSubmit}
          >
            <Modal.Body style={{ minHeight: 300 }}>
              <div>
                <Row style={{ marginTop: 30 }}>
                  <Col
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    {savedRectoImage.documentType &&
                    interimaire &&
                    interimaire.bic ? (
                      <>
                        <section className="dropzone-container-xs">
                          <div style={{ textAlign: "center" }}>
                            <img
                              src={savedRectoImage.imageUrl}
                              style={{
                                height: 160,
                                width: 240,
                                marginTop: 20
                              }}
                            />
                          </div>
                        </section>
                        <span className="text-dark-75 d-block font-size-lg mt-10">
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`/document/display/${savedRectoImage.imageUrl}`}
                            className="btn btn-light-primary"
                          >
                            <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                          </a>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={savedRectoImage.imageUrl}
                          >
                            <i className="btn flaticon-download label label-lg font-weight-bold label-light-success label-inline ml-5" />
                          </a>
                        </span>
                      </>
                    ) : (
                      <Dropzone
                        accept=".jpg,.jpeg,.png"
                        onDrop={acceptedFiles =>
                          onChangeRectoBase64(setFieldValue, acceptedFiles)
                        }
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section className="dropzone-container-xs">
                            <div
                              {...getRootProps()}
                              style={{ textAlign: "center" }}
                            >
                              <div
                                className="image-circle-wrapper"
                                style={{ margin: "0 auto" }}
                              >
                                <i className="flaticon2-download-2 text-white" />
                              </div>
                              <input {...getInputProps()} />
                              <p className="mt-1">
                                Glissez votre{" "}
                                <span className="font-weight-bolder font-size-sm">
                                  Rib
                                </span>
                              </p>
                              <div className="break">ou</div>
                              <button
                                type="button"
                                className="file-input-button"
                              >
                                {values.rectoBase64
                                  ? intl.formatMessage({
                                      id: "BUTTON.REPLACE.FILE"
                                    })
                                  : intl.formatMessage({
                                      id: "BUTTON.CHOSE.FILE"
                                    })}
                              </button>
                            </div>
                          </section>
                        )}
                      </Dropzone>
                    )}
                    {touched.rectoBase64 && errors.rectoBase64 ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.rectoBase64}
                        </div>
                      </div>
                    ) : null}
                    {values.rectoBase64 ? (
                      <div className="fv-plugins-message-container">
                        <i className="fas fa-check text-success"></i>
                        <span className="ml-5 text-success">
                          <FormattedMessage id="MESSAGE.SUCCESS.FILE" />
                        </span>
                      </div>
                    ) : null}
                  </Col>
                  {interimaire.iban && (
                    <Col lg={6}>
                      <div>
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
                            <div className="fv-help-block">
                              {errors.bankName}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="my-2">
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
                      <div className="my-2">
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
                    </Col>
                  )}
                </Row>
                <div style={{ marginTop: 40 }}>
                  * Le document doit être au format jpg, jpeg ou png.
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={hideModal}
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
                  {!interimaire.iban ? (
                    <FormattedMessage id="BUTTON.NEXT" />
                  ) : (
                    <FormattedMessage id="BUTTON.SAVE" />
                  )}
                </span>
                {loading && (
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

export default RibSelector;

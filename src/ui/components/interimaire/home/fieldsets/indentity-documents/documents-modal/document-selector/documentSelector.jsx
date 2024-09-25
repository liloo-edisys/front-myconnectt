import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import { getNationalitiesList } from "../../../../../../../../business/actions/interimaire/interimairesActions";

function DocumentSelector(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    interimaire,
    updateInterimaireIdentityLoading,
    nationalitiesList
  } = useSelector(state => state.interimairesReducerData);
  const {
    activeModal,
    hideModal,
    formStep,
    identityInfo,
    setFormStep,
    setIdentityInfo,
    documentType,
    setDocumentType,
    setRectoBase64,
    setVersoBase64,
    savedRectoImage,
    savedVersoImage,
    setFileTypeFront,
    setFileTypeBack
  } = props;
  const [loading, setLoading] = useState(false);

  const types = [
    "Carte d'identité",
    "Passeport",
    "Titre de séjour",
    "Récépissé"
  ];

  const initialValues = {
    documentType: ""
  };

  const initialValuesImage = {
    documentType: "Carte d'identité"
  };

  const initialValuesIdentityCard = {
    documentType: documentType,
    rectoBase64: "",
    versoBase64: ""
  };

  const initialValuesPassport = {
    documentType: documentType,
    rectoBase64: ""
  };

  const IdentitySchema = Yup.object().shape({
    documentType: Yup.string(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ).required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  const IdentityCardSchema = Yup.object().shape({
    rectoBase64: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    versoBase64: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  const PassportSchema = Yup.object().shape({
    rectoBase64: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    if (savedRectoImage.documentType === 8) {
      setDocumentType("Carte d'identité");
    } else if (savedRectoImage.documentType === 9) {
      setDocumentType("Titre de séjour");
    } else if (savedRectoImage.documentType === 14) {
      setDocumentType("Passeport");
    } else if (savedRectoImage.documentType === 16) {
      setDocumentType("Récépissé");
    } else {
      setDocumentType("");
    }
    if (nationalitiesList.length === 0) {
      getNationalitiesList(dispatch);
    }
  }, [activeModal, interimaire, savedRectoImage]);

  const onChangeDocumentType = (setFieldValue, e) => {
    setDocumentType(e.target.value);
    setFieldValue("documentType", e.target.value);
  };
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
            file.filename + Math.floor(Math.random() * Math.floor(100));
          file["formatedBase64"] = stringBase64;
          setRectoBase64(file.formatedBase64);
          setFileTypeFront(type);
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

  const onChangeVersoBase64 = (setFieldValue, acceptedFiles) => {
    let file = acceptedFiles[0];
    const pieces = file.path.split(/[\s.]+/);
    const type = pieces[pieces.length - 1].toLowerCase();
    if (type === "jpg" || type === "jpeg" || type === "png") {
      getBase64(file)
        .then(result => {
          file["base64"] = result;
          let stringBase64 = result.split(",")[1];
          file["index"] =
            file.filename + Math.floor(Math.random() * Math.floor(100));
          file["formatedBase64"] = stringBase64;
          setVersoBase64(file.formatedBase64);
          setFileTypeBack(type);
          setFieldValue("versoBase64", file.formatedBase64);
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

  return (
    <Modal
      size="lg"
      show={formStep === "document"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {savedRectoImage.documentType ? (
            <div>{documentType}</div>
          ) : (
            <FormattedMessage id="TEXT.SELECT.DOCUMENT.TYPE" />
          )}
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={
          savedVersoImage.documentType
            ? initialValuesImage
            : documentType === "Carte d'identité" ||
              documentType === "Titre de séjour"
            ? initialValuesIdentityCard
            : documentType === "Passeport"
            ? initialValuesPassport
            : initialValues
        }
        validationSchema={
          savedVersoImage.documentType
            ? IdentitySchema
            : documentType === "Carte d'identité" ||
              documentType === "Titre de séjour"
            ? IdentityCardSchema
            : documentType === "Passeport"
            ? PassportSchema
            : IdentitySchema
        }
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          setLoading(true);
          let body = {};
          if (documentType === "Carte d'identité") {
            body = {
              documentType: 8,
              tenantid: +process.env.REACT_APP_TENANT_ID,
              versoBase64: values.versoBase64,
              rectoBase64: values.rectoBase64
            };
          } else if (documentType === "Passeport") {
            body = {
              documentType: 14,
              tenantid: +process.env.REACT_APP_TENANT_ID,
              rectoBase64: values.rectoBase64
            };
          } else if (documentType === "Titre de séjour") {
            body = {
              documentType: 9,
              tenantid: +process.env.REACT_APP_TENANT_ID,
              rectoBase64: values.rectoBase64,
              versoBase64: values.versoBase64
            };
          } else if (documentType === "Récépissé") {
            body = {
              documentType: 16,
              tenantid: +process.env.REACT_APP_TENANT_ID,
              rectoBase64: values.rectoBase64,
              versoBase64: values.versoBase64
            };
          }

          axios
            .post(process.env.REACT_APP_WEBAPI_URL + "api/ApplicantOcr", body)
            .then(res => {
              const user = res.data;
              const today = new Date();
              let birthDate = "";
              let idCardIssueDate = "";
              let idCardExpirationDate = "";
              let dateError = "";

              if (user.birthDate) {
                const tempBirthdate = new Date(user.birthDate);
                if (birthDate < today) {
                  birthDate = tempBirthdate;
                }
              }
              if (user.idCardIssueDate) {
                const tempidCardIssueDate = new Date(user.idCardIssueDate);
                if (idCardIssueDate < today) {
                  idCardIssueDate = tempidCardIssueDate;
                }
              }
              if (user.idCardExpirationDate) {
                const tempididCardExpirationDate = new Date(
                  user.idCardExpirationDate
                );
                if (documentType === "Carte d'identité") {
                  idCardExpirationDate = tempididCardExpirationDate;
                } else if (tempididCardExpirationDate > today) {
                  idCardExpirationDate = tempididCardExpirationDate;
                } else if (tempididCardExpirationDate < today) {
                  dateError = intl.formatMessage({
                    id: "MESSAGE.DOCUMENT.PASSED.DATE"
                  });
                }
              }

              setFormStep("documentData");
              setLoading(false);
              setIdentityInfo({
                titleTypeID: user.titleTypeID,
                idCardNumber: !user.idCardNumber ? "" : user.idCardNumber,
                lastname: !user.lastname ? "" : user.lastname,
                firstname: !user.firstname ? "" : user.firstname,
                nationalityID: !user.nationalityID ? "" : user.nationalityID,
                birthDate: birthDate,
                idCardIssueDate: idCardIssueDate,
                idCardExpirationDate: idCardExpirationDate,
                dateError
              });
            })
            .catch(err => {
              setLoading(false);
              console.log(err);
            });
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
                {!savedRectoImage.documentType && (
                  <select
                    className="col-lg-12 form-control"
                    value={documentType}
                    onChange={e => onChangeDocumentType(setFieldValue, e)}
                  >
                    <option value="" disabled selected>
                      Sélectionnez le type de document.
                    </option>
                    {types.map((type, i) => (
                      <option key={i} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}
                {touched.documentType && errors.documentType ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.documentType}</div>
                  </div>
                ) : null}
                {documentType === "Carte d'identité" ||
                documentType === "Titre de séjour" ||
                documentType === "Récépissé" ? (
                  <div>
                    <Row style={{ marginTop: 30 }}>
                      <Col
                        lg={6}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}
                      >
                        {savedRectoImage.documentType ? (
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
                                      {documentType === "Carte d'identité"
                                        ? intl.formatMessage({
                                            id: "IDENTITY.DOCUMENT"
                                          }) +
                                          " (" +
                                          intl.formatMessage({ id: "FRONT" }) +
                                          ")"
                                        : documentType === "Titre de séjour"
                                        ? "Carte de séjour (" +
                                          intl.formatMessage({ id: "FRONT" }) +
                                          ")"
                                        : documentType === "Récépissé" &&
                                          "Carte de séjour ou votre passeport"}
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
                        {touched.rectoBase64IsImage &&
                        errors.rectoBase64IsImage ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.rectoBase64IsImage}
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
                      <Col
                        lg={6}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}
                      >
                        {savedVersoImage.documentType ? (
                          <section className="dropzone-container-xs">
                            <div style={{ textAlign: "center" }}>
                              <img
                                src={savedVersoImage.imageUrl}
                                style={{
                                  height: 160,
                                  width: 240,
                                  marginTop: 20
                                }}
                              />
                            </div>
                          </section>
                        ) : (
                          <Dropzone
                            accept=".jpg,.jpeg,.png"
                            onDrop={acceptedFiles =>
                              onChangeVersoBase64(setFieldValue, acceptedFiles)
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
                                      {documentType === "Carte d'identité"
                                        ? intl.formatMessage({
                                            id: "IDENTITY.DOCUMENT"
                                          }) + " (verso)"
                                        : documentType === "Titre de séjour"
                                        ? intl.formatMessage({
                                            id: "DOCUMENT.RESIDENCE.PERMIT"
                                          }) + " (verso)"
                                        : documentType === "Récépissé" &&
                                          intl.formatMessage({
                                            id: "DOCUMENT.RECEIPT"
                                          })}
                                    </span>
                                  </p>
                                  <div className="break">ou</div>
                                  <button
                                    type="button"
                                    className="file-input-button"
                                  >
                                    {values.versoBase64
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
                        {touched.versoBase64 && errors.versoBase64 ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.versoBase64}
                            </div>
                          </div>
                        ) : null}
                        {values.versoBase64 ? (
                          <div className="fv-plugins-message-container">
                            <i className="fas fa-check text-success"></i>
                            <span className="ml-5 text-success">
                              <FormattedMessage id="MESSAGE.SUCCESS.FILE" />
                            </span>
                          </div>
                        ) : null}
                      </Col>
                    </Row>
                  </div>
                ) : (
                  documentType === "Passeport" && (
                    <div>
                      <Row style={{ marginTop: 30 }}>
                        <Col
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                          }}
                        >
                          {savedRectoImage.documentType ? (
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
                          ) : (
                            <Dropzone
                              accept=".jpg,.jpeg,.png"
                              onDrop={acceptedFiles =>
                                onChangeRectoBase64(
                                  setFieldValue,
                                  acceptedFiles
                                )
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
                                        Passeport
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
                      </Row>
                    </div>
                  )
                )}
                {documentType && (
                  <div style={{ marginTop: 40 }}>
                    * Les documents doivent être au format jpg, jpeg ou png.
                  </div>
                )}
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
              {!savedRectoImage.documentType && (
                <button
                  id="kt_login_signin_submit"
                  type="submit"
                  className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
                >
                  <span>
                    <FormattedMessage id="BUTTON.NEXT" />
                  </span>
                  {loading && (
                    <span className="ml-3 spinner spinner-white"></span>
                  )}
                </button>
              )}
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default DocumentSelector;

import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import { DatePickerField } from "metronic/_partials/controls";
import { updateSelectedApplicantIdentity } from "../../../../../../../../../business/actions/backoffice/applicantActions";
import { getNationalitiesList } from "../../../../../../../../../business/actions/interimaire/interimairesActions";
import moment from "moment";

function DocumentSelector(props) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const { titleTypes, interimaire, nationalitiesList } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire,
      titleTypes: state.lists.titleTypes,
      nationalitiesList: state.interimairesReducerData.nationalitiesList
    }),
    shallowEqual
  );
  const {
    activeModal,
    hideModal,
    formStep,
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
  const [idCardIssueDate, setIdCardIssueDate] = useState("");
  const [idCardExpirationDate, setIdCardExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [localDateError, setLocalDateError] = useState("");

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

  const initialValueEdit = {
    documentType: documentType,
    titleTypeID: interimaire.titleTypeID,
    idCardNumber: interimaire.idCardNumber,
    nationalityID: interimaire.nationalityID,
    lastname: interimaire.lastname,
    firstname: interimaire.firstname,
    birthDate: moment(interimaire.birthDate),
    idCardIssueDate: moment(interimaire.idCardIssueDate),
    idCardExpirationDate: moment(interimaire.idCardExpirationDate)
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

  const EditIdentitySchema = Yup.object().shape({
    idCardNumber: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    titleTypeID: Yup.number().min(
      1,
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    birthDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    nationalityID: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    idCardIssueDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    idCardExpirationDate: Yup.string().required(
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

  const onChangeGender = (e, setFieldValue) => {
    setFieldValue("titleTypeID", parseInt(e));
  };

  const onChangeNationalityID = (e, setFieldValue) => {
    setFieldValue("nationalityID", parseInt(e));
  };

  const onChangeBirthDate = (date, setFieldValue) => {
    if (date === "Invalid date") {
      setFieldValue("birthDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("birthDate", newDate);
    }
  };

  const onChangeIdCardIssueDate = (date, setFieldValue, values) => {
    var timestamp = Date.parse(date);
    if (date === "Invalid date") {
      setLocalDateError("");
      setFieldValue("idCardIssueDate", "");
      setIdCardIssueDate("");
    } else {
      if (isNaN(timestamp) == false) {
        const { idCardExpirationDate } = values;
        const newDate = moment(date);
        setIdCardIssueDate(newDate);
        setFieldValue("idCardIssueDate", newDate);
        if (moment(idCardExpirationDate)._i < date) {
          setFieldValue("idCardExpirationDate", "");
          setIdCardExpirationDate("");
        }
      }
    }
  };

  const onChangeIdCardExpirationDate = (date, setFieldValue) => {
    var timestamp = Date.parse(date);
    if (date === "Invalid date") {
      setLocalDateError("");
      setFieldValue("idCardExpirationDate", "");
      setIdCardExpirationDate("");
    } else {
      if (isNaN(timestamp) == false) {
        setLocalDateError("");
        const newDate = moment(date);
        setFieldValue("idCardExpirationDate", newDate);
        setIdCardExpirationDate(date);
      }
    }
  };

  return (
    <Modal
      size="lg"
      show={formStep === "document"}
      aria-labelledby="example-modal-sizes-title-lg"
      onHide={hideModal}
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
          interimaire.idCardNumber
            ? initialValueEdit
            : savedVersoImage.documentType
            ? initialValuesImage
            : documentType === "Carte d'identité" ||
              documentType === "Titre de séjour"
            ? initialValuesIdentityCard
            : documentType === "Passeport"
            ? initialValuesPassport
            : initialValues
        }
        validationSchema={
          interimaire.idCardNumber
            ? EditIdentitySchema
            : savedVersoImage.documentType
            ? IdentitySchema
            : documentType === "Carte d'identité" ||
              documentType === "Titre de séjour"
            ? IdentityCardSchema
            : documentType === "Passeport"
            ? PassportSchema
            : IdentitySchema
        }
        setFieldValue
        onSubmit={(values) => {
          setLoading(true);
          if (!interimaire.idCardNumber) {
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
          } else {
            setLoading(true);
            const newInterimaire = {
              ...interimaire,
              ...values
            };
            const isExpired =
              new Date() > new Date(newInterimaire.idCardExpirationDate);
            if (isExpired) {
              setLoading(false);
              return toastr.error(
                intl.formatMessage({ id: "ERROR" }),
                intl.formatMessage({ id: "MESSAGE.DOCUMENT.INVALID" })
              );
            } else {
              updateSelectedApplicantIdentity(newInterimaire, null, dispatch)
                .then(() => {
                  setLoading(false);
                  hideModal();
                })
                .catch(() => setLoading(false));
            }
          }
        }}
      >
        {({ values, touched, errors, handleSubmit, setFieldValue }) => (
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
                          <>
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
                            <span className="text-dark-75 d-block font-size-lg mt-10">
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`/document/display/${savedVersoImage.imageUrl}`}
                                className="btn btn-light-primary"
                              >
                                <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                              </a>
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={savedVersoImage.imageUrl}
                              >
                                <i className="btn flaticon-download label label-lg font-weight-bold label-light-success label-inline ml-5" />
                              </a>
                            </span>
                          </>
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
                    {interimaire.idCardNumber && (
                      <Row className="mt-20">
                        <Col lg={6}>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="MODEL.CIVILITY" />
                              <span className="required_asterix">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-l flaticon-profile-1 text-primary"></i>
                                </span>
                              </div>
                              <Field
                                name="titleTypeID"
                                render={() => (
                                  <select
                                    className="form-control h-auto py-5 px-6"
                                    name="titleTypeID"
                                    onChange={e => {
                                      onChangeGender(
                                        e.target.value,
                                        setFieldValue
                                      );
                                    }}
                                  >
                                    <option disabled selected value="0">
                                      --{" "}
                                      {intl.formatMessage({
                                        id: "MODEL.CIVILITY"
                                      })}{" "}
                                      --
                                    </option>
                                    {titleTypes.map(gender => (
                                      <option
                                        key={gender.id}
                                        label={gender.name}
                                        value={gender.id}
                                        selected={
                                          values.titleTypeID === gender.id
                                        }
                                      >
                                        {gender.name}
                                      </option>
                                    ))}
                                    ;
                                  </select>
                                )}
                              />
                            </div>
                            {touched.titleTypeID && errors.titleTypeID ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.titleTypeID}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="TEXT.NUMBER" />
                              <span className="required_asterix">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-l far fa-address-card text-primary"></i>
                                </span>
                              </div>
                              <Field
                                placeholder={intl.formatMessage({
                                  id: "TEXT.IDCARD.NUMBER"
                                })}
                                type="text"
                                className={`form-control h-auto py-5 px-6`}
                                name="idCardNumber"
                              />
                            </div>
                            {touched.idCardNumber && errors.idCardNumber ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.idCardNumber}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="MODEL.BIRTHNAME" />
                              <span className="required_asterix">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-l far fa-address-card text-primary"></i>
                                </span>
                              </div>
                              <Field
                                placeholder={intl.formatMessage({
                                  id: "MODEL.BIRTHNAME"
                                })}
                                type="text"
                                className={`form-control h-auto py-5 px-6`}
                                name="lastname"
                              />
                            </div>
                            {touched.lastname && errors.lastname ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.lastname}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="MODEL.FIRSTNAME" />
                              <span className="required_asterix">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-l far fa-address-card text-primary"></i>
                                </span>
                              </div>
                              <Field
                                placeholder={intl.formatMessage({
                                  id: "MODEL.FIRSTNAME"
                                })}
                                type="text"
                                className={`form-control h-auto py-5 px-6`}
                                name="firstname"
                              />
                            </div>
                            {touched.firstname && errors.firstname ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.firstname}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </Col>
                        <Col lg={6}>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="COLUMN.NATIONALITY" />
                              <span className="required_asterix">*</span>
                            </label>
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="icon-l fas fa-globe text-primary"></i>
                                </span>
                              </div>
                              <Field
                                name="nationalityID"
                                render={() => (
                                  <select
                                    className="form-control h-auto py-5 px-6"
                                    name="nationalityID"
                                    onChange={e => {
                                      onChangeNationalityID(
                                        e.target.value,
                                        setFieldValue
                                      );
                                    }}
                                  >
                                    <option disabled selected value="0">
                                      --{" "}
                                      {intl.formatMessage({
                                        id: "MESSAGE.SELECT.NATIONALITY"
                                      })}
                                      --
                                    </option>
                                    {nationalitiesList.map(nationality => (
                                      <option
                                        key={nationality.id}
                                        label={nationality.frenchName}
                                        value={nationality.id}
                                        selected={
                                          values.nationalityID ===
                                          nationality.id
                                        }
                                      >
                                        {nationality.name}
                                      </option>
                                    ))}
                                    ;
                                  </select>
                                )}
                              />
                            </div>
                            {touched.nationalityID && errors.nationalityID ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.nationalityID}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="TEXT.BIRTHDATE" />
                              <span className="required_asterix">*</span>
                            </label>
                            <DatePickerField
                              component={DatePickerField}
                              iconHeight="55px"
                              className={`form-control h-auto py-5 px-6 date-input-content`}
                              type="text"
                              placeholder="JJ/MM/AAAA"
                              name="birthDate"
                              maxDate={moment().subtract(18, "years")._d}
                              onChange={date =>
                                onChangeBirthDate(date, setFieldValue)
                              }
                              showMonthDropdown
                              showYearDropdown
                              yearItemNumber={9}
                              locale="fr"
                            />
                            {touched.birthDate && errors.birthDate ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.birthDate}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="MODEL.ID.STARTDATE" />
                              <span className="required_asterix">*</span>
                            </label>
                            <DatePickerField
                              component={DatePickerField}
                              className={`form-control h-auto py-5 px-6 date-input-content`}
                              iconHeight="55px"
                              type="text"
                              placeholder="JJ/MM/AAAA"
                              name="idCardIssueDate"
                              maxDate={moment().toDate()}
                              onChange={date =>
                                onChangeIdCardIssueDate(
                                  date,
                                  setFieldValue,
                                  values
                                )
                              }
                              showMonthDropdown
                              showYearDropdown
                              yearItemNumber={9}
                              locale="fr"
                            />
                            {touched.idCardIssueDate &&
                            errors.idCardIssueDate ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.idCardIssueDate}
                                </div>
                              </div>
                            ) : null}
                          </div>
                          <div className="py-2">
                            <label htmlFor="jobTitle">
                              <FormattedMessage id="MODEL.ID.ENDDATE" />
                              <span className="required_asterix">*</span>
                            </label>
                            {documentType !== "Carte d'identité" ? (
                              <DatePickerField
                                component={DatePickerField}
                                className={`form-control h-auto py-5 px-6 date-input-content`}
                                iconHeight="55px"
                                type="text"
                                placeholder="JJ/MM/AAAA"
                                name="idCardExpirationDate"
                                minDate={
                                  !idCardIssueDate ||
                                  new Date() > new Date(idCardIssueDate)
                                    ? new Date()
                                    : new Date(idCardIssueDate)
                                }
                                onChange={date =>
                                  onChangeIdCardExpirationDate(
                                    date,
                                    setFieldValue
                                  )
                                }
                                showMonthDropdown
                                showYearDropdown
                                yearItemNumber={9}
                                locale="fr"
                              />
                            ) : (
                              <DatePickerField
                                component={DatePickerField}
                                className={`form-control h-auto py-5 px-6 date-input-content`}
                                iconHeight="55px"
                                type="text"
                                placeholder="JJ/MM/AAAA"
                                name="idCardExpirationDate"
                                minDate={
                                  idCardIssueDate &&
                                  moment(idCardIssueDate).toDate()
                                }
                                onChange={date =>
                                  onChangeIdCardExpirationDate(
                                    date,
                                    setFieldValue
                                  )
                                }
                                showMonthDropdown
                                showYearDropdown
                                yearItemNumber={9}
                                locale="fr"
                              />
                            )}
                            {touched.idCardExpirationDate &&
                            errors.idCardExpirationDate ? (
                              <div className="fv-plugins-message-container">
                                <div className="fv-help-block">
                                  {errors.idCardExpirationDate}
                                </div>
                              </div>
                            ) : (
                              localDateError && (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {localDateError}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </Col>
                      </Row>
                    )}
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
                        {interimaire.idCardNumber && (
                          <Col lg={6}>
                            <div>
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="MODEL.BIRTHNAME" />
                                <span className="required_asterix">*</span>
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-l far fa-address-card text-primary"></i>
                                  </span>
                                </div>
                                <Field
                                  placeholder={intl.formatMessage({
                                    id: "MODEL.BIRTHNAME"
                                  })}
                                  type="text"
                                  className={`form-control h-auto py-5 px-6`}
                                  name="lastname"
                                />
                              </div>
                              {touched.lastname && errors.lastname ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.lastname}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="MODEL.FIRSTNAME" />
                                <span className="required_asterix">*</span>
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-l far fa-address-card text-primary"></i>
                                  </span>
                                </div>
                                <Field
                                  placeholder={intl.formatMessage({
                                    id: "MODEL.FIRSTNAME"
                                  })}
                                  type="text"
                                  className={`form-control h-auto py-5 px-6`}
                                  name="firstname"
                                />
                              </div>
                              {touched.firstname && errors.firstname ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.firstname}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="COLUMN.NATIONALITY" />
                                <span className="required_asterix">*</span>
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-l fas fa-globe text-primary"></i>
                                  </span>
                                </div>
                                <Field
                                  name="nationalityID"
                                  render={() => (
                                    <select
                                      className="form-control h-auto py-5 px-6"
                                      name="nationalityID"
                                      onChange={e => {
                                        onChangeNationalityID(
                                          e.target.value,
                                          setFieldValue
                                        );
                                      }}
                                    >
                                      <option disabled selected value="0">
                                        --{" "}
                                        {intl.formatMessage({
                                          id: "MESSAGE.SELECT.NATIONALITY"
                                        })}{" "}
                                        --
                                      </option>
                                      {nationalitiesList.map(nationality => (
                                        <option
                                          key={nationality.id}
                                          label={nationality.frenchName}
                                          value={nationality.id}
                                          selected={
                                            values.nationalityID ===
                                            nationality.id
                                          }
                                        >
                                          {nationality.name}
                                        </option>
                                      ))}
                                      ;
                                    </select>
                                  )}
                                />
                              </div>
                              {touched.nationalityID && errors.nationalityID ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.nationalityID}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="TEXT.BIRTHDATE" />
                                <span className="required_asterix">*</span>
                              </label>
                              <DatePickerField
                                component={DatePickerField}
                                className={`form-control h-auto py-5 px-6`}
                                iconHeight="55px"
                                type="text"
                                placeholder="JJ/MM/AAAA"
                                name="birthDate"
                                maxDate={moment().subtract(18, "years")._d}
                                onChange={date =>
                                  onChangeBirthDate(date, setFieldValue)
                                }
                                showMonthDropdown
                                showYearDropdown
                                yearItemNumber={9}
                                locale="fr"
                              />
                              {touched.birthDate && errors.birthDate ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.birthDate}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </Col>
                        )}
                      </Row>
                      {interimaire.idCardNumber && (
                        <Row>
                          <Col lg={6}>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="MODEL.CIVILITY" />
                                <span className="required_asterix">*</span>
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-l flaticon-profile-1 text-primary"></i>
                                  </span>
                                </div>
                                <Field
                                  name="titleTypeID"
                                  render={() => (
                                    <select
                                      className="form-control h-auto py-5 px-6"
                                      name="titleTypeID"
                                      onChange={e => {
                                        onChangeGender(
                                          e.target.value,
                                          setFieldValue
                                        );
                                      }}
                                    >
                                      <option disabled selected value="0">
                                        --{" "}
                                        {intl.formatMessage({
                                          id: "MODEL.CIVILITY"
                                        })}{" "}
                                        --
                                      </option>
                                      {titleTypes.map(gender => (
                                        <option
                                          key={gender.id}
                                          label={gender.name}
                                          value={gender.id}
                                          selected={
                                            values.titleTypeID === gender.id
                                          }
                                        >
                                          {gender.name}
                                        </option>
                                      ))}
                                      ;
                                    </select>
                                  )}
                                />
                              </div>
                              {touched.titleTypeID && errors.titleTypeID ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.titleTypeID}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="TEXT.NUMBER" />
                                <span className="required_asterix">*</span>
                              </label>
                              <div className="input-group">
                                <div className="input-group-prepend">
                                  <span className="input-group-text">
                                    <i className="icon-l far fa-address-card text-primary"></i>
                                  </span>
                                </div>
                                <Field
                                  placeholder={intl.formatMessage({
                                    id: "TEXT.IDCARD.NUMBER"
                                  })}
                                  type="text"
                                  className={`form-control h-auto py-5 px-6`}
                                  name="idCardNumber"
                                />
                              </div>
                              {touched.idCardNumber && errors.idCardNumber ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.idCardNumber}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </Col>
                          <Col lg={6}>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="MODEL.ID.STARTDATE" />
                                <span className="required_asterix">*</span>
                              </label>
                              <DatePickerField
                                component={DatePickerField}
                                className={`form-control h-auto py-5 px-6 date-input-content`}
                                iconHeight="55px"
                                type="text"
                                placeholder="JJ/MM/AAAA"
                                name="idCardIssueDate"
                                maxDate={moment().toDate()}
                                onChange={date =>
                                  onChangeIdCardIssueDate(
                                    date,
                                    setFieldValue,
                                    values
                                  )
                                }
                                showMonthDropdown
                                showYearDropdown
                                yearItemNumber={9}
                                locale="fr"
                              />
                              {touched.idCardIssueDate &&
                              errors.idCardIssueDate ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.idCardIssueDate}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="py-2">
                              <label htmlFor="jobTitle">
                                <FormattedMessage id="MODEL.ID.ENDDATE" />
                                <span className="required_asterix">*</span>
                              </label>
                              {documentType !== "Carte d'identité" ? (
                                <DatePickerField
                                  component={DatePickerField}
                                  className={`form-control h-auto py-5 px-6 date-input-content`}
                                  iconHeight="55px"
                                  type="text"
                                  placeholder="JJ/MM/AAAA"
                                  name="idCardExpirationDate"
                                  minDate={
                                    !idCardIssueDate ||
                                    new Date() > new Date(idCardIssueDate)
                                      ? new Date()
                                      : new Date(idCardIssueDate)
                                  }
                                  onChange={date =>
                                    onChangeIdCardExpirationDate(
                                      date,
                                      setFieldValue
                                    )
                                  }
                                  showMonthDropdown
                                  showYearDropdown
                                  yearItemNumber={9}
                                  locale="fr"
                                />
                              ) : (
                                <DatePickerField
                                  component={DatePickerField}
                                  className={`form-control h-auto py-5 px-6 date-input-content`}
                                  iconHeight="55px"
                                  type="text"
                                  placeholder="JJ/MM/AAAA"
                                  name="idCardExpirationDate"
                                  minDate={
                                    idCardIssueDate &&
                                    moment(idCardIssueDate).toDate()
                                  }
                                  onChange={date =>
                                    onChangeIdCardExpirationDate(
                                      date,
                                      setFieldValue
                                    )
                                  }
                                  showMonthDropdown
                                  showYearDropdown
                                  yearItemNumber={9}
                                  locale="fr"
                                />
                              )}
                              {touched.idCardExpirationDate &&
                              errors.idCardExpirationDate ? (
                                <div className="fv-plugins-message-container">
                                  <div className="fv-help-block">
                                    {errors.idCardExpirationDate}
                                  </div>
                                </div>
                              ) : (
                                localDateError && (
                                  <div className="fv-plugins-message-container">
                                    <div className="fv-help-block">
                                      {localDateError}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </Col>
                        </Row>
                      )}
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
              <button
                id="kt_login_signin_submit"
                type="submit"
                className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
              >
                <span>
                  {!interimaire.idCardNumber ? (
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

export default DocumentSelector;

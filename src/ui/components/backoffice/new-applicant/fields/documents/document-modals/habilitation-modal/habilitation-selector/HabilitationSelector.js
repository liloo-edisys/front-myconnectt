import React, { useState, useEffect } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { removeOneSelectedApplicantDocument } from "../../../../../../../../../business/actions/backoffice/applicantActions";

function HabilitationSelector(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { interimaire, updateInterimaireIdentityLoading } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire,
      updateInterimaireIdentityLoading:
        state.interimairesReducerData.updateInterimaireIdentityLoading
    }),
    shallowEqual
  );
  const {
    hideModal,
    setRectoBase64,
    formStep,
    setFormStep,
    savedImageArray,
    setVitalCardData,
    setSavedImageArray,
    setFilename
  } = props;
  const [loading, setLoading] = useState(false);
  const [savedRectoImage, setSavedRectoImage] = useState({
    documentType: null,
    imageUrl: null
  });
  const [localeImageArray, setLocaleImageArray] = useState([]);
  const [interimaireImageArray, setInterimareImageArray] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);

  const initialValuesVitalCard = {
    rectoBase64: ""
  };

  const VitalCardSchema = Yup.object().shape({
    rectoBase64: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    setLocaleImageArray(savedImageArray);
    setInterimareImageArray(interimaire ? interimaire.applicantDocuments : []);
  }, [savedImageArray]);

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
          setFilename("Habilitation." + type);
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

  const saveNewImageArray = () => {};

  const onDeleteDocument = id => {
    const imageIndex = interimaire.applicantDocuments.findIndex(
      a => a.id === id
    );
    const body = interimaire.applicantDocuments[imageIndex];
    removeOneSelectedApplicantDocument(body, "habilitation", dispatch);
  };

  return (
    <Modal
      size="xl"
      show={formStep === "selector"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.HABILITATIONS" />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesVitalCard}
        validationSchema={VitalCardSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          setLoading(true);
          let body = (body = {
            documentType: 13,
            tenantid: +process.env.REACT_APP_TENANT_ID,
            rectoBase64: values.rectoBase64
          });
          axios
            .post(process.env.REACT_APP_WEBAPI_URL + "api/ApplicantOcr", body)
            .then(res => {
              const user = res.data;
              let applicantValidationDate = "";
              if (
                user.applicantValidationDate &&
                new Date(user.applicantValidationDate) > new Date()
              ) {
                applicantValidationDate = new Date(
                  user.applicantValidationDate
                );
              }
              setVitalCardData({
                habilitationsList: [],
                habilitationStartDate: "",
                habilitationEndDate: applicantValidationDate
              });
              setLoading(false);
              setFormStep("informations");
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
            <Modal.Body>
              <div>
                <Row gutter={[20, 20]} style={{ marginTop: 30 }}>
                  {localeImageArray.map((image, i) => (
                    <Col lg={6}>
                      <div
                        style={{
                          border: "1px solid grey",
                          position: "relative",
                          padding: 20,
                          marginBottom: 20,
                          borderRadius: 10,
                          display: "flex"
                        }}
                      >
                        <div className="mr-5">
                          {image.documentType && (
                            <div>
                              <img
                                src={image.imageUrl}
                                style={{
                                  height: 100,
                                  width: 150
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4>{image.title}</h4>
                          {image.issueDate && (
                            <div className="mb-1">
                              Date de début:{" "}
                              <span style={{ fontWeight: "bold" }}>
                                {new Date(image.issueDate).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            </div>
                          )}
                          {image.expirationDate && (
                            <div>
                              Date de fin:{" "}
                              <span style={{ fontWeight: "bold" }}>
                                {new Date(
                                  image.expirationDate
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          )}
                          <span
                            className="text-dark-75 d-block font-size-lg mt-5"
                            style={{
                              textAlign: "center",
                              width: "100%"
                            }}
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`/document/display/${image.imageUrl}`}
                              className="btn btn-light-primary"
                            >
                              <FormattedMessage id="BUTTON.SEE.DOCUMENT" />
                            </a>
                          </span>
                        </div>
                        <div
                          style={{
                            zIndex: 10,
                            position: "absolute",
                            top: 10,
                            right: 10
                          }}
                        >
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={image.imageUrl}
                          >
                            <i className="btn flaticon-download icon-xl label label-lg font-weight-bold label-light-success label-inline" />
                          </a>
                          <i
                            onClick={() => onDeleteDocument(image.id)}
                            className="btn flaticon-delete icon-xl label label-lg font-weight-bold  ml-5 label-light-danger label-inline"
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </div>
                    </Col>
                  ))}
                  {!isDeleted && (
                    <Col
                      lg={localeImageArray.length > 0 ? 6 : 12}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                      }}
                    >
                      <Dropzone
                        accept=".jpg,.jpeg,.png"
                        onDrop={acceptedFiles =>
                          onChangeRectoBase64(setFieldValue, acceptedFiles)
                        }
                      >
                        {({ getRootProps, getInputProps }) => (
                          <div>
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
                                    Habilitation
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
                          </div>
                        )}
                      </Dropzone>
                      {touched.rectoBase64 && errors.rectoBase64 ? (
                        <div className="fv-plugins-message-container">
                          <div className="fv-help-block">
                            {errors.rectoBase64}
                          </div>
                        </div>
                      ) : null}
                      {values.rectoBase64 ? (
                        <div
                          className="fv-plugins-message-container"
                          style={{ textAlign: "center", marginTop: 5 }}
                        >
                          <i className="fas fa-check text-success"></i>
                          <span className="ml-5 text-success">
                            <FormattedMessage id="MESSAGE.SUCCESS.FILE" />
                          </span>
                        </div>
                      ) : null}
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
              {!savedRectoImage.documentType && (
                <>
                  {isDeleted ? (
                    <div
                      id="kt_login_signin_submit"
                      type="submit"
                      className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
                      onClick={saveNewImageArray}
                    >
                      <span>
                        <FormattedMessage id="BUTTON.SAVE" />
                      </span>
                      {loading && (
                        <span className="ml-3 spinner spinner-white"></span>
                      )}
                    </div>
                  ) : (
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
                </>
              )}
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default HabilitationSelector;

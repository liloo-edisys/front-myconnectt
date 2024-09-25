import React, { useState } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import _ from "lodash";
import { updateSelectedApplicantIdentity } from "../../../../../../../../../business/actions/backoffice/applicantActions";

function VitalCardSelector(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { titleTypes, interimaire } = useSelector(
    state => ({
      interimaire: state.accountsReducerData.activeInterimaire
    }),
    shallowEqual
  );
  const {
    hideModal,
    setRectoBase64,
    formStep,
    setFormStep,
    savedRectoImage,
    setVitalCardData,
    setFilename
  } = props;
  const [loading, setLoading] = useState(false);
  const socialNumberRegex =
    "^[12][0-9]{2}[0-1][0-9](2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}$";

  const initialValuesVitalCard = interimaire.socialSecurityNumber
    ? {
        birthDepartment: interimaire.birthDepartment,
        birthPlace: interimaire.birthPlace,
        socialSecurityNumber: interimaire.socialSecurityNumber
      }
    : {
        rectoBase64: ""
      };

  const VitalCardSchema = Yup.object().shape(
    interimaire.socialSecurityNumber
      ? {
          birthDepartment: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          ),
          socialSecurityNumber: Yup.string()
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
            .matches(
              socialNumberRegex,
              intl.formatMessage({ id: "MODEL.SOCIAL.NUMBER.INVALID" })
            ),
          birthPlace: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          )
        }
      : {
          rectoBase64: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          )
        }
  );

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
          setRectoBase64(file.formatedBase64);
          setFilename("VitalCardFront." + type);
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

  return (
    <Modal
      size="lg"
      show={formStep === "selector"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          {savedRectoImage.documentType ? (
            <div>Carte Vitale</div>
          ) : (
            <FormattedMessage id="TEXT.SELECT.VITALE.CARD" />
          )}
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesVitalCard}
        validationSchema={VitalCardSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          if (!interimaire.socialSecurityNumber) {
            setLoading(true);
            let body = (body = {
              documentType: 10,
              tenantid: +process.env.REACT_APP_TENANT_ID,
              rectoBase64: values.rectoBase64
            });

            axios
              .post(process.env.REACT_APP_WEBAPI_URL + "api/ApplicantOcr", body)
              .then(res => {
                const user = res.data;
                setVitalCardData({
                  birthDepartment: user.birthDepartment,
                  socialSecurityNumber: user.socialSecurityNumber,
                  birthPlace: user.birthPlace
                });
                setLoading(false);
                let inseeCode = user.socialSecurityNumber.substring(7, 10);

                setFormStep("informations");
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
            updateSelectedApplicantIdentity(newInterimaire, null, dispatch)
              .then(() => {
                setLoading(true);
                hideModal();
              })
              .catch(() => setLoading(true));
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
                    interimaire.socialSecurityNumber ? (
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
                                  <FormattedMessage id="VITAL.CARD" />
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
                  {interimaire.socialSecurityNumber && (
                    <Col lg={6}>
                      <div>
                        <label htmlFor="jobTitle">
                          <FormattedMessage id="MODEL.SOCIAL.NUMBER" />
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
                              id: "MODEL.SOCIAL.NUMBER"
                            })}
                            type="text"
                            className={`form-control h-auto py-5 px-6`}
                            name="socialSecurityNumber"
                          />
                        </div>
                        {touched.socialSecurityNumber &&
                        errors.socialSecurityNumber ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.socialSecurityNumber}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="py-2">
                        <label htmlFor="jobTitle">
                          <FormattedMessage id="TEXT.BIRTH.DEP" />
                          <span className="required_asterix">*</span>
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-l flaticon-map-location text-primary"></i>
                            </span>
                          </div>
                          <Field
                            placeholder={intl.formatMessage({
                              id: "TEXT.BIRTH.DEP"
                            })}
                            type="text"
                            className={`form-control h-auto py-5 px-6`}
                            name="birthDepartment"
                          />
                        </div>
                        {touched.birthDepartment && errors.birthDepartment ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.birthDepartment}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="py-2">
                        <label htmlFor="jobTitle">
                          <FormattedMessage id="TEXT.BIRTH.LOCATION" />
                          <span className="required_asterix">*</span>
                        </label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text">
                              <i className="icon-l flaticon-map-location text-primary"></i>
                            </span>
                          </div>
                          <Field
                            placeholder={intl.formatMessage({
                              id: "TEXT.BIRTH.LOCATION"
                            })}
                            type="text"
                            className={`form-control h-auto py-5 px-6`}
                            name="birthPlace"
                          />
                        </div>
                        {touched.birthPlace && errors.birthPlace ? (
                          <div className="fv-plugins-message-container">
                            <div className="fv-help-block">
                              {errors.birthPlace}
                            </div>
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
                  {!interimaire.socialSecurityNumber ? (
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

export default VitalCardSelector;

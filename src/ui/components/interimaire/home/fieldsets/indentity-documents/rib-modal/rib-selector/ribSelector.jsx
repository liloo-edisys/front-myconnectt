import React, { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { useSelector } from "react-redux";
import Dropzone from "react-dropzone";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";

function RibSelector(props) {
  const intl = useIntl();
  const { interimaire } = useSelector(state => state.interimairesReducerData);
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

  const initialValuesRib = {
    rectoBase64: ""
  };

  const RibSchema = Yup.object().shape({
    rectoBase64: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

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

export default RibSelector;

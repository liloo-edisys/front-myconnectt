import React, {  } from "react";
import { Modal, Row, Col } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { Formik, Form, Field } from "formik";
import { useSelector, useDispatch } from "react-redux";
import * as Yup from "yup";
import { updateInterimaireIdentity } from "../../../../../../../../business/actions/interimaire/interimairesActions";
import axios from "axios";
import { toastr } from "react-redux-toastr";

function VitalCardInformations(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    hideModal,
    formStep,
    vitalCardData,
    setFormStep,
    rectoBase64,
    filename
  } = props;
  const { interimaire, updateInterimaireIdentityLoading } = useSelector(
    state => state.interimairesReducerData
  );

  const initialValuesIdentityData = vitalCardData;
  const socialNumberRegex =
    "^[12][0-9]{2}[0-1][0-9](2[AB]|[0-9]{2})[0-9]{3}[0-9]{3}[0-9]{2}$";

  const IdentityDataSchema = Yup.object().shape({
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
  });

  const socialSecurityNumberRegexGroups =
    "^[12][0-9]{2}[0-1][0-9]((2[AB]|[0-9]{2})[0-9]{3})[0-9]{3}[0-9]{2}$";

  const closeVitalCardInformationsModal = () => {
    hideModal();
    setFormStep("selector");
  };

  return (
    <Modal
      size="lg"
      show={formStep === "informations"}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.VITALE.CARD.INFORMATIONS" />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesIdentityData}
        validationSchema={IdentityDataSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          const newInterimaire = {
            ...interimaire,
            ...values
          };
          const imageArray = [
            {
              documentType: 10,
              applicantID: interimaire.id,
              tenantID: +process.env.REACT_APP_TENANT_ID,
              document: rectoBase64,
              fileName: filename
            }
          ];
          updateInterimaireIdentity(newInterimaire, imageArray, dispatch).then(
            () => {
              setFormStep("selector");
              hideModal();
            }
          );
        }}
      >
        {({ values, touched, errors, status, handleSubmit, setFieldValue }) => (
          <Form
            id="kt_login_signin_form"
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            onSubmit={handleSubmit}
          >
            <Modal.Body>
              <div className="my-10">
                <Row>
                  <Col md={6} sm={12} className="py-2">
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
                        onChange={event => {
                          setFieldValue(
                            "socialSecurityNumber",
                            event.target.value
                          );
                          let matches = event.target.value.match(
                            socialSecurityNumberRegexGroups
                          );
                          if (matches != null && matches.length === 3) {
                            let communeCode = matches[1];
                            axios
                              .get(
                                "https://geo.api.gouv.fr/communes/" +
                                  communeCode
                              )
                              .then(data => {
                                setFieldValue(
                                  "birthPlace",
                                  data.data.nom.toUpperCase()
                                );
                                setFieldValue(
                                  "birthDepartment",
                                  data.data.codeDepartement
                                );
                              })
                              .catch(error => {
                                toastr.error(
                                  intl.formatMessage({ id: "ERROR" }),
                                  "Une erreur a été produite. Veuillez vous assurer de la validité du numéro de sécurité sociale."
                                );
                              });
                          }
                        }}
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
                  </Col>
                  <Col md={6} sm={12} className="py-2">
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
                        // ref={birthDep}
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
                  </Col>
                  <Col md={6} sm={12} className="py-2">
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
                        // ref={birthPlace}
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
                        <div className="fv-help-block">{errors.birthPlace}</div>
                      </div>
                    ) : null}
                  </Col>
                </Row>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={closeVitalCardInformationsModal}
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

export default VitalCardInformations;

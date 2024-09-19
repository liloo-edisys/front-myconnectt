import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { DatePickerField } from "metronic/_partials/controls";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";
import moment from "moment";
import {
  updateInterimaireIdentity,
  getNationalitiesList
} from "../../../../../../../../business/actions/interimaire/interimairesActions";
function IdentityInformations(props) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { titleTypes } = useSelector(
    state => ({
      titleTypes: state.lists.titleTypes
    }),
    shallowEqual
  );
  const {
    interimaire,
    updateInterimaireIdentityLoading,
    nationalitiesList
  } = useSelector(state => state.interimairesReducerData);

  const {
    formStep,
    identityInfo,
    setFormStep,
    setIdentityInfo,
    hideModal,
    documentType,
    rectoBase64,
    versoBase64,
    fileTypeFront,
    fileTypeBack
  } = props;
  const [idCardIssueDate, setIdCardIssueDate] = useState("");
  const [idCardExpirationDate, setIdCardExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [localDateError, setLocalDateError] = useState("");

  const initialValuesIdentityData = identityInfo;

  const IdentityDataSchema = Yup.object().shape({
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
    /*birthPlace: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),*/
    idCardIssueDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    idCardExpirationDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    if (nationalitiesList.length === 0) {
      getNationalitiesList(dispatch);
    }
    if (identityInfo) {
      setIdCardIssueDate(identityInfo.idCardIssueDate);
      setIdCardExpirationDate(identityInfo.idCardExpirationDate);
      setLocalDateError(identityInfo.dateError);
    }
  }, [identityInfo]);

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
  const onChangeGender = (e, setFieldValue) => {
    setFieldValue("titleTypeID", parseInt(e));
  };
  const onChangeNationalityID = (e, setFieldValue) => {
    setFieldValue("nationalityID", parseInt(e));
  };
  const closeIdentityInfomationsModal = () => {
    hideModal();
    setFormStep("document");
  };
  return (
    <Modal
      size="lg"
      show={formStep === "documentData"}
      aria-labelledby="example-modal-sizes-title-lg"
      onHide={closeIdentityInfomationsModal}
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.COMPLETE.IDENTITY.INFORMATIONS" />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValuesIdentityData}
        validationSchema={IdentityDataSchema}
        setFieldValue
        onSubmit={(values, { setSubmitting }) => {
          let imageArray = [];
          if (
            documentType === "Carte d'identité" ||
            documentType === "Titre de séjour" ||
            documentType === "Récépissé"
          ) {
            let documentTypeId =
              documentType === "Carte d'identité"
                ? 8
                : documentType === "Titre de séjour"
                ? 9
                : documentType === "Récépissé" && 16;
            let filename =
              documentType === "Carte d'identité"
                ? "IdentityCard"
                : documentType === "Titre de séjour"
                ? "ResidentCard"
                : documentType === "Récépissé" && "ReceiptCard";
            imageArray = [
              {
                documentType: documentTypeId,
                applicantID: interimaire.id,
                tenantID: +process.env.REACT_APP_TENANT_ID,
                document: rectoBase64,
                fileName: filename + "Front." + fileTypeFront
              },
              {
                documentType: documentTypeId,
                applicantID: interimaire.id,
                tenantID: +process.env.REACT_APP_TENANT_ID,
                document: versoBase64,
                fileName: filename + "Back." + fileTypeBack
              }
            ];
          } else if (documentType === "Passeport") {
            imageArray = [
              {
                documentType: 14,
                applicantID: interimaire.id,
                tenantID: +process.env.REACT_APP_TENANT_ID,
                document: rectoBase64,
                fileName: "PassportFront." + fileTypeFront
              }
            ];
          }

          const newInterimaire = {
            ...interimaire,
            ...values,
            birthDate: moment(values.birthDate).format("YYYY-MM-DDTHH:mm:ss"),
            idCardIssueDate: moment(values.idCardIssueDate).format(
              "YYYY-MM-DDTHH:mm:ss"
            ),
            idCardExpirationDate: moment(values.idCardExpirationDate).format(
              "YYYY-MM-DDTHH:mm:ss"
            )
          };
          updateInterimaireIdentity(newInterimaire, imageArray, dispatch).then(
            () => {
              setFormStep("document");
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
                    <div className="fv-help-block">{errors.idCardNumber}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-10">
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
                    render={({ field, form }) => (
                      <select
                        className="form-control h-auto py-5 px-6"
                        name="titleTypeID"
                        onChange={e => {
                          onChangeGender(e.target.value, setFieldValue);
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
                            selected={values.titleTypeID === gender.id}
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
                    <div className="fv-help-block">{errors.titleTypeID}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-10">
                <Row>
                  <Col md={6} sm={12} className="py-2">
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
                        <div className="fv-help-block">{errors.lastname}</div>
                      </div>
                    ) : null}
                  </Col>
                  <Col md={6} sm={12} className="py-2">
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
                        <div className="fv-help-block">{errors.firstname}</div>
                      </div>
                    ) : null}
                  </Col>
                </Row>
              </div>
              <div className="my-10">
                <Row>
                  <Col md={6} sm={12} className="py-2">
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
                        render={({ field, form }) => (
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
                                  values.nationalityID === nationality.id
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
                  </Col>
                  <Col md={6} sm={12} className="py-2">
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
                      onChange={date => onChangeBirthDate(date, setFieldValue)}
                      showMonthDropdown
                      showYearDropdown
                      yearItemNumber={9}
                      locale="fr"
                    />
                    {touched.birthDate && errors.birthDate ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.birthDate}</div>
                      </div>
                    ) : null}
                  </Col>
                  {/*<Col md={6} sm={12} className="py-2">
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
                        <div className="fv-help-block">{errors.birthPlace}</div>
                      </div>
                    ) : null}
                  </Col>*/}
                </Row>
              </div>
              <div className="my-10">
                <Row>
                  <Col md={6} sm={12} className="py-2">
                    <label htmlFor="jobTitle">
                      <FormattedMessage id="MODEL.ID.STARTDATE" />
                      <span className="required_asterix">*</span>
                    </label>
                    <DatePickerField
                      component={DatePickerField}
                      iconHeight="55px"
                      className={`form-control h-auto py-5 px-6 date-input-content`}
                      type="text"
                      placeholder="JJ/MM/AAAA"
                      name="idCardIssueDate"
                      maxDate={new Date()}
                      onChange={date =>
                        onChangeIdCardIssueDate(date, setFieldValue, values)
                      }
                      showMonthDropdown
                      showYearDropdown
                      yearItemNumber={9}
                      locale="fr"
                    />
                    {touched.idCardIssueDate && errors.idCardIssueDate ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.idCardIssueDate}
                        </div>
                      </div>
                    ) : null}
                  </Col>
                  <Col md={6} sm={12} className="py-2">
                    <label htmlFor="jobTitle">
                      <FormattedMessage id="MODEL.ID.ENDDATE" />
                      <span className="required_asterix">*</span>
                    </label>
                    {documentType !== "Carte d'identité" ? (
                      <DatePickerField
                        component={DatePickerField}
                        iconHeight="55px"
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="idCardExpirationDate"
                        /*minDate={
                            idCardIssueDate
                              ? moment(idCardIssueDate).toDate()
                              : moment().toDate()
                          }*/
                        minDate={
                          !idCardIssueDate ||
                          new Date() > new Date(idCardIssueDate)
                            ? new Date()
                            : new Date(idCardIssueDate)
                        }
                        onChange={date =>
                          onChangeIdCardExpirationDate(date, setFieldValue)
                        }
                        showMonthDropdown
                        showYearDropdown
                        yearItemNumber={9}
                        locale="fr"
                      />
                    ) : (
                      <DatePickerField
                        component={DatePickerField}
                        iconHeight="55px"
                        className={`form-control h-auto py-5 px-6 date-input-content`}
                        type="text"
                        placeholder="JJ/MM/AAAA"
                        name="idCardExpirationDate"
                        minDate={
                          idCardIssueDate && moment(idCardIssueDate).toDate()
                        }
                        onChange={date =>
                          onChangeIdCardExpirationDate(date, setFieldValue)
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
                          <div className="fv-help-block">{localDateError}</div>
                        </div>
                      )
                    )}
                  </Col>
                </Row>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={closeIdentityInfomationsModal}
              >
                <span>
                  <FormattedMessage id="BUTTON.CANCEL" />
                </span>
              </div>
              <button
                id="kt_login_signin_submit"
                type="submit"
                className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
                onClick={() => setLocalDateError("")}
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

export default IdentityInformations;

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form, Field, useField } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "metronic/_partials/controls";
import { useDispatch } from "react-redux";
import { DatePickerField } from "metronic/_partials/controls";
import moment from "moment";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";

function ContractClientRenewalModal(props) {
  const dispatch = useDispatch();
  const { onHide, activeMission, onReloadAfterExpension } = props;
  const [newStartDate, setNewStartDate] = useState("");
  const intl = useIntl();

  const initialValues = activeMission && {
    startDate: "",
    endDate: "",
    recourseReason: activeMission.vacancy.missionReasonJustification
      ? activeMission.vacancy.missionReasonJustification
      : "",
    description: activeMission.vacancy.vacancyMissionDescription
      ? activeMission.vacancy.vacancyMissionDescription
      : "",
    hourlyRate: activeMission.vacancy.vacancyContractualProposedHourlySalary
      ? activeMission.vacancy.vacancyContractualProposedHourlySalary
      : ""
  };

  const RenewalSchema = Yup.object().shape({
    startDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    endDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    recourseReason: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    description: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    hourlyRate: Yup.number()
      .min(10.85, intl.formatMessage({ id: "MESSAGE.HOURLY.SALARY.MIN" }))
      .max(99.99, intl.formatMessage({ id: "MESSAGE.HOURLY.SALARY.MAX" }))
      .required(intl.formatMessage({ id: "MESSAGE.FIELD.EMPTY" }))
      .typeError(intl.formatMessage({ id: "MESSAGE.CHECK.VALUE" }))
  });

  useEffect(() => {
    var date = new Date(activeMission.endDate);
    date.setDate(date.getDate() + 1);
    setNewStartDate(date);
  }, []);

  const onChangeStartDate = (date, setFieldValue, values) => {
    const { endDate } = values;
    if (date === "Invalid date") {
      setFieldValue("startDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("startDate", newDate);
    }
    if (values.endDate && moment(endDate)._i < date) {
      setFieldValue("endDate", "");
    }
  };

  const onChangeEndDate = (date, setFieldValue, values) => {
    const { startDate } = values;
    if (date === "Invalid date") {
      setFieldValue("endDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("endDate", newDate);
    }
    if (values.startDate && moment(startDate)._i > date) {
      setFieldValue("startDate", "");
    }
  };

  const MyTextArea = ({ ...props }) => {
    const [field] = useField(props);
    return <textarea {...field} {...props} />;
  };

  return (
    <Modal show={true} aria-labelledby="example-modal-sizes-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.RENEWAL.CONTRACT" />
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={RenewalSchema}
        onSubmit={values => {
          const body = {
            ...values,
            hourlyRate: parseFloat(values.hourlyRate),
            status: 1,
            contractNumber: activeMission.contractNumber,
            extensionType: 1,
            tenantid: parseInt(process.env.REACT_APP_TENANT_ID),
            VacancyID: activeMission.vacancy.id,
            ApplicantID: activeMission.applicantID,
            EntrepriseID: activeMission.entrepriseID,
            ChantierID: activeMission.chantierID,
            ContractID: activeMission.id
          };
          const EXTENSIONS_URL =
            process.env.REACT_APP_WEBAPI_URL + "api/contractextension";
          axios
            .post(EXTENSIONS_URL, body)
            .then(() => {
              onReloadAfterExpension();
              toastr.success(
                "Succès",
                intl.formatMessage({ id: "MESSAGE.RENEWAL.REQUEST.SUCCESS" })
              );
              onHide();
            })
            .catch(() =>
              toastr.error(
                intl.formatMessage({ id: "ERROR" }),
                intl.formatMessage({ id: "MESSAGE.RENEWAL.REQUEST.ERROR" })
              )
            );
        }}
      >
        {({
          handleSubmit,
          touched,
          errors,
          getFieldProps,
          values,
          handleChange,
          setFieldValue
        }) => (
          <Form onSubmit={handleSubmit} className="form form-label-right">
            <Modal.Body>
              <div className="form-group">
                <label>
                  <FormattedMessage id="MODEL.VACANCY.STARTDATE" />
                  <span className="asterisk">*</span>
                </label>
                <DatePickerField
                  component={DatePickerField}
                  iconHeight="55px"
                  className={`form-control h-auto py-5 px-6 date-input-content`}
                  type="text"
                  placeholder="JJ/MM/AAAA"
                  name="startDate"
                  minDate={
                    activeMission &&
                    new Date(activeMission.endDate) > new Date()
                      ? new Date(newStartDate)
                      : new Date()
                  }
                  onChange={date =>
                    onChangeStartDate(date, setFieldValue, values)
                  }
                  showMonthDropdown
                  showYearDropdown
                  yearItemNumber={9}
                  locale="fr"
                />
                {touched.startDate && errors.startDate ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.startDate}</div>
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label>
                  <FormattedMessage id="MODEL.VACANCY.ENDDATE" />
                  <span className="asterisk">*</span>
                </label>
                <DatePickerField
                  component={DatePickerField}
                  iconHeight="55px"
                  className={`form-control h-auto py-5 px-6 date-input-content`}
                  type="text"
                  placeholder="JJ/MM/AAAA"
                  name="endDate"
                  minDate={
                    values.startDate
                      ? moment(values.startDate).toDate()
                      : activeMission &&
                        new Date(activeMission.endDate) > new Date()
                      ? new Date(newStartDate)
                      : new Date()
                  }
                  onChange={date =>
                    onChangeEndDate(date, setFieldValue, values)
                  }
                  showMonthDropdown
                  showYearDropdown
                  yearItemNumber={9}
                  locale="fr"
                />
                {touched.endDate && errors.endDate ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.endDate}</div>
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label>
                  <FormattedMessage id="MODEL.VACANCY.JUSTIFICATION" />
                  <span className="asterisk">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl far fa-edit text-primary"></i>
                    </span>
                  </div>
                  <Field
                    name="recourseReason"
                    component={Input}
                    placeholder={intl.formatMessage({
                      id: "TEXT.RECOURSE.REASON"
                    })}
                  />
                </div>
                {touched.recourseReason && errors.recourseReason ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.recourseReason}</div>
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label>
                  <FormattedMessage id="MODEL.VACANCY.DESCRIPTION" />
                  <span className="asterisk">*</span>
                </label>
                <div className="input-group">
                  <MyTextArea
                    name="description"
                    style={{
                      width: "100%",
                      border: "1px solid lightgrey",
                      borderradius: 5
                    }}
                    rows="6"
                    placeholder={intl.formatMessage({
                      id: "MODEL.VACANCY.DESCRIPTION"
                    })}
                  />
                  {/*<Field
                    as="textarea"
                    name="description"
                    component={Input}
                    placeholder={intl.formatMessage({
                      id: "MODEL.VACANCY.DESCRIPTION",
                    })}
                  />*/}
                </div>
                {touched.description && errors.description ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.description}</div>
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label>
                  <FormattedMessage id="MODEL.VACANCY.REMUNERATION" />
                  <span className="asterisk">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-xl fas fa-euro-sign text-primary"></i>
                    </span>
                  </div>
                  <Field
                    name="hourlyRate"
                    component={Input}
                    placeholder={intl.formatMessage({
                      id: "MODEL.VACANCY.HOURLY_RATE"
                    })}
                  />
                </div>
                {touched.hourlyRate && errors.hourlyRate ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.hourlyRate}</div>
                  </div>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div>
                <button
                  type="button"
                  className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
                  onClick={onHide}
                >
                  <FormattedMessage id="BUTTON.CANCEL" />
                </button>
                <button
                  id="kt_login_signin_submit"
                  type="submit"
                  className={`btn btn-primary font-weight-bold px-9 py-4 my-3 btn-shadow`}
                >
                  <span>
                    <FormattedMessage id="BUTTON.SAVE" />
                  </span>
                  {/*updateInterimaireIdentityLoading && (
                  <span className="ml-3 spinner spinner-white"></span>
                )*/}
                </button>
              </div>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default ContractClientRenewalModal;

import React, { useState, useEffect } from "react";

import { Modal } from "react-bootstrap";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, useIntl } from "react-intl";
import { Input } from "metronic/_partials/controls";
import { useDispatch } from "react-redux";
import { DatePickerField } from "metronic/_partials/controls";
import moment from "moment";
import * as Yup from "yup";
import axios from "axios";
import { toastr } from "react-redux-toastr";

function ContractClientExpensionModal(props) {
  const dispatch = useDispatch();
  const { onHide, activeMission, onReloadAfterExpension } = props;
  const [newEndDate, setNewEndDate] = useState("");
  const intl = useIntl();

  const initialValues = activeMission && {
    endDate: ""
  };

  const EwpensionSchema = Yup.object().shape({
    endDate: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  useEffect(() => {
    var date = new Date(activeMission.endDate);
    date.setDate(date.getDate() + 1);
    setNewEndDate(date);
  }, []);

  const onChangeEndDate = (date, setFieldValue) => {
    if (date === "Invalid date") {
      setFieldValue("endDate", "");
    } else {
      const newDate = moment(date);
      setFieldValue("endDate", newDate);
    }
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">
          <FormattedMessage id="TEXT.EXPENSION.CONTRACT" />
        </Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={EwpensionSchema}
        onSubmit={values => {
          const endDate = moment(values.endDate._i)
            .add(12, "hours")
            .format("YYYY-MM-DD hh:mm:ss");

          const body = {
            endDate: moment(endDate),
            status: 1,
            contractNumber: activeMission.contractNumber,
            extensionType: 0,
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
            .then(res => {
              onReloadAfterExpension();
              toastr.success(
                "Succès",
                intl.formatMessage({ id: "MESSAGE.EXTENSION.REQUEST.SUCCESS" })
              );
              onHide();
            })
            .catch(() =>
              toastr.error(
                intl.formatMessage({ id: "ERROR" }),
                intl.formatMessage({ id: "MESSAGE.EXTENSION.REQUEST.ERROR" })
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
                    activeMission &&
                    new Date(activeMission.endDate) > new Date()
                      ? new Date(newEndDate)
                      : new Date()
                  }
                  onChange={date => onChangeEndDate(date, setFieldValue)}
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

export default ContractClientExpensionModal;

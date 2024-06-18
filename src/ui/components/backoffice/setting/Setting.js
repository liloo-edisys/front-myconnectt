import axios from "axios";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Formik, Form, Field } from "formik";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import {
  Card,
  CardHeader,
  CardBody
} from "../../../../_metronic/_partials/controls";

export default function() {
  const intl = useIntl();
  const { user } = useSelector(state => ({
    user: state.auth.user
  }));
  const [initialValues, setInitialValues] = useState({
    emailSupport: "",
    emailPrefecture: "",
    acceptLargeRelanceNumber: false
  });

  useEffect(() => {
    getSettingInformations();
  }, []);

  const getSettingInformations = () => {
    const SETTING_URL = `${process.env.REACT_APP_WEBAPI_URL}api/BackofficeDashboard/GetConfiguration`;
    axios.get(SETTING_URL).then(res => {
      setInitialValues({
        emailSupport: res.data.supportMailAddress,
        emailPrefecture: res.data.prefectureMailAddress,
        acceptLargeRelanceNumber: res.data.acceptLargeRelanceNumber
      });
    });
  };

  const formikSchema = Yup.object().shape({
    emailSupport: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    emailPrefecture: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  return (
    <Card>
      <CardHeader
        title={intl.formatMessage({ id: "TEXT.BACKOFFICE.SETTING" })}
      />
      <CardBody>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={formikSchema}
          setFieldValue
          setFieldTouched
          onSubmit={values => {
            const POST_SETTING_URL = `${process.env.REACT_APP_WEBAPI_URL}api/BackofficeDashboard/UpdateConfiguration`;
            const body = {
              tenantID: user.tenantID,
              ...values
            };
            axios
              .post(POST_SETTING_URL, body)
              .then(() => {
                toastr.success(
                  "Succès",
                  "Les informations ont été mises à jour avec succès"
                );
              })
              .catch(() =>
                toastr.error(
                  "Erreur",
                  "Une erreur s'est produite lors de la mise à jour des informations"
                )
              );
          }}
        >
          {({
            values,
            touched,
            errors,
            status,
            handleSubmit,
            setFieldValue,
            setFieldTouched
          }) => (
            <Form
              id="kt_login_signin_form"
              className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
              onSubmit={handleSubmit}
            >
              <div className="row mx-10-responsive">
                <div className="form-group col-sm-12 col-xl-4">
                  <label htmlFor="jobTitle">
                    <FormattedMessage id="TEXT.SUPPORT.EMAIL" />
                    <span className="asterisk">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far fa-envelope text-primary"></i>
                      </span>
                    </div>
                    <Field
                      placeholder={intl.formatMessage({
                        id: "TEXT.SUPPORT.EMAIL"
                      })}
                      type="text"
                      className={`form-control h-auto py-5 px-6`}
                      name="emailSupport"
                    />
                  </div>
                  {touched.emailSupport && errors.emailSupport && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.emailSupport}</div>
                    </div>
                  )}
                </div>
                <div className="form-group col-sm-12 col-xl-4">
                  <label htmlFor="jobTitle">
                    <FormattedMessage id="TEXT.PREFECTURE.EMAIL" />
                    <span className="asterisk">*</span>
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far fa-envelope text-primary"></i>
                      </span>
                    </div>
                    <Field
                      placeholder={intl.formatMessage({
                        id: "TEXT.PREFECTURE.EMAIL"
                      })}
                      type="text"
                      className={`form-control h-auto py-5 px-6`}
                      name="emailPrefecture"
                    />
                  </div>
                  {touched.emailPrefecture && errors.emailPrefecture && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">
                        {errors.emailPrefecture}
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group col-sm-12 col-xl-4">
                  <label htmlFor="jobTitle">
                    <FormattedMessage id="TEXT.RELANCE_ACCEPT_LARGE_NUMBER" />
                  </label>
                  <div className="input-group">
                    <span className="switch switch switch-sm">
                      <label>
                        <Field
                          type="checkbox"
                          className={`col-lg-12 form-control`}
                          name="acceptLargeRelanceNumber"
                        />
                        <span></span>
                      </label>
                    </span>
                  </div>
                </div>
                <div
                  className="mt-10"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end"
                  }}
                >
                  <button
                    id="kt_login_forgot_submit"
                    type="submit"
                    className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                  >
                    <FormattedMessage id="BUTTON.SAVE.DONE" />
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
}

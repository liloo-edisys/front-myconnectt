import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { toastr } from "react-redux-toastr";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Input, Select } from "metronic/_partials/controls";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { userSelectorTypes } from "./userTypeList";
import axios from "axios";

function UserForm({ onHide, getData }) {
  const intl = useIntl();
  const { id } = useParams();
  const { user } = useSelector(state => ({
    user: state.user.user
  }));
  const [initialValues, setInitialValues] = useState({});
  const [isRevealPwd, setIsRevealPwd] = useState(false);
  const [isRevealConfirmPwd, setIsRevealConfirmPwd] = useState(false);

  const InitialSchema = Yup.object().shape(
    id
      ? {
          lastname: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          ),
          firstname: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          ),
          email: Yup.string()
            .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
          backofficeRole: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          )
        }
      : {
          lastname: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          ),
          firstname: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          ),
          email: Yup.string()
            .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
          backofficeRole: Yup.string().required(
            intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
          ),
          password: Yup.string()
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
            .matches(
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
              intl.formatMessage({ id: "VALIDATION.PASSWORD.FORMAT" })
            ),
          passwordConfirm: Yup.string()
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
            .oneOf(
              [Yup.ref("password"), null],
              intl.formatMessage({ id: "CHECK.SAME.PASSWORD" })
            )
        }
  );

  useEffect(() => {
    if (id) {
      axios
        .get(`${process.env.REACT_APP_WEBAPI_URL}api/user/${id}`)
        .then(res => {
          let values = {
            ...values,
            lastname: res.data.lastname,
            firstname: res.data.firstname,
            email: res.data.email,
            backofficeRole: res.data.backofficeRole
          };
          setInitialValues(values);
        })
        .catch(err => console.log(err));
    } else {
      let values = {
        lastname: "",
        firstname: "",
        email: "",
        backofficeRole: "",
        password: "",
        passwordConfirm: ""
      };
      setInitialValues(values);
    }
  }, [id]);

  const addNewUser = values => {
    const body = {
      ...values,
      tenantID: parseInt(user.tenantID),
      backofficeRole: parseInt(values.backofficeRole)
    };
    axios
      .post(`${process.env.REACT_APP_WEBAPI_URL}api/user`, body)
      .then(res => {
        toastr.success(
          "Succès",
          intl.formatMessage({ id: "TEXT.USER.ADMIN.CREATION.SUCCESS" })
        );
        onHide();
        getData();
      })
      .catch(err => {
        toastr.error(
          "Erreur",
          intl.formatMessage({ id: "TEXT.USER.ADMIN.CREATION.ERROR" })
        );
      });
  };

  const updateUser = values => {
    const body = {
      ...values,
      id: parseInt(id),
      tenantID: parseInt(user.tenantID),
      backofficeRole: parseInt(values.backofficeRole)
    };
    axios
      .put(`${process.env.REACT_APP_WEBAPI_URL}api/user/updateUser`, body)
      .then(res => {
        toastr.success(
          "Succès",
          intl.formatMessage({ id: "TEXT.USER.ADMIN.UPDATE.SUCCESS" })
        );
        onHide();
        getData();
      })
      .catch(err => {
        toastr.error(
          "Erreur",
          intl.formatMessage({ id: "TEXT.USER.ADMIN.UPDATE.ERROR" })
        );
      });
  };

  return (
    <Modal
      show={true}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <Modal.Header closeButton className="pb-0">
        <Modal.Title className="pageSubtitle w-100 flex-row flex-space-between responsive_header_desktop">
          <p className="pageDetails">
            {id ? (
              <FormattedMessage id="TEXT.EDIT.NEW.USER" />
            ) : (
              <FormattedMessage id="TEXT.ADD.NEW.USER" />
            )}
          </p>
        </Modal.Title>
      </Modal.Header>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={InitialSchema}
        setFieldValue
        onSubmit={id ? updateUser : addNewUser}
      >
        {({ values, touched, errors, status, handleSubmit, setFieldValue }) => (
          <Form
            id="kt_login_signin_form"
            className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
            onSubmit={handleSubmit}
          >
            <Modal.Body>
              <div>
                <label htmlFor="lastname">
                  <FormattedMessage id="COLUMN.NAME" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l fas fa-address-card text-primary"></i>
                    </span>
                  </div>
                  <Field
                    placeholder={intl.formatMessage({
                      id: "COLUMN.NAME"
                    })}
                    component={Input}
                    type="text"
                    className={`form-control h-auto py-2 px-6`}
                    name="lastname"
                  />
                </div>
                {touched.lastname && errors.lastname ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.lastname}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-5">
                <label htmlFor="firstname">
                  <FormattedMessage id="MODEL.FIRSTNAME" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l fas fa-address-card text-primary"></i>
                    </span>
                  </div>
                  <Field
                    placeholder={intl.formatMessage({
                      id: "MODEL.FIRSTNAME"
                    })}
                    component={Input}
                    type="text"
                    className={`form-control h-auto py-2 px-6`}
                    name="firstname"
                  />
                </div>
                {touched.firstname && errors.firstname ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.firstname}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-5">
                <label htmlFor="email">
                  <FormattedMessage id="MODEL.EMAIL" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l flaticon-multimedia text-primary"></i>
                    </span>
                  </div>
                  <Field
                    placeholder={intl.formatMessage({
                      id: "MODEL.EMAIL"
                    })}
                    component={Input}
                    type="email"
                    className={`form-control h-auto py-2 px-6`}
                    name="email"
                  />
                </div>
                {touched.email && errors.email ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.email}</div>
                  </div>
                ) : null}
              </div>
              <div className="my-5">
                <label htmlFor="type">
                  <FormattedMessage id="TEXT.TYPE" />
                  <span className="required_asterix">*</span>
                </label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="icon-l flaticon2-group text-primary"></i>
                    </span>
                  </div>
                  <Select
                    value={values.backofficeRole}
                    className="form-control"
                    name="backofficeRole"
                  >
                    <option disabled selected value="">
                      --{" "}
                      {intl.formatMessage({
                        id: "TEXT.TYPE"
                      })}{" "}
                      --
                    </option>
                    {userSelectorTypes.map(type => {
                      return (
                        <option key={type.id} value={type.id}>
                          {type.value}
                        </option>
                      );
                    })}
                  </Select>
                </div>
                {touched.backofficeRole && errors.backofficeRole ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.backofficeRole}</div>
                  </div>
                ) : null}
              </div>
              {!id && (
                <>
                  <div className="my-5">
                    <label htmlFor="password">
                      <FormattedMessage id="TEXT.PASSWORD" />
                      <span className="required_asterix">*</span>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i
                            className={
                              isRevealPwd
                                ? "icon-l far fa-eye-slash text-primary"
                                : "icon-l far fa-eye text-primary"
                            }
                            onClick={() => setIsRevealPwd(!isRevealPwd)}
                          ></i>
                        </span>
                      </div>
                      <Field
                        placeholder={intl.formatMessage({
                          id: "TEXT.PASSWORD"
                        })}
                        component={Input}
                        type={isRevealPwd ? "text" : "password"}
                        className={`form-control h-auto py-2 px-6`}
                        name="password"
                      />
                    </div>
                    {touched.password && errors.password ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">{errors.password}</div>
                      </div>
                    ) : null}
                  </div>
                  <div className="my-5">
                    <label htmlFor="confirmPassword">
                      <FormattedMessage id="TEXT.CONFIRM.PASSWORD" />
                      <span className="required_asterix">*</span>
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i
                            className={
                              isRevealConfirmPwd
                                ? "icon-l far fa-eye-slash text-primary"
                                : "icon-l far fa-eye text-primary"
                            }
                            onClick={() =>
                              setIsRevealConfirmPwd(!isRevealConfirmPwd)
                            }
                          ></i>
                        </span>
                      </div>
                      <Field
                        placeholder={intl.formatMessage({
                          id: "TEXT.CONFIRM.PASSWORD"
                        })}
                        type={isRevealConfirmPwd ? "text" : "password"}
                        className={`form-control h-auto py-2 px-6`}
                        name="passwordConfirm"
                      />
                    </div>
                    {touched.passwordConfirm && errors.passwordConfirm ? (
                      <div className="fv-plugins-message-container">
                        <div className="fv-help-block">
                          {errors.passwordConfirm}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <div
                type="button"
                className="btn btn-light-primary btn-shadow m-0 p-0 font-weight-bold px-9 py-4 my-3 mx-4"
                onClick={onHide}
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
                {/*updateInterimaireIdentityLoading && (
                  <span className="ml-3 spinner spinner-white"></span>
                )*/}
              </button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default UserForm;

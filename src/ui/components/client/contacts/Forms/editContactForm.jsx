import React from "react";

import { updateContact } from "actions/client/contactsActions";
import { Formik, Form, Field } from "formik";
import { Input, LoadingDialog } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { useDispatch } from "react-redux";
import * as Yup from "yup";

function EditContactForm({ onHide, intl, history }) {
  const dispatch = useDispatch();
  const currentContact = history.location.state;
  const initialValues = currentContact && {
    id: currentContact.id !== null ? currentContact.id : "",
    accountID:
      currentContact.accountID !== null ? currentContact.accountID : "",
    tenantID: currentContact ? currentContact.tenantID : "",
    parentID: currentContact ? currentContact.parentID : "",
    userID: currentContact ? currentContact.userID : "",
    firstname:
      currentContact.firstname !== null ? currentContact.firstname : "",
    lastname: currentContact.lastname !== null ? currentContact.lastname : "",
    poste: currentContact ? currentContact.poste : "",
    email: currentContact ? currentContact.email : "",
    mobilePhoneNumber: currentContact ? currentContact.mobilePhoneNumber : "",
    homePhoneNumber: currentContact ? currentContact.homePhoneNumber : "",
    isAdmin: currentContact.isAdmin && currentContact.isAdmin,
    hasContract: currentContact.hasContract
      ? currentContact.hasContract
      : false,
    hasRecruitment:
      currentContact.hasRecruitment && currentContact.hasRecruitment,
    hasRH: currentContact.hasRH && currentContact.hasRH,
    hasEvaluate: currentContact.hasEvaluate && currentContact.hasEvaluate,
    hasSms: currentContact.hasSms && currentContact.hasSms
  };

  const EditContactSchema = Yup.object().shape({
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    poste: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    mobilePhoneNumber: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      ),
    homePhoneNumber: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .matches(
        /(0|(\\+33)|(0033))[1-9][0-9]{8}/,
        intl.formatMessage({ id: "VALIDATION.INVALID_PHONE" })
      ),
    isAdmin: Yup.bool(),
    hasContract: Yup.bool(),
    hasRecruitment: Yup.bool(),
    hasRH: Yup.bool(),
    hasEvaluate: Yup.bool(),
    hasSms: Yup.bool()
  });

  return currentContact ? (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={EditContactSchema}
        onSubmit={values => {
          let data = {
            ...values
          };
          dispatch(updateContact.request(data), onHide());
        }}
      >
        {({ handleSubmit, getFieldProps, values, handleChange }) => (
          <>
            <Modal.Body className="overlay overlay-block cursor-default">
              <Form className="form form-label-right">
                <div className="form-group row">
                  {/* Raison sociale */}
                  <div className="col-lg-4">
                    <label>
                      <FormattedMessage id="MODEL.FIRSTNAME" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-user-tie text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="firstname"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.FIRSTNAME"
                        })}
                      />
                    </div>
                  </div>
                  {/* Siret */}
                  <div className="col-lg-4">
                    <label>
                      <FormattedMessage id="MODEL.LASTNAME" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-user-tie text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="lastname"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.LASTNAME"
                        })}
                      />
                    </div>
                  </div>
                  {/* N° APE/NAF */}
                  <div className="col-lg-4">
                    <label>
                      <FormattedMessage id="MODEL.EMAIL" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-envelope text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="email"
                        component={Input}
                        disabled
                        placeholder={intl.formatMessage({
                          id: "MODEL.EMAIL"
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* statut juridique de la société */}
                  <div className="col-lg-4">
                    <label>
                      <FormattedMessage id="MODEL.MOBILE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-mobile-alt text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="mobilePhoneNumber"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.MOBILE"
                        })}
                      />
                    </div>
                  </div>
                  {/* N° TVA intracommunautaire​ */}
                  <div className="col-lg-4">
                    <label>
                      <FormattedMessage id="MODEL.PHONE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-phone text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="homePhoneNumber"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.PHONE"
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <label>
                      <FormattedMessage id="MODEL.JOBTITLE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-laptop-code text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="poste"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.JOBTITLE"
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="separator separator-solid-primary my-10 mx-30"></div>

                <div className="form-group d-flex justify-content-center row">
                  <div className="d-flex flex-column justify-content-center align-items-center col-lg-2">
                    <label className="checkbox d-flex flex-column">
                      <div className="mb-5">
                        <FormattedMessage id="MODEL.CONTACT.CONTRACT" />
                      </div>
                      <input
                        type="checkbox"
                        name="hasContract"
                        checked={values.hasContract}
                        {...getFieldProps("hasContract")}
                      />
                      <span />
                    </label>
                  </div>
                  <div className="d-flex flex-column justify-content-center align-items-center col-lg-2">
                    <label className="checkbox d-flex flex-column">
                      <div className="mb-5">
                        <FormattedMessage id="MODEL.CONTACT.HIRE" />
                      </div>{" "}
                      <input
                        type="checkbox"
                        name="hasRecruitment"
                        checked={values.hasRecruitment}
                        {...getFieldProps("hasRecruitment")}
                      />
                      <span />
                    </label>
                  </div>
                  <div className="d-flex flex-column justify-content-center align-items-center col-lg-2">
                    <label className="checkbox d-flex flex-column">
                      <div className="mb-5">
                        <FormattedMessage id="MODEL.CONTACT.SHIFTS" />
                      </div>
                      <input
                        type="checkbox"
                        name="hasRH"
                        checked={values.hasRH}
                        {...getFieldProps("hasRH")}
                      />
                      <span />
                    </label>
                  </div>
                  <div className="d-flex flex-column justify-content-center align-items-center col-lg-2">
                    <label className="checkbox d-flex flex-column">
                      <div className="mb-5">
                        <FormattedMessage id="MODEL.CONTACT.MARKS" />
                      </div>
                      <input
                        type="checkbox"
                        name="hasEvaluate"
                        checked={values.hasEvaluate}
                        {...getFieldProps("hasEvaluate")}
                      />
                      <span />
                    </label>
                  </div>
                  <div className="d-flex flex-column justify-content-center align-items-center col-lg-2">
                    <label className="checkbox d-flex flex-column">
                      <div className="mb-5">
                        <FormattedMessage id="MODEL.CONTACT.TEXTMESSAGE" />
                      </div>
                      <input
                        type="checkbox"
                        name="hasSms"
                        checked={values.hasSms}
                        {...getFieldProps("hasSms")}
                      />

                      <span />
                    </label>
                  </div>
                </div>
                <div className="form-group justify-content-around row"></div>
                <div className="separator separator-solid-primary my-10 mx-30"></div>

                <div className="form-group row">
                  <div className="d-flex flex-row align-items-center col-lg-4">
                    <label className="checkbox">
                      <div className="mr-3">
                        <FormattedMessage id="MODEL.CONTACT.ADMINRIGHTS" />
                      </div>
                      <input
                        type="checkbox"
                        name="isAdmin"
                        className="m-1"
                        checked={values.isAdmin}
                        {...getFieldProps("isAdmin")}
                      />

                      <span />
                    </label>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                onClick={onHide}
                className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.CANCEL" />
              </button>
              <> </>
              <button
                type="submit"
                onClick={() => handleSubmit()}
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.SAVE" />
              </button>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </>
  ) : (
    <LoadingDialog />
  );
}

export default injectIntl(EditContactForm);

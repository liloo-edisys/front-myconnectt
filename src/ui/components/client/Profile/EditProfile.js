import React, { useState, useEffect } from "react";

import { updateContact } from "actions/client/contactsActions";
import { requestPassword } from "api/shared/AuthApi";
import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { persistor } from "../../../../business/store";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";

function EditProfile({ onHide, intl }) {
  const { contact } = useSelector(
    state => ({
      contact: state.contacts.user
    }),
    shallowEqual
  );

  const displayChoices = [
    { name: "Toutes les demandes", id: 0 },
    { name: "Mes demandes", id: 1 }
  ];

  const dispatch = useDispatch();
  const initialValues = contact && {
    id: contact.id !== null ? contact.id : "",
    tenantID: contact ? contact.tenantID : "",
    parentID: contact ? contact.parentID : "",
    userID: contact ? contact.userID : "",
    firstname: contact.firstname !== null ? contact.firstname : "",
    lastname: contact.lastname !== null ? contact.lastname : "",
    poste: contact ? contact.poste : undefined,
    email: contact ? contact.email : "",
    mobilePhoneNumber: contact ? contact.mobilePhoneNumber : "",
    homePhoneNumber: contact ? contact.homePhoneNumber : undefined,
    isAdmin: contact.isAdmin && contact.isAdmin,
    hasContract: contact.hasContract ? contact.hasContract : false,
    hasRecruitment: contact.hasRecruitment && contact.hasRecruitment,
    hasRH: contact.hasRH && contact.hasRH,
    hasEvaluate: contact.hasEvaluate && contact.hasEvaluate,
    hasSms: contact.hasSms && contact.hasSms,
    displayChoice: contact.displayChoice ? contact.displayChoice : 0
  };
  useEffect(() => {
    !isNullOrEmpty(contact) &&
      !isNullOrEmpty(contact.mobilePhoneNumber) &&
      handleChangeMobilePhone(null, null, contact.mobilePhoneNumber);
    !isNullOrEmpty(contact) &&
      !isNullOrEmpty(contact.homePhoneNumber) &&
      handleChangeHomePhone(null, null, contact.homePhoneNumber);
  }, []);
  const EditContactSchema = Yup.object().shape(
    {
      firstname: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      lastname: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      email: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      poste: Yup.string().required(
        intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
      ),
      mobilePhoneNumber: Yup.string().when(["homePhoneNumber"], {
        is: val => !!val,
        then: Yup.string().matches(
          /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
          intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
        ),
        otherwise: Yup.string()
          .matches(
            /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
            intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
          )
          .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      }),

      homePhoneNumber: Yup.string()
        .matches(
          /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
          intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
        )
        .when("mobilePhoneNumber", {
          is: val => !!val,
          then: Yup.string().matches(
            /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
            intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
          ),
          otherwise: Yup.string()
            .matches(
              /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
              intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
            )
            .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
        })
    },
    [["mobilePhoneNumber", "homePhoneNumber"], ["homePhoneNumber"]]
  );
  let history = useHistory();
  const [mobilePhoneNumber, setMobilePhoneNumber] = useState("");
  const [homePhoneNumber, setHomePhoneNumber] = useState("");

  const handleRequestPassword = email => {
    requestPassword(email)
      .then(
        toastr.success(
          intl.formatMessage({ id: "AUTH.FORGOT.SUCCESS_TITLE" }),
          intl.formatMessage({ id: "AUTH.FORGOT.SUCCESS_DESC" })
        )
      )
      .catch(() => {
        toastr.error(
          intl.formatMessage({ id: "TEXT.ERROR.TITLE" }),
          intl.formatMessage({ id: "TEXT.ERROR.FRIENDLY" })
        );
      });
    persistor.purge();
    history.push("/logout");
  };
  const handleChangeMobilePhone = (setFieldValue, setFieldTouched, e) => {
    setMobilePhoneNumber(e && e.replace(/\s/g, ""));
    if (setFieldTouched) {
      setFieldTouched("mobilePhoneNumber", true);
    }
    if (setFieldValue) {
      setFieldValue("mobilePhoneNumber", e && e.replace(/\s/g, ""));
    }
  };
  const handleChangeHomePhone = (setFieldValue, setFieldTouched, e) => {
    setHomePhoneNumber(e && e.replace(/\s/g, ""));
    if (setFieldTouched) {
      setFieldTouched("homePhoneNumber", true);
    }
    if (setFieldValue) {
      setFieldValue("homePhoneNumber", e && e.replace(/\s/g, ""));
    }
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={EditContactSchema}
        setFieldValue
        setFieldTouched
        onSubmit={values => {
          let data = {
            ...values,
            displayChoice: parseInt(values.displayChoice)
          };
          dispatch(updateContact.request(data));
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
          <>
            <Form className="form form-label-right m-10">
              <div className="form-group row d-flex justify-content-center">
                {/* Raison sociale */}
                <div className="col-lg-4 ">
                  <label className=" col-form-label">
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
                <div className="col-lg-4 ">
                  <label className=" col-form-label">
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
              </div>
              <div className="form-group row d-flex justify-content-center">
                <div className="col-lg-4 ">
                  <label className=" col-form-label">
                    <FormattedMessage id="MODEL.MOBILE" />
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl fas fa-mobile-alt text-primary"></i>
                      </span>
                    </div>
                    {/*<Field
                      name="mobilePhoneNumber"
                      component={Input}
                      placeholder={intl.formatMessage({
                        id: "MODEL.MOBILE"
                      })}
                    />*/}

                    <input
                      placeholder={intl.formatMessage({
                        id: "MODEL.PHONE"
                      })}
                      type="text"
                      className={`form-control h-auto py-5 px-6`}
                      name="mobilePhoneNumber"
                      onChange={e =>
                        handleChangeMobilePhone(
                          setFieldValue,
                          setFieldTouched,
                          e.target.value
                        )
                      }
                      value={
                        mobilePhoneNumber &&
                        mobilePhoneNumber.match(/.{1,2}/g).join(" ")
                      }
                    />
                  </div>
                </div>
                {/* N° TVA intracommunautaire​ */}
                <div className="col-lg-4 ">
                  <label className=" col-form-label">
                    <FormattedMessage id="MODEL.PHONE" />
                  </label>
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl fas fa-phone text-primary"></i>
                      </span>
                    </div>
                    <input
                      placeholder={intl.formatMessage({
                        id: "MODEL.PHONE"
                      })}
                      type="text"
                      className={`form-control h-auto py-5 px-6`}
                      name="mobilePhoneNumber"
                      onChange={e =>
                        handleChangeHomePhone(
                          setFieldValue,
                          setFieldTouched,
                          e.target.value
                        )
                      }
                      value={
                        homePhoneNumber &&
                        homePhoneNumber.match(/.{1,2}/g).join(" ")
                      }
                    />
                    {/*<Field
                      name="homePhoneNumber"
                      component={Input}
                      placeholder={intl.formatMessage({
                        id: "MODEL.PHONE",
                      })}
                    />*/}
                  </div>
                </div>
              </div>
              <div className="form-group row d-flex justify-content-center">
                {/* statut juridique de la société */}

                <div className="col-lg-4 ">
                  <label className=" col-form-label">
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
                <div className="col-lg-4 ">
                  <label className=" col-form-label">
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
              {contact.isAdmin && (
                <div className="form-group row d-flex">
                  <div className="col-lg-4 offset-2">
                    <label className=" col-form-label">
                      <FormattedMessage id="CONTACTS.DISPLAYCHOICE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <Select className="form-control" name="displayChoice">
                        {displayChoices.map(choice => {
                          return (
                            <option
                              key={parseInt(choice.id)}
                              value={parseInt(choice.id)}
                            >
                              {choice.name}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {contact.isAdmin && (
                <>
                  <h3 className="pageSubtitle mt-10 mb-10">
                    <FormattedMessage id="USER.MENU.NAV.MANAGE_NOTIFICATIONS" />
                  </h3>
                  <div className="form-group row d-flex  justify-content-center">
                    <div className="d-flex align-items-center justify-content-center form-group mb-0 row col-lg-3">
                      <label className=" col-form-label">Contrat</label>
                      <div className="col-1">
                        <span className="switch switch switch-sm">
                          <label>
                            <input
                              type="checkbox"
                              onChange={() =>
                                setFieldValue(
                                  "hasContract",
                                  !values.hasContract
                                )
                              }
                              checked={values.hasContract}
                              name=""
                            />
                            <span></span>
                          </label>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center  form-group mb-0 row col-lg-3">
                      <label className=" col-form-label">Recrutement</label>
                      <div className="col-1">
                        <span className="switch switch switch-sm">
                          <label>
                            <input
                              type="checkbox"
                              onChange={() =>
                                setFieldValue(
                                  "hasRecruitment",
                                  !values.hasRecruitment
                                )
                              }
                              checked={values.hasRecruitment}
                              name=""
                            />
                            <span></span>
                          </label>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center  form-group mb-0 row col-lg-3">
                      <label className=" col-form-label">Evalutation</label>
                      <div className="col-1">
                        <span className="switch switch switch-sm">
                          <label>
                            <input
                              type="checkbox"
                              onChange={() =>
                                setFieldValue(
                                  "hasEvaluate",
                                  !values.hasEvaluate
                                )
                              }
                              checked={values.hasEvaluate}
                              name=""
                            />
                            <span></span>
                          </label>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center  form-group mb-0 row col-lg-3">
                      <label className=" col-form-label">SMS</label>
                      <div className="col-1">
                        <span className="switch switch switch-sm">
                          <label>
                            <input
                              type="checkbox"
                              onChange={() =>
                                setFieldValue("hasSms", !values.hasSms)
                              }
                              checked={values.hasSms}
                              name=""
                            />
                            <span></span>
                          </label>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Form>
            <div className="mt-5 form-group row d-flex justify-content-center">
              <button
                type="submit"
                onClick={() => handleRequestPassword(contact.email)}
                className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              >
                <FormattedMessage id="CONTACTS.REQUEST.PASSWORD" />
              </button>
              <button
                type="submit"
                onClick={() => handleSubmit()}
                className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              >
                <FormattedMessage id="BUTTON.SAVE" />
              </button>
            </div>
            <div className="form-group row d-flex justify-content-center"></div>
          </>
        )}
      </Formik>
    </>
  );
}

export default injectIntl(EditProfile);

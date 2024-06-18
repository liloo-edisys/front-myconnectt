import React, { useState } from "react";
import Select from "react-select";

import { inviteContact } from "actions/client/ContactsActions";
import { Formik, Form, Field } from "formik";
import { Input } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import * as Yup from "yup";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import "./styles.scss";
const customStyles = {
  control: (base, state) => ({
    ...base,
    background: "transparent",
    margin: "-9px",
    borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
    borderColor: "transparent",
    boxShadow: null,
    "&:hover": {
      borderColor: "transparent"
    }
  }),
  menu: base => ({
    ...base,
    borderRadius: 0,
    marginTop: 0
  }),
  menuList: base => ({
    ...base,
    padding: 0
  })
};

function InviteContactForm({ onHide, intl, getContactList }) {
  const dispatch = useDispatch();
  const { companies } = useSelector(
    state => ({
      companies: state.companies.companies
    }),
    shallowEqual
  );
  const [selectedCompany, setSelectedCompany] = useState("");
  let filteredCompanies =
    companies != null
      ? companies.length
        ? companies
            .filter(company => company.parentID === null)
            .map(function(c) {
              return {
                value: c.id,
                label: c.name,
                parentId: c.parentID
              };
            })
        : []
      : [];

  const initialValues = {
    lastname: "",
    firstname: "",
    email: "",
    accountID: 0
  };

  // Validation schema
  const ContactInviteSchema = Yup.object().shape({
    lastname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    firstname: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    accountID: Yup.number().min(
      1,
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    )
  });

  const onChangeCompany = (value, setFieldValue) => {
    setSelectedCompany(value);
    setFieldValue("accountID", value.value);
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={ContactInviteSchema}
        onSubmit={(values, { setSubmitting, history }) => {
          dispatch(inviteContact.request(values, getContactList), onHide());
        }}
      >
        {({ handleSubmit, setFieldValue, touched, errors }) => (
          <>
            <Modal.Body className="overlay overlay-block cursor-default">
              <Form className="form form-label-right">
                <div className="form-group row">
                  <div className="col-lg-12">
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
                  {touched.lastname && errors.lastname && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.lastname}</div>
                    </div>
                  )}
                  <div className="col-lg-12 mt-10 ">
                    <label>
                      <FormattedMessage id="MODEL.FIRSTNAME" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-user text-primary"></i>
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
                  {touched.firstname && errors.firstname && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.firstname}</div>
                    </div>
                  )}
                  <div className="col-lg-12 mt-10 ">
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
                        placeholder={intl.formatMessage({
                          id: "MODEL.EMAIL"
                        })}
                      />
                    </div>
                  </div>
                  {touched.email && errors.email && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.email}</div>
                    </div>
                  )}
                  <div className="col-lg-12 mt-10 backoffice-account-selector">
                    <label>
                      <FormattedMessage id="TEXT.COMPANY" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="display-5 text-primary flaticon2-world"></i>
                        </span>
                      </div>
                      <Select
                        name="accountID"
                        className="form-control p-0"
                        style={{ borderWidth: 0 }}
                        options={filteredCompanies}
                        value={selectedCompany}
                        placeholder="Entreprise"
                        onChange={e => {
                          onChangeCompany(e, setFieldValue);
                        }}
                      />
                    </div>
                  </div>
                  {touched.accountID && errors.accountID && (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.accountID}</div>
                    </div>
                  )}
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
                <FormattedMessage id="BUTTON.SUBMIT" />
              </button>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </>
  );
}

export default injectIntl(InviteContactForm);

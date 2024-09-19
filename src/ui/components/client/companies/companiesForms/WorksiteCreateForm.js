// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import { createCompany } from "actions/client/companiesActions";
import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  getAPE,
  getInvoicesTypes,
  getPaymentChoices
} from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import LocationSearchInput from "./location-search-input";

function WorksiteCreateForm({ onHide, intl, history }) {
  const dispatch = useDispatch();

  const [selectedCompany] = useState(null);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { invoiceTypes, paymentChoices, apeNumber } = useSelector(
    state => ({
      invoiceTypes: state.lists.invoiceTypes,
      paymentChoices: state.lists.paymentChoices,
      apeNumber: state.lists.apeNumber
    }),
    shallowEqual
  );
  useEffect(() => {
    if (isNullOrEmpty(apeNumber)) {
      dispatch(getAPE.request());
    }
    if (isNullOrEmpty(invoiceTypes)) {
      dispatch(getInvoicesTypes.request());
    }
    if (isNullOrEmpty(paymentChoices)) {
      dispatch(getPaymentChoices.request());
    }
  }, [dispatch, apeNumber, paymentChoices, invoiceTypes]);
  const currentCompany = history && history.location.state;

  const newInitialValues = {
    name: selectedCompany ? selectedCompany.l1_normalisee : "",
    city: selectedCompany ? selectedCompany.libelle_commune : "",
    siret: selectedCompany ? selectedCompany.siret : "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    confirm: "",
    address:
      selectedCompany && selectedCompany.l4_normalisee
        ? selectedCompany.l4_normalisee
        : "",
    postalcode: selectedCompany ? selectedCompany.code_postal : "",
    phoneNumber: null,
    acceptTerms: false,
    InvoiceTypeID: 1,
    accountGroupID: 0,
    paymentChoiceID: 1,
    apeNumber: "",
    tvaNumber: "",
    companyStatus: ""
  };

  // Validation schema
  const CompanyCreateSchema = Yup.object().shape({
    name: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    /*apeNumber: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),*/
    companyStatus: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    /*tvaNumber: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),*/
    address: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    postalcode: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    phoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  const handleChangePhone = (setFieldValue, setFieldTouched, e) => {
    setPhoneNumber(e && e.replace(/\s/g, ""));

    if (setFieldTouched) {
      setFieldTouched("phoneNumber", true);
    }
    if (setFieldValue) {
      setFieldValue("phoneNumber", e && e.replace(/\s/g, ""));
    }
  };

  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={newInitialValues}
        validationSchema={CompanyCreateSchema}
        setFieldValue
        setFieldTouched
        onSubmit={values => {
          let data = {
            ...values,
            tenantID: currentCompany.tenantID,
            parentID: currentCompany.id,
            invoiceTypeID: parseInt(values.InvoiceTypeID)
          };
          dispatch(createCompany.request(data), onHide());
        }}
      >
        {({
          handleSubmit,
          errors,
          touched,
          values,
          setFieldValue,
          setFieldTouched
        }) => (
          <>
            <Modal.Body className="overlay overlay-block cursor-default">
              <Form className="form form-label-right">
                <div className="form-group row">
                  {/* Raison sociale */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="AUTH.REGISTER.COMPANY_NAME" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-building text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="name"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "AUTH.REGISTER.COMPANY_NAME"
                        })}
                      />
                    </div>
                    {touched.name && errors.name ? (
                      <div className="asterisk">{errors["name"]}</div>
                    ) : null}
                  </div>
                  {/* statut juridique de la société */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.COMPANYSTATUS" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-suitcase text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="companyStatus"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.COMPANYSTATUS"
                        })}
                      />
                    </div>
                    {touched.companyStatus && errors.companyStatus ? (
                      <div className="asterisk">{errors["companyStatus"]}</div>
                    ) : null}
                  </div>
                </div>
                <div className="separator separator-solid-primary mt-10 mb-5 mx-30"></div>
                <div className="form-group row">
                  {/* Adresse */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.ADDRESS" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl flaticon-map-location text-primary"></i>
                        </span>
                      </div>
                      <LocationSearchInput
                        address={address}
                        setAddress={setAddress}
                        setFieldValue={setFieldValue}
                        intl={intl}
                      />
                    </div>
                    {touched.address && errors.address ? (
                      <div className="asterisk">{errors["address"]}</div>
                    ) : null}
                  </div>
                  {/* Complément d’adresse */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.ADDITIONALADDRESS" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-map text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="additionalAddress"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.ADDITIONALADDRESS"
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* code postal */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.POSTALCODE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-map-marker-alt text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="postalcode"
                        disabled
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.POSTALCODE"
                        })}
                      />
                    </div>
                    {touched.postalcode && errors.postalcode ? (
                      <div className="asterisk">{errors["postalcode"]}</div>
                    ) : null}
                  </div>
                  {/* ville */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.CITY" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-city text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="city"
                        disabled
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.CITY"
                        })}
                      />
                    </div>
                    {touched.city && errors.city ? (
                      <div className="asterisk">{errors["city"]}</div>
                    ) : null}
                  </div>
                  {/* numéro de téléphone de la société */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.PHONENUMBER" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-phone-alt text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="phoneNumber"
                        onChange={e =>
                          handleChangePhone(
                            setFieldValue,
                            setFieldTouched,
                            e.target.value
                          )
                        }
                        value={
                          phoneNumber && phoneNumber.match(/.{1,2}/g).join(" ")
                        }
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.PHONENUMBER"
                        })}
                      />
                    </div>
                    {touched.phoneNumber && errors.phoneNumber ? (
                      <div className="asterisk">{errors["phoneNumber"]}</div>
                    ) : null}
                  </div>
                </div>
                <div className="separator separator-solid-primary mt-10 mb-5 mx-30"></div>
                <div className="form-group row">
                  {/* mode de règlement */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.PAYMENT_CHOICE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <Select className="form-control" name="paymentChoiceID">
                        {paymentChoices.map(choice => {
                          return (
                            <option key={choice.id} value={choice.id}>
                              {choice.name}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  </div>
                  {/* Type de Facture souhaitée */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.INVOICE_TYPE" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <Select className="form-control" name="invoiceTypeID">
                        {invoiceTypes.map(invoice => {
                          return (
                            <option key={invoice.id} value={invoice.id}>
                              {invoice.name}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* description */}
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.DESCRIPTION" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-clipboard-list text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="description"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.DESCRIPTION"
                        })}
                      />
                    </div>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                onClick={onHide}
                className="btn btn-light-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              >
                <FormattedMessage id="BUTTON.CANCEL" />
              </button>
              <> </>
              <button
                type="submit"
                onClick={() => handleSubmit()}
                className="btn btn-primary btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              >
                <FormattedMessage id="BUTTON.SAVE" />
              </button>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </>
  );
}

export default injectIntl(WorksiteCreateForm);

// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import { updateCompany } from "actions/client/companiesActions";
import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import {
  getAPE,
  getInvoicesTypes,
  getAccountGroups,
  getPaymentChoices
} from "actions/shared/listsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import LocationSearchInput from "./location-search-input";
import { useParams } from "react-router-dom";
import axios from "axios";
//import { parseResume } from "../../../../../business/api/interimaire/interimairesApi";
function CompanyEditForm({ onHide, intl, history }) {
  const dispatch = useDispatch();
  const TENANTID = +process.env.REACT_APP_TENANT_ID;
  const { id } = useParams();

  const {
    invoiceTypes,
    accountGroups,
    paymentChoices,
    apeNumber
  } = useSelector(
    state => ({
      invoiceTypes: state.lists.invoiceTypes,
      accountGroups: state.lists.accountGroups,
      paymentChoices: state.lists.paymentChoices,
      apeNumber: state.lists.apeNumber
    }),
    shallowEqual
  );
  const [currentCompany, setCurrentCompany] = useState(history.location.state);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  useEffect(() => {
    const address = currentCompany ? currentCompany.address : "";
    setAddress(address);
    if (isNullOrEmpty(apeNumber)) {
      dispatch(getAPE.request());
    }
    if (isNullOrEmpty(invoiceTypes)) {
      dispatch(getInvoicesTypes.request());
    }
    if (isNullOrEmpty(accountGroups)) {
      dispatch(getAccountGroups.request());
    }
    if (isNullOrEmpty(paymentChoices)) {
      dispatch(getPaymentChoices.request());
    }
    /*!isNullOrEmpty(currentCompany && currentCompany.phoneNumber) &&
      handleChangePhone(null, null, currentCompany.phoneNumber);*/

    if (id) {
      const COMPANIES_URL =
        process.env.REACT_APP_WEBAPI_URL + "api/Account/" + id;
      axios.get(COMPANIES_URL).then(res => {
        setCurrentCompany(res.data);
        setAddress(res.data.address);
        setPhoneNumber(
          res.data.phoneNumber && res.data.phoneNumber.replace(/\s/g, "")
        );
      });
    }
  }, [dispatch, apeNumber, invoiceTypes, accountGroups, paymentChoices]);

  const handleChangePhone = (setFieldValue, setFieldTouched, e) => {
    setPhoneNumber(e && e.replace(/\s/g, ""));

    if (setFieldTouched) {
      setFieldTouched("phoneNumber", true);
    }
    if (setFieldValue) {
      setFieldValue("phoneNumber", e && e.replace(/\s/g, ""));
    }
  };

  //const currentCompany = history.location.state;

  const paymentConditions = [
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.BILL" }), id: 0 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.BILL" }), id: 1 },
    { name: intl.formatMessage({ id: "PAYMENT.60.DAYS.BILL" }), id: 2 },
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.END.MONTH" }), id: 3 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.END.MONTH" }), id: 4 },
    { name: intl.formatMessage({ id: "PAYMENT.BILL.RECEIVED" }), id: 5 }
  ];

  const formatTva = value => {
    if (!value) return 0;
    let siren = value.substring(0, value.length - 5);
    let test = [12 + 3 * (siren % 97)] % 97;
    let intraTVA = `FR${test}${siren}`;
    return intraTVA;
  };

  const initialValues = {
    ...currentCompany,
    id: currentCompany ? currentCompany.id : "",
    name: currentCompany ? currentCompany.name : "",
    siret: currentCompany ? currentCompany.siret : "",
    apeNumber: currentCompany ? currentCompany.apeNumber : "",
    companyStatus: currentCompany ? currentCompany.companyStatus : "",
    tvaNumber: currentCompany ? formatTva(currentCompany.siret) : "",
    address: currentCompany ? currentCompany.address : "",
    additionaladdress: currentCompany ? currentCompany.additionalAddress : "",
    postalCode: currentCompany ? currentCompany.postalCode : "",
    city: currentCompany ? currentCompany.city : "",
    coefficient: currentCompany ? currentCompany.coefficient : "",
    phoneNumber: currentCompany ? currentCompany.phoneNumber : "",
    description: currentCompany ? currentCompany.description : "",
    paymentCondition: currentCompany ? currentCompany.paymentCondition : 0,
    anaelID: currentCompany ? currentCompany.anaelID : "",
    invoiceTypeID:
      currentCompany && currentCompany.invoiceTypeID
        ? currentCompany.invoiceTypeID
        : 1,
    accountGroupID:
      currentCompany && currentCompany.accountGroupID
        ? currentCompany.accountGroupID
        : null,
    paymentChoiceID:
      currentCompany && currentCompany.paymentChoiceID
        ? currentCompany.paymentChoiceID
        : 1
  };

  // Validation schema
  const CompanyCreateSchema = Yup.object().shape({
    name: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    siret: Yup.string()
      .matches(
        /^(?:|[0-9]{14})$/,
        intl.formatMessage({ id: "VALIDATION.INVALID_SIRET" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    companyStatus: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    postalCode: Yup.string()
      .test(
        "len",
        intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" }),
        val => val.length === 5
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    tvaNumber: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .test(
        "checkTva",
        intl.formatMessage({ id: "MESSAGE.INVALID.TVA" }),
        value => value === formatTva(currentCompany.siret)
      ),
    phoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });
  return (
    <>
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={CompanyCreateSchema}
        setFieldValue
        setFieldTouched
        onSubmit={values => {
          let data = {
            ...values,
            accountGroupID: parseInt(values.accountGroupID),
            tenantID: TENANTID
          };
          dispatch(updateCompany.request(data), onHide());
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
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.NAME" />
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
                          id: "MODEL.ACCOUNT.NAME"
                        })}
                      />
                    </div>
                  </div>
                  {/* Siret */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.SIRET" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-hashtag text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="siret"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.SIRET"
                        })}
                      />
                    </div>
                  </div>
                  {/* N° APE/NAF */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.APENUMBER" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-edit text-primary"></i>
                        </span>
                      </div>
                      <Select className="form-control" name="apeNumber">
                        <option disabled selected value="">
                          --{" "}
                          {intl.formatMessage({ id: "COLUMN.APE.NAF.NUMBER" })}{" "}
                          --
                        </option>
                        {apeNumber.map(choice => {
                          return (
                            <option key={choice.id} value={choice.code}>
                              {choice.code}-{choice.description}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="form-group row">
                  {/* statut juridique de la société */}
                  <div className="col-lg-4">
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
                  </div>
                  {/* N° TVA intracommunautaire​ */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.TVANUMBER" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-edit text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="tvaNumber"
                        component={Input}
                        disabled
                        value={formatTva(values.siret)}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.TVANUMBER"
                        })}
                      />
                    </div>
                    {errors.tvaNumber && touched.tvaNumber && (
                      <div className="asterisk">{errors.tvaNumber}</div>
                    )}
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
                      {/*<Field
                        name="address"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.ADDRESS"
                        })}
                      />*/}
                      <LocationSearchInput
                        address={address}
                        setAddress={setAddress}
                        setFieldValue={setFieldValue}
                        intl={intl}
                      />
                    </div>
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
                        name="additionaladdress"
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
                        name="postalCode"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.POSTALCODE"
                        })}
                      />
                    </div>
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
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.CITY"
                        })}
                      />
                    </div>
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

                      {/*<input
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.PHONENUMBER",
                        })}
                        type="text"
                        className={`form-control h-auto`}
                        name="phoneNumber"
                        onChange={(e) =>
                          handleChangePhone(
                            setFieldValue,
                            setFieldTouched,
                            e.target.value
                          )
                        }
                        value={
                          phoneNumber && phoneNumber.match(/.{1,2}/g).join(" ")
                        }
                      />*/}
                    </div>
                  </div>
                </div>
                <div className="separator separator-solid-primary mt-10 mb-5 mx-30"></div>

                <div className="form-group row">
                  {/* mode de règlement */}
                  <div className="col-lg-4">
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
                  {/* condition de paiment */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.PAYMENT_CONDITION" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <Select
                        className="form-control"
                        name="paymentCondition"
                        disabled
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.PAYMENT_CONDITION"
                        })}
                      >
                        {paymentConditions.map(choice => {
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
                  {/* Type de Facture souhaitée */}
                  <div className="col-lg-4">
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
                  {/* Groupe client */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.GROUP" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl fas fa-list text-primary"></i>
                        </span>
                      </div>
                      <Field
                        value={intl.formatMessage({ id: "TEXT.NONE" })}
                        component={Input}
                        disabled
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.COEFFICIENT"
                        })}
                      />
                      {/*<Select className="form-control" name="accountGroupID">
                        <option
                          selected={values.accountGroupID === null}
                          value={null}
                        >
                          {intl.formatMessage({ id: "TEXT.NONE" })}
                        </option>
                        {accountGroups.map((group) => {
                          return (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          );
                        })}
                      </Select>*/}
                    </div>
                  </div>
                  {/* description */}
                  <div className="col-lg-4">
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
                  {/* coefficient négocié (accord commercial) */}
                  <div className="col-lg-4">
                    <label className=" col-form-label">
                      <FormattedMessage id="MODEL.ACCOUNT.COEFFICIENT" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl flaticon2-send-1 text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="coefficient"
                        component={Input}
                        disabled
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.COEFFICIENT"
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
                className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
              >
                <FormattedMessage id="BUTTON.CANCEL" />
              </button>
              <> </>
              <button
                type="submit"
                onClick={() => handleSubmit()}
                className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4"
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

export default injectIntl(CompanyEditForm);

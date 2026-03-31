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
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import { toastr } from "react-redux-toastr";
import * as Yup from "yup";
import {
  getInvoicesTypes,
  getPaymentChoices,
  getAPE
} from "../../../../../business/actions/shared/listsActions";
import LocationSearchInput from "./location-search-input";
import { useParams } from "react-router-dom";
import axios from "axios";

function WorksiteEditForm({ onHide, intl, history, getData }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [address, setAddress] = useState("");
  const [
    commercialAgreementsValidated,
    setCommercialAgreementsValidated
  ] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(history.location.state);
  const [outstandingsValidated, setOutstandingsValidated] = useState(false);
  const [commercialContractSigned, setCommercialContractSigned] = useState(
    false
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const { invoiceTypes, paymentChoices, apeNumber } = useSelector(
    state => ({
      invoiceTypes: state.lists.invoiceTypes,
      paymentChoices: state.lists.paymentChoices,
      apeNumber: state.lists.apeNumber
    }),
    shallowEqual
  );
  const useMountEffect = fun => useEffect(fun, []);

  useMountEffect(() => {
    dispatch(getInvoicesTypes.request());
    dispatch(getPaymentChoices.request());
    dispatch(getAPE.request());
    !isNullOrEmpty(currentCompany) &&
      !isNullOrEmpty(currentCompany.phoneNumber) &&
      handleChangePhone(null, null, currentCompany.phoneNumber);

    if (id) {
      const COMPANIES_URL =
        process.env.REACT_APP_WEBAPI_URL + "api/Account/" + id;
      axios.get(COMPANIES_URL).then(res => {
        setCurrentCompany(res.data);
        setAddress(res.data.address);
        setPhoneNumber(
          res.data.phoneNumber && res.data.phoneNumber.replace(/\s/g, "")
        );
        if (res.data.commercialAgreementsValidated) {
          setCommercialAgreementsValidated(
            res.data.commercialAgreementsValidated
          );
        }
        if (res.data.outstandingsValidated) {
          setOutstandingsValidated(res.data.outstandingsValidated);
        }
        if (res.data.commercialContractSigned) {
          setCommercialContractSigned(res.data.commercialContractSigned);
        }
      });
    }
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

  const paymentConditions = [
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.BILL" }), id: 0 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.BILL" }), id: 1 },
    { name: intl.formatMessage({ id: "PAYMENT.60.DAYS.BILL" }), id: 2 },
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.END.MONTH" }), id: 3 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.END.MONTH" }), id: 4 },
    { name: intl.formatMessage({ id: "PAYMENT.BILL.RECEIVED" }), id: 5 }
  ];

  const sendAnael = () => {
    axios
      .get(
        process.env.REACT_APP_WEBAPI_URL +
          "api/account/SendCustomerToAnael/" +
          id
      )
      .then(res => {
        toastr.success(
          intl.formatMessage({ id: "TITLE.CHANTIER.EDIT" }),
          intl.formatMessage({ id: "MESSAGE.CHANTIER.ANAEL.SENT" })
        );
        onHide();
      })
      .catch(err => {
        let msg = err.response.data
          ? err.response.data
          : intl.formatMessage({ id: "TEXT.ERROR.FRIENDLY" });
        toastr.error(intl.formatMessage({ id: "ERROR" }), msg);
      });
  };

  //const currentCompany = history.location.state;
  const initialValues = {
    id: currentCompany ? currentCompany.id : "",
    name: currentCompany ? currentCompany.name : "",
    apeNumber: currentCompany ? currentCompany.apeNumber : "",
    companyStatus: currentCompany ? currentCompany.companyStatus : "",
    tvaNumber: currentCompany ? currentCompany.tvaNumber : "",
    address: currentCompany ? currentCompany.address : "",
    additionaladdress: currentCompany ? currentCompany.additionalAddress : "",
    postalCode: currentCompany ? currentCompany.postalCode : "",
    city: currentCompany ? currentCompany.city : "",
    coefficient: currentCompany ? currentCompany.coefficient : "",
    phoneNumber: currentCompany ? currentCompany.phoneNumber : "",
    description: currentCompany ? currentCompany.description : "",
    anaelID:
      currentCompany && currentCompany.anaelID ? currentCompany.anaelID : "",
    paymentCondition: currentCompany ? currentCompany.paymentCondition : 0,
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
    companyStatus: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    postalCode: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    phoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    anaelID: Yup.string()
      .min(9, intl.formatMessage({ id: "WARNING.ANAEL.LENGTH" }))
      .max(9, intl.formatMessage({ id: "WARNING.ANAEL.LENGTH" }))
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
            tenantID: currentCompany.tenantID,
            commercialAgreementsValidated,
            outstandingsValidated,
            commercialContractSigned,
            parentID: currentCompany.parentID
          };
          dispatch(
            updateCompany.request(data),
            setTimeout(() => {
              getData();
            }, 500),
            onHide()
          );
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
                  </div>
                  <div className="col-lg-6">
                    <label className=" col-form-label">
                      <FormattedMessage id="TEXT.ANAEL.ID" />
                    </label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="icon-xl far fa-edit text-primary"></i>
                        </span>
                      </div>
                      <Field
                        name="anaelID"
                        component={Input}
                        placeholder={intl.formatMessage({
                          id: "TEXT.ANAEL.ID"
                        })}
                      />
                      {touched.anaelID && errors.anaelID ? (
                        <div className="asterisk">{errors["anaelID"]}</div>
                      ) : null}
                    </div>
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
                        disabled
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
                        disabled
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
                        component={Input}
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
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.PHONENUMBER"
                        })}
                      />
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
                        placeholder={intl.formatMessage({
                          id: "MODEL.ACCOUNT.COEFFICIENT"
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div>
                    <span className="switch switch switch-sm">
                      <label>
                        <input
                          type="checkbox"
                          onChange={() =>
                            setCommercialAgreementsValidated(
                              !commercialAgreementsValidated
                            )
                          }
                          checked={commercialAgreementsValidated}
                        />
                        <span></span>
                      </label>
                    </span>
                  </div>
                  <label
                    className="d-flex col-form-label ml-10"
                    style={{ fontSize: 14 }}
                  >
                    <FormattedMessage id="BUTTON.ACCEPT.COMMERCIAL.AGREEMENTS" />
                  </label>
                </div>
                <div className="row">
                  <div>
                    <span className="switch switch switch-sm">
                      <label>
                        <input
                          type="checkbox"
                          onChange={() =>
                            setOutstandingsValidated(!outstandingsValidated)
                          }
                          checked={outstandingsValidated}
                        />
                        <span></span>
                      </label>
                    </span>
                  </div>
                  <label
                    className="d-flex col-form-label ml-10"
                    style={{ fontSize: 14 }}
                  >
                    <FormattedMessage id="BUTTON.ACCEPT.ENCOURS" />
                  </label>
                </div>
                <div className="row">
                  <div>
                    <span className="switch switch switch-sm">
                      <label>
                        <input
                          type="checkbox"
                          onChange={() =>
                            setCommercialContractSigned(
                              !commercialContractSigned
                            )
                          }
                          checked={commercialContractSigned}
                        />
                        <span></span>
                      </label>
                    </span>
                  </div>
                  <label
                    className="d-flex col-form-label ml-10"
                    style={{ fontSize: 14 }}
                  >
                    <FormattedMessage id="BUTTON.ACCEPT.SIGNED.AGREEMENTS" />
                  </label>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                onClick={sendAnael}
                className="btn btn-light-info btn-shadow font-weight-bold px-9 py-4 my-3 mx-4"
              >
                <FormattedMessage id="SEND.TO.ANAEL" />
              </button>
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
  );
}

export default injectIntl(WorksiteEditForm);

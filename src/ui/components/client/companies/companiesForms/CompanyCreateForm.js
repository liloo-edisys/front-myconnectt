// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState } from "react";

import { createCompany } from "actions/client/CompaniesActions";
import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import AsyncSelect from "react-select/async";
import * as Yup from "yup";
import postalCode from "../../../../../utils/postalCodes.json";
import _ from "lodash";
import {
  getInvoicesTypes,
  getAccountGroups,
  getPaymentChoices,
  getAPE
} from "actions/shared/ListsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import LocationSearchInput from "./location-search-input";

function CompanyCreateForm({ onHide, intl }) {
  const dispatch = useDispatch();
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const [cityInputValue, setCityInputValue] = useState("");
  const [selectedCity, setselectedCity] = useState(null);
  const [address, setAddress] = useState("");

  const [companyInputValue, setCompanyInputValue] = useState("");
  const [selectedCompany, setselectedCompany] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleCityInputChange = value => {
    setCityInputValue(value);
  };

  const handleCompanyInputChange = value => {
    setCompanyInputValue(value);
  };

  const handleChangeCity = value => {
    setselectedCity(value);
  };

  const handleChangeCompany = value => {
    setselectedCompany(value);
  };

  const loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(
        _.filter(postalCode, function(city) {
          return (
            city.Nom_commune.toLowerCase().indexOf(
              cityInputValue.toLowerCase()
            ) >= 0 ||
            city.Code_postal.toString().indexOf(cityInputValue.toLowerCase()) >=
              0
          );
        })
      );
    }, 1000);
  };

  const loadCompanyOptions = inputValue => {
    console.log(
      `https://acceslibre.beta.gouv.fr/api/erps/?q=${inputValue}&&code_postal=${selectedCity.Code_postal}`
    );
    return companyInputValue.length >= 3
      ? fetch(
          //`https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${inputValue}?&code_postal=${selectedCity.Code_postal}`
          `https://acceslibre.beta.gouv.fr/api/erps/?q=${inputValue}&&code_postal=${selectedCity.Code_postal}`
        )
          .then(res => res.json())
          .then(data => data.etablissement)
      : null;
  };

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
  const formatTva = value => {
    if (!value) return 0;
    let siren = value.substring(0, value.length - 5);
    let test = [12 + 3 * (siren % 97)] % 97;
    let intraTVA = `FR${test}${siren}`;
    return intraTVA;
  };
  useEffect(() => {
    const address =
      selectedCompany && selectedCompany.l4_normalisee
        ? selectedCompany.l4_normalisee
        : "-";
    setAddress(address);
    if (isNullOrEmpty(invoiceTypes)) {
      dispatch(getInvoicesTypes.request());
    }
    if (isNullOrEmpty(accountGroups)) {
      dispatch(getAccountGroups.request());
    }
    if (isNullOrEmpty(paymentChoices)) {
      dispatch(getPaymentChoices.request());
    }
    if (isNullOrEmpty(apeNumber)) {
      dispatch(getAPE.request());
    }
  }, [
    dispatch,
    invoiceTypes,
    accountGroups,
    paymentChoices,
    apeNumber,
    selectedCompany
  ]);
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
        : "-",
    additionaladdress: selectedCompany ? selectedCompany.l5_normalisee : "",
    postalcode: selectedCompany ? selectedCompany.code_postal : "",
    phoneNumber: null,
    acceptTerms: false,
    InvoiceTypeID: 1,
    accountGroupID: 0,
    paymentChoiceID: 1,
    companyStatus: selectedCompany
      ? selectedCompany.libelle_nature_juridique_entreprise
      : "",
    apeNumber: "",
    tvaNumber: selectedCompany ? formatTva(selectedCompany.siret) : ""
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
    apeNumber: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    companyStatus: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    tvaNumber: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .test(
        "checkTva",
        intl.formatMessage({ id: "MESSAGE.INVALID.TVA" }),
        value => value === formatTva(selectedCompany.siret)
      ),
    address: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    postalcode: Yup.string()
      .test(
        "len",
        intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" }),
        val => val.length === 5
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    phoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "#F3F6F9",
      // match with the menu
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      // Overwrittes the different states of border
      borderColor: "transparent",
      // Removes weird border around container
      boxShadow: null,
      "&:hover": {
        // Overwrittes the different states of border
        borderColor: "transparent"
      }
    }),
    menu: base => ({
      ...base,
      // override border radius to match the box
      borderRadius: 0,
      // kill the gap
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      // kill the white space on first and last option
      padding: 0
    })
  };
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
      <div className="form d-flex flex-column justify-content-center mt-5 mb-10">
        <AsyncSelect
          className="col-lg-10 offset-lg-1 form-control form-control-solid"
          cacheOptions
          value={selectedCity}
          noOptionsMessage={() => intl.formatMessage({ id: "MESSAGE.NO.CITY" })}
          loadingMessage={() =>
            intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })
          }
          getOptionLabel={e => `${e.Nom_commune} (${e.Code_postal})`}
          getOptionValue={e => e.Code_postal}
          loadOptions={loadOptions}
          onInputChange={handleCityInputChange}
          onChange={handleChangeCity}
          placeholder={intl.formatMessage({ id: "AUTH.REGISTER.POSTALCODE" })}
          isClearable
          isSearchable
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null
          }}
          styles={customStyles}
        />

        <AsyncSelect
          className="col-lg-10 offset-lg-1 mt-4  form-control form-control-solid"
          cacheOptions
          value={selectedCompany}
          noOptionsMessage={() =>
            intl.formatMessage({ id: "MESSAGE.NO.COMPANIES" })
          }
          loadingMessage={() =>
            intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })
          }
          getOptionLabel={e => `${e.l1_normalisee} SIRET(${e.siret})`}
          getOptionValue={e => e.siret}
          loadOptions={loadCompanyOptions}
          onInputChange={handleCompanyInputChange}
          onChange={handleChangeCompany}
          placeholder={intl.formatMessage({ id: "AUTH.REGISTER.COMPANY_NAME" })}
          isClearable
          isSearchable
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null
          }}
          styles={customStyles}
        />
        <div className="col-lg-10 offset-lg-1" style={{ fontSize: 8 }}>
          * <FormattedMessage id="MESSAGE.MIN.3.CHAR" />
        </div>
      </div>
      {selectedCompany && (
        <Formik
          enableReinitialize={true}
          initialValues={newInitialValues}
          validationSchema={CompanyCreateSchema}
          setFieldValue
          setFieldTouched
          onSubmit={values => {
            let data = { ...values, tenantID: TENANTID };
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
                    <div className="col-lg-4">
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
                          disabled
                          placeholder={intl.formatMessage({
                            id: "AUTH.REGISTER.COMPANY_NAME"
                          })}
                        />
                      </div>
                      {errors.name && touched.name && (
                        <div className="asterisk">{errors.name}</div>
                      )}
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
                          disabled
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.SIRET"
                          })}
                        />
                      </div>
                      {errors.siret && touched.siret && (
                        <div className="asterisk">{errors.siret}</div>
                      )}
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
                        <Select
                          value={values.apeNumber}
                          className="form-control"
                          name="apeNumber"
                        >
                          <option disabled selected value="">
                            --{" "}
                            {intl.formatMessage({
                              id: "COLUMN.APE.NAF.NUMBER"
                            })}{" "}
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
                      {touched.apeNumber && errors.apeNumber ? (
                        <div className="asterisk">{errors["apeNumber"]}</div>
                      ) : null}
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
                          disabled
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.COMPANYSTATUS"
                          })}
                        />
                      </div>
                      {errors.companyStatus && touched.companyStatus && (
                        <div className="asterisk">{errors.companyStatus}</div>
                      )}
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
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.TVANUMBER"
                          })}
                        />
                      </div>
                      {touched.tvaNumber && errors.tvaNumber ? (
                        <div className="asterisk">{errors["tvaNumber"]}</div>
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
                        {/*<Field
                          name="address"
                          disabled
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
                      {errors.address && touched.address && (
                        <div className="asterisk">{errors.address}</div>
                      )}
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
                          name="postalcode"
                          disabled
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.POSTALCODE"
                          })}
                        />
                      </div>
                      {errors.postalcode && touched.postalcode && (
                        <div className="asterisk">{errors.postalcode}</div>
                      )}
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
                      {errors.city && touched.city && (
                        <div className="asterisk">{errors.city}</div>
                      )}
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
                            phoneNumber &&
                            phoneNumber.match(/.{1,2}/g).join(" ")
                          }
                        />*/}
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
                            phoneNumber &&
                            phoneNumber.match(/.{1,2}/g).join(" ")
                          }
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.PHONENUMBER"
                          })}
                        />
                      </div>
                      {errors.phoneNumber && touched.phoneNumber && (
                        <div className="asterisk">{errors.phoneNumber}</div>
                      )}
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
                        <Select className="form-control" name="InvoiceTypeID">
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
                    <div className="col-lg-6">
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
                        {/*<Select
                          value={newInitialValues.accountGroupID}
                          className="form-control"
                          name="accountGroupID"
                        >
                          <option disabled selected value={0}>
                            --{" "}
                            {intl.formatMessage({ id: "MODEL.ACCOUNT.GROUP" })}
                            --
                          </option>
                          {accountGroups.map(group => {
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
      )}
    </>
  );
}

export default injectIntl(CompanyCreateForm);

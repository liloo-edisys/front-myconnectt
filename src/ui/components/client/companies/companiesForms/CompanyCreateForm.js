// Form is based on Formik
// Data validation is based on Yup
// Please, be familiar with article first:
// https://hackernoon.com/react-form-validation-with-formik-and-yup-8b76bda62e10
import React, { useEffect, useState, useRef } from "react";

import { createCompany } from "actions/client/CompaniesActions";
import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import { Modal } from "react-bootstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import AsyncSelect from "react-select/async";
import axios from "axios";
import * as Yup from "yup";
import postalCode from "../../../../../utils/postalCodes.json";
import _ from "lodash";
import {
  getInvoicesTypes,
  getAccountGroups,
  getPaymentChoices,
  getAPE,
} from "actions/shared/ListsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";

function CompanyCreateForm({ onHide, intl }) {
  const dispatch = useDispatch();
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  const [cityInputValue, setCityInputValue] = useState("");
  const [selectedCity, setselectedCity] = useState(null);
  const [address, setAddress] = useState("");

  const [companyInputValue, setCompanyInputValue] = useState("");
  const [selectedCompany, setselectedCompany] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // États pour la recherche d'adresse
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressObject, setAddressObject] = useState(null);

  // Références pour la gestion du focus
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const addressSuggestionsRef = useRef(null);

  const handleCityInputChange = (value) => {
    setCityInputValue(value);
  };

  const handleCompanyInputChange = (value) => {
    setCompanyInputValue(value);
  };

  const handleChangeCity = (value) => {
    setselectedCity(value);
  };

  const handleChangeCompany = (value) => {
    setselectedCompany(value);
  };

  // Fonction pour rechercher les adresses avec votre API
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) return;

    setAddressSearchLoading(true);

    try {
      const response = await axios.get(
        `https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Map/search?query=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            accept: "text/plain",
          },
        }
      );

      setAddressSuggestions(response.data || []);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      setAddressSuggestions([]);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // Fonction pour sélectionner une adresse
  const selectAddress = (suggestion, setFieldValue) => {
    setAddress(suggestion.freeformAddress);
    setAddressObject(suggestion);
    setAddressSuggestions([]);
    setSelectedSuggestionIndex(-1);

    // Mettre à jour les champs Formik
    if (setFieldValue) {
      setFieldValue("address", suggestion.freeformAddress);
      setFieldValue("postalcode", suggestion.postalCode);
      setFieldValue("city", suggestion.localName);
    }

    // Focus sur l'input après sélection
    if (addressInputRef.current) {
      addressInputRef.current.focus();
    }
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

  const loadCompanyOptions = (inputValue) => {
    console.log(
      `https://acceslibre.beta.gouv.fr/api/erps/?q=${inputValue}&&code_postal=${selectedCity.Code_postal}`
    );
    return companyInputValue.length >= 3
      ? fetch(
          `https://acceslibre.beta.gouv.fr/api/erps/?q=${inputValue}&&code_postal=${selectedCity.Code_postal}`
        )
          .then((res) => res.json())
          .then((data) => data.etablissement)
      : null;
  };

  const {
    invoiceTypes,
    accountGroups,
    paymentChoices,
    apeNumber,
  } = useSelector(
    (state) => ({
      invoiceTypes: state.lists.invoiceTypes,
      accountGroups: state.lists.accountGroups,
      paymentChoices: state.lists.paymentChoices,
      apeNumber: state.lists.apeNumber,
    }),
    shallowEqual
  );

  const formatTva = (value) => {
    if (!value) return 0;
    let siren = value.substring(0, value.length - 5);
    let test = [12 + 3 * (siren % 97)] % 97;
    let intraTVA = `FR${test}${siren}`;
    return intraTVA;
  };

  useEffect(() => {
    const addressValue =
      selectedCompany && selectedCompany.l4_normalisee
        ? selectedCompany.l4_normalisee
        : "-";
    setAddress(addressValue);
  }, [selectedCompany]);

  // useEffect séparé pour charger les listes une seule fois au montage
  useEffect(() => {
    if (isNullOrEmpty(invoiceTypes)) {
      dispatch(getInvoicesTypes.request());
    }
    // if (isNullOrEmpty(accountGroups)) {
    //   dispatch(getAccountGroups.request());
    // }
    if (isNullOrEmpty(paymentChoices)) {
      dispatch(getPaymentChoices.request());
    }
    if (isNullOrEmpty(apeNumber)) {
      dispatch(getAPE.request());
    }
  }, [dispatch]); // Seulement dispatch dans les dépendances

  // Effet pour fermer les suggestions lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      const addressContainer = document.getElementById("address-container");
      if (addressContainer && !addressContainer.contains(event.target)) {
        setAddressSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Nettoyer le timeout lors du démontage du composant
  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, []);

  // Effet pour faire défiler les suggestions visibles lorsque l'index change
  useEffect(() => {
    if (
      selectedSuggestionIndex !== -1 &&
      addressSuggestionsRef.current &&
      addressSuggestionsRef.current.children[selectedSuggestionIndex]
    ) {
      const container = addressSuggestionsRef.current;
      const selectedElement = container.children[selectedSuggestionIndex];

      if (selectedElement) {
        if (
          selectedElement.offsetTop + selectedElement.clientHeight >
          container.scrollTop + container.clientHeight
        ) {
          container.scrollTop =
            selectedElement.offsetTop +
            selectedElement.clientHeight -
            container.clientHeight;
        } else if (selectedElement.offsetTop < container.scrollTop) {
          container.scrollTop = selectedElement.offsetTop;
        }
      }
    }
  }, [selectedSuggestionIndex]);

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
    address: address,
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
    tvaNumber: selectedCompany ? formatTva(selectedCompany.siret) : "",
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
        (value) =>
          selectedCompany ? value === formatTva(selectedCompany.siret) : true
      ),
    address: Yup.string()
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    postalcode: Yup.string()
      .test(
        "len",
        intl.formatMessage({ id: "MESSAGE.MIN.5.NUMBERS" }),
        (val) => val && val.length === 5
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
      .typeError(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
  });

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: "#F3F6F9",
      borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      borderColor: "transparent",
      boxShadow: null,
      "&:hover": {
        borderColor: "transparent",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 0,
      marginTop: 0,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
    }),
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
          getOptionLabel={(e) => `${e.Nom_commune} (${e.Code_postal})`}
          getOptionValue={(e) => e.Code_postal}
          loadOptions={loadOptions}
          onInputChange={handleCityInputChange}
          onChange={handleChangeCity}
          placeholder={intl.formatMessage({ id: "AUTH.REGISTER.POSTALCODE" })}
          isClearable
          isSearchable
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
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
          getOptionLabel={(e) => `${e.l1_normalisee} SIRET(${e.siret})`}
          getOptionValue={(e) => e.siret}
          loadOptions={loadCompanyOptions}
          onInputChange={handleCompanyInputChange}
          onChange={handleChangeCompany}
          placeholder={intl.formatMessage({ id: "AUTH.REGISTER.COMPANY_NAME" })}
          isClearable
          isSearchable
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
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
          onSubmit={(values) => {
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
            setFieldTouched,
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
                            id: "AUTH.REGISTER.COMPANY_NAME",
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
                            id: "MODEL.ACCOUNT.SIRET",
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
                          <option disabled value="">
                            --{" "}
                            {intl.formatMessage({
                              id: "COLUMN.APE.NAF.NUMBER",
                            })}{" "}
                            --
                          </option>
                          {apeNumber.map((choice) => {
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
                            id: "MODEL.ACCOUNT.COMPANYSTATUS",
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
                            id: "MODEL.ACCOUNT.TVANUMBER",
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
                    {/* Adresse avec recherche intégrée */}
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

                        <div
                          className="position-relative w-100"
                          id="address-container"
                        >
                          <div className="input-group">
                            <input
                              type="text"
                              className={`form-control ${
                                errors.address && touched.address
                                  ? "is-invalid"
                                  : ""
                              }`}
                              name="address"
                              value={values.address || address}
                              onChange={(e) => {
                                const query = e.target.value;
                                setAddress(query);
                                setFieldValue("address", query);

                                // Configuration du délai pour l'API
                                if (addressTimeoutRef.current) {
                                  clearTimeout(addressTimeoutRef.current);
                                }

                                if (query.length < 3) {
                                  setAddressSuggestions([]);
                                  return;
                                }

                                // Délai de 300ms avant d'appeler l'API
                                addressTimeoutRef.current = setTimeout(() => {
                                  fetchAddressSuggestions(query);
                                }, 300);
                              }}
                              onKeyDown={(e) => {
                                // Navigation avec les flèches dans les suggestions
                                if (addressSuggestions.length > 0) {
                                  if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    const nextIndex =
                                      (selectedSuggestionIndex + 1) %
                                      addressSuggestions.length;
                                    setSelectedSuggestionIndex(nextIndex);
                                  } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    const prevIndex =
                                      selectedSuggestionIndex === 0
                                        ? addressSuggestions.length - 1
                                        : selectedSuggestionIndex - 1;
                                    setSelectedSuggestionIndex(prevIndex);
                                  } else if (
                                    e.key === "Enter" &&
                                    selectedSuggestionIndex !== -1
                                  ) {
                                    e.preventDefault();
                                    const selected =
                                      addressSuggestions[
                                        selectedSuggestionIndex
                                      ];
                                    selectAddress(selected, setFieldValue);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    setAddressSuggestions([]);
                                    setSelectedSuggestionIndex(-1);
                                  }
                                }
                              }}
                              placeholder={intl.formatMessage({
                                id: "MODEL.ACCOUNT.ADDRESS",
                              })}
                              autoComplete="off"
                              ref={addressInputRef}
                            />
                            {values.address && (
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  setAddress("");
                                  setAddressObject(null);
                                  setFieldValue("address", "");
                                  setFieldValue("postalcode", "");
                                  setFieldValue("city", "");
                                  setAddressSuggestions([]);
                                  if (addressInputRef.current) {
                                    addressInputRef.current.focus();
                                  }
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {addressSearchLoading && (
                            <div
                              className="position-absolute end-0 top-50 translate-middle-y me-4 text-secondary"
                              style={{ right: "40px", pointerEvents: "none" }}
                            >
                              <div
                                className="spinner-border spinner-border-sm"
                                role="status"
                              ></div>
                            </div>
                          )}

                          {/* Affichage des suggestions d'adresse */}
                          {addressSuggestions.length > 0 && (
                            <div
                              ref={addressSuggestionsRef}
                              className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                              style={{
                                zIndex: 1000,
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {addressSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className={`p-2 border-bottom ${
                                    selectedSuggestionIndex === index
                                      ? "bg-light"
                                      : ""
                                  }`}
                                  style={{
                                    cursor: "pointer",
                                    transition: "background-color 0.2s ease",
                                  }}
                                  onMouseEnter={() =>
                                    setSelectedSuggestionIndex(index)
                                  }
                                  onClick={() =>
                                    selectAddress(suggestion, setFieldValue)
                                  }
                                >
                                  <div className="d-flex align-items-start">
                                    <div className="me-2 text-primary">
                                      <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div>
                                      <div className="text-primary">
                                        {suggestion.freeformAddress}
                                      </div>
                                      <div className="small text-muted">
                                        {suggestion.localName},{" "}
                                        {suggestion.postalCode},{" "}
                                        {suggestion.country}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.address && touched.address && (
                        <div className="asterisk">{errors.address}</div>
                      )}
                    </div>
                    {/* Complément d'adresse */}
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
                            id: "MODEL.ACCOUNT.ADDITIONALADDRESS",
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
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.POSTALCODE",
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
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.CITY",
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
                        <Field
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
                          component={Input}
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.PHONENUMBER",
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
                          {paymentChoices.map((choice) => {
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
                          {invoiceTypes.map((invoice) => {
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
                            id: "MODEL.ACCOUNT.COEFFICIENT",
                          })}
                        />
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
                            id: "MODEL.ACCOUNT.DESCRIPTION",
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

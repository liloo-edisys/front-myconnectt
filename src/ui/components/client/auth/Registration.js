import React, { useState } from "react";

import { registerAccount } from "api/shared/AuthApi";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import AsyncSelect from "react-select/async";
import * as Yup from "yup";
import postalCode from "../../../../utils/postalCodes.json";
import _ from "lodash";
import debounce from "debounce-promise";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";
import axios from "axios";

function Registration(props) {
  const [selectedCity, setselectedCity] = useState(null);

  const [selectedCompany, setselectedCompany] = useState(null);

  const handleChangeCity = value => {
    setselectedCity(value);
  };

  const handleChangeCompany = value => {
    setselectedCompany(value);
  };

  const loadOptions = (inputValue, callback) => {
    inputValue.length >= 3 &&
      setTimeout(() => {
        callback(
          _.filter(postalCode, function(city) {
            return (
              city.Nom_commune.toLowerCase().indexOf(
                inputValue.toLowerCase()
              ) >= 0 ||
              city.Code_postal.toString().indexOf(inputValue.toLowerCase()) >= 0
            );
          })
        );
      }, 1000);
  };

  const initialValues = {
    name:
      selectedCompany && !isNullOrEmpty(selectedCompany.nom_complet)
        ? selectedCompany.nom_complet
        : "_",
    city:
      selectedCompany && !isNullOrEmpty(selectedCompany.siege.libelle_commune)
        ? selectedCompany.siege.libelle_commune
        : "_",
    siret:
      selectedCompany && !isNullOrEmpty(selectedCompany.siege.siret)
        ? selectedCompany.siege.siret
        : "",
    email: "",
    address:
      selectedCompany && !isNullOrEmpty(selectedCompany.siege.adresse_complete)
        ? selectedCompany.siege.adresse_complete
        : "_",
    additionaladdress:
      selectedCompany &&
      !isNullOrEmpty(selectedCompany.siege.complement_adresse)
        ? selectedCompany.siege.complement_adresse
        : "_",
    postalcode:
      selectedCompany && !isNullOrEmpty(selectedCompany.siege.code_postal)
        ? selectedCompany.siege.code_postal
        : "_",
    acceptTerms: false,
    companyStatus:
      selectedCompany &&
      !isNullOrEmpty(selectedCompany.libelle_nature_juridique_entreprise)
        ? selectedCompany.libelle_nature_juridique_entreprise
        : "_"
  };
  const { intl, history } = props;
  const [loading, setLoading] = useState(false);
  const RegistrationSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    name: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    siret: Yup.string()
      .matches(
        /^(?:|[0-9]{14})$/,
        intl.formatMessage({ id: "VALIDATION.INVALID_SIRET" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    address: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    postalcode: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    acceptTerms: Yup.bool().required(
      intl.formatMessage({ id: "AUTH.REGISTER.TERMS_REQUIRED" })
    )
  });

  const enableLoading = () => {
    setLoading(true);
  };

  const disableLoading = () => {
    setLoading(false);
  };

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
      marginTop: 0,
      maxHeight: 200
    }),
    menuList: base => ({
      ...base,
      // kill the white space on first and last option
      padding: 0,
      maxHeight: 200
    })
  };

  const wait = 1000;
  const getAsyncOptions = inputValue => {
    return axios
      .get(
        `https://recherche-entreprises.api.gouv.fr/search?q=${inputValue}&&code_postal=${selectedCity.Code_postal}`
      )
      .then(res => {
        /*console.log(res.data.results);*/
        return res.data.results;
      });
  };

  const debouncedLoadOptions = debounce(getAsyncOptions, wait);

  return (
    <div
      className="register-form login-signin pb-11"
      style={{ display: "block" }}
    >
      <div className="text-center mb-10 mb-lg-20">
        <h3 className="pageTitle">
          <FormattedMessage id="AUTH.REGISTER.TITLE" />
        </h3>
        <p className="text-muted font-weight-bold col-lg-8 offset-lg-2">
          <FormattedMessage id="AUTH.REGISTER.DESC" />
        </p>
      </div>

      <div className="form d-flex flex-column justify-content-center">
        <AsyncSelect
          className="col-lg-10 offset-lg-1 form-control form-control-solid min-h-50px"
          cacheOptions
          noOptionsMessage={() => intl.formatMessage({ id: "MESSAGE.NO.CITY" })}
          loadingMessage={() =>
            intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })
          }
          value={selectedCity}
          getOptionLabel={e => `${e.Nom_commune} (${e.Code_postal})`}
          getOptionValue={e => e.Code_postal}
          loadOptions={loadOptions}
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
          className="col-lg-10 offset-lg-1 mt-4  form-control form-control-solid min-h-50px"
          value={selectedCompany}
          noOptionsMessage={() =>
            intl.formatMessage({ id: "MESSAGE.NO.COMPANIES" })
          }
          loadingMessage={() =>
            intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })
          }
          getOptionLabel={e => `${e.nom_complet} SIRET (${e.siege.siret})`}
          getOptionValue={e => e.siege.siret}
          loadOptions={debouncedLoadOptions}
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
          initialValues={initialValues}
          validationSchema={RegistrationSchema}
          setFieldValue
          onSubmit={(values, { setSubmitting }) => {
            enableLoading();
            registerAccount(values)
              .then(response => {
                disableLoading();
                response && history.push("/");
              })
              .catch(() => {
                setSubmitting(true);
                disableLoading();
              });
          }}
        >
          {({ values, touched, errors, status, handleSubmit }) => (
            <Form
              id="kt_login_signin_form"
              className="form fv-plugins-bootstrap fv-plugins-framework animated animate__animated animate__backInUp"
              onSubmit={handleSubmit}
            >
              {status && (
                <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
                  <div className="alert-text font-weight-bold">{status}</div>
                </div>
              )}

              <div className="separator separator-solid-primary my-10 mx-30"></div>

              <div className="row d-flex justify-content-center">
                {/* begin: Email */}
                <div className="form-group col-lg-10">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="icon-xl far fa-envelope text-primary"></i>
                      </span>
                    </div>
                    <Field
                      placeholder={intl.formatMessage({
                        id: "MODEL.EMAIL"
                      })}
                      type="email"
                      className={`form-control h-auto py-5 px-6 
                "email"
              `}
                      name="email"
                    />
                  </div>
                  {touched.email && errors.email ? (
                    <div className="fv-plugins-message-container">
                      <div className="fv-help-block">{errors.email}</div>
                    </div>
                  ) : null}
                </div>
                {/* end: Email */}
              </div>

              {/* begin: Terms and Conditions */}
              <div className="form-group row d-flex justify-content-center">
                <label className="checkbox ">
                  <Field type="checkbox" name="acceptTerms" className="m-1" />
                  <span />

                  <a
                    href="https://connectt.fr/mentions-legales/"
                    target="_blank"
                    className="mr-1 ml-2"
                    rel="noopener noreferrer"
                  >
                    <FormattedMessage id="AUTH.REGISTER.TERMS" />
                  </a>
                </label>
                {touched.acceptTerms && errors.acceptTerms ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{errors.acceptTerms}</div>
                  </div>
                ) : null}
              </div>
              {/* end: Terms and Conditions */}
              <div className="form-group d-flex flex-wrap flex-center">
                <Link to="/auth/login">
                  <button
                    type="button"
                    className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                  >
                    <FormattedMessage id="BUTTON.CANCEL" />
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={values.acceptTerms === true ? false : true}
                  className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                >
                  <span>
                    <FormattedMessage id="BUTTON.REGISTER" />
                  </span>
                  {loading && (
                    <span className="ml-3 spinner spinner-white"></span>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
      <div className="mt-10">
        <span className="opacity-40 mr-4 text-dark">
          <FormattedMessage id="TEXT.HAVE.MYCONNECTT.ACCOUNT" />
        </span>
        <Link to="/auth/login" className="text-black font-weight-normal">
          <FormattedMessage id="TEXT.LOGIN.ACCOUNT" />
        </Link>
      </div>
    </div>
  );
}

export default injectIntl(connect(null, null)(Registration));

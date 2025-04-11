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
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

function Registration(props) {
  const [selectedCity, setselectedCity] = useState(null);
  const [selectedCompany, setselectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [siretInput, setSiretInput] = useState("");
  const [siretError, setSiretError] = useState("");
  const [siretResults, setSiretResults] = useState(null);
  const { intl, history } = props;

  const handleChangeCity = (value) => {
    setselectedCity(value);
  };

  const handleChangeCompany = (value) => {
    setselectedCompany(value);
  };

  const handleSiretChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setSiretInput(value);

    // Reset error if input is empty
    if (!value) {
      setSiretError("");
      setSiretResults(null);
      return;
    }

    // Validate SIRET as user types
    if (value.length < 14) {
      setSiretError("Le numéro SIRET doit contenir exactement 14 chiffres");
      setSiretResults(null);
    } else if (value.length > 14) {
      setSiretInput(value.slice(0, 14)); // Limite  14 chiffres
    } else {
      setSiretError("");
      // Si nous avons 14 digits, fetch les infos de l'entreprise
      fetchCompanyBySiret(value);
    }
  };

  const fetchCompanyBySiret = (siret) => {
    const baseUrl = "https://api.insee.fr";
    const url = `${baseUrl}/entreprises/sirene/V3/siret/${siret}`;
    setLoading(true);

    axios
      .get(url)
      .then((res) => {
        setLoading(false);
        setSiretResults(res.data);
        // Populate company selection if data is valid
        if (res.data && res.data.etablissement) {
          const companyData = {
            nom_complet:
              res.data.etablissement.uniteLegale.denominationUniteLegale ||
              `${res.data.etablissement.uniteLegale.prenom1UniteLegale ||
                ""} ${res.data.etablissement.uniteLegale.nomUniteLegale || ""}`,
            siege: {
              siret: res.data.etablissement.siret,
              libelle_commune:
                res.data.etablissement.libelleCommuneEtablissement,
              adresse_complete: `${res.data.etablissement
                .numeroVoieEtablissement || ""} ${res.data.etablissement
                .typeVoieEtablissement || ""} ${res.data.etablissement
                .libelleVoieEtablissement || ""}`,
              complement_adresse:
                res.data.etablissement.complementAdresseEtablissement || "",
              code_postal: res.data.etablissement.codePostalEtablissement,
            },
            libelle_nature_juridique_entreprise:
              res.data.etablissement.uniteLegale.categorieJuridiqueUniteLegale,
          };
          setselectedCompany(companyData);
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error.response && error.response.status === 404) {
          setSiretError("Aucune entreprise trouvée avec ce numéro SIRET");
        } else {
          setSiretError("Erreur lors de la recherche de l'entreprise");
        }
        console.error("Error fetching company:", error);
      });
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
    password: "",
    confirmPassword: "",
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
        : "_",
  };

  const RegistrationSchema = Yup.object().shape({
    email: Yup.string()
      .email(intl.formatMessage({ id: "VALIDATION.INVALID_EMAIL" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    password: Yup.string()
      .min(8, intl.formatMessage({ id: "VALIDATION.MIN_LENGTH_FIELD" }))
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        intl.formatMessage({ id: "VALIDATION.PASSWORD_MISMATCH" })
      )
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
    acceptTerms: Yup.bool().oneOf(
      [true],
      intl.formatMessage({ id: "AUTH.REGISTER.TERMS_REQUIRED" })
    ),
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
      background: "#F5F7FA",
      borderRadius: "10px",
      border: "none",
      minHeight: "50px",
      padding: "0 10px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "transparent",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "10px",
      marginTop: 8,
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: 200,
    }),
    placeholder: (base) => ({
      ...base,
      color: "#B5B5C3",
    }),
  };

  const wait = 1000;
  const getAsyncOptions = (inputValue) => {
    return axios
      .get(
        `https://recherche-entreprises.api.gouv.fr/search?q=${inputValue}&&code_postal=${
          selectedCity ? selectedCity.Code_postal : ""
        }`
      )
      .then((res) => {
        return res.data.results;
      });
  };

  const debouncedLoadOptions = debounce(getAsyncOptions, wait);

  return (
    <div className="d-flex flex-row min-vh-100">
      {/* Left Side - Blue Section  */}
      <div
        className="d-flex flex-column justify-content-center bg-primary px-15 py-20 w-550px position-fixed"
        style={{ top: 0, height: "100vh", overflow: "hidden" }}
      >
        <h1 className="text-white font-weight-bold display-4 mb-14 text-center">
          Déjà inscrit chez nous?
        </h1>
        <p className="text-white font-size-h4 mb-10 text-center">
          Connectez vous à votre Espace
          <br />
          Recruteur pour l'effet{"  "}
          <img
            src={toAbsoluteUrl("/media/logos/wow.png")}
            className="h-20px"
            alt="wow"
          />
          {"  "}!
        </p>
        <div className="text-center">
          <Link to="/auth/login">
            <button className="btn btn-light-primary font-weight-bold py-3 px-8 mt-8 rounded-pill">
              Connexion
            </button>
          </Link>
        </div>
      </div>

      {/* Right Side - Form Section  */}
      <div
        className="d-flex flex-column flex-grow-1 justify-content-center align-items-center p-10"
        style={{ marginLeft: "550px" }}
      >
        <div className="max-w-850px w-100">
          <div className="text-center mb-10">
            <Link to="/">
              <img
                alt="Logo"
                src={toAbsoluteUrl("/media/logos/logo-myconnectt-color.png")}
                className="max-h-80px"
              />
            </Link>
            <h2
              className="text-primary font-weight-bold display-3 mb-10"
              style={{ fontSize: "2.5rem", fontWeight: "bolder" }}
            >
              Bienvenue
            </h2>
          </div>

          <div className="form mb-10">
            <AsyncSelect
              className="mb-5"
              styles={customStyles}
              cacheOptions
              noOptionsMessage={() =>
                intl.formatMessage({ id: "MESSAGE.NO.CITY" })
              }
              loadingMessage={() =>
                intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })
              }
              value={selectedCity}
              getOptionLabel={(e) => `${e.Nom_commune} (${e.Code_postal})`}
              getOptionValue={(e) => e.Code_postal}
              loadOptions={loadOptions}
              onChange={handleChangeCity}
              placeholder={intl.formatMessage({
                id: "AUTH.REGISTER.POSTALCODE",
              })}
              isClearable
              isSearchable
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
              }}
            />

            <AsyncSelect
              className="mb-5"
              styles={customStyles}
              value={selectedCompany}
              noOptionsMessage={() =>
                intl.formatMessage({ id: "MESSAGE.NO.COMPANIES" })
              }
              loadingMessage={() =>
                intl.formatMessage({ id: "MESSAGE.SEARCH.ONGOING" })
              }
              getOptionLabel={(e) =>
                `${e.nom_complet} SIRET (${e.siege.siret})`
              }
              getOptionValue={(e) => e.siege.siret}
              loadOptions={debouncedLoadOptions}
              onChange={handleChangeCompany}
              placeholder={intl.formatMessage({
                id: "AUTH.REGISTER.COMPANY_NAME",
              })}
              isClearable
              isSearchable
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
              }}
            />

            {/* SIRET Input with direct validation */}
            <div className="form-group mb-5">
              <input
                type="text"
                className="form-control form-control-solid rounded-lg"
                value={siretInput}
                onChange={handleSiretChange}
                placeholder="Entrez les 14 chiffres du numéro SIRET"
                maxLength={14}
              />
              {siretError && (
                <div className="text-danger mt-2">{siretError}</div>
              )}
              {loading && (
                <div className="mt-3">
                  <span className="spinner spinner-primary mr-2"></span>
                  <span>Recherche en cours...</span>
                </div>
              )}

              {/* Display company result */}
              {siretResults && !siretError && !loading && (
                <div className="mt-4 p-5 bg-light-primary rounded">
                  <h4 className="font-weight-bold mb-3">
                    Entreprise trouvée :
                  </h4>
                  {selectedCompany && (
                    <div>
                      <p className="mb-1">
                        <strong>Nom:</strong> {selectedCompany.nom_complet}
                      </p>
                      <p className="mb-1">
                        <strong>SIRET:</strong> {selectedCompany.siege.siret}
                      </p>
                      <p className="mb-1">
                        <strong>Adresse:</strong>{" "}
                        {selectedCompany.siege.adresse_complete}
                      </p>
                      <p className="mb-1">
                        <strong>Code postal:</strong>{" "}
                        {selectedCompany.siege.code_postal}
                      </p>
                      <p className="mb-1">
                        <strong>Ville:</strong>{" "}
                        {selectedCompany.siege.libelle_commune}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedCompany && (
            <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={RegistrationSchema}
              onSubmit={(values, { setSubmitting }) => {
                enableLoading();
                registerAccount(values)
                  .then((response) => {
                    disableLoading();
                    response && history.push("/");
                  })
                  .catch(() => {
                    setSubmitting(false);
                    disableLoading();
                  });
              }}
            >
              {({ values, touched, errors, handleSubmit }) => (
                <Form className="form" onSubmit={handleSubmit}>
                  <div className="form-group mb-5">
                    <label className="font-size-h6 text-primary mb-3">
                      Nom d'utilisateur
                    </label>
                    <Field
                      type="text"
                      className="form-control form-control-solid h-auto py-5 px-6 rounded-lg"
                      name="username"
                      placeholder="Nom d'utilisateur"
                    />
                  </div>

                  <div className="form-group mb-5">
                    <label className="font-size-h6 text-primary mb-3">
                      Adresse Email
                    </label>
                    <Field
                      type="email"
                      className="form-control form-control-solid h-auto py-5 px-6 rounded-lg"
                      name="email"
                      placeholder="Adresse Email"
                    />
                    {touched.email && errors.email && (
                      <div className="text-danger mt-2">{errors.email}</div>
                    )}
                  </div>

                  <div className="form-group mb-5">
                    <label className="font-size-h6 text-primary mb-3">
                      Mot de passe
                    </label>
                    <Field
                      type="password"
                      className="form-control form-control-solid h-auto py-5 px-6 rounded-lg"
                      name="password"
                      placeholder="Mot de passe"
                    />
                    {touched.password && errors.password && (
                      <div className="text-danger mt-2">{errors.password}</div>
                    )}
                  </div>

                  <div className="form-group mb-8">
                    <label className="font-size-h6 text-primary mb-3">
                      Confirmation de mot de passe
                    </label>
                    <Field
                      type="password"
                      className="form-control form-control-solid h-auto py-5 px-6 rounded-lg"
                      name="confirmPassword"
                      placeholder="Confirmation de mot de passe"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <div className="text-danger mt-2">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center mb-8">
                    <div className="border-bottom flex-grow-1"></div>
                    <span className="px-4 text-muted">ou</span>
                    <div className="border-bottom flex-grow-1"></div>
                  </div>

                  <div className="d-flex justify-content-center gap-4 mb-8">
                    <button
                      type="button"
                      className="btn btn-icon btn-light-primary hover-scale p-5 ml-4"
                    >
                      <i className="fab fa-google fs-4"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-light-primary hover-scale p-5 ml-4"
                    >
                      <i className="fab fa-facebook-f fs-4"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-light-primary hover-scale p-5 ml-4"
                    >
                      <i className="fab fa-apple fs-4"></i>
                    </button>
                  </div>

                  <div className="form-group mb-8">
                    <label className="checkbox checkbox-outline checkbox-primary">
                      <Field type="checkbox" name="acceptTerms" />
                      <span></span>
                      <span className="ml-2">
                        J'accepte les{" "}
                        <a
                          href="https://myconnectt.fr/mentions-legales/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-weight-bold"
                        >
                          conditions d'utilisation
                        </a>
                      </span>
                    </label>
                    {touched.acceptTerms && errors.acceptTerms && (
                      <div className="text-danger mt-2">
                        {errors.acceptTerms}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!values.acceptTerms}
                    className="btn btn-primary btn-block font-weight-bold py-5 px-8 rounded-lg"
                  >
                    Inscription
                    {loading && (
                      <span className="ml-3 spinner spinner-white"></span>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          )}
          <div className="separator separator-solid my-7"></div>

          <div className="text-center mt-5">
            <span className="text-muted mr-4">
              <FormattedMessage id="TEXT.HAVE.MYCONNECTT.ACCOUNT" />
            </span>
            <Link to="/auth/login" className="text-primary font-weight-bold">
              <FormattedMessage id="TEXT.LOGIN.ACCOUNT" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default injectIntl(connect(null, null)(Registration));

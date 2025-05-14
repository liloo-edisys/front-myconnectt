import React, { useState } from "react";

import { registerAccount } from "api/shared/AuthApi";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import isNullOrEmpty from "../../../../utils/isNullOrEmpty";
import axios from "axios";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

function Registration(props) {
  const [selectedCompany, setselectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { intl, history } = props;
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Reset error if input is empty
    if (!value) {
      setSearchError("");
      setSearchResults(null);
      return;
    }

    // Validate SIRET (must be exactly 14 digits)
    if (value.match(/^[0-9]+$/)) {
      if (value.length < 14) {
        setSearchError("Le SIRET doit contenir 14 chiffres");
        setSearchResults(null);
        return;
      } else if (value.length > 14) {
        setSearchError("Le SIRET ne peut pas dépasser 14 chiffres");
        setSearchResults(null);
        return;
      }
    }

    // Validate minimal length for general search
    if (value.length < 3) {
      setSearchError("La recherche doit contenir au moins 3 caractères");
      setSearchResults(null);
      return;
    }

    // If we reach here, there are no errors
    setSearchError("");
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.length >= 3) {
      fetchCompanies(searchQuery, 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setPaginationLoading(true);
    fetchCompanies(searchQuery, page);
  };

  const fetchCompanies = (query, page) => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_WEBAPI_URL}/api/Insee/search?query=${query}&page=${page}`
      )
      .then((res) => {
        setLoading(false);
        setPaginationLoading(false);
        setSearchResults(res.data);

        // Calculate total pages if available in header
        if (
          res.data.header &&
          res.data.header.total &&
          res.data.header.nombre
        ) {
          const pages = Math.ceil(
            res.data.header.total / res.data.header.nombre
          );
          setTotalPages(pages);
        }
        if (res.status === 204) {
          setSearchError("Aucune entreprise trouvée avec cette recherche");
        }
      })
      .catch((error) => {
        setLoading(false);
        setPaginationLoading(false);
        if (error.response && error.response.status === 404) {
          setSearchError("Aucune entreprise trouvée avec cette recherche");
        } else {
          setSearchError("Erreur lors de la recherche d'entreprises");
        }
        console.error("Error fetching companies:", error);
      });
  };

  const selectCompany = (company) => {
    const companyData = {
      nom_complet:
        company.uniteLegale.denominationUniteLegale ||
        `${company.uniteLegale.prenom1UniteLegale || ""} ${company.uniteLegale
          .nomUniteLegale || ""}`,
      siege: {
        siret: company.siret,
        libelle_commune:
          company.adresseEtablissement.libelleCommuneEtablissement,
        adresse_complete: `${company.adresseEtablissement
          .numeroVoieEtablissement || ""} ${company.adresseEtablissement
          .typeVoieEtablissement || ""} ${company.adresseEtablissement
          .libelleVoieEtablissement || ""}`,
        complement_adresse:
          company.adresseEtablissement.complementAdresseEtablissement || "",
        code_postal: company.adresseEtablissement.codePostalEtablissement,
      },
      libelle_nature_juridique_entreprise:
        company.uniteLegale.categorieJuridiqueUniteLegale,
      position: company.adresseEtablissement.geoPositionWGS84 || null,
    };
    setselectedCompany(companyData);
  };

  // Modifiez les initialValues pour inclure la position
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
        : "_",
    position:
      selectedCompany && selectedCompany.position
        ? selectedCompany.position
        : null,
  };

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

  const renderPagination = () => {
    if (
      !searchResults ||
      !searchResults.etablissements ||
      searchResults.etablissements.length === 0
    ) {
      return null;
    }

    // Calculate page numbers to show
    const pages = [];
    const maxVisibleButtons = 5;
    const halfVisibleButtons = Math.floor(maxVisibleButtons / 2);

    let startPage = Math.max(1, currentPage - halfVisibleButtons);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust start page if we have fewer pages at the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || paginationLoading}
              >
                {paginationLoading && currentPage > 1 ? (
                  <span className="spinner spinner-white spinner-sm mr-2"></span>
                ) : null}
                Précédent
              </button>
            </li>

            {startPage > 1 && (
              <>
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(1)}
                    disabled={paginationLoading}
                  >
                    1
                  </button>
                </li>
                {startPage > 2 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
              </>
            )}

            {pages.map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page)}
                  disabled={paginationLoading}
                >
                  {paginationLoading && currentPage !== page ? (
                    page
                  ) : currentPage === page && paginationLoading ? (
                    <span className="spinner spinner-white spinner-sm mr-4"></span>
                  ) : (
                    page
                  )}
                </button>
              </li>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={paginationLoading}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || paginationLoading}
              >
                {paginationLoading && currentPage < totalPages ? (
                  <span className="spinner spinner-white spinner-sm mr-2"></span>
                ) : null}
                Suivant
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

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

      {/* Right Side - Form Section with fixed scrolling */}
      <div
        className="d-flex flex-column flex-grow-1 justify-content-start align-items-center p-10"
        style={{ marginLeft: "550px", overflowY: "auto", height: "100vh" }}
      >
        <div className="max-w-850px w-100 mb-10">
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
            {/* Recherche d'entreprise par nom ou SIRET */}
            <div className="form-group mb-5">
              <form onSubmit={handleSearchSubmit} className="d-flex">
                <input
                  type="text"
                  className="form-control form-control-solid h-auto  rounded-lg border mr-3 border-primary"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Nom  d'entreprise ou SIRET"
                />
                <button
                  type="submit"
                  className="btn btn-primary px-6"
                  disabled={
                    searchQuery.length < 3 ||
                    (searchQuery.match(/^[0-9]+$/) &&
                      searchQuery.length !== 14) ||
                    loading
                  }
                >
                  {loading ? (
                    <span className="spinner spinner-white mr-6"></span>
                  ) : (
                    <i className="fa fa-search"></i>
                  )}
                </button>
              </form>

              {searchError && (
                <div className="text-danger mt-2">{searchError}</div>
              )}

              {/* Display company results with max height to enable scrolling */}
              {searchResults &&
                searchResults.etablissements &&
                searchResults.etablissements.length > 0 && (
                  <div className="mt-4 border rounded">
                    <h4 className="font-weight-bold p-4 bg-light-primary border-bottom">
                      Entreprises trouvées
                    </h4>
                    <div
                      className="company-list"
                      style={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                      {searchResults.etablissements.map((company, index) => (
                        <div
                          key={company.siret}
                          className={`p-4 cursor-pointer hover-bg-primary ${
                            index < searchResults.etablissements.length - 1
                              ? "border-bottom"
                              : ""
                          }`}
                          onClick={() => selectCompany(company)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h5 className="font-weight-bold mb-1">
                                {company.uniteLegale.denominationUniteLegale ||
                                  `${company.uniteLegale.prenom1UniteLegale ||
                                    ""} ${company.uniteLegale.nomUniteLegale ||
                                    ""}` ||
                                  "Nom non disponible"}
                              </h5>
                              <p className="mb-1 text-muted">
                                SIRET: {company.siret}
                              </p>
                              <p className="mb-0">
                                {
                                  company.adresseEtablissement
                                    .codePostalEtablissement
                                }{" "}
                                {
                                  company.adresseEtablissement
                                    .libelleCommuneEtablissement
                                }
                              </p>
                            </div>
                            <button
                              className="btn btn-sm btn-light-primary ml-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectCompany(company);
                              }}
                            >
                              Sélectionner
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination with loading indicator */}
                    {renderPagination()}
                  </div>
                )}

              {searchResults &&
                (!searchResults.etablissements ||
                  searchResults.etablissements.length === 0) && (
                  <div className="alert alert-warning mt-4">
                    Aucune entreprise trouvée avec ces critères de recherche.
                  </div>
                )}

              {/* Affichage de l'entreprise sélectionnée */}
              {selectedCompany && (
                <div className="mt-4 p-5 bg-light-primary rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="font-weight-bold mb-0">
                      Entreprise sélectionnée :
                    </h4>
                    <button
                      className="btn btn-sm btn-icon btn-light-danger"
                      onClick={() => setselectedCompany(null)}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
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
                    if (response && response.status === 200) {
                      localStorage.setItem("userEmail", values.email);
                      history.push("/auth/email-confirm");
                    } else {
                      setSubmitting(false);
                    }
                  })
                  .catch((error) => {
                    setSubmitting(false);
                    disableLoading();
                    console.error("Erreur lors de l'inscription:", error);
                  });
              }}
            >
              {({ values, touched, errors, handleSubmit }) => (
                <Form className="form" onSubmit={handleSubmit}>
                  <div className="form-group mb-5">
                    <label className="font-size-h6 text-primary mb-3">
                      Adresse Email
                    </label>
                    <Field
                      type="email"
                      className="form-control form-control-solid h-auto  rounded-lg border border-primary"
                      name="email"
                      placeholder="Adresse Email"
                    />
                    {touched.email && errors.email && (
                      <div className="text-danger mt-2">{errors.email}</div>
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
                    <div>
                      <Field type="checkbox" name="acceptTerms" />

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
                    </div>
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

          <div className="text-center mt-5 mb-10">
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

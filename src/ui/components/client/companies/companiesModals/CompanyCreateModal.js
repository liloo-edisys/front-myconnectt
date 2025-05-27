import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { ModalProgressBar } from "metronic/_partials/controls";
import { useIntl, FormattedMessage } from "react-intl";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { Formik, Form, Field } from "formik";
import { Input, Select } from "metronic/_partials/controls";
import * as Yup from "yup";
import axios from "axios";
import {
  getAPE,
  getInvoicesTypes,
  getAccountGroups,
  getPaymentChoices
} from "actions/shared/ListsActions";
import isNullOrEmpty from "../../../../../utils/isNullOrEmpty";
import LocationSearchInput from "../companiesForms/location-search-input/LocationSearchInput";

// Header Component
export function CompanyCreateHeader() {
  const intl = useIntl();
  const { actionsLoading } = useSelector(
    state => ({
      actionsLoading: state.companies.loading
    }),
    shallowEqual
  );

  const [title, setTitle] = useState("");

  useEffect(() => {
    let _title = intl.formatMessage({ id: "COMPANIES.ADD.ACCOUNT" });
    setTitle(_title);
  }, [actionsLoading, intl]);

  return (
    <>
      {actionsLoading && <ModalProgressBar />}
      <Modal.Header closeButton>
        <Modal.Title id="example-modal-sizes-title-lg">{title}</Modal.Title>
      </Modal.Header>
    </>
  );
}

// Form Component
function CompanyCreateForm({ createCompany, onHide }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const TENANTID = +process.env.REACT_APP_TENANT_ID;

  // États pour la recherche d'entreprise
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // États pour le formulaire détaillé
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Données Redux pour le formulaire détaillé
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

  useEffect(() => {
    // Charger les données nécessaires pour le formulaire détaillé
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
  }, [dispatch, apeNumber, invoiceTypes, accountGroups, paymentChoices]);

  const handleSearchChange = e => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value) {
      setSearchError("");
      setSearchResults(null);
      return;
    }

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

    if (value.length < 3) {
      setSearchError("La recherche doit contenir au moins 3 caractères");
      setSearchResults(null);
      return;
    }

    setSearchError("");
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.length >= 3) {
      fetchCompanies(searchQuery, 1);
    }
  };

  const handlePageChange = page => {
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
      .then(res => {
        setLoading(false);
        setPaginationLoading(false);
        setSearchResults(res.data);

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
      .catch(error => {
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

  const selectCompany = company => {
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
        code_postal: company.adresseEtablissement.codePostalEtablissement
      },
      libelle_nature_juridique_entreprise:
        company.uniteLegale.categorieJuridiqueUniteLegale,
      position: company.adresseEtablissement.geoPositionWGS84 || null,
      activite_principale: company.uniteLegale.activitePrincipaleUniteLegale,
      etablissement_siege: company.etablissementSiege,
      etat_administratif: company.etatAdministratifEtablissement
    };
    setSelectedCompany(companyData);
    setAddress(companyData.siege.adresse_complete);
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

  const paymentConditions = [
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.BILL" }), id: 0 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.BILL" }), id: 1 },
    { name: intl.formatMessage({ id: "PAYMENT.60.DAYS.BILL" }), id: 2 },
    { name: intl.formatMessage({ id: "PAYMENT.30.DAYS.END.MONTH" }), id: 3 },
    { name: intl.formatMessage({ id: "PAYMENT.45.DAYS.END.MONTH" }), id: 4 },
    { name: intl.formatMessage({ id: "PAYMENT.BILL.RECEIVED" }), id: 5 }
  ];

  const formatTva = value => {
    if (!value) return "";
    let siren = value.substring(0, value.length - 5);
    let test = [12 + 3 * (siren % 97)] % 97;
    let intraTVA = `FR${test}${siren}`;
    return intraTVA;
  };

  const initialValues = {
    name:
      selectedCompany && selectedCompany.nom_complet
        ? selectedCompany.nom_complet
        : "",
    city:
      selectedCompany && selectedCompany.siege.libelle_commune
        ? selectedCompany.siege.libelle_commune
        : "",
    siret:
      selectedCompany && selectedCompany.siege.siret
        ? selectedCompany.siege.siret
        : "",
    address:
      selectedCompany && selectedCompany.siege.adresse_complete
        ? selectedCompany.siege.adresse_complete
        : "",
    additionaladdress:
      selectedCompany && selectedCompany.siege.complement_adresse
        ? selectedCompany.siege.complement_adresse
        : "",
    postalCode:
      selectedCompany && selectedCompany.siege.code_postal
        ? selectedCompany.siege.code_postal
        : "",
    companyStatus:
      selectedCompany && selectedCompany.libelle_nature_juridique_entreprise
        ? selectedCompany.libelle_nature_juridique_entreprise
        : "",
    apeNumber:
      selectedCompany && selectedCompany.activite_principale
        ? selectedCompany.activite_principale
        : "",
    tvaNumber:
      selectedCompany && selectedCompany.siege.siret
        ? formatTva(selectedCompany.siege.siret)
        : "",
    position:
      selectedCompany && selectedCompany.position
        ? selectedCompany.position
        : null,
    phoneNumber: "",
    description: "",
    paymentCondition: 0,
    anaelID: "",
    invoiceTypeID: 1,
    accountGroupID: null,
    paymentChoiceID: 1,
    coefficient: ""
  };

  // Validation schema étendu
  const CompanySchema = Yup.object().shape({
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
        val => val && val.length === 5
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })),
    city: Yup.string().required(
      intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" })
    ),
    phoneNumber: Yup.string()
      .matches(
        /^(\+33|0)(1|2|3|4|5|6|7|8|9)\d{8}$/,
        intl.formatMessage({ id: "MESSAGE.FORMAT.PHONE" })
      )
      .required(intl.formatMessage({ id: "VALIDATION.REQUIRED_FIELD" }))
  });

  const renderPagination = () => {
    if (
      !searchResults ||
      !searchResults.etablissements ||
      searchResults.etablissements.length === 0
    ) {
      return null;
    }

    const pages = [];
    const maxVisibleButtons = 5;
    const halfVisibleButtons = Math.floor(maxVisibleButtons / 2);

    let startPage = Math.max(1, currentPage - halfVisibleButtons);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

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

            {pages.map(page => (
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
                    <span className="spinner spinner-white spinner-sm"></span>
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
    <>
      <Modal.Body>
        {/* Section de recherche d'entreprise */}
        {!selectedCompany && (
          <div className="form mb-10">
            <div className="form-group mb-5">
              <form onSubmit={handleSearchSubmit} className="d-flex">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text bg-light">
                      <i className="fa fa-search text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-lg h-auto"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Rechercher par nom d'entreprise ou SIRET..."
                  />
                  <div className="input-group-append">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={
                        searchQuery.length < 3 ||
                        (searchQuery.match(/^[0-9]+$/) &&
                          searchQuery.length !== 14) ||
                        loading
                      }
                    >
                      {loading ? (
                        <span className="spinner spinner-white"></span>
                      ) : (
                        "Rechercher"
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {searchError && (
                <div className="alert alert-danger mt-3">
                  <i className="fa fa-exclamation-circle mr-2"></i>
                  {searchError}
                </div>
              )}

              {searchResults &&
                searchResults.etablissements &&
                searchResults.etablissements.length > 0 && (
                  <div className="mt-4">
                    <div className="card">
                      <div className="card-header bg-light-primary">
                        <h4 className="card-title mb-0">
                          <i className="fa fa-building mr-2"></i>
                          Entreprises trouvées (
                          {searchResults.header?.total ||
                            searchResults.etablissements.length}
                          )
                        </h4>
                      </div>
                      <div
                        className="list-group list-group-flush"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        {searchResults.etablissements.map((company, index) => (
                          <div
                            key={company.siret}
                            className="list-group-item list-group-item-action"
                            onClick={() => selectCompany(company)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex align-items-start">
                              <div className="d-flex align-items-center justify-content-center bg-light-primary rounded p-3 mr-3">
                                <i className="fa fa-building text-primary"></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h5 className="mb-1">
                                      {company.uniteLegale
                                        .denominationUniteLegale ||
                                        `${company.uniteLegale
                                          .prenom1UniteLegale || ""} ${company
                                          .uniteLegale.nomUniteLegale || ""}` ||
                                        "Nom non disponible"}
                                    </h5>
                                    <div className="small text-muted">
                                      <i className="fa fa-barcode mr-1"></i>
                                      SIRET: {company.siret}
                                    </div>
                                    <div className="small text-muted mt-1">
                                      <i className="fa fa-map-marker-alt mr-1"></i>
                                      {
                                        company.adresseEtablissement
                                          .codePostalEtablissement
                                      }{" "}
                                      {
                                        company.adresseEtablissement
                                          .libelleCommuneEtablissement
                                      }
                                    </div>
                                    {company.etablissementSiege && (
                                      <span className="badge badge-success mt-1">
                                        <i className="fa fa-star mr-1"></i>
                                        Siège social
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    className="btn btn-sm btn-light-primary ml-3"
                                    onClick={e => {
                                      e.stopPropagation();
                                      selectCompany(company);
                                    }}
                                  >
                                    <i className="fa fa-plus mr-1"></i>
                                    Sélectionner
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {renderPagination()}
                  </div>
                )}

              {searchResults &&
                (!searchResults.etablissements ||
                  searchResults.etablissements.length === 0) && (
                  <div className="alert alert-warning mt-4">
                    <i className="fa fa-info-circle mr-2"></i>
                    Aucune entreprise trouvée avec ces critères de recherche.
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Formulaire détaillé une fois l'entreprise sélectionnée */}
        {selectedCompany && (
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={CompanySchema}
            onSubmit={(values, { setSubmitting }) => {
              let data = {
                ...values,
                accountGroupID: parseInt(values.accountGroupID) || null,
                tenantID: TENANTID
              };
              createCompany(data)
                .then(() => {
                  setSubmitting(false);
                  onHide();
                })
                .catch(error => {
                  setSubmitting(false);
                  console.error("Erreur lors de la création:", error);
                });
            }}
          >
            {({
              handleSubmit,
              errors,
              touched,
              values,
              setFieldValue,
              setFieldTouched,
              isSubmitting
            }) => (
              <>
                {/* Entreprise sélectionnée */}
                <div className="mb-5">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 text-white">
                          <i className="fa fa-check-circle mr-2 text-white"></i>
                          Entreprise sélectionnée
                        </h4>
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => setSelectedCompany(null)}
                        >
                          <i className="fa fa-times mr-1"></i>
                          Changer
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="text-dark font-weight-bold">
                        {selectedCompany.nom_complet}
                      </h5>
                      <p className="text-muted mb-0">
                        SIRET: {selectedCompany.siege.siret} -{" "}
                        {selectedCompany.siege.libelle_commune}
                      </p>
                    </div>
                  </div>
                </div>

                <Form className="form form-label-right">
                  <div className="form-group row">
                    {/* Raison sociale */}
                    <div className="col-lg-4">
                      <label className="col-form-label">
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
                      <label className="col-form-label">
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
                      <label className="col-form-label">
                        <FormattedMessage id="MODEL.ACCOUNT.APENUMBER" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl far fa-edit text-primary"></i>
                          </span>
                        </div>
                        <Select className="form-control" name="apeNumber">
                          <option disabled value="">
                            --{" "}
                            {intl.formatMessage({
                              id: "COLUMN.APE.NAF.NUMBER"
                            })}{" "}
                            --
                          </option>
                          {apeNumber &&
                            apeNumber.map(choice => {
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
                      <label className="col-form-label">
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
                      <label className="col-form-label">
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
                    </div>
                  </div>

                  <div className="separator separator-solid-primary mt-10 mb-5 mx-30"></div>

                  <div className="form-group row">
                    {/* Adresse */}
                    <div className="col-lg-6">
                      <label className="col-form-label">
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
                    {/* Complément d'adresse */}
                    <div className="col-lg-6">
                      <label className="col-form-label">
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
                      <label className="col-form-label">
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
                      <label className="col-form-label">
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
                          disabled
                          placeholder={intl.formatMessage({
                            id: "MODEL.ACCOUNT.CITY"
                          })}
                        />
                      </div>
                    </div>
                    {/* numéro de téléphone de la société */}
                    <div className="col-lg-4">
                      <label className="col-form-label">
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
                            phoneNumber &&
                            phoneNumber.match(/.{1,2}/g).join(" ")
                          }
                          component={Input}
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
                      <label className="col-form-label">
                        <FormattedMessage id="MODEL.ACCOUNT.PAYMENT_CHOICE" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <Select className="form-control" name="paymentChoiceID">
                          {paymentChoices &&
                            paymentChoices.map(choice => {
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
                      <label className="col-form-label">
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
                      <label className="col-form-label">
                        <FormattedMessage id="MODEL.ACCOUNT.INVOICE_TYPE" />
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="icon-xl fas fa-list text-primary"></i>
                          </span>
                        </div>
                        <Select className="form-control" name="invoiceTypeID">
                          {invoiceTypes &&
                            invoiceTypes.map(invoice => {
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
                      <label className="col-form-label">
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
                            id: "MODEL.ACCOUNT.GROUP"
                          })}
                        />
                      </div>
                    </div>
                    {/* description */}
                    <div className="col-lg-4">
                      <label className="col-form-label">
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
                      <label className="col-form-label">
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

                  <Modal.Footer>
                    <button
                      type="button"
                      onClick={onHide}
                      className="btn btn-light-primary font-weight-bold px-9 py-4 my-3 mx-4 btn-shadow"
                    >
                      <FormattedMessage id="BUTTON.CANCEL" />
                    </button>
                    <button
                      type="submit"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner spinner-white mr-3"></span>
                          <FormattedMessage id="TEXT.LOADING" />
                        </>
                      ) : (
                        <FormattedMessage id="TEXT.CREATE" />
                      )}
                    </button>
                  </Modal.Footer>
                </Form>
              </>
            )}
          </Formik>
        )}
      </Modal.Body>
    </>
  );
}

// Main Modal Component
function CompanyCreateModal({ show, onHide, createCompany }) {
  const isOpen = show === "new" || show === true;

  return (
    <Modal
      size="lg"
      show={isOpen}
      onHide={onHide}
      aria-labelledby="example-modal-sizes-title-lg"
    >
      <CompanyCreateHeader />
      <CompanyCreateForm createCompany={createCompany} onHide={onHide} />
    </Modal>
  );
}

export default CompanyCreateModal;

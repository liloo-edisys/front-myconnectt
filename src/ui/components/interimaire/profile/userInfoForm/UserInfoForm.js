import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

const UserInfoForm = () => {
  // États
  const [view, setView] = useState("options");
  const [showPersonal, setShowPersonal] = useState(true);
  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    addressObject: null, // Pour stocker l'objet complet d'adresse
    nationality: "",
    nationalityId: null, // Pour stocker l'ID du pays
    position: "",
    skills: "",
    searchZone: 50,
  });
  const [errors, setErrors] = useState({});
  const [importedFile, setImportedFile] = useState(null);
  const [cvIdTemporary, setCvIdTemporary] = useState(""); // Pour stocker l'ID du CV
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(-1);
  const [countrySearchLoading, setCountrySearchLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null); // Pour les erreurs de soumission

  // États pour les cases à cocher
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [legalAgeTerms, setLegalAgeTerms] = useState(false);

  // Références
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const addressSuggestionsRef = useRef(null);
  const countryInputRef = useRef(null);
  const countryListRef = useRef(null);

  const history = useHistory();

  // Fonctions de traitement des données
  const filterCountries = (query) => {
    if (!query || query.length < 2) {
      setFilteredCountries([]);
      return;
    }

    // Normalisation de la requête (conversion en minuscules, sans accents)
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Filtrage des pays
    const filtered = countries.filter((country) => {
      const normalizedName = country.frenchName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return normalizedName.includes(normalizedQuery);
    });

    // Limiter à 10 résultats pour la performance
    setFilteredCountries(filtered.slice(0, 10));
  };

  // Fonction pour gérer les changements des cases à cocher
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "acceptTerms") {
      setAcceptTerms(checked);
    } else if (name === "legalAgeTerms") {
      setLegalAgeTerms(checked);
    }
  };

  // Fonction pour sélectionner un pays
  const selectCountry = (country) => {
    setFormValues({
      ...formValues,
      nationality: country.frenchName,
      nationalityId: country.id, // Stocker l'ID pour l'API
    });
    setShowCountryDropdown(false);
    setSelectedCountryIndex(-1);

    // Focus sur l'input après sélection
    if (countryInputRef.current) {
      countryInputRef.current.focus();
    }
  };

  // Fonction pour sélectionner une adresse
  const selectAddress = (suggestion) => {
    setFormValues({
      ...formValues,
      address: suggestion.freeformAddress,
      addressObject: suggestion, // Stocker l'objet complet
    });
    setAddressSuggestions([]);
    setSelectedSuggestionIndex(-1);

    // Focus sur l'input après sélection
    if (addressInputRef.current) {
      addressInputRef.current.focus();
    }
  };

  // Fonction pour récupérer la géolocalisation
  const getMyLocation = async () => {
    setLocationLoading(true);

    try {
      const response = await axios.post(
        "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Map/MyLocalization",
        "",
        {
          headers: {
            accept: "/",
          },
        }
      );

      console.log("Location response:", response.data);

      if (response.data) {
        setFormValues({
          ...formValues,
          address: response.data.freeformAddress,
          addressObject: response.data, // Stocker l'objet complet
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la localisation:",
        error
      );
      alert(
        "Impossible de récupérer votre localisation. Veuillez saisir votre adresse manuellement."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Fonction pour envoyer le CV à l'API
  const uploadCV = async (file) => {
    if (!file) return null;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Applicant/scan/cv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("CV upload response:", response.data);

      // Si l'API retourne un ID pour le CV, le stocker
      if (response.data && response.data.id) {
        setCvIdTemporary(response.data.id);
      }

      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement du CV:", error);
      setUploadError("Erreur lors de l'envoi du CV. Veuillez réessayer.");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour remplir le formulaire avec les données de l'API
  const fillFormWithApiData = (data) => {
    if (!data) return;

    // Mise à jour des valeurs du formulaire avec les données de l'API
    setFormValues((prevValues) => ({
      ...prevValues,
      firstname: data.firstname || prevValues.firstname,
      lastname: data.lastname || prevValues.lastname,
      email: data.email || prevValues.email,
      phone: data.phonenumber || prevValues.phone,
      position: data.jobTitle || prevValues.position,
      skills: data.skills ? data.skills.join(", ") : prevValues.skills,
    }));
  };

  // Fonction pour récupérer les suggestions d'adresses
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
      // Réinitialiser l'index de sélection lorsque de nouvelles suggestions sont chargées
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      setAddressSuggestions([]);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "searchZone" ? parseInt(value, 10) : value;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Supprimer l'erreur si le champ est rempli
    if (value && errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Gérer l'importation de fichier
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Vérifier que c'est un PDF
      if (file.type !== "application/pdf") {
        // Utiliser une alerte plus élégante
        setUploadError(
          "Seuls les fichiers PDF sont acceptés. Veuillez sélectionner un fichier PDF."
        );
        e.target.value = ""; // Réinitialiser l'input
        setSelectedFileName("");
        setImportedFile(null);

        // Effacer le message d'erreur après 5 secondes
        setTimeout(() => {
          setUploadError(null);
        }, 5000);

        return;
      }

      // Vérifier la taille du fichier (limite à 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(
          "Le fichier est trop volumineux. La taille maximale est de 5 MB."
        );
        e.target.value = ""; // Réinitialiser l'input
        setSelectedFileName("");
        setImportedFile(null);

        // Effacer le message d'erreur après 5 secondes
        setTimeout(() => {
          setUploadError(null);
        }, 5000);

        return;
      }

      setImportedFile(file);
      setSelectedFileName(file.name);
      setUploadError(null); // Effacer toute erreur précédente
    }
  };

  // Valider le formulaire - informations personnelles
  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!formValues.firstname) newErrors.firstname = "Le prénom est requis";
    if (!formValues.lastname) newErrors.lastname = "Le nom est requis";
    if (!formValues.gender) newErrors.gender = "Le sexe est requis";
    if (!formValues.phone) newErrors.phone = "Le téléphone est requis";
    if (!formValues.email) newErrors.email = "L'email est requis";
    if (!formValues.address) newErrors.address = "L'adresse est requise";
    if (!formValues.nationality)
      newErrors.nationality = "La nationalité est requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Valider le formulaire - informations professionnelles
  const validateProfessionalInfo = () => {
    const newErrors = {};

    if (!formValues.position) newErrors.position = "Le poste est requis";
    if (!formValues.skills) newErrors.skills = "Les compétences sont requises";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Récupérer la liste des pays lors du chargement initial
  useEffect(() => {
    const fetchCountries = async () => {
      setCountrySearchLoading(true);
      try {
        const response = await axios.get(
          "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Country",
          {
            headers: {
              accept: "/",
            },
          }
        );

        // Tri par ordre alphabétique des noms français
        const sortedCountries = response.data.sort((a, b) =>
          a.frenchName.localeCompare(b.frenchName)
        );

        setCountries(sortedCountries);
        console.log("Pays chargés:", sortedCountries.length);
      } catch (error) {
        console.error("Erreur lors du chargement des pays:", error);
      } finally {
        setCountrySearchLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Effet pour fermer les suggestions lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Fermer la liste des adresses si on clique en dehors
      const addressContainer = document.getElementById("address-container");
      if (addressContainer && !addressContainer.contains(event.target)) {
        setAddressSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }

      // Fermer la liste des pays si on clique en dehors
      const nationalityContainer = document.getElementById(
        "nationality-container"
      );
      if (
        nationalityContainer &&
        !nationalityContainer.contains(event.target)
      ) {
        setShowCountryDropdown(false);
        setSelectedCountryIndex(-1);
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

      // Faire défiler vers l'élément sélectionné
      if (selectedElement) {
        // Vérifier si l'élément est en dessous de la zone visible
        if (
          selectedElement.offsetTop + selectedElement.clientHeight >
          container.scrollTop + container.clientHeight
        ) {
          container.scrollTop =
            selectedElement.offsetTop +
            selectedElement.clientHeight -
            container.clientHeight;
        }
        // Vérifier si l'élément est au-dessus de la zone visible
        else if (selectedElement.offsetTop < container.scrollTop) {
          container.scrollTop = selectedElement.offsetTop;
        }
      }
    }
  }, [selectedSuggestionIndex]);

  // Effet similaire pour les suggestions de pays
  useEffect(() => {
    if (
      selectedCountryIndex !== -1 &&
      countryListRef.current &&
      countryListRef.current.children[selectedCountryIndex]
    ) {
      const container = countryListRef.current;
      const selectedElement = container.children[selectedCountryIndex];

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
  }, [selectedCountryIndex]);

  // Valider le CV et passer au formulaire
  const validateAndProceed = async () => {
    if (!importedFile) {
      alert("Veuillez importer un CV avant de continuer.");
      return;
    }

    setUploading(true);
    try {
      const cvData = await uploadCV(importedFile);
      if (cvData) {
        fillFormWithApiData(cvData);
        setView("form");
      }
    } catch (error) {
      console.error("Erreur lors du traitement du CV:", error);
    } finally {
      setUploading(false);
    }
  };

  // Passer aux informations professionnelles
  const handleContinue = () => {
    if (validatePersonalInfo()) {
      setShowPersonal(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Vérifier si les conditions sont acceptées
    if (!acceptTerms || !legalAgeTerms) {
      setSubmitError(
        "Vous devez accepter les conditions générales et certifier avoir l'âge légal pour continuer."
      );
      return;
    }

    if (validateProfessionalInfo()) {
      try {
        // Préparation des données pour l'API selon le format requis
        const requestData = {
          tenantID: 1, // Fixé à 1 comme demandé
          lastName: formValues.lastname,
          firstName: formValues.firstname,
          email: formValues.email,
          mobilePhone: formValues.phone,
          sexe:
            formValues.gender === "M" ? 0 : formValues.gender === "F" ? 1 : 0, // Conversion
          nationalityID:
            formValues.nationalityId ||
            countries.find((c) => c.frenchName === formValues.nationality)
              ?.id ||
            0,
          localization: formValues.addressObject
            ? {
                postalCode: formValues.addressObject.postalCode || "",
                countryCode: formValues.addressObject.countryCode || "",
                country: formValues.addressObject.country || "",
                localName: formValues.addressObject.localName || "",
                freeformAddress: formValues.addressObject.freeformAddress || "",
                position: formValues.addressObject.position || "",
              }
            : {
                // Fallback si pas d'objet complet
                freeformAddress: formValues.address,
                postalCode: "",
                countryCode: "",
                country: "",
                localName: "",
                position: "",
              },
          jobTitle: formValues.position,
          searchZone: parseInt(formValues.searchZone, 10) || 50,
          skills: formValues.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          cV_ID_TEMPORARY:
            cvIdTemporary || (importedFile ? importedFile.name : ""),
        };

        console.log("Données à envoyer à l'API:", requestData);

        // Appel à l'API d'enregistrement
        const response = await axios.post(
          "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Applicant/Register",
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
              accept: "*/*",
            },
          }
        );

        console.log("Réponse de l'API d'enregistrement:", response.data);
        setFormSubmitted(true);

        // Redirection vers /int-register
        setTimeout(() => {
          window.location.href = "/auth/int-register";
        }, 1500);
      } catch (error) {
        console.error("Erreur lors de la soumission:", error);

        // Affichage d'une erreur détaillée à l'utilisateur
        let errorMessage =
          "Une erreur est survenue lors de l'enregistrement de vos informations.";

        if (error.response) {
          // Erreur de réponse serveur (4xx, 5xx)
          errorMessage += ` Erreur ${error.response.status}: ${error.response
            .data?.message || error.response.statusText}`;
        } else if (error.request) {
          // Pas de réponse reçue
          errorMessage +=
            " Impossible de contacter le serveur. Vérifiez votre connexion internet.";
        }

        setSubmitError(errorMessage);
      }
    }
  };

  // Si le formulaire a été soumis avec succès
  if (formSubmitted) {
    return (
      <div className="container py-4">
        <div className="alert alert-success text-center" role="alert">
          <h4 className="alert-heading">Merci !</h4>
          <p>Vos informations ont été enregistrées avec succès.</p>
          <p>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  // Écran d'options
  if (view === "options") {
    return (
      <div className="container py-4">
        <h1 className="text-center mb-4 text-primary">
          Formulaire d'inscription
        </h1>
        <p className="text-muted font-weight-bold text-center">
          Inscrivez-vous pour créer votre compte MyConnectt et démarrer votre
          recherche sans plus attendre
        </p>
        <div className="card">
          <div className="card-body">
            <div
              className="border border-2 border-dashed rounded p-5 text-center mb-4"
              style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              onClick={() => document.getElementById("file-upload").click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#0d6efd";
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "";

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  // Simuler un changement de fichier
                  const event = { target: { files: files } };
                  handleFileChange(event);
                }
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>
                {selectedFileName ? "📋" : "📄"}
              </div>
              {selectedFileName ? (
                <div>
                  <p className="text-primary fw-bold mb-1">CV importé</p>
                  <p className="mb-0">{selectedFileName}</p>
                  <button
                    className="btn btn-sm btn-outline-secondary mt-3"
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher d'ouvrir le sélecteur de fichier
                      setImportedFile(null);
                      setSelectedFileName("");
                      setCvIdTemporary("");
                      document.getElementById("file-upload").value = "";
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-1">
                    Ajouter votre CV ici (format PDF uniquement)
                  </p>
                  <p className="text-muted small mb-0">
                    Glissez-déposez un fichier ou cliquez pour parcourir
                  </p>
                  <p className="text-muted small mb-0">Taille maximale: 5 MB</p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            {selectedFileName && (
              <p className="text-center mt-2 text-primary">
                <small>
                  <strong>Fichier sélectionné :</strong> {selectedFileName}
                </small>
              </p>
            )}

            <div className="row">
              <div className="col-6">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setView("form")}
                >
                  Passer sans CV
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-primary w-100"
                  onClick={validateAndProceed}
                  disabled={uploading || !importedFile}
                >
                  {uploading ? "Analyse en cours..." : "Valider"}
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="alert alert-danger mt-3" role="alert">
                {uploadError}
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <p className="mb-0 text-muted">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/auth/int-login"
                className="text-primary font-weight-bold"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire principal
  return (
    <div className="container py-4">
      <h1 className="text-center mb-4 text-primary">
        Formulaire d'inscription
      </h1>
      <p className="text-muted font-weight-bold text-center">
        Inscrivez-vous pour créer votre compte MyConnectt et démarrer votre
        recherche sans plus attendre
      </p>
      <div className="card">
        <div className="card-body">
          <div
            className="text-primary mb-4"
            style={{ cursor: "pointer" }}
            onClick={() => setView("options")}
          >
            ← Retour aux options
          </div>
          <div className="mb-4">
            <input
              id="file-upload-form"
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <h2 className="mb-3">
            {showPersonal
              ? "Informations personnelles"
              : "Informations professionnelles"}
          </h2>

          {submitError && (
            <div className="alert alert-danger" role="alert">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Section Informations personnelles */}
            {showPersonal && (
              <div>
                <div className="">
                  <div className="mb-3">
                    <label htmlFor="firstname" className="form-label">
                      Prénom
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.firstname ? "is-invalid" : ""
                      }`}
                      id="firstname"
                      name="firstname"
                      value={formValues.firstname}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                    />
                    {errors.firstname && (
                      <div className="invalid-feedback">{errors.firstname}</div>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="lastname" className="form-label">
                    Nom
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.lastname ? "is-invalid" : ""
                    }`}
                    id="lastname"
                    name="lastname"
                    value={formValues.lastname}
                    onChange={handleChange}
                    placeholder="Votre nom"
                  />
                  {errors.lastname && (
                    <div className="invalid-feedback">{errors.lastname}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="gender" className="form-label">
                    Sexe
                  </label>
                  <select
                    className={`form-control ${
                      errors.gender ? "is-invalid" : ""
                    }`}
                    id="gender"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                    <option value="O">Autre</option>
                  </select>
                  {errors.gender && (
                    <div className="invalid-feedback">{errors.gender}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    placeholder="Votre numéro de téléphone"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    placeholder="Votre email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Adresse
                  </label>

                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mb-2"
                    onClick={getMyLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Localisation en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-map-marker-alt me-2"></i> Utiliser
                        ma localisation actuelle
                      </>
                    )}
                  </button>

                  <div className="position-relative" id="address-container">
                    <div className="input-group">
                      <input
                        type="text"
                        className={`form-control ${
                          errors.address ? "is-invalid" : ""
                        }`}
                        id="address"
                        name="address"
                        value={formValues.address}
                        onChange={(e) => {
                          // Persistez l'événement pour éviter l'erreur de réutilisation des événements synthétiques
                          e.persist();

                          // Capturer la valeur immédiatement pour éviter les références à un événement nul
                          const query = e.target.value;

                          // Mise à jour du champ
                          handleChange(e);

                          // Configuration du délai pour l'API
                          if (addressTimeoutRef.current) {
                            clearTimeout(addressTimeoutRef.current);
                          }

                          // Si la valeur est trop courte, on ne fait pas la recherche
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
                                addressSuggestions[selectedSuggestionIndex];
                              selectAddress(selected);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setAddressSuggestions([]);
                              setSelectedSuggestionIndex(-1);
                            }
                          }
                        }}
                        placeholder="Commencez à taper votre adresse"
                        autoComplete="off"
                        ref={addressInputRef}
                      />
                      {formValues.address && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            setFormValues({
                              ...formValues,
                              address: "",
                              addressObject: null, // Réinitialiser l'objet d'adresse
                            });
                            setAddressSuggestions([]);
                            // Focus sur l'input après suppression
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

                    {errors.address && (
                      <div className="invalid-feedback d-block">
                        {errors.address}
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
                        onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
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
                            onClick={() => selectAddress(suggestion)}
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
                                  {suggestion.postalCode}, {suggestion.country}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="nationality" className="form-label">
                    Nationalité
                  </label>
                  <div className="position-relative" id="nationality-container">
                    <div className="input-group">
                      <input
                        type="text"
                        className={`form-control ${
                          errors.nationality ? "is-invalid" : ""
                        }`}
                        id="nationality"
                        name="nationality"
                        value={formValues.nationality}
                        onChange={(e) => {
                          // Capture de la valeur
                          const value = e.target.value;

                          // Mise à jour du champ
                          handleChange(e);

                          // Filtrage des pays
                          filterCountries(value);

                          // Afficher la liste déroulante si on tape au moins 2 caractères
                          if (value.length >= 2) {
                            setShowCountryDropdown(true);
                            setSelectedCountryIndex(-1);
                          } else {
                            setShowCountryDropdown(false);
                          }
                        }}
                        onFocus={() => {
                          // Réafficher les suggestions si on a déjà tapé quelque chose
                          if (formValues.nationality.length >= 2) {
                            filterCountries(formValues.nationality);
                            setShowCountryDropdown(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Navigation avec les flèches dans les suggestions
                          if (
                            showCountryDropdown &&
                            filteredCountries.length > 0
                          ) {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              const nextIndex =
                                (selectedCountryIndex + 1) %
                                filteredCountries.length;
                              setSelectedCountryIndex(nextIndex);
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              const prevIndex =
                                selectedCountryIndex === 0
                                  ? filteredCountries.length - 1
                                  : selectedCountryIndex - 1;
                              setSelectedCountryIndex(prevIndex);
                            } else if (
                              e.key === "Enter" &&
                              selectedCountryIndex !== -1
                            ) {
                              e.preventDefault();
                              const selected =
                                filteredCountries[selectedCountryIndex];
                              selectCountry(selected);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setShowCountryDropdown(false);
                              setSelectedCountryIndex(-1);
                            }
                          }
                        }}
                        placeholder="Commencez à taper votre nationalité"
                        autoComplete="off"
                        ref={countryInputRef}
                      />
                      {formValues.nationality && (
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            setFormValues({
                              ...formValues,
                              nationality: "",
                              nationalityId: null, // Réinitialiser l'ID
                            });
                            setShowCountryDropdown(false);
                            // Focus sur l'input après suppression
                            if (countryInputRef.current) {
                              countryInputRef.current.focus();
                            }
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {countrySearchLoading && (
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

                    {errors.nationality && (
                      <div className="invalid-feedback d-block">
                        {errors.nationality}
                      </div>
                    )}

                    {/* Affichage des suggestions de pays */}
                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <div
                        ref={countryListRef}
                        className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
                        style={{
                          zIndex: 1000,
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()} // Empêche la propagation du clic
                      >
                        {filteredCountries.map((country, index) => (
                          <div
                            key={country.id}
                            className={`p-2 border-bottom ${
                              selectedCountryIndex === index ? "bg-light" : ""
                            }`}
                            style={{
                              cursor: "pointer",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={() => setSelectedCountryIndex(index)}
                            onClick={() => selectCountry(country)}
                          >
                            <div className="d-flex align-items-start">
                              <div className="me-2">
                                <span className="flag-icon">
                                  {country.twoLettersISO}
                                </span>
                              </div>
                              <div>
                                <div className="text-primary">
                                  {country.frenchName}
                                </div>
                                <div className="small text-muted">
                                  {country.englishName}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setView("options")}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleContinue}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* Section Informations professionnelles */}
            {!showPersonal && (
              <div>
                <div className="mb-3">
                  <label htmlFor="position" className="form-label">
                    Poste
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.position ? "is-invalid" : ""
                    }`}
                    id="position"
                    name="position"
                    value={formValues.position}
                    onChange={handleChange}
                    placeholder="Votre poste ou fonction"
                  />
                  {errors.position && (
                    <div className="invalid-feedback">{errors.position}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="skills" className="form-label">
                    Compétences
                  </label>
                  <textarea
                    className={`form-control ${
                      errors.skills ? "is-invalid" : ""
                    }`}
                    id="skills"
                    name="skills"
                    rows="5"
                    value={formValues.skills}
                    onChange={handleChange}
                    placeholder="Listez vos compétences, séparées par des virgules"
                  />
                  {errors.skills && (
                    <div className="invalid-feedback">{errors.skills}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="searchZone" className="form-label">
                    Distance maximale de déplacement (en km)
                  </label>
                  <div className="input-group">
                    <input
                      type="range"
                      className="form-range"
                      id="searchZone"
                      name="searchZone"
                      min="50"
                      max="1000"
                      step="50"
                      value={formValues.searchZone}
                      onChange={handleChange}
                      style={{ flex: "1" }}
                    />
                    <span className="input-group-text ms-2 rounded">
                      {formValues.searchZone} km
                    </span>
                  </div>
                  <small className="text-muted">
                    Faites glisser pour définir la distance maximale à laquelle
                    vous êtes prêt(e) à vous déplacer pour un poste
                  </small>
                </div>

                {/* Cases à cocher pour les conditions et l'âge légal */}
                <div className="row d-flex justify-content-center mb-4">
                  <div className="form-group col-lg-12">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        className="m-1"
                        checked={acceptTerms}
                        onChange={handleCheckboxChange}
                      />
                      <span />
                      <div className="mr-1 ml-2 mt-3">
                        <FormattedMessage id="AUTH.REGISTER.RGPD" />
                        <span>
                          <a
                            href="https://myconnectt.fr/mentions-legales/"
                            target="_blank"
                            className="mr-1 ml-2 mt-3"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "underline" }}
                          >
                            Lire +
                          </a>
                        </span>
                      </div>
                    </label>

                    <label className="checkbox mt-3">
                      <input
                        type="checkbox"
                        name="legalAgeTerms"
                        className="m-1"
                        checked={legalAgeTerms}
                        onChange={handleCheckboxChange}
                      />
                      <span />
                      <p className="mr-1 ml-2 mt-3">
                        <FormattedMessage
                          id="AUTH.REGISTER.LEGAL_AGE.TERMS"
                          defaultValue="Je certifie avoir l'âge légal"
                        />
                      </p>
                    </label>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPersonal(true)}
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading || !(acceptTerms && legalAgeTerms)}
                  >
                    {uploading
                      ? "Chargement..."
                      : "Enregistrer mes informations"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserInfoForm;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

/**
 * Composant de recherche d'adresse réutilisable
 * @param {string} address - Valeur actuelle de l'adresse
 * @param {function} setAddress - Fonction pour mettre à jour l'adresse
 * @param {function} setFieldValue - Fonction Formik pour mettre à jour les champs (optionnel)
 * @param {object} intl - Objet d'internationalisation
 * @param {string} placeholder - Texte du placeholder (optionnel)
 * @param {string} className - Classes CSS additionnelles (optionnel)
 * @param {boolean} disabled - Désactiver le champ (optionnel)
 * @param {string} name - Nom du champ pour Formik (optionnel)
 * @param {boolean} hasError - Indique si le champ a une erreur (optionnel)
 * @param {function} onAddressSelect - Callback appelé lors de la sélection d'une adresse avec toutes les données (country, countryCode, freeformAddress, localName, position, postalCode)
 * @param {object} customStyles - Styles personnalisés (optionnel)
 * @param {string} apiUrl - URL de l'API (optionnel, utilise l'URL par défaut si non fournie)
 * @param {string} postalCode - Valeur actuelle du code postal (optionnel)
 * @param {function} setPostalCode - Fonction pour mettre à jour le code postal (optionnel)
 * @param {string} postalCodeName - Nom du champ code postal pour Formik (optionnel, défaut: "postalCode")
 */
const AddressSearchInput = ({
  address = "",
  setAddress,
  setFieldValue,
  intl,
  placeholder,
  className = "",
  disabled = false,
  name = "address",
  hasError = false,
  onAddressSelect,
  customStyles = {},
  apiUrl = "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/api/Map/search",
  postalCode,
  setPostalCode,
  postalCodeName = "postalCode"
}) => {
  // États locaux
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [addressObject, setAddressObject] = useState(null);

  // Références
  const addressTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const addressSuggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Générer un ID unique pour ce composant
  const componentId = useRef(
    `address-container-${Math.random()
      .toString(36)
      .substr(2, 9)}`
  );

  // Fonction pour rechercher les adresses
  const fetchAddressSuggestions = async query => {
    if (!query || query.length < 3) return;

    setAddressSearchLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}?query=${encodeURIComponent(query)}`,
        {
          headers: {
            accept: "text/plain"
          }
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
  const selectAddress = suggestion => {
    const addressText = suggestion.freeformAddress;

    // Mettre à jour l'adresse locale
    setAddress(addressText);
    setAddressObject(suggestion);
    setAddressSuggestions([]);
    setSelectedSuggestionIndex(-1);

    // Mettre à jour le code postal si la fonction est fournie
    if (setPostalCode && suggestion.postalCode) {
      setPostalCode(suggestion.postalCode);
    }

    // Mettre à jour les champs Formik si disponible
    if (setFieldValue) {
      setFieldValue(name, addressText);
      setFieldValue(postalCodeName, suggestion.postalCode || "");
      setFieldValue("city", suggestion.localName || "");
    }

    // Callback personnalisé si fourni - passer toutes les données de l'adresse
    if (onAddressSelect) {
      const addressData = {
        country: suggestion.country || "",
        countryCode: suggestion.countryCode || "",
        freeformAddress: suggestion.freeformAddress || "",
        localName: suggestion.localName || "",
        position: suggestion.position || "",
        postalCode: suggestion.postalCode || ""
      };
      onAddressSelect(addressData);
    }

    // Focus sur l'input après sélection
    if (addressInputRef.current) {
      addressInputRef.current.focus();
    }
  };

  // Fonction pour effacer l'adresse
  const clearAddress = () => {
    setAddress("");
    setAddressObject(null);
    setAddressSuggestions([]);

    // Effacer le code postal si la fonction est fournie
    if (setPostalCode) {
      setPostalCode("");
    }

    if (setFieldValue) {
      setFieldValue(name, "");
      setFieldValue(postalCodeName, "");
      setFieldValue("city", "");
    }

    if (addressInputRef.current) {
      addressInputRef.current.focus();
    }
  };

  // Gestion du changement d'input
  const handleInputChange = e => {
    const query = e.target.value;
    setAddress(query);

    if (setFieldValue) {
      setFieldValue(name, query);
    }

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
  };

  // Gestion de la navigation au clavier
  const handleKeyDown = e => {
    if (addressSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          (selectedSuggestionIndex + 1) % addressSuggestions.length;
        setSelectedSuggestionIndex(nextIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          selectedSuggestionIndex === 0
            ? addressSuggestions.length - 1
            : selectedSuggestionIndex - 1;
        setSelectedSuggestionIndex(prevIndex);
      } else if (e.key === "Enter" && selectedSuggestionIndex !== -1) {
        e.preventDefault();
        const selected = addressSuggestions[selectedSuggestionIndex];
        selectAddress(selected);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setAddressSuggestions([]);
        setSelectedSuggestionIndex(-1);
      }
    }
  };

  // Effet pour fermer les suggestions lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
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

  // Effet pour faire défiler les suggestions visibles
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

  // Styles par défaut
  const defaultStyles = {
    container: {
      position: "relative",
      width: "100%",
      ...customStyles.container
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      ...customStyles.inputGroup
    },
    input: {
      flex: 1,
      ...customStyles.input
    },
    loadingIndicator: {
      position: "absolute",
      right: address ? "35px" : "10px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      ...customStyles.loadingIndicator
    },
    clearButton: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      color: "#6c757d",
      ...customStyles.clearButton
    },
    suggestionsContainer: {
      position: "absolute",
      width: "100%",
      marginTop: "2px",
      backgroundColor: "white",
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      zIndex: 1000,
      maxHeight: "200px",
      overflowY: "auto",
      ...customStyles.suggestionsContainer
    },
    suggestionItem: {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #f8f9fa",
      transition: "background-color 0.2s ease",
      ...customStyles.suggestionItem
    },
    suggestionItemActive: {
      backgroundColor: "#f8f9fa",
      ...customStyles.suggestionItemActive
    }
  };

  return (
    <div
      ref={containerRef}
      id={componentId.current}
      style={defaultStyles.container}
      className={className}
    >
      <div style={defaultStyles.inputGroup}>
        <input
          ref={addressInputRef}
          type="text"
          className={`form-control ${hasError ? "is-invalid" : ""}`}
          name={name}
          value={address}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (intl
              ? intl.formatMessage({ id: "MODEL.ACCOUNT.ADDRESS" })
              : "Commencez à taper votre adresse...")
          }
          disabled={disabled}
          autoComplete="off"
          style={defaultStyles.input}
        />

        {/* Indicateur de chargement */}
        {addressSearchLoading && (
          <div style={defaultStyles.loadingIndicator}>
            <div
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
            ></div>
          </div>
        )}

        {/* Bouton pour effacer */}
        {address && !disabled && (
          <button
            type="button"
            onClick={clearAddress}
            style={defaultStyles.clearButton}
            title="Effacer l'adresse"
          >
            ×
          </button>
        )}
      </div>

      {/* Affichage des suggestions d'adresse */}
      {addressSuggestions.length > 0 && (
        <div
          ref={addressSuggestionsRef}
          style={defaultStyles.suggestionsContainer}
          onClick={e => e.stopPropagation()}
        >
          {addressSuggestions.map((suggestion, index) => (
            <div
              key={index}
              style={{
                ...defaultStyles.suggestionItem,
                ...(selectedSuggestionIndex === index
                  ? defaultStyles.suggestionItemActive
                  : {})
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              onClick={() => selectAddress(suggestion)}
            >
              <div className="d-flex align-items-start">
                <div className="me-2 text-primary">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <div className="text-primary fw-bold">
                    {suggestion.freeformAddress}
                  </div>
                  <div className="small text-muted">
                    {suggestion.localName}, {suggestion.postalCode},{" "}
                    {suggestion.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSearchInput;

// Exemple d'utilisation :

/*
// Usage basique (inchangé)
<AddressSearchInput
  address={address}
  setAddress={setAddress}
  intl={intl}
  placeholder="Saisissez votre adresse"
/>

// Usage avec Formik (inchangé)
<AddressSearchInput
  address={values.address}
  setAddress={setAddress}
  setFieldValue={setFieldValue}
  intl={intl}
  name="address"
  hasError={errors.address && touched.address}
  onAddressSelect={(suggestion) => {
    console.log("Adresse sélectionnée:", suggestion);
  }}
/>

// NOUVEAU : Usage avec récupération du code postal
<AddressSearchInput
  address={address}
  setAddress={setAddress}
  postalCode={postalCode}
  setPostalCode={setPostalCode}
  intl={intl}
  placeholder="Saisissez votre adresse"
/>

// NOUVEAU : Usage avec Formik et code postal personnalisé
<AddressSearchInput
  address={values.address}
  setAddress={setAddress}
  setFieldValue={setFieldValue}
  intl={intl}
  name="address"
  postalCode={values.codePostal}
  setPostalCode={setPostalCode}
  postalCodeName="codePostal"
  hasError={errors.address && touched.address}
/>

// Usage avec styles personnalisés (inchangé)
<AddressSearchInput
  address={address}
  setAddress={setAddress}
  intl={intl}
  customStyles={{
    container: { marginBottom: "20px" },
    input: { fontSize: "16px" },
    suggestionsContainer: { border: "2px solid #007bff" }
  }}
/>

// Usage avec API personnalisée (inchangé)
<AddressSearchInput
  address={address}
  setAddress={setAddress}
  intl={intl}
  apiUrl="https://mon-api-personnalisee.com/api/search"
/>
*/

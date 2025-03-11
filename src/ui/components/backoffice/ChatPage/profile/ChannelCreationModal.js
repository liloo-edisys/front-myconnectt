import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@material-ui/core";
import { Search, Person, Business, Label } from "@material-ui/icons";
import axios from "axios";
import { chatService } from "../chatService";

const ChannelCreationModal = ({
  isOpen,
  onClose,
  onCreateChannel,
  currentUserId,
  loadChannels,
}) => {
  // État pour gérer les onglets (intérimaires/clients)
  const [targetType, setTargetType] = useState("users"); // "users" pour intérimaires, "accounts" pour clients
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [channel, setChannel] = useState([]);

  // API URL from environment variables
  const API_URL =
    process.env.REACT_APP_WEBAPI_URL ||
    "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/";

  // Fonction debounce pour retarder les appels API
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Fonction pour rechercher des utilisateurs/clients
  const searchEntities = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let endpoint;
        // Sélectionner l'endpoint en fonction du type cible
        if (targetType === "users") {
          // Recherche d'intérimaires
          endpoint = `${API_URL}api/Applicant/SearchByName?name=${encodeURIComponent(
            query
          )}`;
        } else {
          // Recherche de clients
          endpoint = `${API_URL}api/Account/SearchByName?name=${encodeURIComponent(
            query
          )}`;
        }

        const response = await axios.get(endpoint, {
          headers: {
            Accept: "*/*",
          },
        });

        // Traiter les données reçues selon le format de réponse
        let formattedResults = [];
        if (response.data && Array.isArray(response.data)) {
          if (targetType === "users") {
            // Format pour les intérimaires: { id, fullName }
            formattedResults = response.data.map((user) => ({
              id: user.userID,
              name: user.fullName || "Sans nom",
              role: "Intérimaire",
              status: user.status || "Disponible",
            }));
          } else {
            // Format pour les clients: { id, name }
            formattedResults = response.data.map((account) => ({
              id: account.id,
              name: account.name || "Sans nom",
              role: "Client",
              status: account.status || "Actif",
            }));
          }
        }

        setSearchResults(formattedResults);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      } finally {
        setLoading(false);
      }
    },
    [targetType, API_URL]
  );

  // Créer une version debounced de la fonction de recherche
  const debouncedSearch = useCallback(
    debounce((query) => searchEntities(query), 300),
    [searchEntities]
  );

  // Effet pour déclencher la recherche lorsque la requête change
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  // Réinitialiser la recherche lors du changement de type cible
  const handleTargetTypeChange = (newType) => {
    setTargetType(newType);
    setSelectedIds([]);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Gestion de la sélection d'entités (utilisateurs ou clients)
  const handleToggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((existingId) => existingId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Gestion du changement du nom du canal
  const handleChannelNameChange = (e) => {
    setChannelName(e.target.value);
  };

  // Gestion de la création du canal
  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      alert("Veuillez entrer un nom pour le canal");
      return;
    }

    if (selectedIds.length === 0) {
      alert(
        `Veuillez sélectionner au moins un ${
          targetType === "users" ? "intérimaire" : "client"
        }`
      );
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour la création du canal
      const channelData = {
        name: channelName.trim(),
        chatMasterID: null,
        usersID: targetType === "users" ? selectedIds : [],
        accountsID: targetType === "accounts" ? selectedIds : [],
      };

      console.log("Création de canal avec les données:", channelData);

      // Appel à l'API pour créer le canal
      const response = await axios.post(
        `${API_URL}api/Chat/create/channel`,
        channelData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      // Notifier le composant parent avec les informations du canal créé
      if (response.data) {
        onCreateChannel({
          id: response.data.id || response.data.chatID,
          name: channelName,
          targetType,
          members: selectedIds.map((id) => {
            const entity = searchResults.find((r) => r.id === id);
            return {
              id,
              name: entity?.name || "Utilisateur",
            };
          }),
        });
      }

      loadChannels();
      onClose();
    } catch (error) {
      console.log("Erreur lors de la création du canal:", error);
      loadChannels();
      onClose();
      // alert("Une erreur est survenue lors de la création du canal");
    } finally {
      setLoading(false);
      onClose();
      loadChannels();
    }
  };

  // Fonctions pour l'affichage des avatars
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#4361ee",
      "#3a0ca3",
      "#7209b7",
      "#f72585",
      "#4cc9f0",
      "#4895ef",
      "#560bad",
      "#480ca8",
      "#b5179e",
      "#3f37c9",
    ];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // Réinitialiser le formulaire lors de la fermeture
  const handleClose = () => {
    setChannelName("");
    setSelectedIds([]);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-channel-creation"
      aria-describedby="modal-create-new-channel"
    >
      <div
        className="bg-white rounded"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          maxHeight: "700px",
          display: "flex",
          flexDirection: "column",
          outline: "none",
          overflow: "hidden",
          boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
          padding: "24px",
        }}
      >
        {/* Titre du modal */}
        <div className="pb-3 mb-3 border-bottom">
          <h5 className="mb-0 text-center">Créer un nouveau canal</h5>
        </div>

        {/* Nom du canal */}
        <div className="mb-4">
          <label htmlFor="channel-name" className="form-label fw-medium">
            Nom du canal
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Label fontSize="small" style={{ color: "#6c757d" }} />
            </span>
            <input
              id="channel-name"
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Entrez le nom du canal..."
              value={channelName}
              onChange={handleChannelNameChange}
              required
            />
          </div>
        </div>

        {/* Sélection du type de destinataires */}
        <div className="mb-4">
          <label className="form-label fw-medium">Type de destinataires</label>
          <div className="d-flex">
            <button
              className={`flex-fill btn ${
                targetType === "users" ? "btn-primary" : "btn-outline-secondary"
              } me-2`}
              onClick={() => handleTargetTypeChange("users")}
              disabled={loading}
            >
              <Person fontSize="small" className="me-2" />
              Intérimaires
            </button>
            <button
              className={`flex-fill btn ${
                targetType === "accounts"
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handleTargetTypeChange("accounts")}
              disabled={loading}
            >
              <Business fontSize="small" className="me-2" />
              Clients
            </button>
          </div>
        </div>

        {/* Description du canal selon le type */}
        <div className="alert alert-info mb-3" role="alert">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            {targetType === "users"
              ? "Ce canal sera accessible uniquement aux intérimaires sélectionnés."
              : "Ce canal sera accessible uniquement aux clients sélectionnés."}
          </small>
        </div>

        {/* Barre de recherche */}
        <div className="mb-3">
          <label className="form-label fw-medium">
            Rechercher des {targetType === "users" ? "intérimaires" : "clients"}
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Search fontSize="small" style={{ color: "#6c757d" }} />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder={`Rechercher par nom...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Compteur de sélection */}
        {selectedIds.length > 0 && (
          <div className="mb-3">
            <span className="badge bg-primary text-white rounded-pill px-3 py-2">
              {selectedIds.length}{" "}
              {selectedIds.length > 1
                ? `${
                    targetType === "users" ? "intérimaires" : "clients"
                  } sélectionnés`
                : `${
                    targetType === "users" ? "intérimaire" : "client"
                  } sélectionné`}
            </span>
          </div>
        )}

        {/* Liste des résultats de recherche */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: "200px",
            maxHeight: "300px",
          }}
        >
          {loading && searchResults.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="list-group">
              {searchResults.map((entity) => (
                <div
                  key={entity.id}
                  className={`list-group-item list-group-item-action d-flex align-items-center p-3 ${
                    selectedIds.includes(entity.id) ? "active" : ""
                  }`}
                  onClick={() => handleToggleSelection(entity.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="me-3">
                    <div
                      className={`rounded-circle text-white d-flex align-items-center justify-content-center ${
                        selectedIds.includes(entity.id)
                          ? "bg-white text-primary"
                          : ""
                      }`}
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: selectedIds.includes(entity.id)
                          ? ""
                          : getAvatarColor(entity.name),
                        fontSize: "16px",
                      }}
                    >
                      {getInitials(entity.name)}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div
                      className={`fw-medium ${
                        selectedIds.includes(entity.id) ? "text-white" : ""
                      }`}
                    >
                      {entity.name}
                    </div>
                    <div
                      className={`small ${
                        selectedIds.includes(entity.id)
                          ? "text-white"
                          : "text-muted"
                      }`}
                    >
                      {entity.role} • {entity.status}
                    </div>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedIds.includes(entity.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelection(entity.id);
                      }}
                      id={`entity-check-${entity.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="text-center text-muted py-5">
              <div className="mb-3">
                <i className="bi bi-search" style={{ fontSize: "2rem" }}></i>
              </div>
              <p>
                Aucun {targetType === "users" ? "intérimaire" : "client"} trouvé
                avec ces critères.
              </p>
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <div className="mb-3">
                <i className="bi bi-keyboard" style={{ fontSize: "2rem" }}></i>
              </div>
              <p>
                Commencez à taper pour rechercher des{" "}
                {targetType === "users" ? "intérimaires" : "clients"}.
              </p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="pt-3 mt-3 border-top d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-light me-2"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={handleCreateChannel}
            disabled={
              !channelName.trim() || selectedIds.length === 0 || loading
            }
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Création...
              </>
            ) : (
              "Créer le canal"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChannelCreationModal;

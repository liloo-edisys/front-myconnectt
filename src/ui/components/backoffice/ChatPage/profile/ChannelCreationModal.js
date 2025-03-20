import React, { useState } from "react";
import { Modal } from "@material-ui/core";
import { Label } from "@material-ui/icons";
import axios from "axios";

const ChannelCreationModal = ({
  isOpen,
  onClose,
  onCreateChannel,
  loadChannels,
  chatMasterID,
}) => {
  // État pour gérer les onglets (intérimaires/clients)
  const [targetType, setTargetType] = useState("users"); // "users" pour intérimaires, "accounts" pour clients
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false); // Nouvel état pour suivre la création du canal
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [channelName, setChannelName] = useState("");

  // API URL from environment variables
  const API_URL =
    process.env.REACT_APP_WEBAPI_URL ||
    "https://myconnectt-dev-api-h8hfcccufngyd5ag.northeurope-01.azurewebsites.net/";

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

    // Activer les états de chargement
    setLoading(true);
    setCreating(true);

    try {
      // Préparer les données pour la création du canal
      const channelData = {
        name: channelName.trim(),
        chatMasterID: chatMasterID || null,
      };

      console.log("Création de canal avec les données:", channelData);

      // Appel à l'API pour créer le canal
      const response = await axios.post(
        `${API_URL}api/Chat/channel`,
        channelData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      console.log("Réponse de création:", response.data);

      // Notifier le composant parent avec les informations du canal créé
      if (response.data) {
        const newChannelData = {
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
        };

        // Attendre que le composant parent ait reçu les informations
        await onCreateChannel(newChannelData);

        // Puis appeler loadChannels de manière asynchrone
        if (typeof loadChannels === "function") {
          await loadChannels();
        }
      }

      // Fermer le modal une fois tout terminé
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création du canal:", error);
      // Même en cas d'erreur, essayer de recharger les canaux
      if (typeof loadChannels === "function") {
        try {
          await loadChannels();
        } catch (loadError) {
          console.error("Erreur lors du rechargement des canaux:", loadError);
        }
      }
      onClose();
    } finally {
      setLoading(false);
      setCreating(false);
    }
  };

  // Réinitialiser le formulaire lors de la fermeture
  const handleClose = () => {
    if (creating) {
      // Si la création est en cours, empêcher la fermeture
      return;
    }
    setChannelName("");
    setSelectedIds([]);
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  // Empêcher la fermeture du modal pendant la création
  const handleModalClose = () => {
    if (creating) {
      // Empêcher la fermeture pendant la création
      return;
    }
    handleClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-channel-creation"
      aria-describedby="modal-create-new-channel"
      disableBackdropClick={creating} // Désactiver le clic sur l'arrière-plan pendant la création
      disableEscapeKeyDown={creating} // Désactiver la touche Échap pendant la création
    >
      {/* Overlay de chargement lors de la création */}
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
        {/* Overlay de chargement qui bloque tout le modal pendant la création */}
        {creating && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <h5 className="text-primary">Création du canal en cours...</h5>
            <p className="text-muted mt-2">Veuillez patienter</p>
          </div>
        )}

        {chatMasterID === null ? (
          <h5 className="mb-0 text-center">Créer un nouveau dossier</h5>
        ) : (
          <h5 className="mb-0 text-center">Créer un sous-dossier</h5>
        )}

        {/* Nom du canal */}
        <div className="mb-4">
          {chatMasterID === null ? (
            <label htmlFor="channel-name" className="form-label fw-medium">
              Nom du dossier
            </label>
          ) : (
            <label htmlFor="channel-name" className="form-label fw-medium">
              Nom du sous-dossier
            </label>
          )}
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
              disabled={creating}
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="pt-3 mt-3 border-top d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-light me-2"
            onClick={handleClose}
            disabled={loading || creating}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary px-4"
            style={{ marginLeft: "8px" }}
            onClick={handleCreateChannel}
            disabled={!channelName.trim() || loading || creating}
          >
            {loading || creating ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Création...
              </>
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChannelCreationModal;

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@material-ui/core";
import { Search, Person, Business, Group } from "@material-ui/icons";
import axios from "axios";
import { chatService, messageUtils } from "../chatService";

const UserSelectionModal = ({
  isOpen,
  onClose,
  onSelectUsers,
  currentUserId
}) => {
  // État pour gérer les onglets (intérimaires/clients)
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // API URL from environment variables
  const API_URL =
    process.env.REACT_APP_WEBAPI_URL ||
    "https://myconnectt-apiback-prod.azurewebsites.net/";

  // Fonction debounce pour retarder les appels API
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Surveiller si plusieurs utilisateurs sont sélectionnés pour activer le mode groupe
  useEffect(() => {
    if (selectedUsers.length > 1) {
      setIsCreatingGroup(true);
    } else {
      setIsCreatingGroup(false);
      setGroupName("");
    }
  }, [selectedUsers]);

  // Fonction pour rechercher des utilisateurs
  const searchUsers = useCallback(
    async query => {
      if (!query.trim()) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let endpoint;
        // Sélectionner l'endpoint en fonction de l'onglet actif
        if (tabValue === 0) {
          // Intérimaires
          endpoint = `${API_URL}api/Applicant/SearchByName?name=${encodeURIComponent(
            query
          )}`;
        } else {
          // Clients
          endpoint = `${API_URL}api/Account/SearchByName?name=${encodeURIComponent(
            query
          )}`;
        }

        const response = await axios.get(endpoint, {
          headers: {
            Accept: "*/*"
          }
        });

        // Traiter les données reçues selon le format de réponse
        let formattedUsers = [];
        if (response.data && Array.isArray(response.data)) {
          if (tabValue === 0) {
            // Format pour les intérimaires: { id, fullName }
            formattedUsers = response.data.map(user => ({
              id: user.userID,
              name: user.fullName || "Sans nom",
              role: "Intérimaire",
              status: "Disponible" // Statut par défaut si non fourni par l'API
            }));
          } else {
            // Format pour les clients: { id, name }
            formattedUsers = response.data.map(user => ({
              id: user.id,
              name: user.name || "Sans nom",
              role: "Client",
              status: "Actif" // Statut par défaut si non fourni par l'API
            }));
          }
        }

        setUsers(formattedUsers);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        // En cas d'erreur, on peut ajouter un message d'erreur à l'interface
      } finally {
        setLoading(false);
      }
    },
    [tabValue, API_URL]
  );

  // Créer une version debounced de la fonction de recherche
  const debouncedSearch = useCallback(
    debounce(query => searchUsers(query), 300),
    [searchUsers]
  );

  // Effet pour déclencher la recherche lorsque la requête change
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setUsers([]);
    }
  }, [searchQuery, debouncedSearch]);

  // Réinitialiser la recherche lors du changement d'onglet
  const handleTabChange = newValue => {
    setTabValue(newValue);
    setSelectedUsers([]);
    setSearchQuery("");
    setUsers([]);
    setGroupName("");
    setIsCreatingGroup(false);
  };

  // Gestion de la sélection d'utilisateurs
  const handleToggleUser = userId => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Fonction pour créer un groupe de discussion
  const createChatGroup = async () => {
    try {
      setLoading(true);

      // Préparer les données pour la création du groupe
      const toUsers = selectedUsers.map(userId => ({
        userID: userId,
        enumChatUserRole: 2 // Rôle par défaut pour les membres
      }));

      const groupData = {
        groupName: groupName || "Nouveau groupe",
        chatID: 0,
        chatMasterID: null, // Utilisation du currentUserId passé en prop
        toUsers: toUsers,
        isGroup: true
      };

      // Utiliser le service existant pour créer le groupe
      const response = await chatService.createGroup(groupData);

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la validation et création du chat/groupe
  const handleConfirm = async () => {
    try {
      let result;

      if (isCreatingGroup) {
        // Si plusieurs utilisateurs sont sélectionnés, créer un groupe
        if (!groupName) {
          alert("Veuillez entrer un nom pour le groupe");
          return;
        }

        result = await createChatGroup();
        // Notifier le composant parent avec les informations du groupe créé
        onSelectUsers({
          isGroup: true,
          users: selectedUsers.map(id => {
            const user = users.find(u => u.id === id);
            return { id, name: user?.name || "Utilisateur" };
          }),
          groupName,
          groupId: result?.id || result?.chatID || null
        });
      } else {
        // Si un seul utilisateur est sélectionné, créer une discussion sans API
        const selectedUser = users.find(user => user.id === selectedUsers[0]);

        // Ajouter statiquement à la liste des discussions
        onSelectUsers({
          isGroup: false,
          users: [{ id: selectedUser.id, name: selectedUser.name }],
          groupName: null,
          groupId: null
        });
      }

      // Fermer le modal
      onClose();
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      alert("Une erreur est survenue lors de la création de la discussion");
    }
  };

  // Gestion du changement dans la barre de recherche
  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setUsers([]);
    }
  };

  // Gestion du changement du nom de groupe
  const handleGroupNameChange = e => {
    setGroupName(e.target.value);
  };

  // Générer des initiales à partir du nom pour l'avatar
  const getInitials = name => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Générer une couleur cohérente à partir du nom pour l'avatar
  const getAvatarColor = name => {
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
      "#3f37c9"
    ];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-user-selection"
      aria-describedby="modal-select-users-for-chat"
    >
      <div
        className="bg-white rounded"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", // Taille fixe
          height: "700px", // Taille fixe
          display: "flex",
          flexDirection: "column",
          outline: "none",
          overflow: "hidden",
          boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
          padding: "16px" // Padding global du modal
        }}
      >
        {/* Header - Simple et minimaliste */}
        <div className="pb-3 mb-3 border-bottom">
          <h5 className="mb-0 text-center">
            {isCreatingGroup
              ? "Créer un groupe de discussion"
              : `Sélectionner des ${
                  tabValue === 0 ? "intérimaires" : "clients"
                }`}
          </h5>
        </div>

        {/* Tabs - Style épuré et moderne */}
        <div className="d-flex mb-3">
          <button
            className={`flex-fill py-3 btn ${
              tabValue === 0
                ? "text-primary fw-bold border-0 border-bottom border-primary border-3"
                : "text-secondary border-0 border-bottom"
            }`}
            onClick={() => handleTabChange(0)}
            style={{ borderRadius: 0 }}
            disabled={loading}
          >
            <Person fontSize="small" className="me-2" />
            Intérimaires
          </button>
          <button
            className={`flex-fill py-3 btn ${
              tabValue === 1
                ? "text-primary fw-bold border-0 border-bottom border-primary border-3"
                : "text-secondary border-0 border-bottom"
            }`}
            onClick={() => handleTabChange(1)}
            style={{ borderRadius: 0 }}
            disabled={loading}
          >
            <Business fontSize="small" className="me-2" />
            Clients
          </button>
        </div>

        {/* Champ de nom de groupe (apparaît uniquement quand plusieurs utilisateurs sont sélectionnés) */}
        {isCreatingGroup && (
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Group fontSize="small" style={{ color: "#6c757d" }} />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Nom du groupe..."
                value={groupName}
                onChange={handleGroupNameChange}
                required
              />
            </div>
          </div>
        )}

        {/* Search Bar - Design amélioré */}
        <div className="mb-3">
          <div className="input-group">
            <span
              className="input-group-text bg-light border-end-0"
              style={{ borderRadius: "8px 0 0 8px" }}
            >
              <Search fontSize="small" style={{ color: "#6c757d" }} />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              style={{ borderRadius: "0 8px 8px 0" }}
              placeholder={`Rechercher des ${
                tabValue === 0 ? "intérimaires" : "clients"
              }...`}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Compteur de sélection (visible quand des utilisateurs sont sélectionnés) */}
        {selectedUsers.length > 0 && (
          <div className="mb-3 px-2">
            <span className="badge bg-primary text-white rounded-pill px-3 py-2">
              {selectedUsers.length}{" "}
              {selectedUsers.length > 1
                ? "utilisateurs sélectionnés"
                : "utilisateur sélectionné"}
            </span>
          </div>
        )}

        {/* Body - Liste des utilisateurs améliorée */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && !users.length ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="px-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`py-3 d-flex align-items-center hover-bg-light mb-2 rounded ${
                    selectedUsers.includes(user.id) ? "bg-light" : ""
                  }`}
                  onClick={() => handleToggleUser(user.id)}
                  style={{
                    cursor: "pointer",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseOver={e => {
                    if (!selectedUsers.includes(user.id)) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseOut={e => {
                    if (!selectedUsers.includes(user.id)) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div className="ms-3">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: getAvatarColor(user.name),
                        fontSize: "16px"
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="fw-medium">{user.name}</div>
                  </div>
                  <div className="me-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleToggleUser(user.id)}
                      onClick={e => e.stopPropagation()}
                      id={`user-check-${user.id}`}
                      style={{
                        width: "14px",
                        height: "14px",
                        cursor: "pointer"
                      }}
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
                Aucun {tabValue === 0 ? "intérimaire" : "client"} trouvé avec
                ces critères.
              </p>
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <div className="mb-3">
                <i className="bi bi-keyboard" style={{ fontSize: "2rem" }}></i>
              </div>
              <p>
                Commencez à taper pour rechercher des{" "}
                {tabValue === 0 ? "intérimaires" : "clients"}.
              </p>
            </div>
          )}
        </div>

        {/* Footer - Design plus professionnel */}
        <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
          {loading && selectedUsers.length > 0 ? (
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Création en cours...</span>
            </div>
          ) : (
            <span className="text-muted">
              {selectedUsers.length === 0
                ? "Aucune sélection"
                : isCreatingGroup
                ? "Mode groupe"
                : "Conversation individuelle"}
            </span>
          )}
          <div>
            <button
              type="button"
              className="btn btn-light me-2"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleConfirm}
              disabled={
                selectedUsers.length === 0 ||
                (isCreatingGroup && !groupName) ||
                loading
              }
            >
              {isCreatingGroup ? "Créer le groupe" : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserSelectionModal;

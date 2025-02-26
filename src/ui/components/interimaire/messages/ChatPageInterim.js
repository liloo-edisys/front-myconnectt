import React, { useState, useEffect } from "react";
import { Search, Send, Add, MoreVert } from "@material-ui/icons";
import ProfileModal from "./profile/ProfileModal";
import UserSelectionModal from "./profile/UserSelectionModal";
import { chatService, messageUtils } from "./chatService";

const ChatPageInterim = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(
    false
  );
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Récupérer l'ID de l'utilisateur depuis le localStorage
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Récupérer l'ID utilisateur du localStorage
    const userID = localStorage.getItem("userId");
    // Convertir en nombre car les IDs dans vos messages sont numériques
    setCurrentUserId(userID ? Number(userID) : null);
    console.log("User ID from localStorage:", userID);
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const { data } = await chatService.getChats();
      setChats(data);
      console.log("Chats loaded:", data);
    } catch (err) {
      setError("Erreur lors du chargement des conversations");
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage?.trim() || !selectedChat) return;

    setLoading(true);
    try {
      // Récupérer le chat sélectionné
      const currentChat = chats?.find(
        (c) => Number(c?.id) === Number(selectedChat)
      );

      if (!currentChat) {
        throw new Error("Conversation non trouvée");
      }

      // Vérifier si c'est un groupe
      if (currentChat.isGroup) {
        // Utiliser la fonction existante pour envoyer un message à un groupe
        const messageData = {
          chatID: selectedChat,
          message: newMessage.trim(),
        };

        await chatService.sendMessageToGroup(messageData);
      } else {
        // Pour une conversation individuelle, utiliser l'endpoint existant
        // Récupérer l'utilisateur avec chatUserRole: 1 (l'administrateur)
        const adminUser = getOtherUser(currentChat);

        if (!adminUser || !adminUser.id) {
          throw new Error("Destinataire non trouvé");
        }

        // Préparer les données du message avec l'ID de l'admin comme destinataire
        const messageData = messageUtils.formatChatRequest(
          newMessage,
          adminUser.id
        );
        await chatService.sendUserToBackoffice(messageData);
      }

      await loadChats();
      setNewMessage("");
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = async (chatId) => {
    // Convertir chatId en nombre pour assurer la compatibilité
    setSelectedChat(Number(chatId));
    console.log("Chat sélectionné:", chatId);

    const chat = chats?.find((c) => Number(c?.id) === Number(chatId));
    console.log("Chat trouvé:", chat);

    if (chat) {
      const unreadMessages = chat?.messages?.filter((msg) => !msg?.isRead);
      for (const msg of unreadMessages) {
        try {
          await chatService.markMessageAsRead({
            to: chatId,
            messageID: msg?.id,
          });
        } catch (err) {
          console.error("Error marking message as read:", err);
        }
      }
    }
  };

  const handleProfileSelect = async (profile) => {
    setIsProfileModalOpen(false);

    // Afficher un état de chargement
    setLoading(true);

    try {
      // Récupérer l'ID utilisateur connecté
      const userID = localStorage.getItem("userId");

      // Créer d'abord un groupe pour cette conversation
      // Le isGroup est à false car c'est une conversation 1:1
      const createGroupData = messageUtils.formatCreateGroup(
        profile.name, // Nom du groupe = nom du service
        Number(userID), // L'utilisateur actuel comme master
        [profile.id], // Le profil sélectionné comme destinataire
        false // Pas un groupe, juste une conversation 1:1
      );

      // Créer la conversation
      const groupResult = await chatService.createGroup(createGroupData);

      if (groupResult && groupResult.data) {
        const chatId = groupResult.data.id || groupResult.data.chatID;

        // Envoyer un premier message pour initialiser la conversation
        const messageData = messageUtils.formatGroupMessage(
          chatId,
          "Bonjour, je souhaite discuter avec votre service."
        );

        await chatService.sendBackofficeMessage(messageData);

        // Recharger les conversations
        await loadChats();

        // Sélectionner automatiquement la nouvelle conversation
        handleChatSelect(chatId);
      } else {
        throw new Error("Impossible de créer la conversation");
      }
    } catch (err) {
      setError("Erreur lors de la création d'une nouvelle conversation");
      console.error("Error creating new chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (chat) => {
    // Cherche l'utilisateur avec chatUserRole: 1
    const adminUser = chat?.users?.find((u) => u?.chatUserRole === 1);

    // Si trouvé, retourne cet utilisateur, sinon fallback au premier utilisateur
    return adminUser || chat?.users[0];
  };

  const getLastMessage = (chat) => {
    return chat?.messages[chat?.messages?.length - 1];
  };

  const filteredChats = chats?.filter((chat) => {
    const otherUser = getOtherUser(chat);
    return (
      otherUser?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat?.messages?.some((m) =>
        m?.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // Trouver le chat sélectionné avec une conversion numérique
  const selectedChatData = chats.find(
    (chat) => Number(chat?.id) === Number(selectedChat)
  );

  const handleSelectUsers = (selectedData) => {
    setIsUserSelectionModalOpen(false);

    if (!selectedData.isGroup && selectedData.users.length === 1) {
      // Créer une discussion statique pour un seul utilisateur
      const selectedUser = selectedData.users[0];

      // Générer un ID temporaire unique pour cette conversation
      const tempChatId = Date.now();

      // Créer un nouvel objet de conversation avec structure compatible
      const newChat = {
        id: tempChatId,
        isGroup: false,
        groupName: null,
        users: [
          // L'utilisateur sélectionné avec le rôle admin (1)
          {
            id: selectedUser.id,
            userName: selectedUser.name,
            chatUserRole: 1, // Pour que getOtherUser() fonctionne correctement
          },
          // L'utilisateur actuel
          {
            id: currentUserId,
            userName: "Vous", // Ou récupérer le vrai nom si disponible
            chatUserRole: 2,
          },
        ],
        messages: [], // Pas de messages initiaux
      };

      // Ajouter la nouvelle conversation à la liste
      setChats((prevChats) => [newChat, ...prevChats]);

      // Sélectionner automatiquement cette nouvelle conversation
      handleChatSelect(tempChatId);
    } else {
      // Pour les groupes, continuer avec le code existant qui fait des appels API
      selectedData.users.forEach(async (user) => {
        try {
          const userID = localStorage.getItem("userId");
          const createGroupData = messageUtils.formatCreateGroup(
            selectedData.groupName || user.name,
            Number(userID),
            [user.id],
            selectedData.isGroup // true pour groupe, false pour 1:1
          );

          const groupResult = await chatService.createGroup(createGroupData);
          if (groupResult && groupResult.data) {
            const chatId = groupResult.data.id || groupResult.data.chatID;
            await loadChats();
            handleChatSelect(chatId);
          }
        } catch (err) {
          setError("Erreur lors de la création d'une nouvelle conversation");
          console.error("Error creating new chat:", err);
        }
      });
    }
  };

  // Fonction pour générer une couleur d'avatar basée sur le nom
  const generateAvatarColor = (name) => {
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

  return (
    <div
      className="container-fluid vh-100 p-0"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {/* Notification d'erreur */}
      {error && (
        <div
          className="alert alert-danger position-absolute top-0 start-50 translate-middle-x mt-4 d-flex justify-content-between align-items-center shadow-sm"
          style={{ zIndex: 1030, maxWidth: "90%" }}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
          <button
            type="button"
            className="btn-close ms-3"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      <div className="row h-100 g-0" style={{ height: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <div className="col-md-4 col-lg-3 border-end h-100 bg-white">
          <div className="d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0 fw-bold mr-4">Conversations</h5>
              <button
                className="btn btn-sm btn-primary rounded-circle"
                onClick={() => setIsUserSelectionModalOpen(true)}
                title="Nouvelle conversation"
              >
                <Add fontSize="small" />
              </button>
            </div>

            <div className="position-relative p-3 border-bottom">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search fontSize="small" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-auto flex-grow-1 chat-list">
              {loading && chats?.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                </div>
              ) : filteredChats?.length === 0 ? (
                <div className="text-center text-muted p-4">
                  <div className="mb-3">
                    <i
                      className="bi bi-chat-dots"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                  <p>Aucune conversation trouvée</p>
                </div>
              ) : (
                filteredChats?.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  const lastMessage = getLastMessage(chat);
                  const hasUnread = chat.messages?.some(
                    (m) => !m?.isRead && m?.byUserID !== currentUserId
                  );
                  const chatName = chat.isGroup
                    ? chat?.groupName || "Groupe"
                    : otherUser?.userName || "Discussion";
                  const avatarColor = generateAvatarColor(chatName);

                  return (
                    <div
                      key={chat?.id}
                      className={`d-flex  p-3 border-bottom chat-item ${
                        Number(selectedChat) === Number(chat?.id)
                          ? "bg-light"
                          : ""
                      }`}
                      onClick={() => handleChatSelect(chat?.id)}
                    >
                      <div className="position-relative me-3">
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "35px",
                            height: "35px",
                            backgroundColor: avatarColor,
                            fontSize: "14px",
                            marginRight: "10px",
                          }}
                        >
                          {chatName.charAt(0).toUpperCase()}
                        </div>
                        {hasUnread && (
                          <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">
                              Nouveau message
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span
                            className={`${
                              hasUnread ? "fw-bold" : "fw-medium"
                            } text-truncate`}
                          >
                            {chatName}
                          </span>
                          <small
                            className={`text-nowrap ms-2  ${
                              hasUnread ? "text-dark fw-bold" : "text-muted"
                            } `}
                          >
                            {lastMessage
                              ? new Date(
                                  lastMessage?.sentAt
                                ).toLocaleDateString()
                              : ""}
                          </small>
                        </div>
                        <p
                          className={`mb-0 text-truncate ${
                            hasUnread ? "fw-semibold text-dark" : "text-muted"
                          }`}
                          style={{ fontSize: "0.85rem" }}
                        >
                          {lastMessage?.message || "Pas de message"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="col-md-8 col-lg-9 d-flex flex-column h-100">
          {selectedChat ? (
            <>
              <div className="border-bottom bg-white p-3 d-flex justify-content-between shadow-sm">
                {selectedChatData && (
                  <div className="d-flex">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: "25px",
                        height: "25px",
                        backgroundColor: generateAvatarColor(
                          selectedChatData?.groupName ||
                            getOtherUser(selectedChatData)?.userName
                        ),
                      }}
                    >
                      {(
                        selectedChatData?.groupName ||
                        getOtherUser(selectedChatData)?.userName ||
                        "?"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold ml-3">
                        {selectedChatData.isGroup
                          ? selectedChatData.groupName
                          : getOtherUser(selectedChatData)?.userName}
                      </div>
                      <div className="text-muted small ml-3">
                        {selectedChatData.isGroup
                          ? `${selectedChatData.users?.length ||
                              0} participants`
                          : "En ligne"}
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <button className="btn btn-light rounded-circle">
                    <MoreVert fontSize="small" />
                  </button>
                </div>
              </div>

              <div
                className="flex-grow-1 overflow-auto p-3 bg-light messages-container"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(240, 240, 250, 0.9), rgba(240, 240, 250, 0.9)), url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23dcdcef' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                }}
              >
                {selectedChatData?.messages?.length === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <div className="mb-3">
                      <i
                        className="bi bi-chat"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <p>Pas de messages dans cette conversation</p>
                    <p className="small">Envoyez un message pour commencer</p>
                  </div>
                ) : (
                  // Inverser l'ordre des messages en utilisant slice().reverse()
                  [...selectedChatData?.messages]
                    .reverse()
                    .map((msg, index, reversedArray) => {
                      // Trouver l'expéditeur du message
                      const messageSender = selectedChatData?.users?.find(
                        (user) => Number(user.id) === Number(msg?.byUserID)
                      );

                      // Vérifier si le message est envoyé par un utilisateur avec chatUserRole: 1
                      const isSentByAdmin = messageSender?.chatUserRole === 1;

                      // Pour l'avatar, nous devons vérifier le message suivant dans l'ordre inversé
                      // ce qui correspond à l'index + 1 dans le tableau inversé
                      const showAvatar =
                        index === reversedArray.length - 1 ||
                        reversedArray[index + 1]?.byUserID !== msg?.byUserID;

                      return (
                        <div
                          key={msg.id}
                          className={`d-flex ${
                            !isSentByAdmin ? "justify-content-end" : ""
                          } mb-3`}
                        >
                          {isSentByAdmin && showAvatar && (
                            <div className="me-2 align-self-end">
                              <div
                                className="rounded-circle text-white d-flex align-items-center justify-content-center"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  backgroundColor: generateAvatarColor(
                                    getOtherUser(selectedChatData)?.userName
                                  ),
                                  fontSize: "14px",
                                }}
                              >
                                {(
                                  getOtherUser(selectedChatData)?.userName ||
                                  "?"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            </div>
                          )}
                          {isSentByAdmin && !showAvatar && (
                            <div
                              style={{ width: "32px" }}
                              className="me-2"
                            ></div>
                          )}
                          <div style={{ maxWidth: "75%" }}>
                            <div
                              className={`p-3 rounded-3 shadow-sm ${
                                !isSentByAdmin
                                  ? "bg-primary text-white"
                                  : "bg-white"
                              }`}
                              style={{
                                borderRadius: !isSentByAdmin
                                  ? "18px 18px 4px 18px"
                                  : "18px 18px 18px 4px",
                              }}
                            >
                              {msg?.message}
                            </div>
                            <div
                              className={`text-muted small mt-1 ${
                                !isSentByAdmin ? "text-end" : ""
                              }`}
                            >
                              {new Date(msg?.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              <div className="border-top bg-white p-3">
                <form onSubmit={handleSendMessage}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control bg-light border-0"
                      placeholder="Écrivez un message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      className={`btn ${
                        newMessage.trim() ? "btn-primary" : "btn-secondary"
                      }`}
                      disabled={loading || !newMessage?.trim()}
                    >
                      <Send fontSize="small" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light">
              <div className="text-center text-muted">
                <div
                  className="mb-4"
                  style={{ fontSize: "4rem", opacity: "0.3" }}
                >
                  <i className="bi bi-chat-square-dots"></i>
                </div>
                <h5>Bienvenue dans votre messagerie</h5>
                <p className="mb-4">
                  Sélectionnez une conversation pour commencer à discuter
                  <br />
                  ou créez-en une nouvelle
                </p>
                {/* <button
                  className="btn btn-primary"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <Add className="me-1" fontSize="small" /> Nouvelle
                  conversation
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>

      <UserSelectionModal
        isOpen={isUserSelectionModalOpen}
        onClose={() => setIsUserSelectionModalOpen(false)}
        onSelectUsers={handleSelectUsers}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSelectProfile={handleProfileSelect}
      />
    </div>
  );
};

export default ChatPageInterim;

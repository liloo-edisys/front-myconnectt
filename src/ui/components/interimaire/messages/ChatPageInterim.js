import React, { useState, useEffect, useRef } from "react";
import { Search, Send, MoreVert } from "@material-ui/icons";
import { chatService, messageUtils } from "./chatService";
import { shallowEqual, useSelector } from "react-redux";
import { HubConnectionBuilder } from "@microsoft/signalr";

const ChatPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const { authToken } = useSelector(state => state.auth);

  // Récupérer l'utilisateur depuis Redux
  const { user } = useSelector(
    state => ({
      user: state.auth.user
    }),
    shallowEqual
  );

  // Mettre à jour currentUserId quand user change
  useEffect(() => {
    if (user?.userID) {
      setCurrentUserId(Number(user.userID));
      console.log("User ID from Redux:", user.userID);
    } else {
      // Fallback à localStorage si user.userID n'est pas disponible
      const localStorageUserID = localStorage.getItem("userId");
      setCurrentUserId(localStorageUserID ? Number(localStorageUserID) : null);
      console.log("User ID from localStorage:", localStorageUserID);
    }
  }, [user]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/chat", {
        accessTokenFactory: () => authToken
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(result => {
        connection.on("UserToUser", message => {
          console.log("UserToUser", message);
          loadChats();
        });
      })
      .catch(e => console.log("Connection with SignalR failed: ", e));
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChats();
      console.log("loadChats response --------> ", response);
      // Vérifier si la réponse existe et contient des données
      if (response && response.data) {
        setChats(response.data);
      } else {
        // Si pas de réponse ou données vides, initialiser avec un tableau vide
        setChats([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des conversations");
      console.error("Error loading chats:", err);
      // En cas d'erreur, initialiser également avec un tableau vide
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage?.trim() || !selectedChat) return;

    setLoading(true);
    try {
      // Récupérer le chat sélectionné
      const currentChat = chats?.find(
        c => Number(c?.id) === Number(selectedChat)
      );

      if (!currentChat) {
        throw new Error("Conversation non trouvée");
      }

      // Vérifier si c'est un groupe
      if (currentChat.isGroup) {
        // Utiliser la fonction existante pour envoyer un message à un groupe
        const messageData = {
          chatID: selectedChat,
          message: newMessage.trim()
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

  const handleChatSelect = async chatId => {
    // Convertir chatId en nombre pour assurer la compatibilité
    setSelectedChat(Number(chatId));

    // C'est un chat normal
    const chat = chats?.find(c => Number(c?.id) === Number(chatId));
    if (!chat) return;

    // Marquer les messages non lus comme lus
    const unreadMessages = chat?.messages?.filter(msg => !msg?.isRead);
    for (const msg of unreadMessages) {
      try {
        await chatService.markMessageAsRead({
          chatID: chatId,
          messageID: msg?.id
        });
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    }
  };

  const getOtherUser = chat => {
    // Cherche l'utilisateur avec chatUserRole: 1
    const adminUser = chat?.users?.find(u => u?.chatUserRole === 1);

    // Si trouvé, retourne cet utilisateur, sinon fallback au premier utilisateur
    return adminUser || chat?.users?.[0];
  };

  const getLastMessage = chat => {
    if (!chat?.messages || chat.messages.length === 0) {
      return null;
    }

    // Sort messages by sentAt date (newest first)
    const sortedMessages = [...chat.messages].sort((a, b) => {
      return new Date(b.sentAt) - new Date(a.sentAt);
    });

    // Return the first message in the sorted array (the newest one)
    return sortedMessages[0];
  };

  // Filtrer les chats en fonction de la recherche
  const filteredChats = chats?.filter(chat => {
    if (!chat) return false;

    // Ne pas afficher les groupes
    if (chat.isGroup) {
      return false;
    }

    // Filtrer par recherche
    const otherUser = getOtherUser(chat);
    const name = otherUser?.userName;
    return (
      name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages?.some(m =>
        m?.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // Obtenir les données du chat sélectionné
  const getSelectedData = () => {
    // C'est un chat normal
    const selectedChatData = chats.find(
      chat => Number(chat?.id) === Number(selectedChat)
    );

    return selectedChatData;
  };

  // Fonction pour générer une couleur d'avatar basée sur le nom
  const generateAvatarColor = name => {
    if (!name) return "#4361ee"; // Couleur par défaut si pas de nom

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
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // Obtenir les données sélectionnées (chat)
  const selectedChatData = getSelectedData();

  return (
    <div
      className="container-fluid p-0"
      style={{ backgroundColor: "#f8f9fa", height: "85vh" }}
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
            </div>

            <div className="position-relative p-3 border-bottom">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search fontSize="small" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher des conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-auto flex-grow-1 chat-list">
              {filteredChats?.length === 0 ? (
                // Affichage si pas de conversations trouvées
                <div className="text-center text-muted p-4">
                  <div className="mb-3">
                    <i
                      className="bi bi-chat-dots"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                  <p>Vous n'avez pas encore de discussion</p>
                </div>
              ) : (
                // Affichage des conversations
                filteredChats?.map(chat => {
                  const otherUser = getOtherUser(chat);
                  const lastMessage = getLastMessage(chat);
                  const hasUnread = chat.messages?.some(
                    m =>
                      !m?.isRead &&
                      Number(m?.byUserID) !== Number(currentUserId)
                  );
                  const chatName = otherUser?.userName || "Admin";
                  const avatarColor = generateAvatarColor(chatName);

                  return (
                    <div
                      key={chat?.id}
                      className={`d-flex p-3 border-bottom chat-item ${
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
                            marginRight: "10px"
                          }}
                        >
                          A
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <div className="d-flex  mb-1 w-100">
                          <span
                            className={`${
                              hasUnread ? "fw-bold" : "fw-medium"
                            } text-truncate`}
                          >
                            Admin
                          </span>
                          <small
                            className={`text-nowrap ms-2 ${
                              hasUnread ? "text-dark fw-bold" : "text-muted"
                            }`}
                          ></small>
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
                  // En-tête pour une conversation
                  <div className="d-flex">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: "25px",
                        height: "25px",
                        backgroundColor: generateAvatarColor(
                          getOtherUser(selectedChatData)?.userName
                        )
                      }}
                    >
                      {(getOtherUser(selectedChatData)?.userName || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold ml-3">Admin</div>
                      <div className="text-muted small ml-3">En ligne</div>
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
                    "linear-gradient(rgba(240, 240, 250, 0.9), rgba(240, 240, 250, 0.9)), url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23dcdcef' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")"
                }}
              >
                {/* Affichage des messages de conversation */}
                {selectedChatData?.messages?.length === 0 ? (
                  // Message d'accueil pour une conversation vide
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
                  // Affichage des messages de conversation
                  (selectedChatData?.messages &&
                  Array.isArray(selectedChatData.messages)
                    ? [...selectedChatData.messages].reverse()
                    : []
                  ).map((msg, index, reversedArray) => {
                    // Trouver l'expéditeur du message
                    const messageSender = selectedChatData?.users?.find(
                      user => Number(user.id) === Number(msg?.byUserID)
                    );

                    // Vérifier si le message provient de l'utilisateur actuel
                    const isFromCurrentUser =
                      Number(msg?.byUserID) === Number(currentUserId);

                    // Pour l'avatar, vérifier si le message suivant est du même expéditeur
                    const showAvatar =
                      index === reversedArray.length - 1 ||
                      reversedArray[index + 1]?.byUserID !== msg?.byUserID;

                    return (
                      <div
                        key={msg.id}
                        className={`d-flex ${
                          isFromCurrentUser ? "justify-content-end" : ""
                        } mb-3`}
                      >
                        {/* Avatar pour messages reçus (à gauche)
                        {!isFromCurrentUser && showAvatar && (
                          <div className="me-2 align-self-end">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: generateAvatarColor(
                                  messageSender?.userName || "?"
                                ),
                                fontSize: "14px",
                              }}
                            >
                              {(messageSender?.userName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </div>
                        )}
                        {!isFromCurrentUser && !showAvatar && (
                          <div style={{ width: "32px" }} className="me-2"></div>
                        )} */}

                        {/* Contenu du message */}
                        <div style={{ maxWidth: "75%" }}>
                          <div
                            className={`p-3 rounded-3 shadow-sm ${
                              isFromCurrentUser
                                ? "bg-primary text-white"
                                : "bg-white"
                            }`}
                            style={{
                              borderRadius: isFromCurrentUser
                                ? "18px 18px 4px 18px"
                                : "18px 18px 18px 4px"
                            }}
                          >
                            {msg?.message}
                          </div>
                          <div
                            className={`text-muted small mt-1 ${
                              isFromCurrentUser ? "text-end" : ""
                            }`}
                          >
                            {new Date(msg?.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </div>

                        {/* Avatar pour messages envoyés (à droite) */}
                        {/* {isFromCurrentUser && showAvatar && (
                          <div className="ms-2 align-self-end">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: generateAvatarColor(
                                  messageSender?.userName || "?"
                                ),
                                fontSize: "14px",
                              }}
                            >
                              {(messageSender?.userName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </div>
                        )}
                        {isFromCurrentUser && !showAvatar && (
                          <div style={{ width: "32px" }} className="ms-2"></div>
                        )} */}
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
                      onChange={e => setNewMessage(e.target.value)}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

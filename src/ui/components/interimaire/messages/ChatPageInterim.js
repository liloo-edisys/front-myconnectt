import React, { useState, useEffect } from "react";
import { Search, Send, Add, MoreVert } from "@material-ui/icons";
import { chatService, messageUtils } from "./chatService";
import { shallowEqual, useSelector } from "react-redux";
import signalRService from "./signalrServices";

const ChatPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] = useState(
    false
  );
  const [chats, setChats] = useState([]);
  const [channel, setChannel] = useState([]);
  const [flattenedChannels, setFlattenedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("messages"); // "messages" ou "channels"
  const [signalRConnected, setSignalRConnected] = useState(false);

  // Récupérer l'utilisateur depuis Redux
  const { user } = useSelector(
    (state) => ({
      user: state.auth.user,
    }),
    shallowEqual
  );

  const handleSignalRMessage = (message) => {
    console.log("📩 Message reçu dans ChatPage:", message);

    // Vérifiez si le message contient les informations nécessaires
    if (message.chatID) {
      // Si le message appartient à la conversation active
      if (Number(message.chatID) === Number(selectedChat)) {
        console.log("Ce message appartient à la conversation active");
        // Rechargez les conversations pour mettre à jour les messages
        loadChats();
      } else {
        console.log("Ce message appartient à une autre conversation");
        // Mettre à jour la liste des conversations sans changer la conversation active
        loadChats();
      }
    } else {
      console.log(
        "Le message ne contient pas d'ID de chat, rechargement général"
      );
      loadChats();
      loadChannel();
    }
  };

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

  const loadChannel = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChannel();
      console.log("loadChannel response --------> ", response);

      // Vérifier si la réponse existe et contient des données
      if (response && response.data) {
        // Store the original channel data
        setChannel(response.data);

        // Process the hierarchical channel data into a flat structure
        const flattenChannelData = (channels, level = 0, parentName = "") => {
          let result = [];

          if (Array.isArray(channels)) {
            channels.forEach((chan) => {
              // Add current channel with its level info
              result.push({
                ...chan,
                level: level,
                parentName: parentName,
                displayName:
                  level > 0 ? `${parentName} > ${chan.name}` : chan.name,
              });

              // If the channel has subChannels, process them recursively
              if (
                chan.subChannels &&
                Array.isArray(chan.subChannels) &&
                chan.subChannels.length > 0
              ) {
                const subChannelsFlat = flattenChannelData(
                  chan.subChannels,
                  level + 1,
                  chan.name
                );
                result = [...result, ...subChannelsFlat];
              }
            });
          }

          return result;
        };

        // Set the flattened channels directly when loading
        const flattenedData = flattenChannelData(response.data);
        console.log("Flattened channel data:", flattenedData);
        setFlattenedChannels(flattenedData);
      } else {
        // Si pas de réponse ou données vides, initialiser avec un tableau vide
        console.log("No channel data found in response");
        setChannel([]);
        setFlattenedChannels([]);
      }
    } catch (err) {
      // setError("Erreur lors du chargement des canaux");
      console.error("Error loading channels:", err);
      // En cas d'erreur, initialiser également avec un tableau vide
      setChannel([]);
      setFlattenedChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
    loadChannel();
  }, []);

  // Fonction pour gérer la création d'un canal

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage?.trim() || !selectedChat) return;

    setLoading(true);
    try {
      // Vérifier d'abord si le chat sélectionné est un canal
      const selectedChannelData = flattenedChannels.find(
        (chan) => Number(chan.id) === Number(selectedChat)
      );

      if (selectedChannelData) {
        // Envoyer un message au canal en utilisant sendUserToChannel
        const messageData = {
          chatID: selectedChat,
          message: newMessage.trim(),
        };

        await chatService.sendUserToChannel(messageData);
        await loadChannel(); // Recharger les canaux après envoi
      } else {
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
      }

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

    // Vérifier d'abord si c'est un canal
    const selectedChannelData = flattenedChannels.find(
      (chan) => Number(chan.id) === Number(chatId)
    );

    if (selectedChannelData) {
      // Si c'est un canal, pas besoin de marquer comme lu pour l'instant
      // Pourriez ajouter cette fonctionnalité plus tard si nécessaire
      return;
    }

    // Sinon, c'est un chat normal
    const chat = chats?.find((c) => Number(c?.id) === Number(chatId));
    if (!chat) return;

    // Marquer les messages non lus comme lus
    const unreadMessages = chat?.messages?.filter((msg) => !msg?.isRead);
    for (const msg of unreadMessages) {
      try {
        await chatService.markMessageAsRead({
          chatID: chatId,
          messageID: msg?.id,
        });
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    }
  };

  const getOtherUser = (chat) => {
    // Cherche l'utilisateur avec chatUserRole: 1
    const adminUser = chat?.users?.find((u) => u?.chatUserRole === 1);

    // Si trouvé, retourne cet utilisateur, sinon fallback au premier utilisateur
    return adminUser || chat?.users?.[0];
  };

  const getLastMessage = (chat) => {
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

  // Filtrer les chats en fonction de l'onglet actif et de la recherche
  const filteredChats = chats?.filter((chat) => {
    if (!chat) return false;

    // Filtrer d'abord par type (message individuel ou canal/groupe)
    const isChannel = chat.isGroup;
    if (
      (activeTab === "messages" && isChannel) ||
      (activeTab === "channels" && !isChannel)
    ) {
      return false;
    }

    // Ensuite filtrer par recherche
    const otherUser = getOtherUser(chat);
    const name = chat.isGroup ? chat.groupName : otherUser?.userName;
    return (
      name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages?.some((m) =>
        m?.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  // Obtenir les données du chat ou du canal sélectionné
  const getSelectedData = () => {
    // Vérifier d'abord si c'est un canal
    const selectedChannelData = flattenedChannels.find(
      (chan) => Number(chan.id) === Number(selectedChat)
    );

    if (selectedChannelData) {
      return {
        isChannel: true,
        data: selectedChannelData,
      };
    }

    // Sinon, c'est un chat normal
    const selectedChatData = chats.find(
      (chat) => Number(chat?.id) === Number(selectedChat)
    );

    return {
      isChannel: false,
      data: selectedChatData,
    };
  };

  // Fonction pour générer une couleur d'avatar basée sur le nom
  const generateAvatarColor = (name) => {
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
      "#3f37c9",
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // Obtenir les données sélectionnées (chat ou canal)
  const selectedData = getSelectedData();
  const selectedChatData = selectedData.isChannel ? null : selectedData.data;
  const selectedChannelData = selectedData.isChannel ? selectedData.data : null;

  useEffect(() => {
    loadChats();
    loadChannel();
    // Set up interval to refresh every 15 seconds
    const interval = setInterval(() => {
      if (!loading) {
        console.log("Refreshing chats and channels...");
        loadChats();
        loadChannel();
      }
    }, 7000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);
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

            {/* Onglets Messages/Canaux */}
            <div className="d-flex border-bottom">
              <button
                className={`btn flex-grow-1 rounded-0 py-2 ${
                  activeTab === "messages"
                    ? "btn-light border-bottom border-primary border-3"
                    : "btn-white"
                }`}
                onClick={() => setActiveTab("messages")}
              >
                <i className="bi bi-chat me-2"></i>
                Messages
              </button>
              <button
                className={`btn flex-grow-1 rounded-0 py-2 ${
                  activeTab === "channels"
                    ? "btn-light border-bottom border-primary border-3"
                    : "btn-white"
                }`}
                onClick={() => setActiveTab("channels")}
              >
                <i className="bi bi-hash me-2"></i>
                Canaux
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
                  placeholder={`Rechercher des ${
                    activeTab === "messages" ? "conversations" : "canaux"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-auto flex-grow-1 chat-list">
              {loading &&
              (chats?.length === 0 ||
                (activeTab === "channels" &&
                  flattenedChannels.length === 0)) ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                </div>
              ) : activeTab === "channels" ? (
                // Affichage des canaux (structure hiérarchique)
                flattenedChannels.length === 0 ? (
                  <div className="text-center text-muted p-4">
                    <div className="mb-3">
                      <i
                        className="bi bi-hash"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <p>Aucun canal trouvé</p>
                  </div>
                ) : (
                  flattenedChannels
                    .filter(
                      (chan) =>
                        chan.name
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        chan.displayName
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map((chan) => {
                      // Get the last message for this channel if it exists
                      const lastMessage =
                        chan.messages && chan.messages.length > 0
                          ? chan.messages[chan.messages.length - 1]
                          : null;

                      // Count participants if available
                      const participantsCount =
                        (chan.users?.length || 0) +
                        (chan.accounts?.length || 0);

                      // Check for unread messages
                      const hasUnread = chan.messages?.some(
                        (m) =>
                          !m?.isRead &&
                          Number(m?.byUserID) !== Number(currentUserId)
                      );

                      return (
                        <div
                          key={chan.id}
                          className={`d-flex p-3 border-bottom chat-item ${
                            Number(selectedChat) === Number(chan.id)
                              ? "bg-light"
                              : ""
                          }`}
                          onClick={() => handleChatSelect(chan.id)}
                          style={{
                            paddingLeft: `${chan.level * 16 + 16}px`,
                            backgroundColor:
                              chan.level > 0 ? "#f8f9fa" : "white",
                            cursor: "pointer",
                          }}
                        >
                          <div className="position-relative me-3">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center"
                              style={{
                                width: "35px",
                                height: "35px",
                                marginRight: "10px",
                                backgroundColor: generateAvatarColor(
                                  chan.name || "Channel"
                                ),
                                fontSize: "14px",
                              }}
                            >
                              {chan.level > 0 ? "⤷" : "#"}
                            </div>
                            {/* {hasUnread && (
                              <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                            )} */}
                          </div>
                          <div className="overflow-hidden">
                            <div className="d-flex  mb-1">
                              <span
                                className={`${
                                  hasUnread ? "fw-bold" : "fw-medium"
                                } text-truncate`}
                              >
                                {chan.name}
                                {chan.level > 0 && (
                                  <span className="text-muted ms-2 small">
                                    <i className="bi bi-arrow-return-right me-1"></i>
                                    {chan.parentName}
                                  </span>
                                )}
                              </span>
                              {/* <small className="text-nowrap ms-2 text-muted">
                                {participantsCount > 0
                                  ? `${participantsCount} participant${
                                      participantsCount > 1 ? "s" : ""
                                    }`
                                  : ""}
                              </small> */}
                            </div>
                            <p
                              className={`mb-0 text-truncate ${
                                hasUnread
                                  ? "fw-semibold text-dark"
                                  : "text-muted"
                              }`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              {lastMessage
                                ? lastMessage.message
                                : "Pas de message"}
                            </p>
                          </div>
                        </div>
                      );
                    })
                )
              ) : filteredChats?.length === 0 ? (
                // Affichage si pas de conversations trouvées
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
                // Affichage des conversations
                filteredChats?.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  const lastMessage = getLastMessage(chat);
                  const hasUnread = chat.messages?.some(
                    (m) =>
                      !m?.isRead &&
                      Number(m?.byUserID) !== Number(currentUserId)
                  );
                  const chatName = chat.isGroup
                    ? chat?.groupName || "Groupe"
                    : "Admin";
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
                            marginRight: "10px",
                          }}
                        >
                          {chat.isGroup
                            ? "#"
                            : chatName.charAt(0).toUpperCase()}
                        </div>
                        {/* {hasUnread && (
                          <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                        )} */}
                      </div>
                      <div className="overflow-hidden">
                        <div className="d-flex justify-content-between align-items-center mb-1 w-100">
                          <span>{chatName}</span>
                          {/* <small>
                            {lastMessage
                              ? new Date(
                                  lastMessage?.sentAt
                                ).toLocaleDateString()
                              : ""}
                          </small> */}
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
                {selectedChannelData ? (
                  // En-tête pour un canal
                  <div className="d-flex">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: "25px",
                        height: "25px",
                        backgroundColor: generateAvatarColor(
                          selectedChannelData.name
                        ),
                      }}
                    >
                      <span>#</span>
                    </div>
                    <div>
                      <div className="text-muted small ml-3">
                        {selectedChannelData.level > 0
                          ? selectedChannelData.parentName
                          : ""}
                        {selectedChannelData.level > 0 &&
                          (selectedChannelData.users?.length || 0) +
                            (selectedChannelData.accounts?.length || 0) >
                            0 &&
                          " • "}
                        {(selectedChannelData.users?.length || 0) +
                          (selectedChannelData.accounts?.length || 0) >
                        0
                          ? `${(selectedChannelData.users?.length || 0) +
                              (selectedChannelData.accounts?.length ||
                                0)} participant${
                              (selectedChannelData.users?.length || 0) +
                                (selectedChannelData.accounts?.length || 0) >
                              1
                                ? "s"
                                : ""
                            }`
                          : ""}
                      </div>
                    </div>
                  </div>
                ) : (
                  selectedChatData && (
                    // En-tête pour une conversation
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
                        {selectedChatData.isGroup
                          ? "#"
                          : (
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
                  )
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
                {/* Affichage des messages selon le type (canal ou conversation) */}
                {selectedChannelData ? (
                  // Affichage des messages de canal
                  selectedChannelData.messages?.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <div className="mb-3">
                        <i
                          className="bi bi-hash"
                          style={{ fontSize: "3rem" }}
                        ></i>
                      </div>
                      <p>Pas de messages dans ce canal</p>
                    </div>
                  ) : (
                    // Affichage des messages du canal
                    (selectedChannelData.messages &&
                    Array.isArray(selectedChannelData.messages)
                      ? [...selectedChannelData.messages].sort(
                          (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
                        )
                      : []
                    ).map((msg) => {
                      // Trouver l'expéditeur du message parmi les utilisateurs ou comptes
                      const isUser = Boolean(
                        selectedChannelData.users?.find(
                          (u) => Number(u.id) === Number(msg.byUserID)
                        )
                      );

                      const messageSender = isUser
                        ? selectedChannelData.users?.find(
                            (u) => Number(u.id) === Number(msg.byUserID)
                          )
                        : selectedChannelData.accounts?.find(
                            (a) => Number(a.id) === Number(msg.byUserID)
                          );

                      const senderName = isUser
                        ? messageSender?.userName || "Inconnu"
                        : messageSender?.accountName || "Entreprise";

                      // Vérifier si le message provient de l'utilisateur actuel

                      return (
                        <div key={msg.id} className="mb-3">
                          <div className="d-flex align-items-start">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                              style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: generateAvatarColor(
                                  senderName
                                ),
                                fontSize: "14px",
                              }}
                            >
                              {senderName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="d-flex align-items-center">
                                <span className="fw-bold">{senderName}</span>
                                <small className="text-muted ms-2">
                                  {new Date(msg.sentAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </div>
                              <div className="p-2 rounded-3 bg-white mt-1">
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : selectedChatData?.messages?.length === 0 ? (
                  // Message d'accueil pour une conversation vide
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                    <div className="mb-3">
                      <i
                        className={`bi ${
                          selectedChatData?.isGroup ? "bi-hash" : "bi-chat"
                        }`}
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <p>
                      Pas de messages dans{" "}
                      {selectedChatData?.isGroup
                        ? "ce canal"
                        : "cette conversation"}
                    </p>
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
                      (user) => Number(user.id) === Number(msg?.byUserID)
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
                        {/* Avatar pour messages reçus (à gauche) */}
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
                        )}

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
                                : "18px 18px 18px 4px",
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
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {/* Avatar pour messages envoyés (à droite) */}
                        {isFromCurrentUser && showAvatar && (
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
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-top bg-white p-3">
                {/* Vérifier si la conversation sélectionnée est un canal */}
                {selectedChat &&
                flattenedChannels.some(
                  (chan) => Number(chan.id) === Number(selectedChat)
                ) ? (
                  // Afficher un message indicatif pour les canaux
                  <div className="text-center text-muted py-2">
                    <i className="bi bi-info-circle me-2"></i>
                    Vous ne pouvez pas envoyer de messages dans ce canal.
                  </div>
                ) : (
                  // Afficher le formulaire d'envoi de message pour les conversations normales
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
                )}
              </div>
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light">
              <div className="text-center text-muted">
                <div
                  className="mb-4"
                  style={{ fontSize: "4rem", opacity: "0.3" }}
                >
                  <i
                    className={`bi ${
                      activeTab === "messages"
                        ? "bi-chat-square-dots"
                        : "bi-hash-square"
                    }`}
                  ></i>
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

import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Add, MoreVert } from "@material-ui/icons";
import ProfileModal from "./profile/ProfileModal";
import UserSelectionModal from "./profile/UserSelectionModal";
import ChannelCreationModal from "./profile/ChannelCreationModal";
import TagSuggestions from "./profile/TagSuggestions";
import { chatService, messageUtils } from "./chatService";
import signalRService from "./signalrServices";
import { shallowEqual, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

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

  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [allTags, setAllTags] = useState([]); // Ajout de la déclaration manquante
  const [isLoadingTags, setIsLoadingTags] = useState(false); // Ajout de la déclaration manquante
  const [tagsError, setTagsError] = useState(null);

  //channel params
  const history = useHistory();
  const { channelId } = useParams();

  // Références
  const messageInputRef = useRef(null);
  const channelOptionsRef = useRef(null);

  const [channelMessages, setChannelMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (channelId && chats.length > 0) {
      // Si un ID est présent dans l'URL et que les chats sont chargés
      handleChatSelect(channelId);
    }
  }, [channelId, chats]);

  // Dans loadTags, assurez-vous de bien tracer les erreurs
  const loadTags = async () => {
    console.log("Loading tags...");
    setIsLoadingTags(true);
    setTagsError(null);

    try {
      const response = await chatService.getChannelTags();
      console.log("API response:", response);

      if (response && response.data) {
        // Passer les données brutes au composant TagSuggestions
        setAllTags(response.data);
      } else {
        console.warn("No data in response or unexpected format");
        setAllTags([]);
      }
    } catch (err) {
      console.error("Error loading tags:", err);
      setTagsError("Impossible de charger les suggestions de tags");
      setAllTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Utilisez useEffect pour charger les tags au montage du composant
  useEffect(() => {
    loadTags();
  }, []); // Le tableau vide signifie que cela ne s'exécute qu'une fois au montage

  // Ajoutez également une fonction pour recharger les tags lors du changement de canal
  useEffect(() => {
    if (selectedChat) {
      loadTags();
    }
  }, [selectedChat]);

  const convertMarkdownLinks = (text) => {
    // Regex pour trouver les liens markdown comme [texte](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // Remplacer tous les liens markdown par des liens HTML
    return text.replace(
      linkRegex,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  };

  // Et dans la partie d'affichage de votre message, utilisez quelque chose comme:

  const handleMessageChange = (e) => {
    const { value, selectionStart } = e.target;
    setNewMessage(value);
    setCursorPosition(selectionStart);

    // Vérifier si le caractère à la position actuelle ou précédente est #
    const isPreviousCharHash = value.charAt(selectionStart - 1) === "#";

    // Vérifier s'il y a un # avant le curseur sans espace entre les deux
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastHashIndex = textBeforeCursor.lastIndexOf("#");
    const noSpaceBetween =
      lastHashIndex !== -1 &&
      !textBeforeCursor.substring(lastHashIndex + 1).includes(" ");

    // Activer les suggestions si on vient de taper # ou si on est en train de taper après un #
    if (isPreviousCharHash || noSpaceBetween) {
      if (!showTagSuggestions) {
        console.log("Showing tag suggestions");
        loadTags(); // Recharger les tags à chaque fois qu'on ouvre le modal
      }
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Ajoutez cette fonction pour gérer la sélection d'un tag
  // Dans ChatPage.js, modifiez la fonction handleSelectTag
  const handleSelectTag = (updatedMessage) => {
    // Le composant TagSuggestions va maintenant nous envoyer le message complet mis à jour
    // avec le lien markdown déjà inséré
    setNewMessage(updatedMessage);

    // Focus sur l'input et placer le curseur à la fin
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        // Placer le curseur à la fin du message
        const length = updatedMessage.length;
        messageInputRef.current.setSelectionRange(length, length);
        setCursorPosition(length);
      }
    }, 0);
  };
  // Récupérer l'utilisateur depuis Redux
  const { user } = useSelector(
    (state) => ({
      user: state.auth.user,
    }),
    shallowEqual
  );

  // Fonction pour créer une liste plate à partir de la structure hiérarchique des canaux
  const flattenChannels = (channels, level = 0, parentName = "") => {
    if (!channels || !Array.isArray(channels)) return [];

    let result = [];

    channels.forEach((channel) => {
      // Ajouter les informations du niveau et du parent
      const channelWithLevel = {
        ...channel,
        level,
        parentName,
        displayName:
          level > 0 ? `${parentName} / ${channel.name}` : channel.name,
      };

      // Ajouter le canal courant
      result.push(channelWithLevel);

      // Récursivement ajouter les sous-canaux
      if (channel.slaves && channel.slaves.length > 0) {
        const subChannels = flattenChannels(
          channel.slaves,
          level + 1,
          level === 0 ? channel.name : `${parentName} / ${channel.name}`
        );
        result = [...result, ...subChannels];
      }
    });

    return result;
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

  // Mettre à jour les canaux aplatis lorsque les canaux sont chargés
  useEffect(() => {
    if (channel && channel.length > 0) {
      const allChannels = flattenChannels(channel);
      setFlattenedChannels(allChannels);
    }
  }, [channel]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChats();

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

      // Vérifier si la réponse existe et contient des données
      if (response && response.data) {
        setChannel(response.data);
      } else {
        // Si pas de réponse ou données vides, initialiser avec un tableau vide
        setChannel([]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des canaux");
      console.error("Error loading channels:", err);
      // En cas d'erreur, initialiser également avec un tableau vide
      setChannel([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer la création d'un canal
  const handleCreateChannel = async (channelData) => {
    console.log("Canal créé:", channelData);
    setLoading(true);

    try {
      // Recharger les canaux et les chats
      await loadChannel();
      await loadChats();

      // Sélectionner le nouveau canal si vous avez son ID
      if (channelData.id) {
        handleChatSelect(channelData.id);
      }

      // Basculer vers l'onglet "Canaux" si ce n'est pas déjà le cas
      if (activeTab !== "channels") {
        setActiveTab("channels");
      }
    } catch (err) {
      setError("Erreur lors du chargement des conversations");
      console.error("Error after channel creation:", err);
    } finally {
      setLoading(false);
    }
  };

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
        // Envoyer un message au canal avec sendMessageToChannel
        const messageData = {
          chatID: selectedChat,
          message: newMessage.trim(),
        };

        await chatService.sendMessageToChannel(messageData);
        setNewMessage("");
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
          setNewMessage("");
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
          await chatService.sendBackofficeMessage(messageData);
          setNewMessage("");
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
    const numericChatId = Number(chatId);
    setSelectedChat(numericChatId);
    console.log(" ------------ Chat sélectionné ------------ ", chatId);

    // Rediriger vers l'URL avec l'ID de la discussion
    // Nous utilisons history de react-router pour naviguer
    history.push(`/messages/${numericChatId}`);

    // Vérifier d'abord si c'est un canal
    const selectedChannelData = flattenedChannels.find(
      (chan) => Number(chan.id) === numericChatId
    );

    if (selectedChannelData) {
      // Si c'est un canal, charger les messages via le nouvel endpoint
      try {
        setLoadingMessages(true);
        const messagesResponse = await chatService.getChannelMessages(
          numericChatId
        );

        console.log("Messages du canal récupérés:", messagesResponse.data);

        if (
          messagesResponse &&
          messagesResponse.data &&
          messagesResponse.data.messages
        ) {
          // La réponse contient un objet avec un tableau messages, on extrait ce tableau
          setChannelMessages(messagesResponse.data.messages);
        } else if (
          messagesResponse &&
          messagesResponse.data &&
          Array.isArray(messagesResponse.data)
        ) {
          // La réponse est directement un tableau de messages
          setChannelMessages(messagesResponse.data);
        } else {
          console.log("Format de réponse inattendu:", messagesResponse);
          setChannelMessages([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des messages du canal:",
          error
        );
        setError("Impossible de charger les messages du canal");
        setChannelMessages([]);
      } finally {
        setLoadingMessages(false);
      }
      return;
    }

    // Réinitialiser les messages du canal si ce n'est pas un canal
    setChannelMessages([]);

    // Sinon, c'est un chat normal
    const chat = chats?.find((c) => Number(c?.id) === numericChatId);
    if (!chat) return;

    // Marquer les messages non lus comme lus
    const unreadMessages = chat?.messages?.filter((msg) => !msg?.isRead);
    if (unreadMessages && Array.isArray(unreadMessages)) {
      for (const msg of unreadMessages) {
        try {
          await chatService.markMessageAsRead({
            chatID: numericChatId,
            messageID: msg?.id,
          });
        } catch (err) {
          console.error("Error marking message as read:", err);
        }
      }
    }
  };

  // Fonction utilitaire pour mettre à jour les canaux imbriqués
  const updateNestedChannel = (channels, targetId, messages) => {
    if (!channels || !Array.isArray(channels)) return channels;

    return channels.map((chan) => {
      if (Number(chan.id) === Number(targetId)) {
        return { ...chan, messages };
      }

      if (chan.slaves && Array.isArray(chan.slaves)) {
        const updatedSlaves = updateNestedChannel(
          chan.slaves,
          targetId,
          messages
        );
        return { ...chan, slaves: updatedSlaves };
      }

      return chan;
    });
  };
  const tryLoadSpecificChatById = async (specificId) => {
    try {
      // Vérifier d'abord si c'est un canal
      const channelResponse = await chatService.getSpecificChannel(specificId);
      if (channelResponse && channelResponse.data) {
        // C'est un canal
        const newChannelData = channelResponse.data;

        // Ajouter ce canal à la liste des canaux
        setChannel((prevChannels) => {
          // Vérifier si le canal existe déjà
          const channelExists = prevChannels.some(
            (chan) => Number(chan.id) === Number(specificId)
          );
          if (channelExists) {
            return prevChannels;
          }
          return [...prevChannels, newChannelData];
        });

        // Sélectionner le canal
        handleChatSelect(specificId);
        return;
      }

      // Si ce n'est pas un canal, essayer de charger comme chat
      const chatResponse = await chatService.getSpecificChat(specificId);
      if (chatResponse && chatResponse.data) {
        // C'est un chat
        const newChatData = chatResponse.data;

        // Ajouter ce chat à la liste des chats
        setChats((prevChats) => {
          // Vérifier si le chat existe déjà
          const chatExists = prevChats.some(
            (chat) => Number(chat?.id) === Number(specificId)
          );
          if (chatExists) {
            return prevChats;
          }
          return [...prevChats, newChatData];
        });

        // Sélectionner le chat
        handleChatSelect(specificId);
        return;
      }

      // Si on arrive ici, c'est que ni chat ni canal n'a été trouvé
      setError(`Aucune discussion trouvée avec l'ID ${specificId}`);
    } catch (err) {
      console.error(
        "Erreur lors du chargement de la discussion spécifique:",
        err
      );
      setError(`Impossible de charger la discussion avec l'ID ${specificId}`);
    }
  };

  useEffect(() => {
    if (channelId) {
      // Si un ID est présent dans l'URL
      const loadSpecificChat = async () => {
        try {
          setLoading(true);
          // Essayer de charger les chats d'abord
          await loadChats();
          await loadChannel();

          // Attendre un court instant pour que les données soient bien chargées
          setTimeout(() => {
            // Vérifier si c'est un chat ou un canal
            const foundChat = chats.find(
              (chat) => Number(chat?.id) === Number(channelId)
            );
            const foundChannel = flattenedChannels.find(
              (chan) => Number(chan.id) === Number(channelId)
            );

            if (foundChat || foundChannel) {
              // Si on a trouvé une correspondance, sélectionner cette discussion
              handleChatSelect(channelId);
            } else {
              // Si pas trouvé, on peut essayer de faire une requête spécifique pour cet ID
              console.log(
                "Chat/Channel non trouvé dans les données existantes, tentative de chargement spécifique..."
              );
              // Note: Vous pourriez avoir besoin d'implémenter une fonction dans chatService
              // pour charger une conversation spécifique par ID
              tryLoadSpecificChatById(channelId);
            }
          }, 300);
        } catch (err) {
          console.error(
            "Erreur lors du chargement de la discussion spécifique:",
            err
          );
          setError("Impossible de charger cette discussion");
        } finally {
          setLoading(false);
        }
      };

      loadSpecificChat();
    }
  }, [channelId]);

  const handleProfileSelect = async (profile) => {
    setIsProfileModalOpen(false);
    setLoading(true);

    try {
      // Utiliser l'ID utilisateur depuis Redux si disponible, sinon depuis localStorage
      const userID = user?.userID || localStorage.getItem("userId");

      if (!userID) {
        throw new Error("Utilisateur non identifié");
      }

      // Créer d'abord un groupe pour cette conversation
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
      (chat.messages &&
        Array.isArray(chat.messages) &&
        chat.messages.some((m) =>
          m?.message?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
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

  const handleSelectUsers = (selectedData) => {
    setIsUserSelectionModalOpen(false);

    if (!selectedData.isGroup && selectedData.users.length === 1) {
      // Vérifier que l'ID utilisateur est disponible
      if (!currentUserId) {
        setError(
          "Impossible de créer une conversation: utilisateur non identifié"
        );
        return;
      }

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
            userName: user?.fullName || "Vous", // Utiliser le nom complet si disponible
            chatUserRole: 2,
          },
        ],
        messages: [], // Pas de messages initiaux
      };

      // Ajouter la nouvelle conversation à la liste
      setChats((prevChats) => [newChat, ...prevChats]);

      // Sélectionner automatiquement cette nouvelle conversation
      handleChatSelect(tempChatId);

      // Basculer sur l'onglet Messages si ce n'est pas déjà le cas
      if (activeTab !== "messages") {
        setActiveTab("messages");
      }
    } else {
      // Pour les groupes, continuer avec le code existant qui fait des appels API
      selectedData.users.forEach(async (user) => {
        try {
          // Utiliser l'ID utilisateur depuis Redux si disponible, sinon depuis localStorage
          const userID = currentUserId || localStorage.getItem("userId");

          if (!userID) {
            throw new Error("Utilisateur non identifié");
          }

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

            // Basculer sur l'onglet approprié
            if (selectedData.isGroup && activeTab !== "channels") {
              setActiveTab("channels");
            } else if (!selectedData.isGroup && activeTab !== "messages") {
              setActiveTab("messages");
            }
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
    }, 40000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const [currentChatMasterID, setCurrentChatMasterID] = useState(null);

  // Premier bouton - sans chatMasterID
  const handleOpenChannelModal = () => {
    setCurrentChatMasterID(null); // Réinitialiser à null
    setIsChannelModalOpen(true);
  };

  // Second bouton - avec chatMasterID
  const handleOpenChannelForChild = (id) => {
    setCurrentChatMasterID(id); // Définir l'ID
    setIsChannelModalOpen(true);
  };

  return (
    <div
      className="container-fluid vh-100 p-0"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {/* Notification d'erreur */}
      {/* {error && (
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
      )} */}

      <div className="row h-100 g-0" style={{ height: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <div className="col-md-4 col-lg-3 border-end h-100 bg-white">
          <div className="d-flex flex-column h-100">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0 fw-bold mr-4">Conversations</h5>
              <button
                className="btn btn-sm btn-primary rounded-circle"
                onClick={() => {
                  if (activeTab === "channels") {
                    handleOpenChannelModal();
                  } else {
                    setIsUserSelectionModalOpen(true);
                  }
                }}
                title={
                  activeTab === "channels"
                    ? "Nouveau canal"
                    : "Nouvelle conversation"
                }
              >
                <Add fontSize="small" />
              </button>
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
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => setIsChannelModalOpen(true)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Nouveau canal
                    </button>
                  </div>
                ) : (
                  // Dans la partie où vous affichez les canaux
                  // Dans la partie où vous affichez les canaux
                  flattenedChannels
                    .filter(
                      (chan) =>
                        chan.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        chan.displayName
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map((chan) => {
                      const lastMessage =
                        chan.messages && chan.messages.length > 0
                          ? chan.messages[chan.messages.length - 1]
                          : null;

                      const participantsCount =
                        (chan.users?.length || 0) +
                        (chan.accounts?.length || 0);

                      // Calcul des messages non lus
                      const hasUnread =
                        chan.messages &&
                        Array.isArray(chan.messages) &&
                        chan.messages.some(
                          (m) =>
                            !m?.isRead &&
                            Number(m?.byUserID) !== Number(currentUserId)
                        );

                      // Styles adaptés pour tous les niveaux hiérarchiques
                      const isRootLevel = chan.level === 0;
                      const indentation = chan.level * 16 + 16;

                      // Calculer une teinte de gris plus claire en fonction du niveau
                      // Plus le niveau est profond, plus la teinte est claire
                      const bgColorIntensity = 248 + chan.level * 2; // Limite à 255
                      const bgColor = isRootLevel
                        ? "white"
                        : `rgb(${bgColorIntensity}, ${bgColorIntensity}, ${bgColorIntensity})`;

                      // Obtenir une bordure de couleur différente selon le niveau
                      const borderColors = [
                        "#6c757d",
                        "#8a94a0",
                        "#adb5bd",
                        "#ced4da",
                        "#dee2e6",
                      ];
                      const borderColor =
                        borderColors[
                          Math.min(chan.level - 1, borderColors.length - 1)
                        ];
                      const borderStyle = isRootLevel
                        ? "none"
                        : `3px solid ${borderColor}`;

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
                            paddingLeft: `${indentation}px`,
                            backgroundColor: bgColor,
                            borderLeft: borderStyle,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div className="position-relative me-3">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center"
                              style={{
                                width: "35px",
                                height: "35px",
                                backgroundColor: isRootLevel
                                  ? generateAvatarColor(chan.name)
                                  : `rgba(108, 117, 125, ${0.8 -
                                      chan.level * 0.1})`,
                                fontSize: "14px",
                                marginRight: "10px",
                              }}
                            >
                              {isRootLevel
                                ? "#"
                                : "└" + "─".repeat(Math.min(chan.level, 3))}
                            </div>
                            {hasUnread && (
                              <span className="position-absolute top-0 end-0 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <div className="d-flex mb-1">
                              <span
                                className={`${
                                  hasUnread
                                    ? "fw-bold"
                                    : isRootLevel
                                    ? "fw-medium"
                                    : "fw-normal"
                                } text-truncate`}
                              >
                                {chan.name}
                                {!isRootLevel && (
                                  <span className="text-muted ms-2 small d-inline-block">
                                    <i className="bi bi-diagram-3 me-1"></i>
                                    {/* Afficher le dernier segment du chemin parent */}
                                    {chan.parentName
                                      .split("/")
                                      .pop()
                                      .trim()}
                                  </span>
                                )}
                              </span>
                            </div>
                            <p
                              className={`mb-0 text-truncate ${
                                hasUnread
                                  ? "fw-semibold text-dark"
                                  : "text-muted"
                              }`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              {chan.level > 0 && (
                                <span
                                  className="badge bg-secondary bg-opacity-25 text-dark me-2"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Niveau {chan.level}
                                </span>
                              )}
                              {lastMessage
                                ? lastMessage.message
                                : "Pas de message"}
                            </p>
                          </div>
                          {/* Afficher un indicateur de sous-canaux s'il en existe */}
                          {chan.slaves && chan.slaves.length > 0 && (
                            <div className="ms-auto align-self-center">
                              <span className="badge bg-secondary rounded-pill">
                                {chan.slaves.length}
                              </span>
                            </div>
                          )}
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
                  <button
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => setIsUserSelectionModalOpen(true)}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Nouvelle conversation
                  </button>
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
                    : otherUser?.userName || "Discussion";
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
                        <div className="d-flex  mb-1">
                          <span>{chatName}</span>
                          {/* <small
                            className={`text-nowrap ms-2 ${
                              hasUnread ? "text-dark fw-bold" : "text-muted"
                            }`}
                          >
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
                  <button
                    className="btn btn-light rounded-circle"
                    onClick={() => handleOpenChannelForChild(selectedChat)}
                  >
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
                  loadingMessages ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      ></div>
                    </div>
                  ) : channelMessages.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <div className="mb-3">
                        <i
                          className="bi bi-hash"
                          style={{ fontSize: "3rem" }}
                        ></i>
                      </div>
                      <p>Pas de messages dans ce canal</p>
                      <p className="small">Envoyez un message pour commencer</p>
                    </div>
                  ) : (
                    // Affichage des messages du canal récupérés via l'API
                    [...channelMessages]
                      .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
                      .map((msg, index) => {
                        // Afficher les détails du message pour déboguer
                        console.log("Traitement du message:", msg);

                        // Vérifier si le message provient de l'utilisateur actuel
                        const isFromCurrentUser =
                          Number(msg.byUserID) === Number(currentUserId);

                        // Trouver l'information sur l'expéditeur (peut être manquante)
                        // On utilise une approche défensive avec des valeurs par défaut
                        let senderName = isFromCurrentUser
                          ? "Vous"
                          : "Utilisateur";

                        // Si possible, essayer de trouver les informations sur l'expéditeur
                        if (selectedData.data && selectedData.data.users) {
                          const messageSender = selectedData.data.users.find(
                            (u) => Number(u.id) === Number(msg.byUserID)
                          );
                          if (messageSender && messageSender.userName) {
                            senderName = messageSender.userName;
                          }
                        }

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
                                    {new Date(msg.sentAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
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
                            <div
                              className="message-content"
                              dangerouslySetInnerHTML={{
                                __html: convertMarkdownLinks(msg.message),
                              }}
                            />
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

              <div className="input-group position-relative">
                {/* Intégration du composant TagSuggestions avec les bonnes props */}
                <TagSuggestions
                  message={newMessage}
                  cursorPosition={cursorPosition}
                  onSelectTag={handleSelectTag}
                  isVisible={showTagSuggestions}
                  setIsVisible={setShowTagSuggestions}
                  tags={allTags}
                  isLoading={isLoadingTags}
                  error={tagsError}
                />

                <input
                  ref={messageInputRef}
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Écrivez un message... (utilisez # pour les mentions)"
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    // Empêcher la propagation des touches fléchées lorsque les suggestions sont visibles
                    if (
                      showTagSuggestions &&
                      ["ArrowUp", "ArrowDown", "Enter"].includes(e.key)
                    ) {
                      e.stopPropagation();
                    }
                  }}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`btn ${
                    newMessage.trim() ? "btn-primary" : "btn-secondary"
                  }`}
                  disabled={loading || !newMessage?.trim()}
                  onClick={handleSendMessage}
                >
                  <Send fontSize="small" />
                </button>
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
                <p className="mb-4">
                  Sélectionnez{" "}
                  {activeTab === "messages" ? "une conversation" : "un canal"}{" "}
                  pour commencer à discuter
                  <br />
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (activeTab === "channels") {
                      setIsChannelModalOpen(true);
                    } else {
                      setIsUserSelectionModalOpen(true);
                    }
                  }}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  {activeTab === "messages"
                    ? "Nouvelle conversation"
                    : "Nouveau canal"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserSelectionModal
        isOpen={isUserSelectionModalOpen}
        onClose={() => setIsUserSelectionModalOpen(false)}
        onSelectUsers={handleSelectUsers}
        initialTab={activeTab === "channels" ? "group" : "individual"}
        currentUserId={currentUserId}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSelectProfile={handleProfileSelect}
      />

      <ChannelCreationModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        onCreateChannel={handleCreateChannel}
        currentUserId={currentUserId}
        load={loadChannel}
        chatMasterID={currentChatMasterID}
      />
    </div>
  );
};

export default ChatPage;

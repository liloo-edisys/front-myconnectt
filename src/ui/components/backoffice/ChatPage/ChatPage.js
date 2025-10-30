import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, MoreVert } from "@material-ui/icons";
import ProfileModal from "./profile/ProfileModal";
import UserSelectionModal from "./profile/UserSelectionModal";
import ChannelCreationModal from "./profile/ChannelCreationModal";
import TagSuggestions from "./profile/TagSuggestions";
import { chatService, messageUtils } from "./chatService";
import { shallowEqual, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { useMessageHandler } from "./hooks/useMessageHandler";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { ExpandMore, ChevronRight } from "@material-ui/icons";

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
  const [allTags, setAllTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagsError, setTagsError] = useState(null);

  const [expandedChannels, setExpandedChannels] = useState({});

  //channel params
  const history = useHistory();
  const { channelId } = useParams();

  // Références
  const messageInputRef = useRef(null);

  const [channelMessages, setChannelMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [temporaryChats, setTemporaryChats] = useState([]);

  const [adminList, setAdminList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const { authToken } = useSelector(state => state.auth);

  // Fonction pour vérifier si un canal est un parent (a des enfants)
  const hasChildren = channel => {
    return channel.slaves && channel.slaves.length > 0;
  };

  // Fonction pour obtenir tous les IDs enfants d'un canal (récursif)
  const getChildrenIds = channel => {
    if (!hasChildren(channel)) return [];

    let ids = [];
    channel.slaves.forEach(slave => {
      ids.push(slave.id);
      ids = [...ids, ...getChildrenIds(slave)];
    });

    return ids;
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await chatService.getAllAdmin();

      if (response && response.data) {
        setAdminList(response.data);
      } else {
        console.warn("Aucun administrateur trouvé");
        setAdminList([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des administrateurs:", error);
      setAdminList([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Charger les admins au montage du composant
  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    if (channelId && chats.length > 0) {
      // Si un ID est présent dans l'URL et que les chats sont chargés
      handleChatSelect(channelId);
    }
  }, [channelId, chats]);

  // Dans loadTags, assurez-vous de bien tracer les erreurs
  const loadTags = async () => {
    // console.log("Loading tags...");
    setIsLoadingTags(true);
    setTagsError(null);

    try {
      const response = await chatService.getChannelTags();
      // console.log("API response:", response);

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

  const convertMarkdownLinks = text => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    return text.replace(linkRegex, (match, text, url) => {
      // Si l'URL contient '/messages/', c'est un lien interne
      if (url.includes("/messages/")) {
        // On ajoute la classe 'internal-link' pour l'identifier facilement
        return `<a href="${url}" class="internal-link" data-internal="true">#${text}</a>`;
      }

      // Comportement par défaut pour les autres liens (liens externes)
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">#${text}</a>`;
    });
  };

  // Et dans la partie d'affichage de votre message, utilisez quelque chose comme:

  const handleMessageChange = e => {
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
        // console.log("Showing tag suggestions");
        loadTags(); // Recharger les tags à chaque fois qu'on ouvre le modal
      }
      setShowTagSuggestions(true);
    } else {
      setShowTagSuggestions(false);
    }
  };

  // Ajoutez cette fonction pour gérer la sélection d'un tag
  // Dans ChatPage.js, modifiez la fonction handleSelectTag
  const handleSelectTag = updatedMessage => {
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
    state => ({
      user: state.auth.user
    }),
    shallowEqual
  );

  // Fonction pour créer une liste plate à partir de la structure hiérarchique des canaux
  const flattenChannels = (channels, level = 0, parentName = "") => {
    if (!channels || !Array.isArray(channels)) return [];

    let result = [];

    channels.forEach(channel => {
      // Ajouter les informations du niveau et du parent
      const channelWithLevel = {
        ...channel,
        level,
        parentName,
        displayName:
          level > 0 ? `${parentName} / ${channel.name}` : channel.name
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
      // console.log("User ID from Redux:", user.userID);
    } else {
      // Fallback à localStorage si user.userID n'est pas disponible
      const localStorageUserID = localStorage.getItem("userId");
      setCurrentUserId(localStorageUserID ? Number(localStorageUserID) : null);
      // console.log("User ID from localStorage:", localStorageUserID);
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
        // Combiner les chats de l'API avec les chats temporaires
        // En évitant les doublons basés sur l'ID
        const apiChats = response.data || [];

        // Conserver uniquement les chats temporaires dont l'ID ne figure pas dans l'API
        // (car ils sont marqués avec un préfixe 'temp_', il n'y aura pas de conflit)
        const combinedChats = [...temporaryChats, ...apiChats];

        setChats(combinedChats);
      } else {
        // Si pas de réponse ou données vides, utiliser uniquement les chats temporaires
        setChats([...temporaryChats]);
      }
    } catch (err) {
      setError("Erreur lors du chargement des conversations");
      console.error("Error loading chats:", err);
      // En cas d'erreur, conserver au moins les chats temporaires
      setChats([...temporaryChats]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sauvegarder les chats temporaires dans le localStorage
    if (temporaryChats.length > 0) {
      localStorage.setItem("temporaryChats", JSON.stringify(temporaryChats));
    }
  }, [temporaryChats]);

  // Ajouter un useEffect pour charger les chats temporaires au démarrage
  useEffect(() => {
    const savedTemporaryChats = localStorage.getItem("temporaryChats");
    if (savedTemporaryChats) {
      try {
        const parsedChats = JSON.parse(savedTemporaryChats);
        setTemporaryChats(parsedChats);
      } catch (e) {
        console.error("Erreur lors du chargement des chats temporaires:", e);
      }
    }
  }, []);

  const loadChannel = async () => {
    try {
      setLoading(true);
      // console.log("Chargement des canaux...");
      const response = await chatService.getChannel();

      // Vérifier si la réponse existe et contient des données
      if (response && response.data) {
        // console.log("Canaux chargés avec succès:", response.data);
        setChannel(response.data);

        // Mettre à jour également les canaux aplatis
        const allChannels = flattenChannels(response.data);
        setFlattenedChannels(allChannels);

        return response.data; // Retourner les données pour utilisation éventuelle
      } else {
        // Si pas de réponse ou données vides, initialiser avec un tableau vide
        console.log("Aucun canal trouvé");
        setChannel([]);
        setFlattenedChannels([]);
        return [];
      }
    } catch (err) {
      setError("Erreur lors du chargement des canaux");
      console.error("Error loading channels:", err);
      // En cas d'erreur, initialiser également avec un tableau vide
      setChannel([]);
      setFlattenedChannels([]);
      throw err; // Propager l'erreur pour gestion supérieure
    } finally {
      setLoading(false);
    }
  };

  // Configuration de SignalR pour les mises à jour en temps réel
  const handleSignalRMessage = useMessageHandler({
    selectedChat,
    chats,
    loadChats,
    loadChannel,
    flattenChannels,
    channel,
    setFlattenedChannels,
    setChannelMessages,
    setChats,
    updateNestedChannel,
    handleChatSelect,
    currentUserId,
    user
  });

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

  // Fonction utilitaire pour mettre à jour les canaux imbriqués
  const updateNestedChannel = (channels, targetId, newMessage) => {
    if (!channels || !Array.isArray(channels)) return channels;

    return channels.map(chan => {
      if (Number(chan.id) === Number(targetId)) {
        // Ajouter le message au canal si besoin
        const messages = chan.messages || [];
        const messageExists = messages.some(msg => msg.id === newMessage.id);

        if (!messageExists) {
          return {
            ...chan,
            messages: [...messages, newMessage]
          };
        }
        return chan;
      }

      if (chan.slaves && Array.isArray(chan.slaves)) {
        const updatedSlaves = updateNestedChannel(
          chan.slaves,
          targetId,
          newMessage
        );
        return { ...chan, slaves: updatedSlaves };
      }

      return chan;
    });
  };

  // Fonction pour créer un canal
  const handleCreateChannel = async channelData => {
    // console.log("Canal créé:", channelData);
    setLoading(true);

    try {
      // Appeler directement la fonction de chargement des canaux
      await loadChannel();

      // Attendre un court instant pour s'assurer que les données sont bien chargées
      setTimeout(() => {
        // Si nous avons l'ID du nouveau canal, le sélectionner automatiquement
        if (channelData.id) {
          handleChatSelect(channelData.id);
        }

        // Basculer vers l'onglet "Canaux" si ce n'est pas déjà le cas
        if (activeTab !== "channels") {
          setActiveTab("channels");
        }

        setLoading(false);
      }, 300);
    } catch (err) {
      setError("Erreur lors du chargement des conversations");
      console.error("Error after channel creation:", err);
      setLoading(false);
    }
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage?.trim() || !selectedChat) return;

    // Conserver une copie du message pour pouvoir l'ajouter optimistiquement
    const messageContent = newMessage.trim();

    // Vider le champ de message immédiatement pour améliorer la réactivité
    setNewMessage("");

    // Vérifier si c'est un chat temporaire (ID commence par "temp_")
    const isTemporaryChat = String(selectedChat).startsWith("temp_");

    try {
      // Transformer les tags #Tag en liens markdown
      const transformedMessage = messageContent.replace(
        /#(\w+)/g,
        (match, tagName) => {
          // Rechercher le tag correspondant dans la liste complète des tags
          const matchingTag = allTags.find(
            tag => tag.name.toLowerCase() === tagName.toLowerCase()
          );

          return matchingTag
            ? `[${tagName}](${window.location.origin}/messages/${matchingTag.chatID})`
            : match;
        }
      );

      if (isTemporaryChat) {
        // Pour les chats temporaires, on simule l'envoi en ajoutant le message localement
        const newMsg = {
          id: `temp_msg_${Date.now()}`,
          message: transformedMessage,
          sentAt: new Date().toISOString(),
          byUserID: currentUserId,
          isRead: true
        };

        // Mettre à jour les chats temporaires et la liste des chats
        const updatedTemporaryChats = temporaryChats.map(chat => {
          if (chat.id === selectedChat) {
            return {
              ...chat,
              messages: [...(chat.messages || []), newMsg]
            };
          }
          return chat;
        });

        setTemporaryChats(updatedTemporaryChats);

        // Mettre également à jour la liste principale des chats
        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.id === selectedChat) {
              return {
                ...chat,
                messages: [...(chat.messages || []), newMsg]
              };
            }
            return chat;
          })
        );

        return; // Sortir tôt, pas besoin d'appeler l'API
      }

      // Vérifier d'abord si le chat sélectionné est un canal
      const selectedChannelData = flattenedChannels.find(
        chan => Number(chan.id) === Number(selectedChat)
      );

      if (selectedChannelData) {
        // Envoyer un message au canal avec sendMessageToChannel
        const messageData = {
          chatID: selectedChat,
          message: transformedMessage
        };

        await chatService.sendMessageToChannel(messageData);

        // Récupérer les messages mis à jour sans indicateur de chargement
        try {
          const messagesResponse = await chatService.getChannelMessages(
            selectedChat
          );

          if (
            messagesResponse &&
            messagesResponse.data &&
            messagesResponse.data.messages
          ) {
            setChannelMessages(messagesResponse.data.messages);
          } else if (
            messagesResponse &&
            messagesResponse.data &&
            Array.isArray(messagesResponse.data)
          ) {
            setChannelMessages(messagesResponse.data);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des messages du canal après envoi:",
            error
          );
          // On ne montre pas d'erreur pour préserver l'UX
        }
      } else {
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
            message: transformedMessage
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
            transformedMessage,
            adminUser.id
          );
          await chatService.sendBackofficeMessage(messageData);
        }

        // Maintenant on laisse SignalR gérer la mise à jour des messages plutôt que de recharger
        // Comme avec SignalR, on peut avoir un délai, ajouter optimistiquement le message localement
        const newMsg = {
          id: `temp_msg_${Date.now()}`, // Sera remplacé par le vrai ID quand SignalR le recevra
          message: transformedMessage,
          sentAt: new Date().toISOString(),
          byUserID: currentUserId,
          isRead: true
        };

        setChats(prevChats =>
          prevChats.map(chat => {
            if (Number(chat.id) === Number(selectedChat)) {
              return {
                ...chat,
                messages: [...(chat.messages || []), newMsg]
              };
            }
            return chat;
          })
        );
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      // Afficher une erreur de manière non intrusive
      setError("Erreur lors de l'envoi du message");

      // Si l'envoi échoue, remettre le message dans le champ de saisie
      setNewMessage(messageContent);
    }
  };

  const handleChatSelect = useCallback(
    async chatId => {
      // Convertir chatId en valeur pour compatibilité (sans Number() pour les chats temporaires)
      const chatIdValue = String(chatId);
      const isTemporaryChat = chatIdValue.startsWith("temp_");

      // Si le chat est déjà sélectionné, pas besoin de refaire toute la procédure
      if (String(selectedChat) === chatIdValue) {
        return; // Sortir de la fonction tôt si c'est le même chat
      }

      // Mise à jour de la sélection
      setSelectedChat(chatIdValue);
      // console.log(" ------------ Chat sélectionné ------------ ", chatId);

      // Rediriger vers l'URL avec l'ID de la discussion
      history.push(`/messages/${chatIdValue}`);

      // Pour les chats temporaires, activer toujours l'onglet "messages"
      if (isTemporaryChat && activeTab !== "messages") {
        setActiveTab("messages");

        // Réinitialiser les messages du canal
        setChannelMessages([]);

        // Mettre à jour le titre du document pour un chat temporaire
        const tempChat = temporaryChats.find(chat => chat.id === chatIdValue);
        if (tempChat) {
          const otherUser = getOtherUser(tempChat);
          document.title = `Chat temporaire avec: ${otherUser?.userName ||
            "Utilisateur"}`;
        }

        return; // Pas besoin d'aller plus loin pour les chats temporaires
      }

      // À partir d'ici, c'est un chat normal ou un canal (pas temporaire)

      // Vérifier d'abord si c'est un canal
      const selectedChannelData = flattenedChannels.find(
        chan => Number(chan.id) === Number(chatId)
      );

      // Si c'est un canal et que l'onglet n'est pas "channels", changer l'onglet
      if (selectedChannelData && activeTab !== "channels") {
        setActiveTab("channels");
      }

      // Si ce n'est pas un canal et que l'onglet n'est pas "messages", changer l'onglet
      if (!selectedChannelData && activeTab !== "messages") {
        setActiveTab("messages");
      }

      // Mettre à jour le titre du document pour refléter la conversation actuelle
      if (selectedChannelData) {
        // Format pour les canaux : "Canal: [Nom du canal]"
        // document.title = `Canal: ${selectedChannelData.name}`;
      } else {
        // Pour les chats, on attend de récupérer les infos
        const chat = chats?.find(c => Number(c?.id) === Number(chatId));
        if (chat) {
          const otherUser = getOtherUser(chat);
          // Format pour les conversations : "Chat avec: [Nom]"
          // document.title = `Chat avec: ${chatName}`;
        }
      }

      if (selectedChannelData) {
        // Si c'est un canal, charger les messages via l'endpoint des canaux
        try {
          setLoadingMessages(true);
          const messagesResponse = await chatService.getChannelMessages(
            Number(chatId)
          );

          // console.log("Messages du canal récupérés:", messagesResponse.data);

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
      const chat = chats?.find(c => Number(c?.id) === Number(chatId));
      if (!chat) return;

      // Charger les messages via l'API pour les discussions normales
      try {
        setLoadingMessages(true);
        // console.log("Chargement des messages pour la discussion:", chatId);

        const messagesResponse = await chatService.getChatMessages(
          Number(chatId)
        );

        if (messagesResponse && messagesResponse.data) {
          // console.log(
          //   "Messages de discussion récupérés:",
          //   messagesResponse.data
          // );

          // Mettre à jour le chat dans la liste des chats avec les nouveaux messages
          const updatedChats = chats.map(c => {
            if (Number(c.id) === Number(chatId)) {
              // S'assurer que le format des données est cohérent
              const updatedMessages = Array.isArray(messagesResponse.data)
                ? messagesResponse.data
                : messagesResponse.data.messages || [];

              return {
                ...c,
                messages: updatedMessages
              };
            }
            return c;
          });

          // Mettre à jour la liste complète des chats
          setChats(updatedChats);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des messages de la discussion:",
          error
        );
        setError("Impossible de charger les messages de la discussion");
      } finally {
        setLoadingMessages(false);
      }

      // Marquer les messages non lus comme lus
      const unreadMessages = chat?.messages?.filter(msg => !msg?.isRead);
      if (unreadMessages && Array.isArray(unreadMessages)) {
        for (const msg of unreadMessages) {
          try {
            await chatService.markMessageAsRead({
              chatID: Number(chatId),
              messageID: msg?.id
            });
          } catch (err) {
            console.error("Error marking message as read:", err);
          }
        }
      }
    },
    [
      flattenedChannels,
      chats,
      temporaryChats,
      history,
      setError,
      selectedChat,
      activeTab,
      getOtherUser,
      setChats
    ]
  );

  // Ajoutez cet useEffect dans le composant ChatPage pour mettre en place le polling

  useEffect(() => {
    // Fonction pour charger les chats et mettre à jour les messages si un chat est sélectionné
    const refreshChatsAndMessages = async () => {
      try {
        // Charger tous les chats
        await loadChats();

        // Si un chat est sélectionné, mettre à jour ses messages
        if (selectedChat) {
          // Vérifier d'abord si c'est un canal
          const selectedChannelData = flattenedChannels.find(
            chan => Number(chan.id) === Number(selectedChat)
          );

          if (selectedChannelData) {
            // C'est un canal, charger les messages du canal
            try {
              const messagesResponse = await chatService.getChannelMessages(
                Number(selectedChat)
              );

              if (
                messagesResponse &&
                messagesResponse.data &&
                messagesResponse.data.messages
              ) {
                setChannelMessages(messagesResponse.data.messages);
              } else if (
                messagesResponse &&
                messagesResponse.data &&
                Array.isArray(messagesResponse.data)
              ) {
                setChannelMessages(messagesResponse.data);
              }
            } catch (error) {
              console.error(
                "Erreur lors de la mise à jour des messages du canal:",
                error
              );
              // Ne pas afficher d'erreur pour ne pas perturber l'expérience utilisateur
            }
          } else {
            // C'est un chat normal, pas un canal
            // Ne rien faire ici car loadChats() a déjà mis à jour les messages
            // pour les chats normaux, et nous ne voulons pas appeler getChatMessages
            // à nouveau car cela marquerait tous les messages comme lus
          }
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour périodique:", err);
      }
    };

    // Configurer l'intervalle pour rafraîchir les données toutes les 5 secondes
    const intervalId = setInterval(refreshChatsAndMessages, 5000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedChat, flattenedChannels]); // Dépendances pour recréer l'intervalle si le chat sélectionné change

  useEffect(() => {
    const handleLinkClick = e => {
      // Vérifier si le clic est sur un lien interne
      if (
        e.target.tagName === "A" &&
        e.target.classList.contains("internal-link")
      ) {
        e.preventDefault(); // Empêcher le comportement par défaut (rechargement de la page)

        // Extraire l'ID de chat/canal de l'URL
        const href = e.target.getAttribute("href");
        const match = href.match(/\/messages\/(\d+)/);

        if (match && match[1]) {
          const chatId = Number(match[1]);

          // Vérifier d'abord si c'est un canal
          const isChannel = flattenedChannels.some(
            chan => Number(chan.id) === chatId
          );

          // Si c'est un canal, activer l'onglet "channels"
          if (isChannel && activeTab !== "channels") {
            setActiveTab("channels");
          }

          // Mettre à jour l'URL sans recharger la page en utilisant history
          history.push(`/messages/${chatId}`);

          // Sélectionner le chat immédiatement (ce qui charge aussi les messages)
          handleChatSelect(chatId);
        }
      }
    };

    // Ajouter l'écouteur d'événements à TOUS les conteneurs de messages
    // pour couvrir à la fois les messages de canal et de chat normal
    document.addEventListener("click", handleLinkClick, true);

    // Nettoyage
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [flattenedChannels, activeTab, history, handleChatSelect]); //

  const tryLoadSpecificChatById = async specificId => {
    try {
      // Vérifier d'abord si c'est un canal
      const channelResponse = await chatService.getSpecificChannel(specificId);
      if (channelResponse && channelResponse.data) {
        // C'est un canal
        const newChannelData = channelResponse.data;

        // Ajouter ce canal à la liste des canaux
        setChannel(prevChannels => {
          // Vérifier si le canal existe déjà
          const channelExists = prevChannels.some(
            chan => Number(chan.id) === Number(specificId)
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
        setChats(prevChats => {
          // Vérifier si le chat existe déjà
          const chatExists = prevChats.some(
            chat => Number(chat?.id) === Number(specificId)
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
              chat => Number(chat?.id) === Number(channelId)
            );
            const foundChannel = flattenedChannels.find(
              chan => Number(chan.id) === Number(channelId)
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

  const handleProfileSelect = async profile => {
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

  // Filtrer les chats en fonction de l'onglet actif et de la recherche
  const filteredChats = chats?.filter(chat => {
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
        chat.messages.some(m =>
          m?.message?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );
  });

  // Obtenir les données du chat ou du canal sélectionné
  const getSelectedData = () => {
    // Vérifier d'abord si c'est un canal
    const selectedChannelData = flattenedChannels.find(
      chan => Number(chan.id) === Number(selectedChat)
    );

    if (selectedChannelData) {
      return {
        isChannel: true,
        data: selectedChannelData
      };
    }

    // Sinon, c'est un chat normal
    const selectedChatData = chats.find(
      chat => Number(chat?.id) === Number(selectedChat)
    );

    return {
      isChannel: false,
      data: selectedChatData
    };
  };

  const handleSelectUsers = selectedData => {
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
      // Utilisez un préfixe pour distinguer facilement les IDs temporaires
      const tempChatId = `temp_${Date.now()}`;

      // Créer un nouvel objet de conversation avec structure compatible
      const newChat = {
        id: tempChatId,
        isGroup: false,
        groupName: null,
        isTemporary: true, // Marquer comme temporaire pour préservation lors du rechargement
        users: [
          // L'utilisateur sélectionné avec le rôle admin (1)
          {
            id: selectedUser.id,
            userName: selectedUser.name,
            chatUserRole: 1 // Pour que getOtherUser() fonctionne correctement
          },
          // L'utilisateur actuel
          {
            id: currentUserId,
            userName: user?.fullName || "Vous", // Utiliser le nom complet si disponible
            chatUserRole: 2
          }
        ],
        messages: [] // Pas de messages initiaux
      };

      // Ajouter aux chats temporaires
      setTemporaryChats(prevTempChats => [...prevTempChats, newChat]);

      // Ajouter également à la liste des chats normaux
      // Ajouter aux chats temporaires
      setTemporaryChats(prevTempChats => [...prevTempChats, newChat]);

      // Ajouter également à la liste des chats normaux
      setChats(prevChats => [newChat, ...prevChats]);

      // Sélectionner automatiquement cette nouvelle conversation
      handleChatSelect(tempChatId);

      // Basculer sur l'onglet Messages si ce n'est pas déjà le cas
      if (activeTab !== "messages") {
        setActiveTab("messages");
      }
    } else {
      // Pour les groupes ou plusieurs utilisateurs, afficher un message d'erreur
      setError("La création de groupes n'est pas supportée dans cette version");
    }
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

  // Obtenir les données sélectionnées (chat ou canal)
  const selectedData = getSelectedData();
  const selectedChatData = selectedData.isChannel ? null : selectedData.data;
  const selectedChannelData = selectedData.isChannel ? selectedData.data : null;

  // Charger les données initiales au montage du composant
  useEffect(() => {
    loadChats();
    // Pas d'interval ici, on utilise SignalR pour les mises à jour
  }, []);

  // Charger les canaux une seule fois au montage
  useEffect(() => {
    loadChannel();
    // Pas d'interval ici, on utilise SignalR pour les mises à jour
  }, []);

  const [currentChatMasterID, setCurrentChatMasterID] = useState(null);

  // Premier bouton - sans chatMasterID
  const handleOpenChannelModal = () => {
    setCurrentChatMasterID(null); // Réinitialiser à null
    setIsChannelModalOpen(true);
  };

  // Second bouton - avec chatMasterID
  const handleOpenChannelForChild = id => {
    setCurrentChatMasterID(id); // Définir l'ID
    setIsChannelModalOpen(true);
  };

  return (
    <div className="container-fluid  p-0" style={{ height: "85vh" }}>
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
              <button
                className="btn flex-grow-1 rounded-0 py-2 btn-light text-white border-bottom bg-primary border-3"
                onClick={() => {
                  if (activeTab === "channels") {
                    handleOpenChannelModal();
                  } else {
                    setIsUserSelectionModalOpen(true);
                  }
                }}
              >
                {activeTab === "channels"
                  ? "Nouveau dossier"
                  : "Nouveau message"}
              </button>
            </div>

            {/* Onglets Messages/Canaux */}
            <div className="d-flex border-bottom">
              <button
                className={`btn flex-grow-1 rounded-0 py-2 ${
                  activeTab === "messages"
                    ? "btn-light text-white border-bottom bg-primary border-3"
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
                    ? "btn-light text-white border-bottom bg-primary border-3"
                    : "btn-white"
                }`}
                onClick={() => setActiveTab("channels")}
              >
                <i className="bi bi-hash me-2"></i>
                Dossiers
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
                    activeTab === "messages" ? "conversations" : "dossiers"
                  }...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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
                    <p>Aucun dossier trouvé</p>
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => setIsChannelModalOpen(true)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Nouveau dossier
                    </button>
                  </div>
                ) : (
                  // Filtrer pour n'afficher que les parents et les enfants visibles
                  flattenedChannels
                    .filter(chan => {
                      // Filtrer par recherche si nécessaire
                      const matchesSearch =
                        chan.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        (chan.displayName &&
                          chan.displayName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()));

                      if (searchQuery) return matchesSearch; // Si recherche active, afficher tous les résultats

                      // Niveau 0 toujours affiché
                      if (chan.level === 0) return true;

                      // Pour les niveaux supérieurs, vérifier si le parent est déployé
                      const parentSegments = chan.parentName.split("/");
                      // Trouver le parent immédiat
                      const immediateParentName = parentSegments[
                        parentSegments.length - 1
                      ].trim();
                      const parentChannel = flattenedChannels.find(
                        c =>
                          c.name === immediateParentName &&
                          c.level === chan.level - 1
                      );

                      // Afficher seulement si le parent est déployé
                      return (
                        parentChannel &&
                        expandedChannels[parentChannel.id] !== false
                      );
                    })
                    .map(chan => {
                      const lastMessage =
                        chan.messages && chan.messages.length > 0
                          ? chan.messages[chan.messages.length - 1]
                          : null;

                      const hasUnread =
                        chan.messages &&
                        Array.isArray(chan.messages) &&
                        chan.messages.some(
                          m =>
                            !m?.isRead &&
                            Number(m?.byUserID) !== Number(currentUserId)
                        );

                      // Vérifier si le canal a des enfants
                      const hasChildren = chan.slaves && chan.slaves.length > 0;
                      // État d'expansion du canal (par défaut déplié)
                      const isExpanded = expandedChannels[chan.id] !== false;

                      // Styles selon le niveau
                      const isRootLevel = chan.level === 0;
                      const indentation = chan.level * 20; // 20px par niveau d'indentation

                      return (
                        <div
                          key={chan.id}
                          className={`channel-item ${
                            Number(selectedChat) === Number(chan.id)
                              ? "selected"
                              : ""
                          }`}
                        >
                          <div
                            className={`d-flex align-items-center p-2 ${
                              Number(selectedChat) === Number(chan.id)
                                ? "bg-light"
                                : ""
                            }`}
                            style={{
                              paddingLeft: `${indentation + 10}px`,
                              cursor: "pointer"
                            }}
                          >
                            {/* Bouton dropdown pour les canaux avec enfants */}
                            {hasChildren && (
                              <div
                                className="me-2"
                                onClick={e => {
                                  e.stopPropagation(); // Empêcher de sélectionner le canal
                                  setExpandedChannels(prev => ({
                                    ...prev,
                                    [chan.id]: !prev[chan.id] // Inverser l'état
                                  }));
                                }}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  cursor: "pointer",
                                  borderRadius: "3px",
                                  border: "1px solid #ffffff",
                                  backgroundColor: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 8px 0 0"
                                }}
                              >
                                {isExpanded ? (
                                  <ExpandMore
                                    style={{
                                      fontSize: "24px",
                                      color: "#56565f"
                                    }}
                                  />
                                ) : (
                                  <ChevronRight
                                    style={{
                                      fontSize: "24px",
                                      color: "#56565f"
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            {/* Espace réservé pour l'alignement si pas d'enfants */}
                            {!hasChildren && (
                              <div
                                style={{ width: "32px", marginRight: "8px" }}
                              ></div>
                            )}

                            {/* Contenu principal du canal */}
                            <div
                              className="d-flex align-items-center flex-grow-1"
                              onClick={() => handleChatSelect(chan.id)}
                            >
                              <div
                                className="me-2 "
                                style={{ marginRight: "6px" }}
                              >
                                <div
                                  className="rounded-circle text-white d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "35px",
                                    height: "35px",
                                    backgroundColor: generateAvatarColor(
                                      chan.name
                                    ),
                                    fontSize: "14px"
                                  }}
                                >
                                  {isRootLevel
                                    ? "#"
                                    : chan.name.charAt(0).toUpperCase()}
                                </div>
                              </div>

                              <div className="flex-grow-1 overflow-hidden">
                                <div className="fw-medium text-truncate">
                                  {chan.name}
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
                                    ? lastMessage.message.length > 20
                                      ? lastMessage.message.substring(0, 20) +
                                        "..."
                                      : lastMessage.message
                                    : "Pas de message"}
                                </p>
                              </div>

                              {/* Indicateur de messages non lus */}
                              {/* {hasUnread && (
                                <div className="ms-2">
                                  <span className="badge rounded-pill bg-primary">
                                    {
                                      chan.messages.filter(
                                        (m) =>
                                          !m.isRead &&
                                          Number(m.byUserID) !==
                                            Number(currentUserId)
                                      ).length
                                    }
                                  </span>
                                </div>
                              )} */}
                            </div>
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
                filteredChats?.map(chat => {
                  const otherUser = getOtherUser(chat);
                  const lastMessage = getLastMessage(chat);
                  const hasUnread = chat.messages?.some(
                    m =>
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
                      <div className="position-relative me-3 ">
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "35px",
                            height: "35px",
                            backgroundColor: avatarColor,
                            fontSize: "14px",
                            marginRight: "6px"
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
                        <div className="d-flex mb-1">
                          <span>{chatName}</span>
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
                        )
                      }}
                    >
                      <span>#</span>
                    </div>
                    <div style={{ marginLeft: "8px" }}>
                      <h5 className="mb-0 fw-bold">
                        {selectedChannelData.name}
                      </h5>
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
                          marginRight: "8px",
                          backgroundColor: generateAvatarColor(
                            selectedChatData?.groupName ||
                              getOtherUser(selectedChatData)?.userName
                          )
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
                        <h5 className="fw-bold mb-0">
                          {selectedChatData.isGroup
                            ? selectedChatData.groupName
                            : getOtherUser(selectedChatData)?.userName}
                        </h5>
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
                    "linear-gradient(rgba(240, 240, 250, 0.9), rgba(240, 240, 250, 0.9)), url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23dcdcef' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")"
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
                      .map(msg => {
                        // Afficher les détails du message pour déboguer
                        // console.log("Traitement du message:", msg);

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
                            u => Number(u.id) === Number(msg.byUserID)
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
                                  color: "#b8b8b8",
                                  fontSize: "14px",
                                  marginRight: "8px"
                                }}
                              >
                                <span className="text-muted ">
                                  {senderName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="">
                                  <div className="p-2 rounded-3  mt-1">
                                    <div
                                      className="message-content"
                                      dangerouslySetInnerHTML={{
                                        __html: convertMarkdownLinks(
                                          msg.message
                                        )
                                      }}
                                    />
                                  </div>
                                  <span
                                    className=""
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#3165a7",
                                      fontWeight: "semi-bold"
                                    }}
                                  >
                                    {msg.byUserID === user?.userID
                                      ? "Vous"
                                      : msg.byUserName}
                                    ,{" "}
                                    {new Date(msg.sentAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      }
                                    )}
                                  </span>
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
                    ? [...selectedChatData.messages].sort(
                        (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
                      )
                    : []
                  ).map((msg, index, messages) => {
                    // Trouver l'expéditeur du message
                    const messageSender = selectedChatData?.users?.find(
                      user => Number(user.id) === Number(msg?.byUserID)
                    );

                    // Vérifier si le message provient de l'utilisateur actuel
                    const isFromCurrentUser =
                      Number(msg?.byUserID) === Number(currentUserId);

                    // Pour l'avatar, vérifier si le message suivant est du même expéditeur
                    const showAvatar =
                      index === 0 ||
                      messages[index - 1]?.byUserID !== msg?.byUserID;

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
                                fontSize: "14px"
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
                                : "18px 18px 18px 4px"
                            }}
                          >
                            {msg.message}
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
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-top bg-white p-3 position-sticky bottom-0">
                <form onSubmit={handleSendMessage}>
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
                      onKeyDown={e => {
                        // Empêcher la propagation des touches fléchées lorsque les suggestions sont visibles
                        if (
                          showTagSuggestions &&
                          ["ArrowUp", "ArrowDown", "Enter"].includes(e.key)
                        ) {
                          e.stopPropagation();
                        }
                      }}
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
                    : "Nouveau dossier"}
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

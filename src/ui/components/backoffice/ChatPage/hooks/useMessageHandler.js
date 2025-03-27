// hooks/useMessageHandler.js
import { useCallback } from 'react';

export function useMessageHandler({
  selectedChat,
  chats,
  loadChats,
  loadChannel,
  flattenChannels,
  channel,
  setFlattenedChannels,
  setChannelMessages,
  setChats,
  setChannel,
  updateNestedChannel,
  handleChatSelect,
  currentUserId,
  user
}) {
  const handleSignalRMessage = useCallback((messageData) => {
    console.log("ChatPage: SignalR message received:", messageData);

    // Vérifier que le message contient les informations nécessaires
    if (!messageData || !messageData.chatID) return;

    // Vérifier si le message appartient au chat/canal actuellement sélectionné
    if (Number(messageData.chatID) === Number(selectedChat)) {
      console.log("loadChats");

      loadChats()
        .then(() => {
          // Une fois les chats chargés, vérifier si le chat actuel existe toujours
          const chatExists = chats.some(
            (chat) => Number(chat?.id) === Number(selectedChat)
          );
          if (chatExists) {
            // Mettre à jour les messages du chat actuel
            handleChatSelect(selectedChat);
          }
        })
        .catch((err) => {
          console.error("Erreur lors du rechargement des chats:", err);
        });
    } else {
      console.log("loadChats");
      loadChannel()
        .then(() => {
          // Mettre à jour la liste des canaux aplatis si nécessaire
          const allChannels = flattenChannels(channel);
          setFlattenedChannels(allChannels);

          // Vous pourriez ajouter ici une notification visuelle pour indiquer un nouveau message
        })
        .catch((err) => {
          console.error("Erreur lors du rechargement des canaux:", err);
        });
    }

    // Convertir le message au format utilisé par l'application
    const formattedMessage = {
      id: messageData.id,
      message: messageData.message,
      sentAt: messageData.sentAt,
      byUserID: messageData.fromUserID,
      isRead: false,
    };

    // Si le message appartient au chat/canal actuellement sélectionné, l'ajouter à l'affichage
    if (Number(messageData.chatID) === Number(selectedChat)) {
      if (messageData.isChannel) {
        // Pour les canaux, mettre à jour channelMessages
        setChannelMessages((prevMessages) => {
          const messageExists = prevMessages.some(
            (msg) => msg.id === messageData.id
          );
          if (messageExists) return prevMessages;

          const updatedMessages = [...prevMessages, formattedMessage];
          // Tri par date pour garder l'ordre chronologique
          return updatedMessages.sort(
            (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
          );
        });
      } else {
        // Pour les chats normaux, mettre à jour la liste des chats
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (Number(chat.id) === Number(messageData.chatID)) {
              const messages = chat.messages || [];
              const messageExists = messages.some(
                (msg) => msg.id === messageData.id
              );

              if (!messageExists) {
                // Nouveau tableau avec le message ajouté et trié
                const updatedMessages = [
                  ...messages,
                  formattedMessage,
                ].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

                return {
                  ...chat,
                  messages: updatedMessages,
                };
              }
            }
            return chat;
          });
        });
      }
    } else {
      // Si le message n'appartient pas au chat actuel, mettre à jour la liste des chats
      // pour l'affichage dans la barre latérale
      if (messageData.isChannel) {
        // Mise à jour des canaux...
        setFlattenedChannels((prev) => {
          return prev.map((chan) => {
            if (Number(chan.id) === Number(messageData.chatID)) {
              const updatedMessages = [...(chan.messages || [])];
              const messageExists = updatedMessages.some(
                (msg) => msg.id === messageData.id
              );

              if (!messageExists) {
                updatedMessages.push(formattedMessage);
                return { ...chan, messages: updatedMessages };
              }
            }
            return chan;
          });
        });

        // Mise à jour de la structure hiérarchique des canaux
        setChannel((prev) =>
          updateNestedChannel(prev, messageData.chatID, formattedMessage)
        );
      } else {
        // Mise à jour ou création d'un chat normal
        setChats((prevChats) => {
          // Vérifier si le chat existe déjà
          const chatExists = prevChats.some(
            (chat) => Number(chat.id) === Number(messageData.chatID)
          );

          if (chatExists) {
            // Mettre à jour le chat existant
            return prevChats.map((chat) => {
              if (Number(chat.id) === Number(messageData.chatID)) {
                const messages = chat.messages || [];
                const messageExists = messages.some(
                  (msg) => msg.id === messageData.id
                );

                if (!messageExists) {
                  return {
                    ...chat,
                    messages: [...messages, formattedMessage],
                  };
                }
              }
              return chat;
            });
          } else {
            // Créer un nouveau chat à partir des données reçues
            const newChat = {
              id: messageData.chatID,
              isGroup: messageData.isGroup || false,
              groupName: messageData.chatName,
              users: [
                {
                  id: messageData.fromUserID,
                  userName: messageData.fromUserName,
                  chatUserRole: 1,
                },
                {
                  id: currentUserId,
                  userName: user?.fullName || "Vous",
                  chatUserRole: 2,
                },
              ],
              messages: [formattedMessage],
            };

            return [newChat, ...prevChats];
          }
        });
      }
    }
  }, [
    selectedChat, 
    chats, 
    loadChats, 
    loadChannel, 
    flattenChannels, 
    channel, 
    setFlattenedChannels, 
    setChannelMessages, 
    setChats,
    setChannel,
    updateNestedChannel, 
    handleChatSelect, 
    currentUserId, 
    user
  ]);

  return handleSignalRMessage;
}
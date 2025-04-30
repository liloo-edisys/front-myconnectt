import axios from "axios";

const API_URL = process.env.REACT_APP_WEBAPI_URL;

export const chatService = {
  // Récupérer toutes les conversations
  getChats: () => {
    return axios.get(`${API_URL}api/Chat/all`);
  },

  // Récupérer toutes les channels
  getChannel: () => {
    return axios.get(`${API_URL}api/Chat/channels`);
  },

  getChannelTags: () => {
    return axios.get(`${API_URL}api/Chat/channel/tags`);
  },

  getAllAdmin: () => {
    return axios.get(`${API_URL}api/User/backoffice`);
  },

  getSpecificChat: async chatId => {
    try {
      const response = await axios.get(`${API_URL}/api/chats/${chatId}`);
      return response;
    } catch (error) {
      console.error("Error fetching specific chat:", error);
      throw error;
    }
  },

  // Fonction pour récupérer un canal spécifique par ID
  getSpecificChannel: async channelId => {
    try {
      const response = await axios.get(`${API_URL}/api/channels/${channelId}`);
      return response;
    } catch (error) {
      console.error("Error fetching specific channel:", error);
      throw error;
    }
  },

  // Récupérer les messages d'un chat spécifique
  getChatMessages: chatId => {
    return axios.get(`${API_URL}api/Chat/${chatId}/messages`);
  },

  // Récupérer les messages d'un channel spécifique
  getChannelMessages: channelId => {
    return axios.get(`${API_URL}api/Chat/channel/messages/${channelId}`);
  },

  // Envoyer un message de l'admin vers un utilisateur
  sendBackofficeMessage: data => {
    return axios.post(`${API_URL}api/Chat/backoffice/to/user`, data);
  },

  // Envoyer un message utilisateur vers l'admin
  sendUserToBackoffice: data => {
    return axios.post(`${API_URL}api/Chat/user/to/backoffice`, data);
  },

  // Envoyer un message à un utilisateur spécifique
  sendMessageToUser: data => {
    return axios.post(`${API_URL}api/Chat/message/to/user`, data);
  },

  // Envoyer un message à un groupe
  sendMessageToGroup: data => {
    return axios.post(`${API_URL}api/Chat/message/to/users`, data);
  },

  // Envoyer un message à une canal
  sendMessageToChannel: data => {
    return axios.post(`${API_URL}api/Chat/message/to/channel`, data);
  },

  // Créer un nouveau groupe
  createGroup: data => {
    return axios.post(`${API_URL}api/Chat/create/group`, data);
  },

  // Créer un nouveau channel
  createChannel: data => {
    return axios.post(`${API_URL}api/Chat/channel`, data);
  },

  // Mettre à jour les utilisateurs d'un chat
  updateChatUsers: (chatId, data) => {
    return axios.post(`${API_URL}api/Chat/upsert/users/chat/${chatId}`, data);
  },

  // Marquer un message comme lu
  markMessageAsRead: data => {
    return axios.post(`${API_URL}api/Chat/message/as/read`, data);
  },

  // Envoyer un message d'un utilisateur à un autre
  sendMessageDispatch: (fromUserId, data) => {
    return axios.post(
      `${API_URL}api/Chat/message/dispatch/to/user/${fromUserId}`,
      data
    );
  },

  // Décrypter un message
  decryptMessage: data => {
    return axios.post(`${API_URL}api/Chat/decrypt`, data);
  }
};

// Types pour les requêtes
export const MessageTypes = {
  CHAT_REQUEST: {
    message: "",
    toUserID: 0
  },

  CHAT_REQUEST_GROUP: {
    chatID: 0,
    message: ""
  },

  CHAT_MESSAGE_ONLY: {
    message: ""
  },

  CHAT_MESSAGE_IS_READ: {
    chatID: 0,
    messageID: ""
  },

  CHAT_REQUEST_CREATE_GROUP: {
    chatID: 0,
    groupName: "",
    chatMasterID: 0,
    toUsers: [],
    isGroup: false
  }
};

// Utilitaires pour formater les messages
export const messageUtils = {
  formatChatRequest: (message, toUserId) => ({
    message,
    toUserID: toUserId
  }),

  formatGroupMessage: (chatId, message) => ({
    chatID: chatId,
    message
  }),

  formatCreateGroup: (name, masterId, users, isGroup = true) => ({
    groupName: name,
    chatMasterID: masterId,
    toUsers: users,
    isGroup
  })
};

// services/chatService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_WEBAPI_URL;

export const chatService = {
  // Récupérer toutes les conversations
  getChats: () => {
    return axios.get(`${API_URL}api/Chat/all`);
  },

  // Envoyer un message de l'admin vers un utilisateur
  sendBackofficeMessage: (data) => {
    return axios.post(`${API_URL}api/Chat/backoffice/to/user`, data);
  },

  // Envoyer un message utilisateur vers l'admin
  sendUserToBackoffice: (data) => {
    return axios.post(`${API_URL}api/Chat/user/to/backoffice`, data);
  },

  // Envoyer un message à un utilisateur spécifique
  sendMessageToUser: (data) => {
    return axios.post(`${API_URL}api/Chat/message/to/user`, data);
  },

  // Envoyer un message à un groupe
  sendMessageToGroup: (data) => {
    return axios.post(`${API_URL}api/Chat/message/to/users`, data);
  },

  // Créer un nouveau groupe
  createGroup: (data) => {
    return axios.post(`${API_URL}api/Chat/create/group`, data);
  },

  // Mettre à jour les utilisateurs d'un chat
  updateChatUsers: (chatId, data) => {
    return axios.post(`${API_URL}api/Chat/upsert/users/chat/${chatId}`, data);
  },

  // Marquer un message comme lu
  markMessageAsRead: (data) => {
    return axios.post(`${API_URL}api/Chat/message/as/read`, data);
  },

  // Envoyer un message d'un utilisateur à un autre
  sendMessageDispatch: (fromUserId, data) => {
    return axios.post(`${API_URL}api/Chat/message/dispatch/to/user/${fromUserId}`, data);
  },

  // Décrypter un message
  decryptMessage: (data) => {
    return axios.post(`${API_URL}api/Chat/decrypt`, data);
  }
};

// Types pour les requêtes
export const MessageTypes = {
  CHAT_REQUEST: {
    message: '',
    toUserID: 0
  },
  
  CHAT_REQUEST_GROUP: {
    chatID: 0,
    message: ''
  },

  CHAT_MESSAGE_ONLY: {
    message: ''
  },

  CHAT_MESSAGE_IS_READ: {
    chatID: 0,
    messageID: ''
  },

  CHAT_REQUEST_CREATE_GROUP: {
    chatID: 0,
    groupName: '',
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
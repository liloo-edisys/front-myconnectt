import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";

class SignalRService {
  constructor() {
    this.connection = null;
    this.connected = false;
    this.messageHandlers = [];
    this.connectPromise = null;
  }

  /**
   * Initialize and start SignalR connection
   * @param {string} authToken - Authentication token
   * @param {Function} onMessageReceived - Callback for message handling
   * @returns {Promise}
   */
  connect(authToken, onMessageReceived) {
    // Si une connexion est déjà en cours, retourner la promesse existante
    if (this.connectPromise) {
      console.log("Connection already in progress, returning existing promise");
      return this.connectPromise;
    }

    // Si déjà connecté, retourner une promesse résolue
    if (this.connected && this.connection) {
      console.log("Already connected to SignalR");
      if (onMessageReceived) {
        this.addMessageHandler(onMessageReceived);
      }
      return Promise.resolve(this.connection);
    }

    console.log("Creating new SignalR connection...");
    // Créer la connexion avec plus de détails de journalisation
    this.connection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/chat", {
        accessTokenFactory: () => authToken,
      })
      .configureLogging(LogLevel.Debug) // Ajout de logs détaillés
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Tentatives plus fréquentes
      .build();

    // Enregistrer le gestionnaire de messages
    if (onMessageReceived) {
      this.addMessageHandler(onMessageReceived);
    }

    // Logger tous les messages bruts reçus
    this.connection.on("", (data) => {
      console.warn("Raw SignalR message:", data);
    });

    // Gestionnaire d'événements de reconnexion
    this.connection.onreconnecting((error) => {
      console.log("SignalR reconnecting:", error);
      this.connected = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log("SignalR reconnected with ID:", connectionId);
      this.connected = true;
    });

    this.connection.onclose((error) => {
      console.log("SignalR connection closed:", error);
      this.connected = false;
      this.connectPromise = null;
    });

    // Démarrer la connexion
    this.connectPromise = this.connection
      .start()
      .then(() => {
        console.log("SignalR connected successfully");
        this.connected = true;

        // Enregistrer les gestionnaires d'événements pour les messages
        this.connection.on("UserToUser", (message) => {
          console.log("UserToUser message received:", message);
          this.processMessage(message);
        });

        // Essayer aussi avec la casse originale
        this.connection.on("userToUser", (message) => {
          console.log("userToUser message received:", message);
          this.processMessage(message);
        });

        // Vérifier que les handlers sont bien enregistrés
        console.log(
          `Registered ${this.messageHandlers.length} message handlers`
        );

        this.connectPromise = null;
        return this.connection;
      })
      .catch((err) => {
        console.error("SignalR Connection Error:", err);
        this.connected = false;
        this.connectPromise = null;
        throw err;
      });

    return this.connectPromise;
  }

  // Traiter les messages dans différents formats possibles
  processMessage(message) {
    console.log("Processing SignalR message:", message);

    let messageData;

    // Format avec type et arguments (comme dans votre exemple)
    if (
      message.type === 1 &&
      message.arguments &&
      message.arguments.length > 0
    ) {
      messageData = message.arguments[0];
      console.log("Extracted message data from arguments:", messageData);
    }
    // Format direct (objet message)
    else if (message.id && message.message) {
      messageData = message;
      console.log("Message in direct format:", messageData);
    }
    // Message déjà sous forme d'objet simple
    else if (typeof message === "object") {
      messageData = message;
      console.log("Using message as is:", messageData);
    }
    // Autre format inconnu
    else {
      console.warn("Unknown message format:", message);
      messageData = { rawMessage: message };
    }

    // Tenter de décrypter si un message chiffré est présent
    if (messageData && messageData.message) {
      this.decryptMessage(messageData)
        .then((decryptedMessage) => {
          console.log("Successfully decrypted message:", decryptedMessage);
          messageData.decryptedContent = decryptedMessage;
          this.notifyMessageReceived(messageData);
        })
        .catch((err) => {
          console.error("Failed to decrypt message:", err);
          this.notifyMessageReceived(messageData);
        });
    } else {
      this.notifyMessageReceived(messageData);
    }
  }

  /**
   * Decrypt message content using axios
   * @param {Object} messageData - Message data with encrypted content
   * @returns {Promise<string>} - Decrypted message content
   */
  async decryptMessage(messageData) {
    if (!messageData || !messageData.message) {
      return "No message content";
    }

    try {
      // Get token from localStorage or other storage mechanism
      const token = localStorage.getItem("token");

      console.log("Attempting to decrypt message:", messageData.message);

      // Prepare axios request to decrypt the message
      const response = await axios({
        method: "post",
        url: `${process.env.REACT_APP_WEBAPI_URL}api/chat/decrypt`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          encryptedMessage: messageData.message,
          chatID: messageData.chatID,
        },
      });

      // Log the response for debugging
      console.log("Decryption response:", response.data);

      // Return the decrypted message from the response
      return (
        response.data.decryptedMessage || "Decryption returned empty result"
      );
    } catch (error) {
      console.error("Message decryption error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          "Server responded with:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);
      }
      return `[Encrypted: ${messageData.message}]`;
    }
  }

  /**
   * Disconnect SignalR
   */
  disconnect() {
    if (this.connection) {
      this.connected = false;
      this.connection.stop();
      this.connection = null;
      this.messageHandlers = [];
      console.log("SignalR disconnected");
    }
  }

  /**
   * Add message handler
   * @param {Function} handler - Message handler function
   */
  addMessageHandler(handler) {
    if (handler && typeof handler === "function") {
      this.messageHandlers.push(handler);
      console.log(
        `Message handler added. Total handlers: ${this.messageHandlers.length}`
      );
    }
  }

  /**
   * Remove message handler
   * @param {Function} handler - Message handler to remove
   */
  removeMessageHandler(handler) {
    const initialCount = this.messageHandlers.length;
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    const removedCount = initialCount - this.messageHandlers.length;
    console.log(
      `Removed ${removedCount} message handler(s). Remaining: ${this.messageHandlers.length}`
    );
  }

  /**
   * Notify all handlers of received message
   * @param {Object} message - Message object
   */
  notifyMessageReceived(message) {
    console.log(
      `Notifying ${this.messageHandlers.length} handlers about message:`,
      message
    );
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    });
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected;
  }
}

// Create and export singleton instance
const signalRService = new SignalRService();
export default signalRService;

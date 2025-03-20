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
    this.connection.onreconnecting(error => {
      console.log("SignalR reconnecting:", error);
      this.connected = false;
    });

    this.connection.onreconnected(connectionId => {
      console.log("SignalR reconnected with ID:", connectionId);
      this.connected = true;
    });

    this.connection.onclose(error => {
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
        console.log(`Registered ${this.messageHandlers.length} message handlers`);

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
    if (message.type === 1 && message.arguments && message.arguments.length > 0) {
      messageData = message.arguments[0];
      console.log("Extracted message data from arguments:", messageData);
    } 
    // Format direct (objet message)
    else if (message.id && message.message) {
      messageData = message;
      console.log("Message in direct format:", messageData);
    } 
    // Message déjà sous forme d'objet simple
    else if (typeof message === 'object') {
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
        .then(decryptedMessage => {
          console.log("Successfully decrypted message:", decryptedMessage);
          messageData.decryptedContent = decryptedMessage;
          this.notifyMessageReceived(messageData);
        })
        .catch(err => {
          console.error("Failed to decrypt message:", err);
          this.notifyMessageReceived(messageData);
        });
    } else {
      this.notifyMessageReceived(messageData);
    }
  }

  // Le reste de votre code...
}

// Create and export singleton instance
const signalRService = new SignalRService();
export default signalRService;
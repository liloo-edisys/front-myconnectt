import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connection = null;
const messageHandlers = [];
let messageHandlingEnabled = true; // Flag pour activer/désactiver le traitement

const signalRService = {
  connect: (authToken, onConnected) => {
    return new Promise((resolve, reject) => {
      // Si déjà connecté, ne pas recréer la connexion
      if (connection && connection.state === "Connected") {
        if (onConnected) onConnected();
        resolve();
        return;
      }

      // Créer une nouvelle connexion avec plus de logs pour le débogage
      connection = new HubConnectionBuilder()
        .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/backoffice", {
          accessTokenFactory: () => authToken
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Stratégie de reconnexion plus agressive
        .configureLogging(LogLevel.Information) // Ajouter des logs pour le débogage
        .build();

      // Gérer les événements de reconnexion
      connection.onreconnecting(error => {
        console.warn("SignalR reconnecting due to:", error);
      });

      connection.onreconnected(connectionId => {
        console.log("SignalR reconnected with ID:", connectionId);
      });

      connection.onclose(error => {
        console.warn("SignalR connection closed:", error);
      });

      connection
        .start()
        .then(() => {
          console.log("SignalR connected successfully");

          // Intercepteur pour déboguer TOUS les événements SignalR
          const originalOn = connection.on;
          connection.on = function(methodName, newMethod) {
            console.log(`Registering handler for SignalR event: ${methodName}`);

            // Wrapper qui loggera tous les appels
            const wrappedMethod = (...args) => {
              console.log(`SignalR event received: ${methodName}`, args);
              return newMethod.apply(this, args);
            };

            return originalOn.call(this, methodName, wrappedMethod);
          };

          // Définir les écouteurs pour les messages de chat
          const messageEvents = [
            "ReceiveMessage",
            "UserToUser",
            "NewMessage",
            "SendMessage",
            "ChatMessage",
            "MessageReceived",
            "BackofficeMessage"
          ];
          messageEvents.forEach(eventName => {
            connection.on(eventName, message => {
              console.log(`${eventName} received via SignalR:`, message);

              // Normaliser le message selon sa source
              const normalizedMessage = normalizeMessage(message, eventName);

              // Vérifier que le message est valide
              if (normalizedMessage) {
                // Appeler tous les gestionnaires enregistrés si le traitement est activé
                if (messageHandlingEnabled) {
                  messageHandlers.forEach(handler => {
                    try {
                      handler(normalizedMessage);
                    } catch (error) {
                      console.error(
                        `Error in message handler (${eventName}):`,
                        error
                      );
                    }
                  });
                }
              } else {
                console.warn(
                  `Message ${eventName} avec format invalide:`,
                  message
                );
              }
            });
          });

          if (onConnected) onConnected();
          resolve();
        })
        .catch(error => {
          console.error("Connection with SignalR failed:", error);
          reject(error);
        });
    });
  },

  addMessageHandler: handler => {
    if (typeof handler === "function") {
      // Éviter les doublons
      if (!messageHandlers.includes(handler)) {
        messageHandlers.push(handler);
        console.log(
          "Message handler added, total handlers:",
          messageHandlers.length
        );
      }
    }
  },

  removeMessageHandler: handler => {
    const index = messageHandlers.indexOf(handler);
    if (index !== -1) {
      messageHandlers.splice(index, 1);
      console.log(
        "Message handler removed, remaining handlers:",
        messageHandlers.length
      );
    }
  },

  disconnect: () => {
    if (connection) {
      connection.stop().catch(err => {
        console.error("Error while disconnecting SignalR:", err);
      });
      console.log("SignalR disconnect requested");
    }
  },

  // Activer/désactiver le traitement des messages
  enableMessageHandling: (enabled = true) => {
    messageHandlingEnabled = enabled;
    console.log(`SignalR message handling ${enabled ? "enabled" : "disabled"}`);
  },

  // Méthode utilitaire pour déboguer l'état de la connexion
  getConnectionStatus: () => {
    if (!connection) return "Not initialized";
    return connection.state;
  },

  // Méthode pour normaliser un message manuellement
  normalizeMessage: (message, eventType) => {
    return normalizeMessage(message, eventType);
  }
};

// Fonction pour normaliser les formats de messages potentiellement différents
function normalizeMessage(message, eventName) {
  // Vérifier que le message existe
  if (!message) return null;

  // Créer une copie pour ne pas modifier l'original
  const normalized = { ...message };

  // Ajouter le type d'événement pour référence
  normalized._eventSource = eventName;

  // S'assurer que les propriétés ont un format cohérent
  if (normalized.ChatID !== undefined && normalized.chatID === undefined) {
    normalized.chatID = normalized.ChatID;
  }

  if (
    normalized.FromUserID !== undefined &&
    normalized.fromUserID === undefined
  ) {
    normalized.fromUserID = normalized.FromUserID;
  }

  if (normalized.Message !== undefined && normalized.message === undefined) {
    normalized.message = normalized.Message;
  }

  // Normalisation spécifique pour UserToUser
  if (eventName === "UserToUser") {
    // Assurer que tous les champs requis sont présents
    normalized.id = normalized.id || normalized.messageId || Date.now();
    normalized.sentAt =
      normalized.sentAt || normalized.timestamp || new Date().toISOString();
    normalized.isChannel = normalized.isChannel || false;

    // Si le message UserToUser a un format spécial, vous pouvez le convertir ici
    // Par exemple, s'il contient un champ 'conversationId' au lieu de 'chatID'
    if (!normalized.chatID && normalized.conversationId) {
      normalized.chatID = normalized.conversationId;
    }

    // Si pas d'ID de chat mais des ID utilisateurs, on peut créer un ID de chat
    if (!normalized.chatID && normalized.toUserID && normalized.fromUserID) {
      // Créer un ID basé sur les IDs d'utilisateurs
      normalized.chatID = `user_${Math.min(
        normalized.fromUserID,
        normalized.toUserID
      )}_${Math.max(normalized.fromUserID, normalized.toUserID)}`;
      normalized.isDirectMessage = true;
    }
  }

  // Vérification finale que le message a les champs minimaux requis
  if (!normalized.chatID && !normalized.fromUserID) {
    console.warn(`Message ${eventName} incomplet ou mal formaté:`, message);
    return null;
  }

  return normalized;
}

export default signalRService;

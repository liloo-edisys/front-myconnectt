import { HubConnectionBuilder } from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.connected = false;
    this.messageHandlers = [];
  }

  /**
   * Initialize and start SignalR connection
   * @param {string} authToken - Authentication token
   * @param {Function} onMessageReceived - Callback for message handling
   * @returns {Promise}
   */
  connect(authToken, onMessageReceived) {
    // Create connection using the same pattern as your example
    this.connection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/chat", {
        accessTokenFactory: () => authToken,
      })
      .withAutomaticReconnect()
      .build();

    // Register message handler
    if (onMessageReceived) {
      this.messageHandlers.push(onMessageReceived);
    }

    // Start the connection
    return this.connection
      .start()
      .then(() => {
        console.log("SignalR connected successfully");
        this.connected = true;

        // Register event handler for receiving messages
        this.connection.on("userToUser", (message) => {
          console.log("Received message:", message);
          this.notifyMessageReceived(message);
        });

        return this.connection;
      })
      .catch((err) => {
        console.error("SignalR Connection Error: ", err);
        throw err;
      });
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
    }
  }

  /**
   * Add message handler
   * @param {Function} handler - Message handler function
   */
  addMessageHandler(handler) {
    if (handler && typeof handler === "function") {
      this.messageHandlers.push(handler);
    }
  }

  /**
   * Remove message handler
   * @param {Function} handler - Message handler to remove
   */
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  /**
   * Notify all handlers of received message
   * @param {Object} message - Message object
   */
  notifyMessageReceived(message) {
    this.messageHandlers.forEach((handler) => handler(message));
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

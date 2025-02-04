import React, { useState, useRef, useEffect } from 'react';
import ChatIcon from '@material-ui/icons/Chat';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import './MetronicChat.css';

const MetronicChat = ({ supportName = "Support MyConnect" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "👋 Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      sender: "support",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen, messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Simuler une réponse du support
    setTimeout(() => {
      const supportResponse = {
        id: (Date.now() + 1).toString(),
        content: "Je vous réponds dans quelques instants...",
        sender: "support",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="metronic-chat-widget">
      <button
        onClick={() => setIsOpen(true)}
        className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
      >
        <ChatIcon />
        <span>Messages</span>
      </button>

      <div className={`chat-container ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-user-info">
            <div className="avatar">
              <span className="avatar-text">{supportName.charAt(0)}</span>
              <span className="status-badge"></span>
            </div>
            <div className="user-details">
              <h3>{supportName}</h3>
              <span className="status">En ligne</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn">
              <MoreVertIcon />
            </button>
            <button className="action-btn" onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-wrapper ${msg.sender === "user" ? "outgoing" : "incoming"}`}
            >
              <div className="message">
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <div className="input-group">
            <button className="attach-btn">
              <AttachFileIcon />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="message-input"
            />
            <button
              className={`send-btn ${!message.trim() ? 'disabled' : ''}`}
              onClick={sendMessage}
              disabled={!message.trim()}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetronicChat;
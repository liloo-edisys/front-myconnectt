import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import ListIcon from "@material-ui/icons/List";
import "./MetronicChat.css";

const MetronicChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFaq, setShowFaq] = useState(true);
  const [faqData, setFaqData] = useState([]);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      content:
        "👋 Bonjour! Je suis là pour répondre à vos questions. Voici les sujets fréquemment abordés :",
      type: "bot",
      timestamp: new Date(),
      suggestions: []
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Function to detect and render links in message content
  const renderMessageContent = content => {
    // Check if content is a URL only
    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (urlRegex.test(content)) {
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="message-link"
          onClick={e => {
            e.stopPropagation();
            window.open(content, "_blank", "noopener,noreferrer");
          }}
        >
          {content}
        </a>
      );
    }

    // For mixed content or text with URLs
    const urlsInTextRegex = /(https?:\/\/[^\s]+)/g;

    // If no URLs in the text, return as is
    if (!urlsInTextRegex.test(content)) {
      return content;
    }

    // Create array to hold parts of the message (text and links)
    const parts = [];

    // Find all URLs in the content
    let lastIndex = 0;
    let match;
    let index = 0;

    // Use regex to find all matches
    const regex = /(https?:\/\/[^\s]+)/g;

    // For each match, add the text before it and the link
    while ((match = regex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the link
      parts.push(
        <a
          key={index++}
          href={match[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="message-link"
          onClick={e => {
            e.stopPropagation();
            window.open(match[0], "_blank", "noopener,noreferrer");
          }}
        >
          {match[0]}
        </a>
      );

      // Update lastIndex to the end of this match
      lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last URL
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(
          "https://myconnectt-apiback-prod.azurewebsites.net/api/Faq",
          {
            headers: {
              accept: "text/plain"
            }
          }
        );
        setFaqData(response.data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            content:
              "Désolé, je n'ai pas pu charger les questions fréquentes. Veuillez réessayer plus tard.",
            type: "bot",
            timestamp: new Date(),
            suggestions: []
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = answer => {
    setIsTyping(true);
    const typingTime = Math.min(Math.max(answer.length * 30, 1000), 3000);

    return new Promise(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, typingTime);
    });
  };

  const handleQuestionClick = async (question, answer, slaves = []) => {
    // Hide the main FAQ list when a question is selected
    setShowFaq(false);

    // Add the user's question to the messages
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        content: question,
        type: "user",
        timestamp: new Date(),
        suggestions: []
      }
    ]);

    // Simulate typing
    await simulateTyping(answer);

    // Add the bot's answer to the messages, including any slave FAQs as suggestions
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        content: answer,
        type: "bot",
        timestamp: new Date(),
        suggestions: slaves
      }
    ]);

    // Update current suggestions
    setCurrentSuggestions(slaves);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleFaq = () => {
    setShowFaq(!showFaq);
  };

  return (
    <div className="metronic-chat-widget">
      <button
        onClick={toggleChat}
        className={`chat-toggle-btn ${isOpen ? "hidden" : ""}`}
      >
        <ChatIcon />
        <span>Support</span>
      </button>

      <div className={`chat-container ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <div className="header-user-info">
            <div className="avatar">
              <span className="avatar-text">S</span>
              <span className="status-badge"></span>
            </div>
            <div className="user-details">
              <h3>Support MyConnectt</h3>
              <span className="status">En ligne</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={toggleFaq}>
              <ListIcon />
            </button>
            <button className="action-btn" onClick={toggleChat}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map(msg => (
            <div key={msg.id}>
              <div
                className={`message-wrapper ${
                  msg.type === "user" ? "outgoing" : "incoming"
                }`}
              >
                <div className="message">
                  <div className="message-content">
                    {renderMessageContent(msg.content)}
                  </div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>

              {/* Render suggestions (slave FAQs) below bot messages */}
              {msg.type === "bot" &&
                msg.suggestions &&
                msg.suggestions.length > 0 && (
                  <div className="suggestion-buttons">
                    {msg.suggestions.map(slave => (
                      <button
                        key={slave.id}
                        onClick={() =>
                          handleQuestionClick(
                            slave.question,
                            slave.answer,
                            slave.slaves
                          )
                        }
                        className="suggestion-button"
                      >
                        {slave.question}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper incoming">
              <div className="message typing-indicator">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="message-time">En train d'écrire...</div>
              </div>
            </div>
          )}

          {showFaq && !isLoading && (
            <div className="faq-buttons">
              {faqData.map(faq => (
                <button
                  key={faq.id}
                  onClick={() =>
                    handleQuestionClick(faq.question, faq.answer, faq.slaves)
                  }
                  className="faq-button"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="message-wrapper incoming">
              <div className="message">
                <div className="message-content">
                  Chargement des questions fréquentes...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <div className="input-group">
            <span className="footer-info">
              <ChatIcon style={{ fontSize: "16px" }} />
              Bot FAQ - Temps de réponse moyen : &lt; 1 minute
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetronicChat;

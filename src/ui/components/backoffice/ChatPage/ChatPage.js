import React, { useState } from "react";
import {
  Search,
  Star,
  StarBorder,
  MoreVert,
  Reply,
  Delete,
  Email,
  AccountCircle,
  Add,
  AttachFile,
  InsertEmoticon,
  Image,
  Send,
} from "@material-ui/icons";
import "./chat.scss";

const ChatPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMail, setSelectedMail] = useState(2);
  const [newMessage, setNewMessage] = useState("");
  const [mails, setMails] = useState([
    {
      id: 1,
      sender: "Ben Cline",
      avatar: "/api/placeholder/40/40",
      subject: "Build stunning courses with Content...",
      preview:
        "Nullam molestie tincidunt sem, at tincidunt libero vulputate id. Sed ultric...",
      date: "Dec 15",
      starred: true,
      messages: [
        {
          id: 1,
          text: "Nullam molestie tincidunt sem, at tincidunt libero vulputate id. Sed ultric...",
          sender: "Virginia Jordan",
          timestamp: "15:00",
        },
      ],
    },
    {
      id: 2,
      sender: "Erric Hoffman",
      email: "erichoffman@gmail.com",
      avatar: "/api/placeholder/40/40",
      subject: "Special Request for Attendance to Quarterly Meeting",
      preview: "I am writing on behalf of the Product Development Team...",
      date: "Dec 15",
      starred: false,
      messages: [
        {
          id: 1,
          text: "Sure, I'll send it right away.",
          sender: "Virginia Jordan",
          timestamp: "15:00",
        },
        {
          id: 2,
          text:
            "I have a question about the report. Did you include the latest sales figures?",
          sender: "You",
          timestamp: "15:01",
        },
      ],
    },
    {
      id: 3,
      sender: "Airbnb",
      avatar: "/api/placeholder/40/40",
      subject: "Let's finish your listing!",
      preview:
        "Mauris lorem quam, pretium ac tellus in, bibendum vehicula metus. Class patent...",
      date: "Dec 15",
      starred: false,
      messages: [],
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const updatedMails = mails.map((mail) => {
      if (mail.id === selectedMail) {
        return {
          ...mail,
          messages: [
            ...(mail.messages || []),
            {
              id: Date.now(),
              text: newMessage,
              sender: "You",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
            },
          ],
        };
      }
      return mail;
    });

    setMails(updatedMails);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const selectedMailData = mails.find((m) => m.id === selectedMail);

  const handleStarMail = (mailId) => {
    const updatedMails = mails.map((mail) => {
      if (mail.id === mailId) {
        return {
          ...mail,
          starred: !mail.starred,
        };
      }
      return mail;
    });
    setMails(updatedMails);
  };

  const filteredMails = mails.filter(
    (mail) =>
      mail.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mail-app">
      <div className="mail-sidebar">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="inbox-header">
          <div className="inbox-title">
            <input type="checkbox" className="checkbox" />
            <span>Inbox</span>
          </div>
          <span className="dropdown">All</span>
        </div>

        <div className="mail-list">
          {filteredMails.map((mail) => (
            <div
              key={mail.id}
              className={`mail-item ${
                selectedMail === mail.id ? "active" : ""
              }`}
              onClick={() => setSelectedMail(mail.id)}
            >
              <AccountCircle className="avatar" />
              <div className="mail-content">
                <div className="mail-header">
                  <span className="sender">{mail.sender}</span>
                  <span className="date">{mail.date}</span>
                </div>
                <div className="subject">{mail.subject}</div>
                <div className="preview">{mail.preview}</div>
              </div>
              <div
                className="star-icon-wrapper"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarMail(mail.id);
                }}
              >
                {mail.starred ? (
                  <Star className="star-icon starred" />
                ) : (
                  <StarBorder className="star-icon" />
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="compose-btn">
          <Add />
          Compose New
        </button>
      </div>

      <div className="mail-main">
        {selectedMailData && (
          <div className="selected-mail">
            <div className="mail-header">
              <div className="sender-info">
                <AccountCircle className="avatar large" />
                <div className="sender-details">
                  <div className="name-row">
                    <h2>{selectedMailData.sender}</h2>
                    <span className="email">{selectedMailData.email}</span>
                  </div>
                  <div className="date-time">July 23, 2018 06:41 AM</div>
                </div>
              </div>
              <div className="actions">
                {/* <Reply />
                <Delete />
                <Email />
                <MoreVert /> */}
              </div>
            </div>

            <div className="mail-content">
              <h1>{selectedMailData.subject}</h1>
              {selectedMailData.content && (
                <div className="mail-body">{selectedMailData.content}</div>
              )}

              {selectedMailData.attachments && (
                <div className="attachments">
                  {selectedMailData.attachments.map((att, index) => (
                    <div key={index} className="attachment">
                      <div className="attachment-icon">
                        {att.type === "pdf" ? "PDF" : "IMG"}
                      </div>
                      <div className="attachment-info">
                        <span className="name">{att.name}</span>
                        <span className="size">{att.size}</span>
                      </div>
                      <button className="download-btn">↓</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="messages-section">
                {selectedMailData.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.sender === "You" ? "sent" : "received"
                    }`}
                  >
                    <div className="message-content">{msg.text}</div>
                    <div className="message-time">{msg.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reply-section">
              <form onSubmit={handleSendMessage} className="reply-editor">
                <input
                  type="text"
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="message-input"
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim()}
                >
                  <Send />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="right-sidebar">
        <AccountCircle className="avatar" />
        <AccountCircle className="avatar" />
        <AccountCircle className="avatar" />
        <button className="add-more">
          <Add />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;

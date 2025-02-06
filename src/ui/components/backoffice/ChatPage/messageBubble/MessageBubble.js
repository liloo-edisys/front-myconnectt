import React from "react";
import { Link } from "react-router-dom";
import { Add, Person } from "@material-ui/icons"; // Ajout de l'icône Person
import "./MessageBubble.scss";

export const MessageBubble = ({ messages = [], unreadCount = 0 }) => {
  const displayedMessages = messages.slice(0, 5);

  return (
    <div className="message-bubble">
      <ul className="message-bubble__list">
        {displayedMessages.map((message) => (
          <li key={message.id} className="message-bubble__item">
            <div className="symbol symbol-40px">
              <div className="symbol-label fs-2 fw-semibold bg-light-primary text-primary">
                <Person />
              </div>
              <div className="message-bubble__item-status"></div>
            </div>
          </li>
        ))}
      </ul>

      <Link to="/messages" className="message-bubble__more">
        <Add />
      </Link>
    </div>
  );
};

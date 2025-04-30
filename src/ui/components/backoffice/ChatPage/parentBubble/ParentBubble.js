import React from "react";
import { MessageBubble } from "../messageBubble/MessageBubble";

export const ParentBubble = () => {
  const messages = [
    {
      id: 1,
      name: "John Doe",
      avatar: "/path/to/avatar1.jpg",
      lastMessage: "Salut, comment ça va ?"
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "/path/to/avatar2.jpg",
      lastMessage: "Tu as reçu mon message ?"
    },
    {
      id: 3,
      name: "Jane Smith",
      avatar: "/path/to/avatar2.jpg",
      lastMessage: "Tu as reçu mon message ?"
    }
    // ... autres messages
  ];

  return (
    <div className="parent-component">
      <MessageBubble messages={messages} unreadCount={3} />
    </div>
  );
};

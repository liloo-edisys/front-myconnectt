import { HubConnectionBuilder } from "@microsoft/signalr";
import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./chatInput.jsx";
import ChatWindow from "./chatWindow.jsx";
import { useSelector } from "react-redux";

const Chat = () => {
  const [chat, setChat] = useState([]);
  const latestChat = useRef(null);
  const { authToken } = useSelector(state => state.auth);

  latestChat.current = chat;

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_WEBAPI_URL + "hubs/chat", {
        accessTokenFactory: () => authToken
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(result => {
        connection.on("ReceiveMessage", message => {
          const updatedChat = [...latestChat.current];
          updatedChat.push(message);

          setChat(updatedChat);
        });
      })
      .catch(e => console.log("Connection failed: ", e));
  }, []);

  const sendMessage = async (user, message) => {
    const chatMessage = {
      user: user,
      message: message
    };

    try {
      await fetch(process.env.REACT_APP_WEBAPI_URL + "api/chat/messages", {
        method: "POST",
        body: JSON.stringify(chatMessage),
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (e) {
      console.log("Sending message failed.", e);
    }
  };

  return (
    <div>
      <ChatInput sendMessage={sendMessage} />
      <hr />
      <ChatWindow chat={chat} />
    </div>
  );
};

export default Chat;



import React from "react";
import "../css/chat.css";

const Messages = ({ messages }) => {
  if (!messages || !Array.isArray(messages)) {
    return null; // Return null if messages is not an array or is undefined
  }

  return (
    <div>
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender === msg.receiver ? "sender" : "receiver"}`}>
          <span className="message-text">{msg.text}</span>
          <span className="message-time">{msg.time}</span>
        </div>
      ))}
    </div>
  );
};

export default Chat;

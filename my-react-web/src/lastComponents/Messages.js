import React from "react";

const Messages = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="no-messages">Không có tin nhắn.</div>
    );
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

export default Messages;

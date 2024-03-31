import React from "react";
import "../css/chat.css";

function Chat() {
  // Dữ liệu mẫu cho danh sách chat
  const chatData = [
    { sender: "Alice", message: "Xin chào!" },
   
  ];

  return (
    <div className="chat">
      <div className="chat-list">
        {/* Hiển thị danh sách chat */}
        
        {chatData.map((chat, index) => (
          <div className="chat-item" key={index}>
            {/* <div className="chat-avt"></div> */}
            <div className="chat-sender">{chat.sender}</div>
            <div className="chat-message">{chat.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;

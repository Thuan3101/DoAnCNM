import React from "react";
import "../css/chat.css";
import DanhSachBB from "./DanhSachBB";
//import { ToastContainer, toast } from 'react-toastify';

const Chat = () => {
  // const notify = () => toast("bạn đã nhấn vào tin nhắn");
  // // if (!messages || !Array.isArray(messages)) {
  // //   return null; // Return null if messages is not an array or is undefined
  // // }

  return (
    <div>
      {/* {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender === msg.receiver ? "sender" : "receiver"}`}>
          <span className="message-text">{msg.text}</span>
          <span className="message-time">{msg.time}</span>
        </div>
      ))} */}
      
      <DanhSachBB />
      
    </div>
  );
};

export default Chat;

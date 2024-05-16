import React, { useState } from "react";
import "../css/chat.css";
import Banbe from "./Banbe";
import Nhom2 from "./Nhom2";

const Chat = () => {
  const [currentPage, setCurrentPage] = useState("bb");

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "bb":
        return <Banbe />;
      case "Nhom2":
        // Render Nhom2 và truyền props nếu cần
        return <Nhom2 />;
      default:
        return <div></div>;
    }
  };

  return (
    <div className="chat">
      <div className="navBarChat">
        <div className="bb" onClick={() => changePage("bb")}>
          <p className="st" style={{fontWeight:'bold', fontSize:'14px'}}>Chat Với Bạn bè</p>
        </div>

        <div className="Nhom2" onClick={() => changePage("Nhom2")}>
          <p className="st" style={{fontWeight:'bold', fontSize:'14px'}}>Chat Với Nhóm</p>
        </div>
      </div>
      {renderPageContent()}
    </div>
  );
};

export default Chat;

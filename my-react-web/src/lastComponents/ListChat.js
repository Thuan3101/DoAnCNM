import React from "react";
import "../css/listChat.css";
import Chat from "../lastComponents/Chat";
import Avatar from "../components/Avatar";
import DanhBa from "../lastComponents/DanhBa";
import TimKiem from "./TimKiem";
import CaiDat from "../components/CaiDat";

const ListChat = ({ currentTab }) => {
  return (
    <div className="listChat">
   
      <div>
        {/* Hiển thị component tương ứng với tab được chọn */}
        {currentTab === "chat" && <Chat />}
        {currentTab === "avatar" && <Avatar />}
        {currentTab === "danhBa" && <DanhBa />}
        {currentTab === "timKiem" && <TimKiem />}
        {currentTab === "caiDat" && <CaiDat />}
      </div>
    </div>
  );
}

export default ListChat;

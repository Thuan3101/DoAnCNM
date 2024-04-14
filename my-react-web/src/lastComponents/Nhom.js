import React, { useState } from "react";
import "../css/nhom.css";
import DanhSachNhom from "../lastComponents/DanhSachNhom";
import TaoNhom from "./TaoNhom";

function DanhBa() {
  const [currentPage, setCurrentPage] = useState("dsNhom"); 
  

  const changePage = (page) => {
    setCurrentPage(page);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "taoNhom":
        return <TaoNhom />;
      case "dsNhom":
        // Render DanhSachBB và truyền danh sách bạn bè vào
        return <DanhSachNhom />;
      default:
        return <div></div>;
    }
  };

  return (
    <div className="nhom">
      <div className="navBarNhom">
        <div className="taoNhom" onClick={() => changePage("taoNhom")}>Tạo Nhóm</div>
  
        <div className="dsNhom" onClick={() => changePage("dsNhom")}>Danh Sách Nhóm</div>
       
      </div>
      {renderPageContent()}
    </div>
  );
}

export default DanhBa;

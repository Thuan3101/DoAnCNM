// DanhBa.js
import React, { useState } from "react";
import LoiMoiGui from "../lastComponents/LoimoiGui";
import LoimoiNhan from "../lastComponents/LoimoiNhan";
//import DanhSachMain from "../lastComponents/DanhSachMain";
import "../css/danhBa.css";
import DanhSachBB from "../lastComponents/DanhSachBB";


function DanhBa() {
  const [currentPage, setCurrentPage] = useState("danhSachBanBe"); // Mặc định là "Danh sách bạn bè"
  //const [friendsMap, setFriendsMap] = useState({}); // Thêm state để lưu danh sách bạn bè
  
  //hàm thay đổi trang
  const changePage = (page) => {
    setCurrentPage(page);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "lmDaGui":
        return <LoiMoiGui />;
      case "lmDaNhan":
        return <LoimoiNhan />;
      case "dsBanBe":
        // Render DanhSachBB và truyền danh sách bạn bè vào
        return <DanhSachBB />;
      default:
        return <div></div>;
    }
  };

  return (
    <div className="danhBa">
      <div className="navBar">
        <div className="lmDaGui" style={{fontWeight:'bold', fontSize:'15px'}} onClick={() => changePage("lmDaGui")}>
          <p>Lời mời đã gửi</p></div>
        <div className="lmDaNhan" style={{fontWeight:'bold', fontSize:'15px'}} onClick={() => changePage("lmDaNhan")}>
          <p>Lời mời đã nhận</p></div>
        <div className="dsBanBe" style={{fontWeight:'bold', fontSize:'15px'}} onClick={() => changePage("dsBanBe")}>
          <p>Danh Sách Bạn Bè</p></div>
       
      </div>
      {renderPageContent()}
    </div>
  );
}

export default DanhBa;

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
        <div className="lmDaGui" onClick={() => changePage("lmDaGui")}>Lời mời đã gửi</div>
        <div className="lmDaNhan" onClick={() => changePage("lmDaNhan")}>Lời mời đã nhận</div>
        <div className="dsBanBe" onClick={() => changePage("dsBanBe")}>Danh Sách Bạn Bè</div>
       
      </div>
      {renderPageContent()}
    </div>
  );
}

export default DanhBa;

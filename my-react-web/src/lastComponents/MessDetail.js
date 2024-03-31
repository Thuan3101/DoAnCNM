import React from "react";
import "../css/messDetail.css";
function MessDetail() {
      return(
            <div className="messDetail">
                  <div className="top">Tên người dùng</div>
                  <div className="center">Phần chứa tin nhắn</div>
                  <div className="bottom">
                        <input className="inpT" type="text" placeholder="Nhập tin nhắn...."></input>
                        <input type="file"></input>
                        <button>Gửi</button>

                  </div>
            </div>

      )
      
}
export default MessDetail;
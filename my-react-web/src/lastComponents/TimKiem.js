import React, { useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import "../css/timKiem.css";

const TimKiem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const handleSearch = async () => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("name", "==", searchTerm)); // Thay "name" bằng trường dữ liệu bạn muốn tìm kiếm
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push(doc.data());
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSendFriendRequest = (userId) => {
    // Xử lý logic gửi lời mời kết bạn ở đây
    console.log("Đã gửi lời mời kết bạn đến người dùng có ID:", userId);
    // Thêm userId vào mảng sentRequests
    setSentRequests([...sentRequests, userId]);
  };

  const isRequestSent = (userId) => {
    return sentRequests.includes(userId);
  };

  return (
    <div className="timKiem">
      <input
        type="text"
        placeholder="Nhập nội dung tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Tìm kiếm</button>
      <div className="searchResults">
        {searchResults.map((user, index) => (
          <div key={index}>
            <p>{user.name}</p> 
            {isRequestSent(user.id) ? (
              <button disabled>Đã gửi lời mời</button>
            ) : (
              <button onClick={() => handleSendFriendRequest(user.id)}>Gửi lời mời</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimKiem;

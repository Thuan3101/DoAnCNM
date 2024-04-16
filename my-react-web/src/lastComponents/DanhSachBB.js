import React, { useState, useEffect } from "react";
import { getFirestore, collection,  getDocs, doc,  getDoc } from "firebase/firestore"; //query, where,updateDoc,
import { getAuth } from "firebase/auth";
import "../css/DanhSachBB.css";
import ChatBox from "../lastComponents/ChatBox"; // Import phần chatbox mới

const DanhSachBB = () => {
  const [userFriends, setUserFriends] = useState({});
  const [senders, setSenders] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);

  const auth = getAuth();
  // Lấy danh sách bạn bè và người dùng từ Firestore
  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const db = getFirestore();
        if (auth.currentUser) { // Kiểm tra nếu currentUser không phải là null
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserFriends(userDoc.data().friends || {});
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
      }
    };
    
    const fetchSenders = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const sendersData = {};
        usersSnapshot.forEach((doc) => {
          sendersData[doc.id] = doc.data();
        });
        setSenders(sendersData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };
  
    fetchUserFriends();
    fetchSenders();
  }, [auth.currentUser]); // Bao gồm auth.currentUser trong mảng phụ thuộc
  
  // Xử lý khi click vào bạn bè
  const handleFriendClick = (friendId) => {
    setSelectedFriend(friendId);
  };

  return (
    <div className="danh-sach-bb">
      <h2>Bạn bè:</h2>
      {Object.keys(userFriends).length === 0 ? (
        <p>Bạn không có bạn bè nào</p>
      ) : (
        <ul>
          {Object.keys(userFriends).map((friendId) => (
            <li key={friendId} onClick={() => handleFriendClick(friendId)}>
              <img style={{ width: '30px', height: '30px', borderRadius: '50%', padding:'10px' }} src={senders[friendId]?.profileImageUrl} alt={senders[friendId]?.name} className="avatar" />
              {senders[friendId]?.name}
            </li>
          ))}
        </ul>
      )}
      {selectedFriend && (
        <ChatBox friendId={selectedFriend}  /> // Truyền friendId vào phần chatbox mới
      )}
    </div>
  );
};

export default DanhSachBB;

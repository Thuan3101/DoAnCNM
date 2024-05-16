import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import "../css/timKiem.css";

// Định nghĩa component TimKiem sử dụng React hooks
const TimKiem = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Lưu trữ từ khóa tìm kiếm
  const [searchResults, setSearchResults] = useState([]); // Lưu trữ kết quả tìm kiếm
  const [currentUser, setCurrentUser] = useState(null); // Lưu trữ thông tin người dùng hiện tại
  const [invitationSentMessage, setInvitationSentMessage] = useState(""); // Lưu trữ thông báo sau khi gửi lời mời
  const auth = getAuth(); // Lấy thực thể xác thực từ Firebase

  // Hook useEffect để lấy thông tin người dùng hiện tại
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
      }
    };
  
    getCurrentUser();
  }, [auth.currentUser]);

  // Hàm kiểm tra hai người dùng đã là bạn bè chưa
  const checkIfFriends = async (userId) => {
    const db = getFirestore();
    const friendsRef = collection(db, "friends");

    try {
      const querySnapshot = await getDocs(query(friendsRef, where("userId", "==", auth.currentUser.uid), where("friendId", "==", userId)));
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking friendship status:", error);
      return false;
    }
  };

  // Xử lý tìm kiếm người dùng theo từ khóa
  const handleSearch = async () => {
    setSearchResults([]);

    const db = getFirestore();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("name", "==", searchTerm));

    try {
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        const userData = { ...doc.data(), id: doc.id, invitationSent: false };
        results.push(userData);
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for users: ", error);
    }
  };

  // Gửi lời mời kết bạn
  const sendInvitation = async (userId, index) => {
    const db = getFirestore();

    try {
      const friends = await checkIfFriends(userId);
      if (friends) {
        setInvitationSentMessage("Hai người dùng đã là bạn bè.");
        return;
      }

      const invitationsRef = collection(db, "invitations");

      // Kiểm tra xem người nhận đã gửi lời mời cho người gửi trước đó chưa
      const querySnapshotReceiver = await getDocs(query(invitationsRef, where("senderId", "==", userId), where("receiverId", "==", auth.currentUser.uid)));
      if (!querySnapshotReceiver.empty) {
        setInvitationSentMessage("Người này đã gửi lời mời cho bạn trước đó.");
        return;
      }

      // Kiểm tra xem người gửi đã gửi lời mời cho người nhận trước đó chưa
      const querySnapshotSender = await getDocs(query(invitationsRef, where("senderId", "==", auth.currentUser.uid), where("receiverId", "==", userId)));
      if (!querySnapshotSender.empty) {
        setInvitationSentMessage("Bạn đã gửi lời mời cho người này trước đó.");
        return;
      }

      setSearchResults(prevResults => prevResults.map((user, idx) =>
        idx === index ? { ...user, invitationSent: true } : user
      ));

      await addDoc(invitationsRef, {
        senderId: auth.currentUser.uid,
        receiverId: userId,
        sentAt: new Date(),
        status: "pending"
      });
      setInvitationSentMessage("Lời mời đã được gửi thành công!");
    } catch (error) {
      console.error("Error sending invitation to user:", error);
    }
  };

  // Render component
  return (
    <div className="timKiem">
      <input
        type="text"
        placeholder="Nhập nội dung tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        
      />
      <button onClick={handleSearch}>
        <text>Tìm kiếm</text></button>
      <div className="search-results">
        {invitationSentMessage && <p>{invitationSentMessage}</p>}
        {searchResults.map((user, index) => (
          <div key={user.id} className="user-item" style={{borderBottom: '1px solid gray'}}>
            <img src={user.photoURL} alt="Avatar" style={{ width: '40px', height: '40px', marginTop: '10px', marginLeft: '10px', borderRadius:'50%' }} />
            <p style={{marginLeft:'15px', fontSize:'16px'}}>{user.name}</p>
            {currentUser && user.id !== currentUser.uid && (
              user.invitationSent ? (
                <button disabled>Đã gửi</button>
              ) : (
                <button onClick={() => sendInvitation(user.id, index)}>Gửi lời mời</button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimKiem;

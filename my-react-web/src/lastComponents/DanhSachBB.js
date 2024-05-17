import React, { useState, useEffect } from "react";
import { getFirestore, collection,  getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ChatDon from "./ChatDon";
import "../css/DanhSachBB.css";

const DanhSachBB = () => {
  const [userFriends, setUserFriends] = useState({});
  const [senders, setSenders] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatRoomCreated, setChatRoomCreated] = useState(false);

  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
      }
    };

    getCurrentUser();
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const db = getFirestore();
        if (auth.currentUser) {
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
  }, [auth.currentUser]);

  const handleFriendClick = async (friendId) => {
    try {
      setSelectedFriend(friendId);
      const db = getFirestore();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.uid) {
        throw new Error("Người dùng hiện tại chưa được xác thực hoặc thiếu UID.");
      }

      if (!friendId) {
        throw new Error("Dữ liệu bạn bè không hợp lệ hoặc thiếu UID.");
      }

      const sortedUIDs = [currentUser.uid, friendId].sort();
      const chatRoomRef = doc(db, "Chats", sortedUIDs.join("_"));

      const chatRoomSnapshot = await getDoc(chatRoomRef);

      if (!chatRoomSnapshot.exists()) {
        const chatRoomId = generateRandomId();
        await setDoc(chatRoomRef, {
          ID_roomChat: chatRoomId,
          UID: [currentUser.uid, friendId],
          UID_Chats: sortedUIDs.join("_")
        });
        console.log("Phòng trò chuyện mới được tạo:", friendId);
      }

      setChatRoomCreated(true);
    } catch (error) {
      console.error("Lỗi khi tạo hoặc điều hướng đến phòng trò chuyện:", error);
    }
  };

  const generateRandomId = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return (
    <div className="danh-sach-bb" style={{ width:'80%' }}>
      <p className="title"></p>
      {Object.keys(userFriends).length === 0 ? (
        <p>Bạn không có bạn bè nào</p>
      ) : (
        <ul>
          {Object.keys(userFriends).map((friendId) => (
            <li key={friendId} onClick={() => handleFriendClick(friendId)}>
              <img style={{ width: '30px', height: '30px', borderRadius: '50%', padding:'10px' }} src={senders[friendId]?.photoURL} alt={senders[friendId]?.name} className="avatar" />
              {senders[friendId]?.name}
            </li>
          ))}
        </ul>
      )}
       {/* Nút chuyển hướng đến tin nhắn giữa 2 người */}
      {/* {selectedFriend && (
        <ChatBox friendId={selectedFriend}  /> // Truyền friendId vào phần chatbox mới
      )} */}
      {/* {selectedFriend && (
        <ChatDon friendId={selectedFriend}  /> // Truyền friendId vào phần chatbox mới
      )} */}
      {selectedFriend && !chatRoomCreated && (
        <button onClick={handleFriendClick}>Chat với bạn bè</button>
      )}
      {chatRoomCreated && (
        <ChatDon friendId={selectedFriend} />
      )}
    </div>
  );
};

export default DanhSachBB;

import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
import "../css/timKiem.css";

const TimKiem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
      }
    };

    getCurrentUser();
  }, []);

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

  const sendInvitation = async (userId, index) => {
    const db = getFirestore();

    try {
      const friends = await checkIfFriends(userId);
      if (friends) {
        console.log("Hai người dùng đã là bạn bè.");
        return;
      }

      const invitationsRef = collection(db, "invitations");
      const querySnapshot = await getDocs(query(invitationsRef, where("senderId", "==", auth.currentUser.uid), where("receiverId", "==", userId)));

      if (!querySnapshot.empty) {
        console.log("Lời mời đã được gửi đến người dùng này trước đó.");
        return;
      }

      await addDoc(invitationsRef, {
        senderId: auth.currentUser.uid,
        receiverId: userId,
        sentAt: new Date(),
        status: "pending"
      });
      console.log("Lời mời đã được gửi đến người dùng có ID:", userId);

      const updatedResults = [...searchResults];
      updatedResults[index].invitationSent = true;
      setSearchResults(updatedResults);
    } catch (error) {
      console.error("Error sending invitation to user:", error);
    }
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
      <div className="search-results">
        {searchResults.map((user, index) => (
          <div key={user.id} className="user-item" style={{borderBottom: '1px gray'}}>
            <img src={user.profileImageUrl} alt="Avatar" style={{ width: '40px', height: '40px', marginTop: '10px', marginLeft: '10px', borderRadius:'50%' }} />
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

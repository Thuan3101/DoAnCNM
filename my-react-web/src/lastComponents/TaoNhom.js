import React, { useState, useEffect } from "react";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs } from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import "../css/taoNhom.css";

const TaoNhom = () => {
  const [userFriends, setUserFriends] = useState({});
  const [senders, setSenders] = useState({});
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]); // Danh sách bạn bè đã chọn để thêm vào nhóm
  const [groupName, setGroupName] = useState(""); // Tên của nhóm chat mới
  const [groupImage, setGroupImage] = useState(null); // Đường dẫn ảnh của nhóm

  const auth = getAuth();

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const db = getFirestore();
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserFriends(userDoc.data().friends || {});
        }
      } catch (error) {
        console.error("Error fetching user friends:", error);
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
        console.error("Error fetching users:", error);
      }
    };

    fetchUserFriends();
    fetchSenders();
  }, [auth.currentUser.uid]);

  const handleFriendClick = (friendId) => {
    setSelectedFriend(friendId);
  };

  const handleAddToGroup = (friendId) => {
    setSelectedFriends([...selectedFriends, friendId]);
  };

  const handleRemoveFromGroup = (friendId) => {
    const updatedFriends = selectedFriends.filter((id) => id !== friendId);
    setSelectedFriends(updatedFriends);
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleGroupImageChange = (e) => {
    const file = e.target.files[0];
    setGroupImage(file);
  };

  const handleCreateGroup = async () => {
    try {
      // Kiểm tra xem tên nhóm có được nhập hay không
      if (!groupName.trim()) {
        alert("Vui lòng nhập tên nhóm");
        return;
      }

      // Upload file ảnh lên Firebase Storage (nếu có)
      let imageUrl = null;
      if (groupImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `group_images/${groupImage.name}`);
        await uploadBytes(storageRef, groupImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Lưu thông tin nhóm vào Firestore
      const db = getFirestore();
      const groupsRef = collection(db, "groups");
      await addDoc(groupsRef, {
        name: groupName,
        image: imageUrl, // Lưu đường dẫn ảnh vào Firestore (nếu có)
        members: [auth.currentUser.uid, ...selectedFriends]
      });

      // Thành công
      console.log("Group created successfully!");
      alert("Nhóm tạo thành công");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="danh-sach-bb">
      <h2>Tạo nhóm từ bạn bè sau:</h2>
      {Object.keys(userFriends).length === 0 ? (
        <p>Bạn không có bạn bè nào</p>
      ) : (
        <ul>
          {Object.keys(userFriends).map((friendId) => (
            <li key={friendId} onClick={() => handleFriendClick(friendId)}>
              <img style={{ width: '30px', height: '30px', borderRadius: '50%', padding:'10px' }} src={senders[friendId]?.profileImageUrl} alt={senders[friendId]?.name} className="avatar" />
              {senders[friendId]?.name}
              {selectedFriends.includes(friendId) ? (
                <button className="xoa" onClick={() => handleRemoveFromGroup(friendId)}>Xóa</button>
              ) : (
                <button className="them" onClick={() => handleAddToGroup(friendId)}>Thêm </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedFriends.length > 0 && (
        <div>
          <div className="tenAnh">
          <input className="tenNhom" type="text" value={groupName} onChange={handleGroupNameChange} placeholder="Nhập tên nhóm"  />
          <input type="file" accept="image/*" onChange={handleGroupImageChange} />
            
          </div>
        
          <button className="taoNhommm" onClick={handleCreateGroup}>Tạo nhóm chat</button>
        </div>
      )}
    </div>
  );
};

export default TaoNhom;

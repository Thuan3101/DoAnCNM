import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import "../css/groupChat.css";
import EmojiPicker from "emoji-picker-react";

const GroupChat = ({ groupId }) => {
  const [groupName, setGroupName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [addedFriends, setAddedFriends] = useState([]);
  const [confirmDissolve, setConfirmDissolve] = useState(false);
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [recallMessageStatus, setRecallMessageStatus] = useState("");

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        if (!groupId) return;

        const db = getFirestore();

        // Fetch group name
        const groupRef = doc(db, "groups", groupId);
        const groupDoc = await getDoc(groupRef);
        if (groupDoc.exists()) {
          setGroupName(groupDoc.data().name);
        }

        // Fetch user ID
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          setUserId(user.uid);
        }

        // Fetch group members
        const groupMembersRef = doc(db, "groups", groupId);
        const unsubscribeSnapshot = onSnapshot(groupMembersRef, (doc) => {
          if (doc.exists()) {
            setGroupMembers(doc.data().members || []);
          }
        });

        // Fetch messages
        const messagesRef = doc(db, "groupChats", groupId);
        const unsubscribe = onSnapshot(messagesRef, (doc) => {
          if (doc.exists()) {
            setMessages(doc.data().messages || []);
          } else {
            setMessages([]);
          }
        });

        // Return cleanup function
        return () => {
          unsubscribeSnapshot();
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching group data:", error);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const fetchUserName = useCallback(async (uid) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data().name;
      } else {
        return " ";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return " ";
    }
  }, []);

  useEffect(() => {
    const fetchMessagesData = async () => {
      try {
        if (!userId || !groupId) return;

        const db = getFirestore();
        const groupMessagesRef = doc(db, "groupChats", groupId);
        const groupMessagesDoc = await getDoc(groupMessagesRef);

        const groupMessages = groupMessagesDoc.exists()
          ? groupMessagesDoc.data().messages || []
          : [];

        groupMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        setMessages(groupMessages);

        const uniqueSenders = Array.from(
          new Set(groupMessages.map((msg) => msg.sender))
        );
        const senderNames = {};
        for (const senderId of uniqueSenders) {
          if (!userNames[senderId]) {
            const name = await fetchUserName(senderId);
            senderNames[senderId] = name;
          }
        }
        setUserNames((prevNames) => ({ ...prevNames, ...senderNames }));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessagesData();
  }, [userId, groupId, userNames, fetchUserName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    try {
      if ((!messageInput.trim() && files.length === 0) || !userId || !groupId)
        return;
      let fileUrls = "";
      if (files.length > 0) {
        fileUrls = await Promise.all(
          files.map(async (file) => {
            const fileType = file.type.split("/")[0];
            let url = "";
            if (fileType === "image" || fileType === "video") {
              url = await uploadImageAsync(file);
            } else if (
              fileType === "application" ||
              fileType === "text" ||
              fileType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
              url = await uploadFileAsync(file);
            }
            return { url, fileType, fileName: file.name };
          })
        );
      }

      const newMessage = {
        text: messageInput,
        sender: userId,
        groupId: groupId,
        fileUrls: fileUrls,
        fileType: fileType,
        time: new Date().toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      const db = getFirestore();
      const messagesRef = doc(db, "groupChats", groupId);
      const messagesDoc = await getDoc(messagesRef);
      if (messagesDoc.exists()) {
        await updateDoc(messagesRef, {
          messages: arrayUnion(newMessage),
        });
      } else {
        await setDoc(messagesRef, { messages: [newMessage] });
      }

      setMessageInput("");
      setFiles([]);
      setFileType("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const uploadFileAsync = async (file) => {
    try {
      if (!file) {
        throw new Error("Không có tệp nào được chọn");
      }

      const storageRef = storage;
      const filename = `groupChatFiles/${groupId}/${file.name}`;
      const fileRef = ref(storageRef, filename);

      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      return fileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên tệp khác:", error);
      throw error;
    }
  };

  const uploadImageAsync = async (imageFile) => {
    try {
      if (!imageFile) {
        throw new Error("Không có tệp hình ảnh nào được chọn");
      }

      const imageUrl = URL.createObjectURL(imageFile);
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const storageRef = storage;
      const filename = `groupChatFiles/${groupId}/${Date.now()}_${
        imageFile.name
      }`;
      const imageRef = ref(storageRef, filename);

      await uploadBytes(imageRef, blob);
      const fileUrl = await getDownloadURL(imageRef);

      return fileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên hình ảnh:", error);
      throw error;
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles((prevFiles) => {
        if (!Array.isArray(prevFiles)) {
          prevFiles = [];
        }
        return [...prevFiles, ...Array.from(selectedFiles)];
      });
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput((prevMessageInput) => prevMessageInput + emoji.emoji);
  };

  const searchFriends = async (keyword) => {
    try {
      if (keyword.trim() === "") {
        setSearchResults([]);
        return;
      }

      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("name", ">=", keyword.trim()),
        where("name", "<=", keyword.trim() + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({
          id: doc.id,
          name: userData.name,
        });
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching friends:", error);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchKeyword(e.target.value);
    searchFriends(e.target.value);
  };

  const handleFriendSelect = async (friend) => {
    try {
      console.log("Selected friend:", friend);
      const db = getFirestore();
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);
      const groupData = groupDoc.data();

      if (!groupData.members.includes(friend.id)) {
        await updateDoc(groupRef, {
          members: arrayUnion(friend.id),
        });
        setAddedFriends((prevFriends) => [...prevFriends, friend.id]);
        setActionMessage(`${friend.name} đã được thêm vào nhóm`);
        console.log("Added friend to group successfully!");

        await updateDoc(doc(db, "groupChats", groupId), {
          messages: arrayUnion({
            text: `${friend.name} đã được thêm vào nhóm`,
            sender: "system",
            groupId: groupId,
            time: new Date().toLocaleTimeString(),
          }),
        });
      } else {
        await updateDoc(groupRef, {
          members: arrayRemove(friend.id),
        });
        setAddedFriends((prevFriends) =>
          prevFriends.filter((id) => id !== friend.id)
        );
        setActionMessage(`${friend.name} đã bị xóa khỏi nhóm`);
        console.log("Removed friend from group successfully!");

        await updateDoc(doc(db, "groupChats", groupId), {
          messages: arrayUnion({
            text: `${friend.name} đã bị xóa khỏi nhóm`,
            sender: "system",
            groupId: groupId,
            time: new Date().toLocaleTimeString(),
          }),
        });
      }
    } catch (error) {
      console.error("Error updating group members:", error);
    }
  };
  const deleteMessage = async () => {
    try {
      if (!selectedMessage) return;

      const db = getFirestore();
      const groupMessagesRef = doc(db, "groupChats", groupId);
      await updateDoc(groupMessagesRef, {
        messages: arrayRemove(selectedMessage),
      });

      setSelectedMessage(null);
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
    }
  };

  const recallMessage = async () => {
    try {
      if (!userId || !selectedMessage) return;

      const db = getFirestore();
      const groupMessagesRef = doc(db, "groupChats", groupId);
      await updateDoc(groupMessagesRef, {
        messages: arrayRemove(selectedMessage),
      });

      setSelectedMessage(null);

      // Cập nhật trạng thái để hiển thị thông báo thu hồi tin nhắn
      setRecallMessageStatus("Tin nhắn đã được thu hồi");
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };

  const dissolveGroup = async () => {
    try {
      const db = getFirestore();
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      // Kiểm tra xem người dùng hiện tại có phải là người dẫn đầu của nhóm hay không
      if (groupDoc.exists() && groupDoc.data().leader === userId) {
        // Nếu là người dẫn đầu, thực hiện giải tán nhóm
        const groupMessagesRef = doc(db, "groupChats", groupId);
        await setDoc(groupMessagesRef, { messages: [] });

        await deleteDoc(groupRef);

        alert("Nhóm đã được giải tán thành công!");
      } else {
        // Nếu không phải là người dẫn đầu, hiển thị thông báo cho người dùng
        alert("Chỉ người dẫn đầu nhóm mới có thể giải tán nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi giải tán nhóm:", error);
    }
  };

  return (
    <div className="groupChat">
      <div className="groupChat-header">
        <h3>Chat với {groupName}</h3>
        <input
          placeholder="Thêm/Xóa..."
          value={searchKeyword}
          onChange={handleSearchInputChange}
          className="ipSearch"
        />
        {confirmDissolve ? (
          <div className="dissolution-group">
            <button onClick={dissolveGroup}>Xác nhận</button>
            <button onClick={() => setConfirmDissolve(false)}>Hủy</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDissolve(true)}>
            Giải tán nhóm
          </button>
        )}
      </div>
      <div className="search-results">
        {searchResults.length > 0 && (
          <ul className="themnguoi">
            {searchResults.map((friend) => (
              <li key={friend.id}>
                {friend.name}
                {groupMembers.includes(friend.id) ? (
                  <button onClick={() => handleFriendSelect(friend)}>
                    Xóa
                  </button>
                ) : (
                  <button onClick={() => handleFriendSelect(friend)}>
                    Thêm
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="groupChat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`g-message ${
              msg.sender === userId ? "sender" : "receiver"
            }`}
            onClick={() => setSelectedMessage(msg)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="g-message-time">{msg.time}</p>
            </div>
            <span className="message-sender">{userNames[msg.sender]}</span>
            <br></br>
            <span className="message-text">{msg.text}</span>
            {msg.fileUrls && (
              <div
                className={`chat-image-container ${
                  msg.sender === userId ? "sender" : "receiver"
                }`}
              >
                {msg.fileUrls.map((file, index) => (
                  <div key={index}>
                    {file.fileType === "image" && (
                      <img
                        src={file.url}
                        alt="Hình ảnh"
                        className="chat-image"
                      />
                    )}
                    {file.fileType === "video" && (
                      <video controls className="gchat-videos">
                        <source src={file.url} type="video/mp4" />
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    )}
                    {file.fileType !== "image" && file.fileType !== "video" && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.fileName}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {selectedMessage && (
          <div className="selected-message-options">
            {selectedMessage.sender === userId && (
              <button onClick={recallMessage}>Thu hồi</button>
            )}
            {selectedMessage !== userId && (
              <button onClick={deleteMessage}>Xóa</button>
            )}
          </div>
        )}

        {/* Hiển thị thông báo thu hồi tin nhắn */}
        {recallMessageStatus && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              margin: "10px 0",
              marginTop: "30px",
              height: "auto",
              width: "auto",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            <span className="message-text">{recallMessageStatus}</span>
          </div>
        )}

        {showEmojiPicker && (
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            emojiStyle="native"
            reactionsDefaultOpen={true}
            height={400}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="gchat-input">
        <button onClick={toggleEmojiPicker}>😀</button>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <input type="file" multiple onChange={handleFileInputChange} />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default GroupChat;

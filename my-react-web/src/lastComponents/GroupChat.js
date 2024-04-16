import React, { useState, useEffect, useRef } from "react";
import { getFirestore, doc,getDoc,setDoc,updateDoc,  arrayUnion, arrayRemove, onSnapshot,collection,  query,where,getDocs,} from "firebase/firestore";
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
  const [setAddedFriends] = useState([]); //addedFriends,
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        if (!groupId) return;

        const db = getFirestore();
        const groupRef = doc(db, "groups", groupId);
        const groupDoc = await getDoc(groupRef);
        if (groupDoc.exists()) {
          setGroupName(groupDoc.data().name);
        }
      } catch (error) {
        console.error("Error fetching group's name:", error);
      }
    };

    fetchGroupName();
  }, [groupId]);

  useEffect(() => {
    const fetchUserId = () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
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

    fetchMessages();

    const db = getFirestore();
    const messagesRef = doc(db, "groupChats", groupId);
    const unsubscribe = onSnapshot(messagesRef, (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [userId, groupId, userNames]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        if (!groupId) return;

        const db = getFirestore();
        const groupRef = doc(db, "groups", groupId);
        const groupDoc = await getDoc(groupRef);
        if (groupDoc.exists()) {
          setGroupMembers(groupDoc.data().members || []);
        }
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

  useEffect(() => {
    if (actionMessage) {
      const newMessage = {
        text: actionMessage,
        sender: "system",
        groupId: groupId,
        time: new Date().toLocaleTimeString(),
      };

      const saveActionMessage = async () => {
        try {
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
        } catch (error) {
          console.error("Error saving action message:", error);
        }
      };

      saveActionMessage();
    }
  }, [actionMessage, groupId]);

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
        time: new Date().toLocaleTimeString(),
        fileUrls: fileUrls,
        fileType: fileType,
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
        // Kiểm tra nếu prevFiles không phải là mảng, thì khởi tạo nó là một mảng trống
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

  const deleteGroupMessage = async (message) => {
    try {
      const db = getFirestore();
      const groupMessagesRef = doc(db, "groupChats", groupId);
      const updatedMessages = messages.map((msg) => {
        if (msg === message && msg.sender === userId) {
          return { ...msg, text: "This message has been deleted." };
        }
        return msg;
      });
      await setDoc(groupMessagesRef, { messages: updatedMessages });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  
  const recallGroupMessage = async (message) => {
    try {
      const db = getFirestore();
      const groupMessagesRef = doc(db, "groupChats", groupId);
      await updateDoc(groupMessagesRef, {
        messages: arrayRemove(message),
      });
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };
  
  const shareGroupMessage = async (message) => {
    try {
      const db = getFirestore();
      const shareTasks = groupMembers.map(async (memberId) => {
        const memberMessagesRef = doc(db, "groupChats", memberId);
        await updateDoc(memberMessagesRef, {
          messages: arrayUnion(message),
        });
      });
  
      await Promise.all(shareTasks);
    } catch (error) {
      console.error("Lỗi khi chia sẻ tin nhắn:", error);
    }
  };
  

  const fetchUserName = async (uid) => {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          >
            <span className="message-sender">{userNames[msg.sender]}</span>{" "}
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
                    {/* Hiển thị tên tệp chỉ khi không phải là hình ảnh hoặc video */}
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
            <span className="g-message-time">{msg.time}</span>
            {msg.sender === userId && (
              <div>
                <button onClick={() => deleteGroupMessage(msg)}>Xóa</button>
                <button onClick={() => recallGroupMessage(msg)}>Thu hồi</button>
              </div>
            )}
            <button onClick={() => shareGroupMessage(msg)}>Chia sẻ</button>
              </div>
            ))}
        
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
        <input  type="file" multiple onChange={handleFileInputChange} />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default GroupChat;

import React, { useState, useEffect, useRef } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

import "../css/groupChat.css";

const GroupChat = ({ groupId }) => {
  const [groupName, setGroupName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [userNames, setUserNames] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [actionMessage, setActionMessage] = useState(""); 
  const [addedFriends, setAddedFriends] = useState([]);
  
  const messagesEndRef = useRef(null);

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
        
        const groupMessages = groupMessagesDoc.exists() ? groupMessagesDoc.data().messages || [] : [];
        
        groupMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        setMessages(groupMessages);

        const uniqueSenders = Array.from(new Set(groupMessages.map(msg => msg.sender)));
        const senderNames = {};
        for (const senderId of uniqueSenders) {
          if (!userNames[senderId]) {
            const name = await fetchUserName(senderId);
            senderNames[senderId] = name;
          }
        }
        setUserNames(prevNames => ({ ...prevNames, ...senderNames }));
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
  }, [userId, groupId]);

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
              messages: arrayUnion(newMessage)
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
      if ((!messageInput.trim() && !file) || !userId || !groupId) return;

      let fileUrl = "";
      if (file) {
        if (fileType === "image" || fileType === "video") {
          fileUrl = await uploadImageAsync(file);
        } else {
          fileUrl = await uploadFileAsync(file);
        }
      }

      const newMessage = {
        text: messageInput,
        sender: userId,
        groupId: groupId,
        time: new Date().toLocaleTimeString(),
        fileUrl: fileUrl,
        fileType: fileType,
      };

      const db = getFirestore();
      const messagesRef = doc(db, "groupChats", groupId);
      const messagesDoc = await getDoc(messagesRef);
      if (messagesDoc.exists()) {
        await updateDoc(messagesRef, {
          messages: arrayUnion(newMessage)
        });
      } else {
        await setDoc(messagesRef, { messages: [newMessage] });
      }

      setMessageInput("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const uploadFileAsync = async (file) => {
    try {
      if (!file) {
        throw new Error("No file selected");
      }

      const storageRef = storage;
      const filename = `groupChatFiles/${groupId}/${Date.now()}_${file.name}`;
      const fileRef = ref(storageRef, filename);

      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
      
      return fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const uploadImageAsync = async (imageFile) => {
    try {
      if (!imageFile) {
        throw new Error("No image file selected");
      }

      const imageUrl = URL.createObjectURL(imageFile);
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const storageRef = storage;
      const filename = `groupChatFiles/${groupId}/${Date.now()}_${imageFile.name}`;
      const imageRef = ref(storageRef, filename);

      await uploadBytes(imageRef, blob);
      const fileUrl = await getDownloadURL(imageRef);
      
      return fileUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      setFile(selectedFile);
      setFileType(fileType);
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
      const q = query(usersRef, where("name", ">=", keyword.trim()), where("name", "<=", keyword.trim() + "\uf8ff"));
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
          members: arrayUnion(friend.id)
        });
        setAddedFriends(prevFriends => [...prevFriends, friend.id]);
        setActionMessage(`${friend.name} đã được thêm vào nhóm`);
        console.log("Added friend to group successfully!");

        await updateDoc(doc(db, "groupChats", groupId), {
          messages: arrayUnion({
            text: `${friend.name} đã được thêm vào nhóm`,
            sender: "system",
            groupId: groupId,
            time: new Date().toLocaleTimeString(),
          })
        });
      } else {
        await updateDoc(groupRef, {
          members: arrayRemove(friend.id)
        });
        setAddedFriends(prevFriends => prevFriends.filter(id => id !== friend.id));
        setActionMessage(`${friend.name} đã bị xóa khỏi nhóm`);
        console.log("Removed friend from group successfully!");

        await updateDoc(doc(db, "groupChats", groupId), {
          messages: arrayUnion({
            text: `${friend.name} đã bị xóa khỏi nhóm`,
            sender: "system",
            groupId: groupId,
            time: new Date().toLocaleTimeString(),
          })
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
                  <button onClick={() => handleFriendSelect(friend)}>Xóa</button>
                ) : (
                  <button onClick={() => handleFriendSelect(friend)}>Thêm</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="groupChat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`g-message ${msg.sender === userId ? "sender" : "receiver"}`}>
            <span className="message-sender">{userNames[msg.sender]}</span> <br></br>
            <span className="message-text">{msg.text}</span>
            {msg.fileUrl && (
              <div className={`chat-image-container ${msg.sender === userId ? "sender" : "receiver"}`}>
                {msg.fileType === "image" && <img src={msg.fileUrl} alt="Hình ảnh" className="chat-image" />}
                {msg.fileType === "video" && (
                  <video controls>
                    <source src={msg.fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
            <span className="g-message-time">{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="gchat-input">
        <input type="text" placeholder="Nhập tin nhắn..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
        <input type="file" onChange={handleFileInputChange} />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default GroupChat;

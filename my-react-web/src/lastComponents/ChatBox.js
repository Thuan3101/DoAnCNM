import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import "../css/ChatBox.css";

const ChatBox = ({ friendId }) => {
  const [friendName, setFriendName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState([]);
  //const [fileUrls, setFileUrls] = useState([]);

  useEffect(() => {
    const fetchFriendName = async () => {
      try {
        if (!friendId) return;

        const db = getFirestore();
        const userRef = doc(db, "users", friendId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setFriendName(userDoc.data().name);
        }
      } catch (error) {
        console.error("Error fetching friend's name:", error);
      }
    };

    fetchFriendName();
  }, [friendId]);

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
        if (!userId || !friendId) return;

        const db = getFirestore();
        const senderReceiverMessagesRef = doc(db, "chats", `${userId}_${friendId}`);
        const receiverSenderMessagesRef = doc(db, "chats", `${friendId}_${userId}`);
        
        const senderReceiverMessagesDoc = await getDoc(senderReceiverMessagesRef);
        const receiverSenderMessagesDoc = await getDoc(receiverSenderMessagesRef);
        
        const senderReceiverMessages = senderReceiverMessagesDoc.exists() ? senderReceiverMessagesDoc.data().messages || [] : [];
        const receiverSenderMessages = receiverSenderMessagesDoc.exists() ? receiverSenderMessagesDoc.data().messages || [] : [];
        
        const allMessages = senderReceiverMessages.concat(receiverSenderMessages);
        
        allMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        setMessages(allMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const db = getFirestore();
    const messagesRef = doc(db, "chats", `${friendId}_${userId}`);
    const unsubscribe = onSnapshot(messagesRef, (doc) => {
      if (doc.exists()) {
        setMessages(doc.data().messages || []);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [userId, friendId]);

  const sendMessage = async () => {
    try {
      if ((!messageInput.trim() && files.length === 0) || !userId || !friendId) return;

      let fileUrls = [];
      if (files.length > 0) {
        fileUrls = await Promise.all(files.map(async (file) => {
          const fileType = file.type.split("/")[0];
          let url = "";
          if (fileType === "image" || fileType === "video") {
            url = await uploadImageAsync(file);
          } else {
            url = await uploadFileAsync(file);
          }
          return { url, fileType };
        }));
      }

      const newMessages = [];
      if (messageInput.trim()) {
        const newMessage = {
          text: messageInput,
          sender: userId,
          receiver: friendId,
          time: new Date().toLocaleTimeString(),
        };
        newMessages.push(newMessage);
      }

      fileUrls.forEach(({ url, fileType }) => {
        const newMessage = {
          sender: userId,
          receiver: friendId,
          time: new Date().toLocaleTimeString(),
          fileUrl: url,
          fileType: fileType,
        };
        newMessages.push(newMessage);
      });

      const db = getFirestore();
      const messagesRef = doc(db, "chats", `${userId}_${friendId}`);
      const messagesDoc = await getDoc(messagesRef);
      if (messagesDoc.exists()) {
        await updateDoc(messagesRef, {
          messages: arrayUnion(...newMessages)
        });
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
      } else {
        await setDoc(messagesRef, { messages: newMessages });
        setMessages(newMessages);
      }

      setMessageInput("");
      setFiles([]);
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
      const filename = `chatFiles/${userId}_${friendId}/${Date.now()}_${file.name}`;
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
      const filename = `chatFiles/${userId}_${friendId}/${Date.now()}_${imageFile.name}`;
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
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat với {friendName}</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === userId ? "sender" : "receiver"}`}>
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
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" placeholder="Nhập tin nhắn..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
        <input type="file" multiple onChange={handleFileInputChange} />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatBox;

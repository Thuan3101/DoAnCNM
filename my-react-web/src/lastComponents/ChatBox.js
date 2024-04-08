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
  const [file, setFile] = useState(null);

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
        console.error("Lỗi khi lấy tên bạn:", error);
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
        
        // Sắp xếp tin nhắn theo thời gian
        allMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        setMessages(allMessages);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
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
      if ((!messageInput.trim() && !file) || !userId || !friendId) return;

      let fileUrl = "";
      if (file) {
        fileUrl = await uploadFileAsync(file);
      }

      const newMessage = {
        text: messageInput,
        sender: userId,
        receiver: friendId,
        time: new Date().toLocaleTimeString(),
        fileUrl: fileUrl,
      };

      const db = getFirestore();
      const messagesRef = doc(db, "chats", `${userId}_${friendId}`);
      const messagesDoc = await getDoc(messagesRef);
      if (messagesDoc.exists()) {
        await updateDoc(messagesRef, {
          messages: arrayUnion(newMessage)
        });
        setMessages(prevMessages => [...prevMessages, newMessage]);
      } else {
        await setDoc(messagesRef, { messages: [newMessage] });
        setMessages([newMessage]);
      }

      setMessageInput("");
      setFile(null);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  const uploadFileAsync = async (file) => {
    try {
      if (!file) {
        throw new Error("Không có tệp được chọn");
      }

      const fileUrl = await uploadToStorage(file);

      return fileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên tệp:", error);
      throw error;
    }
  };

  const uploadToStorage = async (file) => {
    try {
      const imageUrl = URL.createObjectURL(file);
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const storageRef = storage;
      const filename = `chatFiles/${userId}_${friendId}/${Date.now()}_${file.name}`;
      const fileRef = ref(storageRef, filename);

      await uploadBytes(fileRef, blob);
      const fileUrl = await getDownloadURL(fileRef);
      
      return fileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên tệp:", error);
      throw error;
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
                {msg.fileUrl.includes("image") ? (
                  <img src={msg.fileUrl} alt="Hình ảnh" className="chat-image" />
                ) : (
                  <video controls className="chat-video">
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
        <input type="file" accept="image/*, video/*" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatBox;

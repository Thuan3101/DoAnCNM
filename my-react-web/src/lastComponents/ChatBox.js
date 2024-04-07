import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import "../css/ChatBox.css";

const ChatBox = ({ friendId }) => {
  const [friendName, setFriendName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");

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
        
        // Sort messages by time
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
      if (!messageInput.trim() || !userId || !friendId) return;

      const newMessage = {
        text: messageInput,
        sender: userId,
        receiver: friendId,
        time: new Date().toLocaleTimeString(),
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
    } catch (error) {
      console.error("Error sending message:", error);
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
            <span className="message-time">{msg.time}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" placeholder="Nhập tin nhắn..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
};

export default ChatBox;

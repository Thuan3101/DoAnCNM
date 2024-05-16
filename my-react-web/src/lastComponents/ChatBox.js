import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import "../css/ChatBox.css";
import EmojiPicker from "emoji-picker-react";

const ChatBox = ({ friendId }) => {
  const [friendName, setFriendName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatMessagesRef = useRef(null);

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
        const senderReceiverMessagesRef = doc(
          db,
          "chats",
          `${userId}_${friendId}`
        );
        const receiverSenderMessagesRef = doc(
          db,
          "chats",
          `${friendId}_${userId}`
        );

        const senderReceiverMessagesDoc = await getDoc(
          senderReceiverMessagesRef
        );
        const receiverSenderMessagesDoc = await getDoc(
          receiverSenderMessagesRef
        );

        const senderReceiverMessages = senderReceiverMessagesDoc.exists()
          ? senderReceiverMessagesDoc.data().messages || []
          : [];
        const receiverSenderMessages = receiverSenderMessagesDoc.exists()
          ? receiverSenderMessagesDoc.data().messages || []
          : [];

        const allMessages = senderReceiverMessages.concat(
          receiverSenderMessages
        );

        // Sort messages by time after parsing them correctly
        allMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

        const formattedMessages = allMessages.map((msg) => ({
          ...msg,
          time: msg.time instanceof Date
            ? msg.time.toLocaleString("vi-VN")
            : msg.time.toDate
              ? msg.time.toDate().toLocaleString("vi-VN")
              : new Date(msg.time).toLocaleString("vi-VN"),
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    fetchMessages();

    const db = getFirestore();
  const messagesRef = doc(db, "chats", `${friendId}_${userId}`);
  const unsubscribe = onSnapshot(messagesRef, (doc) => {
    if (doc.exists()) {
      const formattedMessages = (doc.data().messages || []).map((msg) => ({
        ...msg,
        time: msg.time instanceof Date
          ? msg.time.toLocaleString("vi-VN")
          : msg.time.toDate
            ? msg.time.toDate().toLocaleString("vi-VN")
            : new Date(msg.time).toLocaleString("vi-VN"),
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  });

  return () => unsubscribe();
}, [friendId, userId]);

  const sendMessage = async () => {
    try {
      if ((!messageInput.trim() && files.length === 0) || !userId || !friendId)
        return;

      let fileUrls = [];
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
              url = await uploadOtherFileAsync(file);
            }
            return { url, fileType, fileName: file.name };
          })
        );
      }

      const newMessages = [];
      if (messageInput.trim()) {
        const newMessage = {
          text: messageInput,
          sender: userId,
          receiver: friendId,
          time: new Date().toISOString(),
        };
        newMessages.push(newMessage);
      }

      fileUrls.forEach(({ url, fileType, fileName }) => {
        const newMessage = {
          sender: userId,
          receiver: friendId,
          time: new Date().toISOString(),
          fileUrl: url,
          fileType: fileType,
          fileName: fileName,
        };
        newMessages.push(newMessage);
      });

      const db = getFirestore();
      const messagesRef = doc(db, "chats", `${userId}_${friendId}`);
      const messagesDoc = await getDoc(messagesRef);
      if (messagesDoc.exists()) {
        await updateDoc(messagesRef, {
          messages: arrayUnion(...newMessages),
        });
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } else {
        await setDoc(messagesRef, { messages: newMessages });
        setMessages(newMessages);
      }

      setMessageInput("");
      setFiles([]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  const uploadOtherFileAsync = async (otherFile) => {
    try {
      if (!otherFile) {
        throw new Error("Không có tệp nào được chọn");
      }

      const storageRef = storage;
      const filename = `chatFiles/${userId}_${friendId}/${otherFile.name}`;
      const otherFileRef = ref(storageRef, filename);

      await uploadBytes(otherFileRef, otherFile);
      const otherFileUrl = await getDownloadURL(otherFileRef);

      return otherFileUrl;
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
      const filename = `chatFiles/${userId}_${friendId}/${imageFile.name}`;
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
      setFiles((prevFiles) => [...prevFiles, ...Array.from(selectedFiles)]);
    }
  };

  const deleteMessage = async () => {
    try {
      if (!selectedMessage) return;

      const db = getFirestore();
      const messagesRef = doc(db, "chats", `${friendId}_${userId}`);
      await updateDoc(messagesRef, {
        messages: messages.filter((msg) => msg !== selectedMessage),
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
      const senderReceiverMessagesRef = doc(
        db,
        "chats",
        `${userId}_${friendId}`
      );
      const receiverSenderMessagesRef = doc(
        db,
        "chats",
        `${friendId}_${userId}`
      );

      await updateDoc(senderReceiverMessagesRef, {
        messages: arrayRemove(selectedMessage),
      });
      await updateDoc(receiverSenderMessagesRef, {
        messages: arrayRemove(selectedMessage),
      });

      setMessages(messages.filter((msg) => msg !== selectedMessage));
      setSelectedMessage(null);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };

  const replyToMessage = (msg) => {
    setMessageInput(` ${msg.text} Trả lời:`);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput((prevMessageInput) => prevMessageInput + emoji.emoji);
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat với {friendName}</h3>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === userId ? "sender" : "receiver"
            }`}
            onClick={() => setSelectedMessage(msg)}
          >
            <span className="message-time">{msg.time}</span>
            <span className="message-text">{msg.text}</span>
            {msg.fileUrl && (
              <div
                className={`chat-file-container ${
                  msg.sender === userId ? "sender" : "receiver"
                }`}
              >
                {msg.fileType === "image" && (
                  <img
                    src={msg.fileUrl}
                    alt="Hình ảnh"
                    className="chat-image"
                  />
                )}
                {msg.fileType === "video" && (
                  <video controls className="chat-videos">
                    <source src={msg.fileUrl} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                )}
                {msg.fileType !== "image" && msg.fileType !== "video" && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {msg.fileName}
                  </a>
                )}
              </div>
            )}
            {selectedMessage && selectedMessage === msg && (
              <div className="selected-message-options">
                {(selectedMessage.sender === userId ||
                  selectedMessage.receiver === userId) && (
                  <button onClick={deleteMessage}>Xóa</button>
                )}
                {selectedMessage.sender === userId && (
                  <button onClick={recallMessage}>Thu hồi</button>
                )}
                {(selectedMessage.sender === userId ||
                  selectedMessage.receiver === userId) && (
                  <button onClick={() => replyToMessage(selectedMessage)}>
                    Trả lời
                  </button>
                )}
              </div>
            )}
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
      </div>

      <div className="chat-input">
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

export default ChatBox;
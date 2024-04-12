import React, { useState, useEffect,useRef } from "react";
import {getFirestore, doc, getDoc, setDoc,updateDoc,arrayUnion,arrayRemove,onSnapshot,} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import "../css/ChatBox.css";
import EmojiPicker from "emoji-picker-react";

// Hàm ChatBox nhận một prop friendId
const ChatBox = ({ friendId }) => {
  const [friendName, setFriendName] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedFriendsIds] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  //hàm useEffect sẽ chạy mỗi khi friendId thay đổi
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

  //hàm useEffect sẽ chạy mỗi khi component được render
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

  //hàm useEffect sẽ chạy mỗi khi userId hoặc friendId thay đổi
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

        allMessages.sort((a, b) => new Date(a.time) - new Date(b.time));

        setMessages(allMessages);
      } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
      }
    };

    // Gọi hàm fetchMessages
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

  //hàm gửi tin nhắn
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
      // Tạo mảng mới để chứa tin nhắn mới
      const newMessages = [];
      if (messageInput.trim()) {
        const newMessage = {
          text: messageInput,
          sender: userId,
          receiver: friendId,
          time: new Date().toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        newMessages.push(newMessage);
      }

      // Thêm tin nhắn chứa file vào mảng tin nhắn mới
      fileUrls.forEach(({ url, fileType, fileName }) => {
        const newMessage = {
          sender: userId,
          receiver: friendId,
          time: new Date().toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          fileUrl: url,
          fileType: fileType,
          fileName: fileName,
        };
        newMessages.push(newMessage);
      });

      // Lưu tin nhắn vào Firestore
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

    // Hàm tải lên tệp khác
  const uploadOtherFileAsync = async (otherFile) => {
    try {
      if (!otherFile) {
        throw new Error("Không có tệp nào được chọn");
      }
  
      const storageRef = storage;
      const filename = `chatFiles/${userId}_${friendId}/${otherFile.name}`; // Sửa đổi ở đây
      const otherFileRef = ref(storageRef, filename);
  
      await uploadBytes(otherFileRef, otherFile);
      const otherFileUrl = await getDownloadURL(otherFileRef);
  
      return otherFileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên tệp khác:", error);
      throw error;
    }
  };
  
  // Hàm tải lên hình ảnh
  const uploadImageAsync = async (imageFile) => {
    try {
      if (!imageFile) {
        throw new Error("Không có tệp hình ảnh nào được chọn");
      }
  
      const imageUrl = URL.createObjectURL(imageFile);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
  
      const storageRef = storage;
      const filename = `chatFiles/${userId}_${friendId}/${imageFile.name}`; // Sửa đổi ở đây
      const imageRef = ref(storageRef, filename);
  
      await uploadBytes(imageRef, blob);
      const fileUrl = await getDownloadURL(imageRef);
  
      return fileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên hình ảnh:", error);
      throw error;
    }
  };
  
  // Hàm xử lý sự kiện khi người dùng chọn tệp
  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(selectedFiles)]);
    }
  };

  // Hàm xử xóa tin nhắn 1 bên người gửi hoặc người nhận
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

  // Hàm thu hồi tin nhắn cả 2 bên người gui và người nhận
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

  // Hàm chia sẻ tin nhắn
  const shareMessage = async () => {
    try {
      if (!userId || !selectedMessage) return;

      const db = getFirestore();
      const shareTasks = selectedFriendsIds.map(async (friendId) => {
        const receiverSenderMessagesRef = doc(
          db,
          "chats",
          `${friendId}_${userId}`
        );
        await updateDoc(receiverSenderMessagesRef, {
          messages: arrayUnion(selectedMessage),
        });
      });

      await Promise.all(shareTasks);

      console.log("Tin nhắn đã được chia sẻ thành công cho bạn bè.");
    } catch (error) {
      console.error("Lỗi khi chia sẻ tin nhắn:", error);
    }
  };

  // Hàm hiển thị hoặc ẩn Emoji Picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  // Hàm xử lý sự kiện khi người dùng chọn emoji
  const handleEmojiSelect = (emoji) => {
    setMessageInput((prevMessageInput) => prevMessageInput + emoji.emoji);
  };

  // Ref để scroll xuống cuối cùng khi có tin nhắn mới
  const chatMessagesRef = useRef(null);
  // Hàm useEffect sẽ chạy mỗi khi messages thay đổi
  useEffect(() => {
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat với {friendName}</h3>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
         {/* Hiển thị các tùy chọn tin nhắn khi người dùng chọn tin nhắn xóa thu hồi hoặc chia sẻ */}
      {selectedMessage && (
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
            <button onClick={shareMessage}>Chia sẻ</button>
          )}
        </div>
      )}
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
                    <source src={msg.fileUrl} type="video/mp4"  />
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

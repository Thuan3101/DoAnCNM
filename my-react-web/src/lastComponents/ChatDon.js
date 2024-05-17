import React, { useState, useEffect, useRef } from "react";
import { getFirestore, doc, getDoc, addDoc, updateDoc, onSnapshot, collection, query, orderBy, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import "../css/ChatBox.css";
import EmojiPicker from "emoji-picker-react";

const ChatDon = ({ friendId }) => {
  const [friendName, setFriendName] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();
  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  


  useEffect(() => {
    const fetchFriendName = async () => {
      try {
        if (!friendId) return;

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
  }, [friendId, db]);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (!userId || !friendId) return;

    const chatRoomId = [userId, friendId].sort().join('_');
    const chatMessRef = collection(db, 'Chats', chatRoomId, 'chat_mess');
    const q = query(chatMessRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
      const  delete_mess = doc.data().delete_mess || [];
      const   isDeletedByUser = delete_mess.some((item) => item.uid_delete === userId);
        if (!isDeletedByUser) {
        messages.push({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
          image: doc.data().image,
          video: doc.data().video,
          document: doc.data().document,
          fileName: doc.data().fileName,
          fileType: doc.data().fileType,
          fileUrl: doc.data().fileUrl
        });
        }
      });
      
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [db, userId, friendId]);

  const sendMessage = async () => {
    try {
      if ((!messageInput.trim() && files.length === 0) || !userId || !friendId) return;
  
      let fileUrls = [];
      if (files.length > 0) {
        fileUrls = await Promise.all(
          files.map(async (file) => {
            const fileType = file.type.split("/")[0];
            let url = "";
            if (fileType === "image" || fileType === "video") {
              url = await uploadFileAsync(file);
            } else if (
              fileType === "application" ||
              fileType === "text" ||
              fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ) {
              url = await uploadFileAsync(file);
            }
            return { url, fileType, fileName: file.name };
          })
        );
      }
  
      const newMessages = [];
      if (messageInput.trim()) {
        const newMessage = {
          _id: new Date().getTime().toString(),
          createdAt: new Date(),
          user: {
            _id: userId,
            name: friendName,
          },
          text: messageInput, 
        };
        newMessages.push(newMessage);
      }
  
      fileUrls.forEach(({ url, fileType, fileName }) => {
        const newMessage = {
          _id: new Date().getTime().toString(),
          createdAt: new Date(),
          user: {
            _id: userId,
            name: friendName,
          },
          text: fileName,
        };
        if (fileType === "image") {
          newMessage.image = url;
        } else if (fileType === "video") {
          newMessage.video = url;
        } else {
          newMessage.document = url;
        }
        newMessages.push(newMessage);
      });
  
      const chatRoomId = [userId, friendId].sort().join('_');
      const chatMessRef = collection(db, 'Chats', chatRoomId, 'chat_mess');
  
      await Promise.all(newMessages.map(async (msg) => {
        await addDoc(chatMessRef, msg);
      }));
      setMessageInput("");
      setFiles([]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };
  

  const uploadFileAsync = async (file) => {
    try {
      const storageRef = ref(storage, `chatFiles/${userId}_${friendId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      return fileUrl;
    } catch (error) {
      console.error("Lỗi khi tải lên tệp:", error);
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
  
      const messageid = selectedMessage._id;
      const uid_delete = userId; 
      const time_delete = new Date();
      const chatRoomId = [userId, friendId].sort().join('_');
  
      // Log variables for debugging
      console.log('selectedMessage ID:', messageid);
      console.log('User ID:', userId);
      console.log('Friend ID:', friendId);
      console.log('chatRoomId:', chatRoomId);
  
      // Reference to the message document
      const messageRef = doc(db, 'Chats', chatRoomId, 'chat_mess', messageid);
      const messageSnapshot = await getDoc(messageRef);
  
      if (messageSnapshot.exists()) {
        const delete_mess = {
          uid_delete: uid_delete,
          time_delete: time_delete
        };
  
        const chatMessData = messageSnapshot.data();
        const Delete_mess_Array = chatMessData.delete_mess || [];
        // Add delete_mess to the array
        Delete_mess_Array.push(delete_mess);
  
        await updateDoc(messageRef, {
          delete_mess: Delete_mess_Array
        });
  
        console.log('Message deleted successfully.');
      } else {
        console.log("Document does not exist.");
        console.log("Checked path:", `Chats/${chatRoomId}/chat_mess/${messageid}`);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  

  
  
  const recallMessage = async () => {
    try {
      if (!userId || !selectedMessage) return;

      const chatRoomId = [userId, friendId].sort().join('_');
      const messageRef = doc(db, 'Chats', chatRoomId, 'chat_mess', selectedMessage._id);

      await updateDoc(messageRef, {
        text: 'Tin nhắn đã được thu hồi',
        image: null,
        video: null,
        document: null,
        fileName: null,
        fileType: null,
        fileUrl: null
      });

      setSelectedMessage(null);
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
    }
  };

  const replyToMessage = (msg) => {
    setMessageInput(`${msg.text} Trả lời:`);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput((prevMessageInput) => prevMessageInput + emoji.emoji);
  };

  const chatMessagesRef = useRef(null);

  useEffect(() => {
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [messages]);

  const formatMessageTime = (time) => {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(time);
  };
  
  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat với {friendName}</h3>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user._id === userId ? "sender" : "receiver"}`}
            onClick={() => setSelectedMessage(msg)}
          >
            <span className="message-time">{formatMessageTime(msg.createdAt)}</span>
            <a href={msg.document} target="_blank" rel="noopener noreferrer">
              <span className="message-text">{msg.text}</span>
            </a>
            {msg.image && (
              <img src={msg.image} alt="Hình ảnh" className="chat-image" />
            )}
            {msg.video && (
              <video controls className="chat-videos">
                <source src={msg.video} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            )}

            {/* Hiển thị nút chỉ khi có tin nhắn được chọn */}
            {selectedMessage && (
              <>
                {/* Hiển thị nút chỉ khi tin nhắn được gửi bởi user hiện tại */}
                {msg.user._id === userId && selectedMessage._id === msg._id && (
                  <div className="selected-message-options">
                    <button onClick={deleteMessage}>Xóa</button>
                    <button onClick={recallMessage}>Thu hồi</button>
                    <button onClick={() => replyToMessage(selectedMessage)}>Trả lời</button>
                  </div>
                )}
                {/* Hiển thị nút chỉ khi tin nhắn được gửi bởi user khác */}
                {msg.user._id !== userId && selectedMessage._id === msg._id && (
                  <div className="selected-message-options">
                    <button onClick={deleteMessage}>Xóa</button>
                    <button onClick={() => replyToMessage(selectedMessage)}>Trả lời</button>
                  </div>
                )}
              </>
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

export default ChatDon;

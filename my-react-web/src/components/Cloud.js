import React, { useState } from "react";
import "../css/cloud.css";
import may from '../image/clouds.webp';

const Cloud = () => {
  const chatList = [
    { id: 0, name: 'Cloud của tao ', text: 'trống' },
    { id: 1, name: 'An ', text: 'hello mày' },
    { id: 2, name: 'TuiTi', text: 'ừ hihi' },
    // Thêm các cuộc trò chuyện khác nếu cần
  ];
  const [messages, setMessages] = useState([
    // { id: 0, sender: "An", text: "Hello" },
    // { id: 1, sender: "You", text: "Hi there" },
    // { id: 2, sender: "An", text: "How are you?" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    let fileData = null;
    if (selectedFile) {
      // Đọc file thành ArrayBuffer
      const reader = new FileReader();
      reader.onload = function(event) {
        fileData = event.target.result;

        // Gửi tin nhắn và fileData tới máy chủ
        const newMsg = {
          id: messages.length,
          sender: "You",
          text: newMessage,
          fileData: fileData, // Thêm trường fileData vào tin nhắn
        };

        setMessages([...messages, newMsg]);
        setNewMessage("");
        setSelectedFile(null);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // Gửi tin nhắn không kèm file
      const newMsg = {
        id: messages.length,
        sender: "You",
        text: newMessage,
      };

      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Lưu file đã chọn vào state
  };

  const openFileDialog = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <div className="container-cloud">
      <div className="row1-cloud" >
      <div className='chat-list'>
          <h2>Chats</h2>
          <ul>
            {chatList.map(chat => (
              <li key={chat.id}>
            
                <span className="name">{chat.name}</span>
                <br></br>
                <span className="text">{chat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      
      </div>
      <div className="roww-cloud">
            {/* <img className="anhmay" src={may} alt="Logo"></img> */}
            <div className="chat-list">
          <div className="mycloud">
            <text className="tit">Cloud của tôi</text>
            <br />
            <text className="title2">Lưu trữ các dữ liệu giữa các thiết bị</text>
          </div>
          
          <ul>
            {messages.map((msg) => (
              <li className="nametext" key={msg.id}>
                <span className="name-cloud">{msg.sender}</span>
                <br />
                <span className="text-cloud">{msg.text}</span>
                {msg.fileData && <span> - <a href={URL.createObjectURL(new Blob([msg.fileData]))} download>Download File</a></span>} {/* Hiển thị link tải file nếu có */}
              </li>
            ))}
          </ul>
        </div>
        <div className="message-input" style={{ position: "absolute", bottom: 0, left: 0, width: "100%" }}>
          <input
            className="inputText"
            type="text"
            placeholder="Nhập gì đó ...."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }} // Ẩn input type file
            onChange={handleFileChange}
          />
          <button className="btnFile" onClick={openFileDialog}>Chọn file</button> {/* Nút chọn file */}
          <button className="btnSend" onClick={handleSendMessage}>Send</button>
        </div>
            
          
        </div>
      </div>
   
  );
};

export default Cloud;
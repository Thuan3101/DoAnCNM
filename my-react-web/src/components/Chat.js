import React from 'react';
import '../css/chat.css';

const Chat = () => {
  // Giả sử danh sách các cuộc trò chuyện
  const chatList = [
    { id: 0, name: 'Cloud của tao ', text: 'trống' },
    { id: 1, name: 'An ', text: 'hello mày' },
    { id: 2, name: 'TuiTi', text: 'ừ hihi' },
    // Thêm các cuộc trò chuyện khác nếu cần
  ];

  return (
    <div className='container'>
      <div className='row1'>
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
      <div className='row2'></div>
    </div>
  );
};

export default Chat;

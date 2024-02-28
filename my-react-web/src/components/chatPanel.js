import React from 'react';
import { Link } from 'react-router-dom';
import "../css/chatPanel.css";

const ChatPanel = () => {
  return (
    <div>
      <div className="App">
        <div className="header">
          {/* <div className="avatar"></div> */}
          <div className="search-bar">
            <input type="text" placeholder="Search..." className="searchBarInput" />
            <Link to="/chat">
              <button className="searchBarButton">Search</button>
            </Link> 
          </div>
        </div>
      </div> 
      <div className="chatPanel">
        {/* Danh sách cuộc trò chuyện */}
        <div className="chatItem">
          <div className="avatar"></div>
          <div className="content">
            <div className="name">Nhi Nhi</div>
            <div className="message">Hello</div>
          </div>
        </div>
        <div className="chatItem">
          <div className="avatar"></div>
          <div className="content">
            <div className="name">BaBy</div>
            <div className="message">Mãi yêuuuuu</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;

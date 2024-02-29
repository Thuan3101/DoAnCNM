import React, { useState } from 'react';
import Cloud from './Cloud';
import CongCu from './CongCu';
import CaiDat from './CaiDat';
import Chat from './Chat';
import Call from './Call';
import DanhBa from './DanhBa'; // Import DanhBa component
import '../css/home.css';

const Home = () => {
  const [currentTab, setCurrentTab] = useState('chat'); // 'chat', 'call', 'cloud', 'congcu', 'caidat', 'danhba'

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="container1">
      <div className="tabs">
        <div onClick={() => handleTabChange('chat')}>
          <div className="tab">Chat</div>
        </div>
        <div onClick={() => handleTabChange('call')}>
          <div className="tab">Call</div>
        </div>
        <div onClick={() => handleTabChange('danhba')}>
          <div className="tab">Danh bạ</div>
        </div>
        <div onClick={() => handleTabChange('cloud')}>
             <div className="tab" style={{ marginTop: '120px' }}>My Cloud</div>
        </div>
        <div onClick={() => handleTabChange('congcu')}>
          <div className="tab">Công cụ</div>
        </div>
        <div onClick={() => handleTabChange('caidat')}>
          <div className="tab">Cài đặt</div>
        </div>
      </div>

      <div className='container2'>
        <div className='tabtop'></div>
        <div className="tab-content">
         
          {currentTab === 'chat' ? <Chat /> :
           (currentTab === 'call' ? <Call /> :
           (currentTab === 'danhba' ? <DanhBa /> :
           (currentTab === 'cloud' ? <Cloud /> :
           (currentTab === 'congcu' ? <CongCu /> : <CaiDat />))))}
        </div>
      </div>
    </div>
  );
};

export default Home;

import React, { useState } from 'react';
import Cloud from './Cloud';
import CongCu from './CongCu';
import CaiDat from './CaiDat';
import Chat from './Chat';
import Call from './Call';
import DanhBa from './DanhBa'; 
import '../css/home.css';
import tool1 from '../image/tool1.png';
import tool2 from '../image/tool2.png';
import tool3 from '../image/tool3.png';
import tool7 from '../image/tool7.png';
import tool5 from '../image/tool5.png';
import tool6 from '../image/tool6.png';
import avatar from '../image/avatar.png';
import Avatar from './Avatar';

const Home = () => {
  const [currentTab, setCurrentTab] = useState('chat'); // 'chat', 'call', 'cloud', 'congcu', 'caidat', 'danhba'

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div className="container1">
      <div className="tabs">
        <div onClick={() => handleTabChange('Avatar')}>
          <img src={avatar} alt="Avatar" className="avatar-home" /></div>
        <div onClick={() => handleTabChange('chat')}>
          <img src={tool1} alt="Chat" className="tab-icon" />
        </div>
        <div onClick={() => handleTabChange('call')}>
          <img src={tool2} alt="Call" className="tab-icon" />
        </div>
        <div onClick={() => handleTabChange('danhba')}>
          <img src={tool3} alt="Danh bạ" className="tab-icon" />
        </div>
        <div onClick={() => handleTabChange('cloud')}>
          <img src={tool5} alt="My Cloud" className="tab-icon" />
        </div>
        <div onClick={() => handleTabChange('congcu')}>
          <img src={tool6} alt="Công cụ" className="tab-icon" />
        </div>
        <div onClick={() => handleTabChange('caidat')}>
          <img src={tool7} alt="Cài đặt" className="tab-icon" />
        </div>
      </div>

      <div className='container2'>
        <div className='tabtop'>
        </div>
        <div className="tab-content">
          {currentTab === 'chat' ? <Chat /> :
          (currentTab === 'avatar' ? <Avatar /> :
           (currentTab === 'call' ? <Call /> :
           (currentTab === 'danhba' ? <DanhBa /> :
           (currentTab === 'cloud' ? <Cloud /> :
           (currentTab === 'congcu' ? <CongCu /> : <CaiDat />)))))}
        </div>
      </div>
    </div>
  );
};

export default Home;

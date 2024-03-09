import React, { useState } from 'react';
import '../css/congcu.css';

const CongCuLayout = ({ currentTab, handleTabChange }) => {
  return (
    <div className='container'>
      <div className='row'>
        <div className='chat-list1'>
          <h2>Công cụ</h2>
          <ul>
            <li onClick={() => handleTabChange('tinNhanNhanh')}>Tin nhắn nhanh</li>
            <hr></hr>
            <li onClick={() => handleTabChange('tinDau')}>Tin dấu</li>
            <hr></hr>
          </ul>
        </div>
        <div className='content'>
          {currentTab === 'tinNhanNhanh' && (
            <div className='tinNhanNhanh'>
              <h3 className='titleNhanh'>CHƯA CÓ NỘI DUNG CHO TIN NHẮN NHANH</h3>
              
            </div>
          )}
          {currentTab === 'tinDau' && (
            <div className='tinDau'>
             <h3 className='tdTitle'>CHƯA CÓ NỘI DUNG CHO TIN DẤU</h3>
           
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CongCu = () => {
  const [currentTab, setCurrentTab] = useState('tinNhanNhanh');

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
  };

  return <CongCuLayout currentTab={currentTab} handleTabChange={handleTabChange} />;
};

export default CongCu;

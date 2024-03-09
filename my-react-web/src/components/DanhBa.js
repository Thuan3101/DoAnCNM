import React, { useState, useEffect } from 'react';
import "../css/danhBa.css";

const DanhBaTab = ({ currentTab, handleTabChange }) => {
  const [selected, setSelected] = useState('az');
  const [userData, setUserData] = useState([]);
  const [filter, setFilter]=useState('all')

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://65e824cf4bb72f0a9c4e5ce4.mockapi.io/danhBa');
      const data = await response.json();
      setUserData(data); // Lưu trữ toàn bộ mảng dữ liệu
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleshortChange = (selected) => {
    setSelected(selected);
   
  };
  const handleFilterChange =(filter) =>{
    setFilter(filter);
  }

  return (
    <div className='container'>
      <div className='row1'>
        <div className='chat-list'>
          <h2>Danh Bạ</h2>
          <ul>
            <li onClick={() => handleTabChange('dsBanBe')}>Danh Sách Bạn Bè</li>
            <li onClick={() => handleTabChange('dsNhom')}>Danh Sách Nhóm</li>
            <li onClick={() => handleTabChange('loiMoiKB')}>Lời Mời Kết Bạn</li>
          </ul>
        </div>
      </div>
      <div className='row2'>
        <div className='titleAria'></div>

        {currentTab === 'dsBanBe' && (
          <div className='dsbb'>
            <div className="h">
              <h5 className='headerText'>Bạn bè</h5>
              <input className='inputName' type="text" placeholder="Tìm kiếm bạn bè" />

              <select className='az' value={selected} onChange={(e) => handleshortChange(e.target.value)}>
              <option value="az">Từ A-Z</option>
              <option value="za">Từ Z-A</option></select>

              <select className='loc' value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">Tất Cả</option>
              <option value="pl">Phân Loại</option></select>
            </div>
            <div className="content">
              {userData.map((user) => (
                <div key={user.id} className="userInfo">
                  <div className="userInfoRow">
                    <div className="name">{user.name}</div>
                   
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'dsNhom' && (
          <div className='dsn'>
            <div className="h">
              <h5 className='headerText'>Danh Sách Nhóm</h5>
              <input className='inputName' type="text" placeholder="Tìm kiếm nhóm" />
              <select className='az' value={selected} onChange={(e) => handleshortChange(e.target.value)}>
              <option value="az">Từ A-Z</option>
              <option value="za">Từ Z-A</option></select>

              <select className='loc' value={filter} onChange={(e) => handleFilterChange(e.target.value)}>
              <option value="all">Tất Cả</option>
              <option value="pl">Phân Loại</option></select>
            
            </div>
            
           
          
          </div>
        )}

        {currentTab === 'loiMoiKB' && (
          <div className='lmKB'>
             <div className="h">
             <h5 className='headerTextLM'>Lời Mời Đã Nhận</h5>
              <div className="hd3">
                <div className='kb'></div>
                <div className='kb'></div>
              </div>
             
             
              
            
            </div>
            
          </div>
        )}

      
      </div>
    </div>
  );
};

const DanhBa = () => {
  const [currentTab, setCurrentTab] = useState(null);

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
  };

  return (
    <DanhBaTab currentTab={currentTab} handleTabChange={handleTabChange} />
  );
};

export default DanhBa;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "../css/caiDat.css";

const CaiDatLayout = ({ currentTab, handleTabChange }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('vn');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getFirestore();
        const userRef = doc(db, "users", "userInfoId"); // Thay "userInfoId" bằng ID của người dùng
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserInfo(userData);
        } else {
          console.log("Không tìm thấy thông tin người dùng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateUserInfo = () => {
    // Thực hiện các hành động cần thiết khi nhấn nút cập nhật
    console.log("Nút cập nhật đã được nhấn!");
  };

  const handleLogout = () => {
    // Hiển thị hộp thoại xác nhận trước khi đăng xuất
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất?");
    if (confirmLogout) {
      // Xử lý đăng xuất nếu người dùng đồng ý
      //  chuyển hướng người dùng về trang đăng nhập
      navigate("/");
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    // Thực hiện các hành động bổ sung ở đây, như thay đổi cài đặt ngôn ngữ trong ứng dụng của bạn
  };

  const handleChangePassword = () => {
    // Thực hiện logic để thay đổi mật khẩu ở đây
    console.log("Thay đổi mật khẩu");
    console.log("Mật khẩu cũ:", oldPassword);
    console.log("Mật khẩu mới:", newPassword);
    // Reset các trường sau khi thực hiện xong
    setOldPassword('');
    setNewPassword('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <div className='row1'>
        <div className='chat-list'> 
          <h2>Cài đặt</h2>
          <ul>
            {/* <li onClick={() => handleTabChange('thongTin')}>Thông tin</li>
            <li onClick={() => handleTabChange('caiDat')}>Cài đặt</li> */}
            <li onClick={() => handleTabChange('ngonNgu')}>Ngôn ngữ</li>
            <li onClick={handleLogout}>Đăng xuất</li>
          </ul>
        </div>
      </div>
      <div className='row2'>
        <div className='titleAria'></div>
        {currentTab === 'thongTin' && (
          <div className='thong-tin'>
            <div className="header">
              <h1>Thông tin cá nhân</h1>
              <div className="avatar"></div>
              <p>{userInfo?.name || ''}</p>
            </div>
    
            <div className="content">
              <div className="userInfo">
                {userInfo && (
                  <>
                    <div className="userInfoRow">
                      <span>Bio:</span>
                      <span>{userInfo.bio}</span>
                    </div>
    
                    <div className="userInfoRow">
                      <span>Giới tính:</span>
                      <span>{userInfo.gioiTinh}</span>
                    </div>
    
                    <div className="userInfoRow">
                      <span>Ngày sinh:</span>
                      <span>{userInfo.ngaySinh}</span>
                    </div>
    
                    <div className="userInfoRow">
                      <span>Số điện thoại:</span>
                      <span>{userInfo.soDienThoai}</span>
                    </div>
    
                    <div className="userInfoRow">
                      <span>Nơi sinh:</span>
                      <span>{userInfo.noiSinh}</span>
                    </div>
    
                    <button className="updateBtn" onClick={handleUpdateUserInfo}>Cập nhật thông tin</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {currentTab === 'caiDat' && (
          <div className='cai-dat'>
            <text className='title'>Hiển thị</text> <br></br>
            <text className='title2'>Nội dung cho tab Cài đặt</text>
            <ul>
              <li onClick={() => handleTabChange('chung')}>Chung</li>
              <li onClick={() => handleTabChange('baoMat')}>Bảo mật</li>
              <li onClick={() => handleTabChange('quanLiDuLieu')}>Quản lí dữ liệu</li>
              <li onClick={() => handleTabChange('giaoDien')}>Giao diện</li>
            </ul>
          </div>
        )}
    
        {currentTab === 'ngonNgu' && (
          <div className='ngon-ngu'>
            <h2>Ngôn ngữ</h2>
            <p>Chọn ngôn ngữ:</p>
            <select value={selectedLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="vn">Tiếng Việt</option>
              <option value="en">English</option>
              {/* Thêm các tùy chọn ngôn ngữ khác nếu cần */}
            </select>
          </div>
        )}

        {currentTab === 'baoMat' && (
          <div className='bao-mat'>
            <text className='title'>Thay đổi mật khẩu</text> <br></br>
            <div className='password-change'>
              <label>Mật khẩu cũ:</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <label>Mật khẩu mới:</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button className="updateBtn" onClick={handleChangePassword}>Thay đổi mật khẩu</button>
            </div>
          </div>
        )}

        {currentTab === 'giaoDien' && (
          <div className='giao-dien'>
            <text className='title'>Giao diện</text> <br></br>
            <div className='dark-mode-toggle'>
              <label>Chế độ tối:</label>
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const CaiDat = () => {
  const [currentTab, setCurrentTab] = useState(null);

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
  };

  return (
    <CaiDatLayout currentTab={currentTab} handleTabChange={handleTabChange} />
  );
};

export default CaiDat;

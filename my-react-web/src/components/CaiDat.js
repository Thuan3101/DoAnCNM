import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const CaiDatLayout = ({ currentTab, handleTabChange, userData }) => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('vn');
  // const [oldPassword, setOldPassword] = useState(userData ? userData.password : ''); 
  // const [newPassword, setNewPassword] = useState('');
  // const [showPassword, setShowPassword] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);
  // const [isError, setIsError] = useState(false);

  // const handleUpdateUserInfo = async () => {
  //   try {
  //     if (userData) {
  //       const db = getFirestore();
  //       const userRef = doc(db, "users", userData.uid); 
  //       const userSnap = await getDoc(userRef);
  //       if (userSnap.exists()) {
  //         await updateDoc(userRef, { password: newPassword });
  //         console.log("Mật khẩu đã được cập nhật!");
  //         setIsSuccess(true);
  //         setIsError(false); 
  //       } else {
  //         console.error("Tài liệu không tồn tại");
  //         setIsSuccess(false); 
  //         setIsError(true); 
  //       }
  //     } else {
  //       console.error("Không có dữ liệu người dùng để cập nhật mật khẩu");
  //       setIsSuccess(false);
  //       setIsError(true); 
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi cập nhật mật khẩu:", error);
  //     setIsSuccess(false); 
  //     setIsError(true); 
  //   }
  // };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất?");
    if (confirmLogout) {
      navigate("/");
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // const handleChangePassword = () => {
  //   console.log("Thay đổi mật khẩu");
  //   console.log("Mật khẩu cũ:", oldPassword);
  //   console.log("Mật khẩu mới:", newPassword);
  //   setOldPassword('');
  //   setNewPassword('');
  //   handleUpdateUserInfo();
  // };

  // const handleTogglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  return (
    <div>
      <div>
        <h2>Cài đặt</h2>
        <ul>
          <li onClick={() => handleTabChange('ngonNgu')}>Ngôn ngữ</li>
          {/* <li onClick={() => handleTabChange('baoMat')}>Bảo mật</li> */}
          <li onClick={handleLogout}>Đăng xuất</li>
        </ul>
      </div>
      <div>
        {currentTab === 'ngonNgu' && (
          <div>
            <h2>Ngôn ngữ</h2>
            <p>Chọn ngôn ngữ:</p>
            <select value={selectedLanguage} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="vn">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        )}

        {/* {currentTab === 'baoMat' && (
          <div>
            <h2> Mật khẩu</h2>
            {isSuccess && <p style={{ color: 'green' }}>Thay đổi mật khẩu thành công!</p>}
            {isError && <p style={{ color: 'red' }}>Thay đổi mật khẩu không thành công!</p>}
            <div>
              <div>
                <label>Mật khẩu cũ:</label>
                <input type={showPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                <span className="password-toggle" onClick={handleTogglePasswordVisibility}>{showPassword ? "Ẩn" : "Hiện"}</span>
              </div>
              <div>
                <label>Mật khẩu mới:</label>
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                
              </div>
              <button onClick={handleChangePassword}>Thay đổi mật khẩu</button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

const CaiDat = ({ userData }) => { 
  const [currentTab, setCurrentTab] = useState(null);

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
  };

  return (
    <CaiDatLayout currentTab={currentTab} handleTabChange={handleTabChange} userData={userData} />
  );
};

export default CaiDat;

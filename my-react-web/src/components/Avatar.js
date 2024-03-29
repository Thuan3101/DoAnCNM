import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { getDoc, getFirestore, doc } from "firebase/firestore";
import "../css/avatar.css";

const Avatar = () => {
  const user = auth.currentUser;
  const db = getFirestore();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
        } else {
          navigate("/profile"); // Nếu không có hồ sơ, chuyển hướng đến trang hồ sơ
        }
      }
    };
    fetchUserData();
  }, [user, db, navigate]);

  const handleUpdateUserInfo = () => {
    // Định nghĩa logic cập nhật thông tin người dùng tại đây
  };

  return (
    <div className='row2'>
      <div className='titleAria'></div>
      {userData && (
        <div className='thong-tin'>
          <div className="header">
            <h1>Thông tin cá nhân</h1>
            <div className="avatar">
              <img src={userData.profileImageUrl} alt="Avatar" />
            </div>
            {/* <p>{userData.name || ''}</p> */}
          </div>

          <div className="content">
            <div className="userInfo">
              <>
                <div className="userInfoRow">
                  <span>Bio:</span>
                  <span>{userData.name}</span>
                </div>

                <div className="userInfoRow">
                  <span>Giới tính:</span>
                  <span>{userData.gender}</span>
                </div>

                <div className="userInfoRow">
                  <span>Ngày sinh:</span>
                  <span>{userData.dateOfBirth}</span>
                </div>

                <div className="userInfoRow">
                  <span>Số điện thoại:</span>
                  <span>{userData.soDienThoai}</span>
                </div>

                <div className="userInfoRow">
                  <span>Nơi sinh:</span>
                  <span>{userData.noiSinh}</span>
                </div>

                <button className="updateBtn" onClick={handleUpdateUserInfo}>Cập nhật thông tin</button>
              </>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;

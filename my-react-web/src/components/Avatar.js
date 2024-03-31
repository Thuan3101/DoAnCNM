import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { getDoc, getFirestore, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../css/avatar.css";


const Avatar = () => {
  const user = auth.currentUser;
  const db = getFirestore();
  const storage = getStorage();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newDateOfBirth, setNewDateOfBirth] = useState("");
  const [newSoDienThoai, setNewSoDienThoai] = useState("");
  const [newNoiSinh, setNewNoiSinh] = useState("");
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(null); // Thêm state để lưu trữ ảnh tạm thời khi đang chỉnh sửa

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          setNewName(userData.name || "");
          setNewGender(userData.gender || "");
          setNewDateOfBirth(userData.dateOfBirth || "");
          setNewSoDienThoai(userData.soDienThoai || "");
          setNewNoiSinh(userData.noiSinh || "");
        } else {
          navigate("/profile");
        }
      }
    };
    fetchUserData();
  }, [user, db, navigate]);

  const handleUpdateUserInfo = async () => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }

      let downloadURL = null;

      if (newProfileImage) {
        // Xóa ảnh cũ trên storage nếu tồn tại
        if (userData.profileImageUrl) {
          const oldImageRef = ref(storage, userData.profileImageUrl);
          await deleteObject(oldImageRef);
        }

        // Tải ảnh mới lên storage
        const storageRef = ref(storage, `profileImages/${user.uid}/${newProfileImage.name}`);
        await uploadBytes(storageRef, newProfileImage);
        downloadURL = await getDownloadURL(storageRef);
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: newName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
        soDienThoai: newSoDienThoai,
        noiSinh: newNoiSinh,
        profileImageUrl: downloadURL || userData.profileImageUrl,
      });

      setUserData({
        ...userData,
        name: newName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
        soDienThoai: newSoDienThoai,
        noiSinh: newNoiSinh,
        profileImageUrl: newProfileImage ? downloadURL : userData.profileImageUrl,
      });

      alert("Thông tin đã được cập nhật thành công!");

      setIsEditing(false);

    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Lưu trữ ảnh cũ vào state tạm thời
    setTempProfileImage(userData.profileImageUrl);
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    setNewProfileImage(imageFile);
  };

  return (
    <div className='row22222'>
      
      {userData && (
        <div className='avatarContainer'>
          <div className="avatarHeader">
            <h4 className="ttAvatar">Thông tin cá nhân</h4>
            <div className="avt">
              {isEditing ? (
                <div className="fit">
                  <input type="file" id="file" className="inputFileHidden" onChange={handleImageChange} accept="image/*" />
                  {newProfileImage ? (
                    <img className="imgAvt" src={URL.createObjectURL(newProfileImage)} alt="Avatar" />
                  ) : (
                    <img className="imgAvt" src={tempProfileImage || userData.profileImageUrl} alt="Avatar" />
                  )}
                  <label htmlFor="file" className="customFileUpload">Choose file</label>
                </div>
              ) : (
                <img src={userData.profileImageUrl} alt="Avatar" />
              )}
            </div>


          </div>

          <div className="contentEdit">
            <div className="headerEdit">
              
                <div className="bio">
                  <span>Bio : </span>
                  {isEditing ? (
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  ) : (
                    <span>{userData.name}</span>
                  )}
                </div>
                   
                <div className="gioiTinh">
                  <span>Giới tính :</span>  
                  {isEditing ? (
                    <input type="text" value={newGender} onChange={(e) => setNewGender(e.target.value)} />
                  ) : (
                    <span>{userData.gender}</span>
                  )}
                </div>
               
                <div className="ngaySinh">
                  <span>Ngày sinh  : </span>
                  {isEditing ? (
                    <input type="text" value={newDateOfBirth} onChange={(e) => setNewDateOfBirth(e.target.value)} />
                  ) : (
                    <span>{userData.dateOfBirth}</span>
                  )}
                </div>
                

                {/* <div className="userInfoRow">
                  <span>Số điện thoại:</span>
                  {isEditing ? (
                    <input type="text" value={newSoDienThoai} onChange={(e) => setNewSoDienThoai(e.target.value)} />
                  ) : (
                    <span>{userData.soDienThoai}</span>
                  )}
                </div>

                <div className="userInfoRow">
                  <span>Nơi sinh:</span>
                  {isEditing ? (
                    <input type="text" value={newNoiSinh} onChange={(e) => setNewNoiSinh(e.target.value)} />
                  ) : (
                    <span>{userData.noiSinh}</span>
                  )}
                </div> */}

                {isEditing ? (
                  <button className="editBtn" onClick={handleUpdateUserInfo}>Cập nhật thông tin</button>
                ) : (
                  <button className="editBtn" onClick={handleEditClick}>Chỉnh sửa thông tin</button>
                )}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;

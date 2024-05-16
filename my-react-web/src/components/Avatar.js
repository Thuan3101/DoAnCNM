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
  const [newphoto, setNewphoto] = useState(null);
  const [newEmail, setNewEmail] = useState(""); 
  const [isEditing, setIsEditing] = useState(false);
  const [tempphoto, setTempphoto] = useState(null); 
  
  // Lấy thông tin người dùng từ Firestore
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
          setNewEmail(user.email || ""); // Lấy email từ Firebase Authentication
        } else {
          navigate("/profile");
        }
      }
    };
    fetchUserData();
  }, [user, db, navigate]);
  
  // Cập nhật thông tin người dùng
  const handleUpdateUserInfo = async () => {
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
      
      // Validate date of birth
      const dob = new Date(newDateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
  
      if (age < 16) {
        alert("Bạn phải đủ 16 tuổi trở lên để cập nhật thông tin.");
        return;
      }
  
      let downloadURL = null;
  
      if (newphoto) {
        // Xóa ảnh cũ trên storage nếu tồn tại
        if (userData.photoURL) {
          const oldImageRef = ref(storage, userData.photoURL);
          await deleteObject(oldImageRef);
        }
  
        // Tải ảnh mới lên storage
        const storageRef = ref(storage, `photo/${user.uid}/${newphoto.name}`);
        await uploadBytes(storageRef, newphoto);
        downloadURL = await getDownloadURL(storageRef);
      }
  
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: newName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
        soDienThoai: newSoDienThoai,
        noiSinh: newNoiSinh,
        photoURL: downloadURL || userData.photoURL,
        email: newEmail // Cập nhật email mới
      });
  
      setUserData({
        ...userData,
        name: newName,
        gender: newGender,
        dateOfBirth: newDateOfBirth,
        soDienThoai: newSoDienThoai,
        noiSinh: newNoiSinh,
        photoURL: newphoto ? downloadURL : userData.photoURL,
        email: newEmail // Cập nhật email trong state
      });
  
      alert("Thông tin đã được cập nhật thành công!");
  
      setIsEditing(false);
  
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };
  
  // Xử lý khi click vào nút chỉnh sửa
  const handleEditClick = () => {
    setIsEditing(true);
    // Lưu trữ ảnh cũ vào state tạm thời
    setTempphoto(userData.photoURL);
  };
  
  // Xử lý khi thay đổi ảnh đại diện
  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    setNewphoto(imageFile);
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
                  {newphoto ? (
                    <img className="imgAvt" src={URL.createObjectURL(newphoto)} alt="Avatar" />
                  ) : (
                    <img className="imgAvt" src={tempphoto || userData.photoURL} alt="Avatar" />
                  )}
                  <label htmlFor="file" className="customFileUpload">Choose file</label>
                </div>
              ) : (
                <img src={userData.photoURL} alt="Avatar" />
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
                  <select value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <span>{userData.gender}</span>
                )}
              </div>
              <div className="ngaySinh">
                <span>Ngày sinh  : </span>
                {isEditing ? (
                  <input type="date" value={newDateOfBirth} onChange={(e) => setNewDateOfBirth(e.target.value)} />
                ) : (
                  <span>{userData.dateOfBirth}</span>
                )}
              </div>
              <div className="userInfoRow">
                <span>Email:</span>
                {isEditing ? (
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                ) : (
                  <span>{newEmail}</span>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../config/firebase";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import "../css/profile.css";

const Profile = () => {
  const db = getFirestore();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    photo: null,
    photoURL: "",
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(""); 

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "gender") {
      if (value !== "Nam" && value !== "Nữ" && value !== "Khác") {
        return;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      setFormData((prevData) => ({
        ...prevData,
        photo: imageFile,
        photoURL: imageUrl,
      }));
    }
  };

  const uploadImageAsync = async (imageFile, userId) => {
    try {
      if (!imageFile) {
        throw new Error("Không có tệp hình ảnh được chọn");
      }

      const imageUrl = URL.createObjectURL(imageFile);
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const storageRef = storage;
      const filename = `photo/${userId}/${Date.now()}`;
      const imageRef = ref(storageRef, filename);

      await uploadBytes(imageRef, blob);

      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Lỗi tải lên ảnh:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!auth.currentUser) {
        throw new Error("Không có người dùng đang đăng nhập");
      }

      if (!formData.name || !formData.gender || !formData.dateOfBirth || !formData.photo) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();

      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 16) {
        setErrorMessage("Bạn phải đủ 16 tuổi trở lên để đăng ký");
        return;
      }

      const imageUrl = await uploadImageAsync(formData.photo, auth.currentUser.uid);

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        UID: auth.currentUser.uid,         // Thêm UID
        email: auth.currentUser.email,     // Thêm email
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        photoURL: imageUrl,
      });

      navigate("/home");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ người dùng:", error);
      setErrorMessage(error.message);  // Hiển thị thông báo lỗi cho người dùng
      // Xử lý lỗi ở đây (ví dụ: hiển thị thông báo lỗi cho người dùng)
    }
  };

  return (
    <div className="container-pf">
      <h2 className="titlePf">HOÀN THIỆN HỒ SƠ</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="input-field nameIp"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tên"
          />
        </div>
        <div className="form-group">
          <select
            className="input-field genderIp"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div className="form-group">
          <input
            className="input-field birthIp"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            min="1900-01-01"
            max="2024-12-31" 
          />
        </div>
        <div className="form-group">
          <img className="avt-pf" src={formData.photoURL} alt="Hình ảnh" />
          <input
            className="input-field imgIp"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        {errorMessage && (
          <span style={{color:'red'}}>{errorMessage}</span>
        )}
        <button className="btnSm" type="submit">
          Gửi
        </button>
      </form>
    </div>
  );
};

export default Profile;

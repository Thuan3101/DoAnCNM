import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../config/firebase";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import "../css/profile.css";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

const Profile = () => {
  const db = getFirestore();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    profileImage: null,
    profileImageUrl: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Kiểm tra giá trị của trường giới tính
    if (name === "gender") {
      if (value !== "nam" && value !== "nữ" && value !== "khác") {
        // Nếu giá trị không hợp lệ, không cập nhật state
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
        profileImage: imageFile,
        profileImageUrl: imageUrl,
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
      const filename = `profileImages/${userId}/${Date.now()}`;
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

      // Kiểm tra xem tất cả các trường đã được điền chưa
      if (!formData.name || !formData.gender || !formData.dateOfBirth || !formData.profileImage) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      // Tải ảnh lên Firebase Storage
      const imageUrl = await uploadImageAsync(formData.profileImage, auth.currentUser.uid);

      // Lưu dữ liệu vào Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        profileImageUrl: imageUrl,
      });

      // Điều hướng đến trang "/home" sau khi gửi thành công
      navigate("/home");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ người dùng:", error);
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
            <option value="nam">Nam</option>
            <option value="nữ">Nữ</option>
            <option value="khác">Khác</option>
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
          <img className="avt-pf" src={formData.profileImageUrl} alt="Hình ảnh" />
          <input
            className="input-field imgIp"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button className="btnSm" type="submit">
          Gửi
        </button>
      </form>
    </div>
  );
};

export default Profile;

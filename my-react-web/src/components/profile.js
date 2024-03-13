import React, { useState } from "react";
import { auth, firestore } from "../config/firebase";

const Profile = ({ history }) => {
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    profileImage: null, // Thêm trường profileImage để lưu trữ hình ảnh
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0]; // Lấy file hình ảnh từ input
    setFormData((prevData) => ({
      ...prevData,
      profileImage: imageFile, // Lưu trữ file hình ảnh trong trường profileImage
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Tạo tài khoản Firebase
      const userCredential = await auth.createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );

      // Upload hình ảnh lên Firebase Storage
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(`profile_images/${formData.profileImage.name}`);
      await imageRef.put(formData.profileImage);

      // Lấy URL của hình ảnh đã upload
      const profileImageUrl = await imageRef.getDownloadURL();

      
      await firestore.collection("users").doc(userCredential.user.uid).set({
        ...formData,
        profileImageUrl: profileImageUrl, 
      });
      
      // Đặt lại biểu mẫu sau khi hoàn thành
      setFormData({
        name: "",
        email: "",
        password: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        profileImage: null,
      });

      // Điều hướng người dùng đến trang thành công sau khi đăng ký
      history.push("/home");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên" />
      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mật khẩu" />
      <input type="text" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="Ngày sinh" />
      <input type="text" name="gender" value={formData.gender} onChange={handleChange} placeholder="Giới tính" />
      <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Số điện thoại" />
      <input type="file" accept="image/*" onChange={handleImageChange} /> 
      <button type="submit">Đăng ký</button>
    </form>
  );
};

export default Profile;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth} from "../config/firebase";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import "../css/profile.css";

const Profile = () => {
  const user = auth.currentUser;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        throw new Error("No user is logged in");
      }
  
      // Kiểm tra xem tất cả các trường đã được điền đầy đủ hay không
      if (!formData.name || !formData.gender || !formData.dateOfBirth || !formData.profileImage) {
        throw new Error("Please fill in all fields");
      }
  
      // Lưu dữ liệu vào Firestore với userID là email
      setDoc(doc(db, "users", auth.currentUser.uid), {

        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        profileImageUrl: formData.profileImageUrl,
        // Các trường dữ liệu khác bạn muốn lưu vào đây...
      });
      
      // Điều hướng đến trang "/home" sau khi lưu thành công
      navigate("/home");
    } catch (error) {
      console.error("Error updating user profile:", error);
      // Xử lý lỗi ở đây (ví dụ: hiển thị thông báo lỗi cho người dùng)
    }
  };


  return (
    <div className="container-pf">
      <h2 className="titlePf">HOÀN TẤT HỒ SƠ</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="input-field nameIp"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />
        </div>
        <div className="form-group">
          <input
            className="input-field genderIp"
            type="text"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Gender"
          />
        </div>
        <div className="form-group">
          <input
            className="input-field birthIp"
            type="text"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="Date of Birth"
          />
        </div>
        <div className="form-group">
          <div
            className="avt-pf"
            style={{
              backgroundImage: `url(${formData.profileImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <input
            className="input-field imgIp"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <button className="btnSm" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Profile;

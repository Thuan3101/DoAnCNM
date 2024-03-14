import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import "../css/profile.css";

const Profile = () => {
  const user = auth.currentUser;
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
      if (user) {
    
        navigate("/home");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
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

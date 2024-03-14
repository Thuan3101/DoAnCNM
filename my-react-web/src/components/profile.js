import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../config/firebase"; // Thay đổi import
import { doc, getFirestore } from "firebase/firestore";

const Profile = () => {
  // const auth = getAuth();
   const user = auth.currentUser;
   const db = getFirestore;
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    profileImage: null,
  });

  const navigate = useNavigate();
  console.log("userID",user.uid);
  
  useEffect(() => {
    const checkUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        // 
        console.log(user);
      }
    };

    checkUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      profileImage: imageFile,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        // Lưu thông tin profile vào Firestore
        
        navigate("/home");
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>
        <label>
          Gender:
          <input type="text" name="gender" value={formData.gender} onChange={handleChange} />
        </label>
        <label>
          Date of Birth:
          <input type="text" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
        </label>
        <label>
          Profile Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { setDoc, doc, getFirestore, getDoc } from "firebase/firestore";
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

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        if (!user) {
          throw new Error("No user is logged in");
        }
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          navigate("/home");
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        // Handle error here
      }
    };

    checkUserProfile();
  }, [db, navigate, user]);

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

      // Check if all fields are filled
      if (!formData.name || !formData.gender || !formData.dateOfBirth || !formData.profileImage) {
        throw new Error("Please fill in all fields");
      }

      // Save data to Firestore with userID as email
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name: formData.name,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        profileImageUrl: formData.profileImageUrl,
        // Add other fields you want to save here...
      });

      // Navigate to "/home" page after successful save
      navigate("/home");
    } catch (error) {
      console.error("Error updating user profile:", error);
      // Handle error here (e.g., display error message to the user)
    }
  };

  return (
    <div className="container-pf">
      <h2 className="titlePf">COMPLETE PROFILE</h2>
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

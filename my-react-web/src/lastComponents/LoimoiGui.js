import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../css/loimoiGui.css";

const LoimoiGui = () => {
  const [invitations, setInvitations] = useState([]);
  const [receivers, setReceivers] = useState({});

  const auth = getAuth(); // Lấy thông tin xác thực của người dùng hiện tại
  
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const db = getFirestore();
        const invitationsRef = collection(db, "invitations");
        const q = query(invitationsRef, where("senderId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const invitationsData = [];
        querySnapshot.forEach((doc) => {
          invitationsData.push({ id: doc.id, ...doc.data() });
        });
        setInvitations(invitationsData);
      } catch (error) {
        console.error("Lỗi khi lấy lời mời:", error);
      }
    };

    const fetchReceivers = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const receiversData = {};
        usersSnapshot.forEach((doc) => {
          receiversData[doc.id] = doc.data();
        });
        setReceivers(receiversData);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchInvitations();
    fetchReceivers();
  }, [auth.currentUser.uid]);

  // Function to translate status to Vietnamese
  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "đang chờ";
      case "confirmed":
        return "đã xác nhận";
      case "declined":
        return "đã từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="loiMoiGui">
      <h2>Lời mời đã gửi:</h2>
      <ul>
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            <img src={receivers[invitation.receiverId]?.photoURL} alt="Người nhận" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
            <br />
            {receivers[invitation.receiverId]?.name}: {translateStatus(invitation.status)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoimoiGui;

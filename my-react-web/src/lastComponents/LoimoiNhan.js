import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../css/loiMoiNhan.css";

// Component để quản lý và hiển thị lời mời đã nhận
const LoimoiNhan = () => {
  const [invitations, setInvitations] = useState([]);
  const [senders, setSenders] = useState({});
  const auth = getAuth();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const db = getFirestore();
        const invitationsRef = collection(db, "invitations");
        const q = query(invitationsRef, where("receiverId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const invitationsData = [];
        querySnapshot.forEach((doc) => {
          // Ensure fetched invitations are translated to Vietnamese if stored in English
          const status = doc.data().status === "confirmed" ? "đã xác nhận" : "đang chờ";
          invitationsData.push({ id: doc.id, ...doc.data(), status });
        });
        setInvitations(invitationsData);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };

    const fetchSenders = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const sendersData = {};
        usersSnapshot.forEach((doc) => {
          sendersData[doc.id] = doc.data();
        });
        setSenders(sendersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchInvitations();
    fetchSenders();
  }, [auth.currentUser.uid]);

  const confirmInvitation = async (invitationId) => {
    try {
      const db = getFirestore();
      const invitationRef = doc(db, "invitations", invitationId);
      await updateDoc(invitationRef, { status: "đã xác nhận" });
      console.log("Invitation confirmed:", invitationId);
      
      setInvitations(prevInvitations => {
        return prevInvitations.map(invitation => {
          if (invitation.id === invitationId) {
            return { ...invitation, status: "đã xác nhận" };
          }
          return invitation;
        });
      });

      const invitation = invitations.find(inv => inv.id === invitationId);
      const { senderId, receiverId } = invitation;
      const senderRef = doc(db, "users", senderId);
      const receiverRef = doc(db, "users", receiverId);

      await updateDoc(senderRef, {
        friends: {
          ...senders[senderId]?.friends,
          [receiverId]: true
        }
      });

      await updateDoc(receiverRef, {
        friends: {
          ...senders[receiverId]?.friends,
          [senderId]: true
        }
      });

    } catch (error) {
      console.error("Error confirming invitation:", error);
    }
  };

  return (
    <div className="loiMoiNhan">
      <h2>Lời mời đã nhận:</h2>
      {invitations.length === 0 ? (
        <p>Danh sách trống</p>
      ) : (
        <ul>
          {invitations.map((invitation) => (
            <li key={invitation.id}>
                <img src={senders[invitation.senderId]?.photoURL} alt="Người gửi" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                <br></br>
              {senders[invitation.senderId]?.name}, Trạng thái: {invitation.status}{" "}
              {invitation.status === "đang chờ" && (
                <button onClick={() => confirmInvitation(invitation.id)} style={{backgroundColor:' #a0c3f5', border:'none', padding:'5px 10px'}}>Xác nhận</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LoimoiNhan;

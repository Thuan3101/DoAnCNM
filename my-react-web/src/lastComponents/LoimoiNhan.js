import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../css/loiMoiNhan.css";

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
          invitationsData.push({ id: doc.id, ...doc.data() });
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
      await updateDoc(invitationRef, { status: "confirmed" });
      console.log("Invitation confirmed:", invitationId);
      
      setInvitations(prevInvitations => {
        return prevInvitations.map(invitation => {
          if (invitation.id === invitationId) {
            return { ...invitation, status: "confirmed" };
          }
          return invitation;
        });
      });

      const invitation = invitations.find(invitation => invitation.id === invitationId);
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
                <img src={senders[invitation.senderId]?.profileImageUrl} alt="Người gửi" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                <br></br>
              {senders[invitation.senderId]?.name}, Trạng thái: {invitation.status}{" "}
              {invitation.status === "pending" && (
                <button onClick={() => confirmInvitation(invitation.id)}>Xác nhận</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* <DanhSachBB /> */}
    </div>
  );
};

export default LoimoiNhan;

import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore"; 
import GroupChat from "../lastComponents/GroupChat";
import { getAuth } from "firebase/auth";
import "../css/danhSachNhom.css";


function DanhSachNhom() {
  const [nhom, setNhom] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    setCurrentUserUid(auth.currentUser.uid);

    const db = getFirestore();
    const groupsRef = collection(db, "groups");
    const unsubscribe = onSnapshot(groupsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNhom(data.filter(group => group.members.includes(auth.currentUser.uid)));
    });

    return () => unsubscribe();
  }, []);

  const handleGroupClick = (groupId) => {
    setCurrentGroup(groupId);
    setShowChat(true);
  };

  return (
    <div className="container">
      <h2 className="title">Danh sách nhóm:</h2>
      <ul className="groupList">
        {nhom.map(item => (
          <li key={item.id} onClick={() => handleGroupClick(item.id)} className="groupItem">
            <strong>{item.name}</strong> - Thành viên: {item.members.length}
          </li>
        ))}
      </ul>
      {showChat && currentGroup && <div className="showChat"><GroupChat groupId={currentGroup} currentUserUid={currentUserUid} /></div>}
    </div>
  );
}

export default DanhSachNhom;

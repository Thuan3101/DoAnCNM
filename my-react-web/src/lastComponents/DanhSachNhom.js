import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "firebase/firestore"; 
import GroupChat from "../lastComponents/GroupChat";
import { getAuth } from "firebase/auth";
import defaultGroupImage from "../image/groups.png"; 
import "../css/danhSachNhom.css";

function DanhSachNhom() {
  const [nhom, setNhom] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [memberNames, setMemberNames] = useState({});
  const [groupImages, setGroupImages] = useState({}); 

  useEffect(() => {
    const auth = getAuth();
    setCurrentUserUid(auth.currentUser.uid);

    const db = getFirestore();
    const groupsRef = collection(db, "groups");
    const unsubscribe = onSnapshot(groupsRef, async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNhom(data.filter(group => group.members.includes(auth.currentUser.uid)));

      // Fetch member names
      const memberNamesObj = {};
      for (const group of data) {
        for (const memberId of group.members) {
          if (!memberNamesObj[memberId]) {
            const memberDoc = await getDoc(doc(db, "users", memberId));
            if (memberDoc.exists()) {
              memberNamesObj[memberId] = memberDoc.data().name; 
            }
          }
        }
      }
      setMemberNames(memberNamesObj);

      // Fetch group images
      const groupImagesObj = {};
      for (const group of data) {
        const groupDoc = await getDoc(doc(db, "groups", group.id));
        if (groupDoc.exists()) {
          groupImagesObj[group.id] = groupDoc.data().image || defaultGroupImage; // Use default image if group image is not available
        }
      }
      setGroupImages(groupImagesObj);
    });

    return () => unsubscribe();
  }, []);

  const handleGroupClick = (groupId) => {
    setCurrentGroup(groupId);
    setShowChat(true);
  };

  const handleViewMembers = () => {
    setShowMembers(true);
  };

  const handleCloseMembers = () => {
    setShowMembers(false);
  };

  return (
    <>
      <div className="container">
        {/* <h2 className="title">Danh sách nhóm:</h2> */}
        <ul className="groupList">
          {nhom.map(item => (
            <li key={item.id} onClick={() => handleGroupClick(item.id)} className="groupItem">
              <div className="groupItemContent">
                <img src={groupImages[item.id]} alt="Group" className="groupImage" />
                <div className="groupInfo">
                  <strong>{item.name}</strong> - Thành viên: {item.members ? item.members.length : 0}
                </div>
              </div>
              <button onClick={handleViewMembers}>---</button>
            </li>
          ))}
        </ul>
        {showChat && currentGroup && <div className="showChat"><GroupChat groupId={currentGroup} currentUserUid={currentUserUid} /></div>}
      </div>
      {showMembers && currentGroup && <div className="showMembers">
        <h3>Thành viên của nhóm</h3>
        <ul>
          {nhom.find(group => group.id === currentGroup)?.members.map((memberId, index) => (
            <li key={index}>{memberNames[memberId]}</li> 
          ))}
        </ul>
        <button style={{backgroundColor:'white'}} onClick={handleCloseMembers}>x</button> 
      </div>}
    </>
  );
}

export default DanhSachNhom;

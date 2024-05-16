import React, { useState, useEffect } from "react";
import "../css/list.css";
import chat from "../image/tool1.png";
import danhBa from "../image/tool2.png";
import timKiem from "../image/search-259.png";
import caiDat from "../image/tool7.png";
import nhom from "../image/groups2.png";
import { getAuth ,onAuthStateChanged} from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';


const List = ({ setCurrentTab }) => {
  const [userData, setUserData] = useState({});
  

  useEffect(() => {
    const fetchDataFromFirebase = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userDataFromFirebase = userDocSnapshot.data();
            setUserData(userDataFromFirebase);
          }
        }
      } catch (error) {
        console.error('Error fetching user data from Firebase:', error);
      }
    };

    fetchDataFromFirebase();

    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        await fetchDataFromFirebase(); // Fetch data whenever auth state changes
      } else {
        setUserData(null); // Reset user data if user is not authenticated
      }
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe from auth state changes
  }, []);

  return (
    <div className="list">
      <div className="listContainer">
      <div onClick={() => setCurrentTab("avatar")}>
      <img src={userData.photoURL} alt=""  className="avatar" />
    </div>
        <div onClick={() => setCurrentTab("chat")}>
          <img src={chat} alt="chat" className="chat" />
        </div>
        <div onClick={() => setCurrentTab("danhBa")}>
          <img src={danhBa} alt="" className="danhBa" />
        </div>
        <div onClick={() => setCurrentTab("timKiem")}>
          <img src={timKiem} alt="" className="timKiem" />
        </div>
        <div onClick={() => setCurrentTab("nhom")}>
          <img src={nhom} alt="" className="nhom"></img>
        </div>
        <div onClick={() => setCurrentTab("caiDat")}>
          <img src={caiDat} alt="" className="caiDat" />
        </div>
       
      </div>
    </div>
  );
};

export default List;

import React, { useState } from "react";
import "../css/home.css";
import Heading from "../lastComponents/Heading";
import List from "../lastComponents/List";
import ListChat from "../lastComponents/ListChat";
import Messages from "../lastComponents/Messages";



const  Home=() => {
  const [currentTab, setCurrentTab] = useState("chat");
  const [userData] = useState("user123"); 
  

  return (
    <div className="homeContainer">
      <div className="home">
        <Heading />
        <div className="home2">
         <List userId={userData} setCurrentTab={setCurrentTab} />
          <ListChat currentTab={currentTab} />
          <Messages></Messages>
        </div>
      </div>
    </div>
  );
}

export default Home;

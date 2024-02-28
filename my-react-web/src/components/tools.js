import React from 'react';
import '../css/tools.css'; 

function Tools() {
  return (
    <div className="tools-tools"> 
      <div className="v1-tools">
        <img src="avatar.png" alt="Icon 4" className="icon-tools" />
        <img src="tool1.png" alt="Icon 1" className="icon-tools" />
        <img src="tool2.png" alt="Icon 2" className="icon-tools" />
        <img src="tool3.png" alt="Icon 3" className="icon-tools" />
        <img src="tool4.png" alt="Icon 4" className="icon-tools" />
      </div>
      <div className="v2-tools">
        <img src="tool5.png" alt="Icon 5" className="icon-tools" />
        <img src="tool6.png" alt="Icon 6" className="icon-tools" />
        <img src="tool7.png" alt="Icon 7" className="icon-tools" />
      </div>
    </div>
  );
}

export default Tools;

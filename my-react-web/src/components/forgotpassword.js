import React, { useState } from 'react';
import '../css/ForgotPassScreen.css';

const ForgotPassScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleZaloRegister = () => {
    // Xử lý đăng ký tại đây
  };
  
  return (
    <div className="container-forgotpassword">
      <div className="v1-forgotpassword">
        <h4 className="h2-forgotpassword">Vui lòng nhập lại số điện thoại của bạn</h4>
        <div className="inputContainer">
          <label>Số điện thoại:</label>
          <input type="text-forgotpassword" value={phoneNumber} onChange={handlePhoneNumberChange} className="input-forgotpassword" />
        </div>
        <button className="button-forgotpassword" onClick={handleZaloRegister}>Gửi</button>
        <h6 className="h6-forgotpassword">Quay lại</h6>
      </div>
    </div>
  );
};

export default ForgotPassScreen;

import React, { useState } from 'react';
import '../css/dangki.css'; // Import file CSS

const RegisterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  
  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleZaloRegister = () => {
    // Xử lý đăng ký tại đây
  };
  
  return (
    <div className="container-dangki">
      <h1 className="h1-dangki">WELCOME YOU !!!!!</h1>
      
      <div className="v1-dangki">
        <h2 className="h2-dangki">Đăng ký </h2>
        <div className="inputContainer-dangki">
          <label>Số điện thoại:</label>
          <input type="text" value={phoneNumber} onChange={handlePhoneNumberChange} className="input-dangki" />
        </div>
        <div className="inputContainer-dangki">
          <label>Họ :</label>
          <input type="text-dangki" value={firstName} onChange={handleFirstNameChange} className="input-dangki" />
        </div>
        <div className="inputContainer-dangki">
          <label>Tên :</label>
          <input type="text-dangki" value={lastName} onChange={handleLastNameChange} className="input-dangki" />
        </div>
        <div className="inputContainer-dangki">
          <label>Nhập mật khẩu :</label>
          <input type="text-dangki" value={password} onChange={handlePasswordChange} className="input-dangki" />
        </div>
        <button  onClick={handleZaloRegister}>Đăng ký</button>
      </div>
    </div>
  );
};

export default RegisterScreen;

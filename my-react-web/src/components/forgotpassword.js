import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/ForgotPassScreen.css';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassScreen = () => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Gửi email xác nhận thành công
        setIsEmailSent(true);
        setError(null);
      })
      .catch((error) => {
        // Xử lý lỗi nếu có
        setError(error.message);
      });
  };

  
  return (
    <div className="container-forgotpassword">
      <div className="v1-forgotpassword">
        <h4 className="h2-forgotpassword">Vui lòng nhập lại email của bạn</h4>
        <div className="inputContainer">
          <label>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} className="input-forgotpassword" />
        </div>
        <button className="button-forgotpassword" onClick={handleResetPassword}>Gửi</button>
        {error && <p className="error-message">{error}</p>}
        {isEmailSent && <p className="success-message">Email xác nhận đã được gửi.</p>}
        <Link to="/">Quay lại</Link>
      </div>
    </div>
  );
};

export default ForgotPassScreen;

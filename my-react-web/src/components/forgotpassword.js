import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import '../css/ForgotPassScreen.css';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassScreen = () => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState(null);
  //const navigate = useNavigate();
  // Xử lý thay đổi email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  // Xử lý gửi email xác nhận
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
        <h4 className="h2-forgotpassword" style={{marginLeft:"30px"}}>Vui lòng nhập lại email của bạn</h4>
        <div className="inputContainer">
          <label  style={{ color: "black" }}>Email:</label>
          <input type="email" value={email} onChange={handleEmailChange} className="input-forgotpassword" />
        </div>
        <button className="button-forgotpassword" onClick={handleResetPassword}>
          <text>Gửi</text>
          </button>
          <br></br>
        {error && <p className="error-message">{error}</p>}
        {isEmailSent && <p className="success-message">Email xác nhận đã được gửi.</p>}
        <Link style={{textDecoration:'none', color:' #418df8', fontWeight:'bold'}} to="/">
          <text> Quay lại
            </text></Link>
      </div>
    </div>
  );
};

export default ForgotPassScreen;

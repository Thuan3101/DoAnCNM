import React, { useState } from 'react';
import { Link,useNavigate} from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

import '../components/dangnhap.js';
import "../css/dangki.css";

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRegister = () => {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Đăng ký thành công
        console.log('Đăng ký thành công:', userCredential.user);
        // Hiển thị thông báo và chuyển hướng đến trang đăng nhập
        alert('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
        navigate("/"); // Chuyển hướng đến trang đăng nhập
        console.log(user);
      })
      .catch((error) => {
        console.error('Đăng ký không thành công:', error);
      });
  };

  return (
    <div className="container-dangki">
    <h1 className="h1-dangki">WELCOME YOU !!!!!</h1>
    
    <div className="v1-dangki">
      <h2 className="h2-dangki">Đăng ký </h2>
      <div className="inputContainer-dangki">
        <label>Email:</label>
        <input type="text" value={email} onChange={handleEmailChange} className="input-dangki" />
      </div>
      
      <div className="inputContainer-dangki">
        <label>Nhập mật khẩu :</label>
        <input type="text-dangki" value={password} onChange={handlePasswordChange} className="input-dangki" />
      </div>
      <button  onClick={handleRegister}>Đăng ký </button>
      <Link to="/" className="link-dangnhap">Đã có tài khoản</Link>

    </div>
  </div>
);

};

export default RegisterScreen;

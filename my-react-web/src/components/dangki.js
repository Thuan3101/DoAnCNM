import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import '../components/dangnhap.js';
import "../css/dangki.css";

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  // Xử lý thay đổi email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  // Xử lý thay đổi mật khẩu
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
// Xử lý thay đổi mật khẩu xác nhận
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  // Xử lý hiển thị hoặc ẩn mật khẩu
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
// Xử lý đăng ký
  const handleRegister = () => {
    // Kiểm tra email và mật khẩu hợp lệ
    if (!isValidEmail(email)) {
      alert('Vui lòng nhập email hợp lệ.');
      return;
    }

    if (!isValidPassword(password)) {
      alert('Vui lòng nhập mật khẩu hợp lệ (ít nhất 8 ký tự, bao gồm cả chữ hoa, chữ thường, số và ký tự đặc biệt).');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu và mật khẩu xác nhận không khớp.');
      return;
    }

    // Thực hiện đăng ký
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
        alert('Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
      });
  };
  // Kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    // Kiểm tra email có hợp lệ theo định dạng @gmail.com không
    return /\b[A-Za-z0-9._%+-]+@gmail\.com\b/.test(email);
  };

  const isValidPassword = (password) => {
    // Kiểm tra mật khẩu có đủ độ dài và độ phức tạp không (ít nhất 8 ký tự, bao gồm cả chữ hoa, chữ thường, số và ký tự đặc biệt)
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

  return (
    <div className="container-dangki">
      <h1 className="h1-dangki">WELCOME!!!!!</h1>
      <div className="v1-dangki">
        <h2 className="h2-dangki">Đăng ký </h2>
        <div className="inputContainer-dangki">
          <label  style={{ color: "black" }}>Email:</label>
          <input placeholder='' type="text" value={email} onChange={handleEmailChange} className="input-dangki" />
        </div>
        <div className="inputContainer-dangki">
          <label  style={{ color: "black" }}>Nhập mật khẩu :</label>
          <input placeholder='' type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} className="input-dangki" />
          <span className="password-toggle" onClick={handleTogglePasswordVisibility}>{showPassword ? "Ẩn" : "Hiện"}</span>
        </div>
        <div className="inputContainer-dangki">
          <label  style={{ color: "black" }}>Nhập lại mật khẩu :</label>
          <input placeholder='' type={showPassword ? "text" : "password"} value={confirmPassword} onChange={handleConfirmPasswordChange} className="input-dangki" />
        </div>
        <button className='button-dangki' onClick={handleRegister}>
         <text style={{fontSize:"14px", fontWeight:'bold'}}> Đăng ký</text></button> <br></br>
        <Link to="/" className="link-dangnhap" style={{ textDecoration: 'none', color:'#418df8' , marginLeft:'80px', fontWeight:'bold'}}>
          <text>Bạn đã có tài khoản? </text></Link>
      </div>
    </div>
  );
};

export default RegisterScreen;

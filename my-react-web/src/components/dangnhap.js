import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/dangnhap.css'; // Import CSS file

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    formData.append('password', password);

    fetch('https://6556d664bd4bcef8b611b193.mockapi.io/projects') // Thực hiện yêu cầu GET để lấy danh sách người dùng
      .then(response => response.json())
      .then(users => {
        const foundUser = users.find(user => user.phoneNumber === phoneNumber && user.password === password);
        if (foundUser) {
          // Đăng nhập thành công, chuyển hướng đến trang home
          navigate("/home")
        } else {
          // Đăng nhập không thành công, xử lý thông báo lỗi hoặc hành động khác
          console.log('Login failed: Invalid phone number or password');
          alert('Đăng nhập không thành công. Vui lòng kiểm tra số điện thoại và mật khẩu.');
        }
      })
      .catch(error => {
        // Xử lý lỗi nếu có lỗi trong quá trình gửi yêu cầu
        console.error('Error during login:', error);
        alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      });
  };

  return (
    <div className="container-dangnhap">
      <h1 className="h1-dangnhap">WELCOME BACK YOU !!!!!</h1>
      <div className="v1-dangnhap">
        <h2 className="h2-dangnhap">Đăng Nhập </h2>
        <div className="inputContainer-dangnhap">
          <label>Số điện thoại:</label>
          <input type="text" value={phoneNumber} onChange={handlePhoneNumberChange} className="input-dangnhap" />
        </div>
        <div className="inputContainer">
          <label>Nhập mật khẩu :</label>
          <input type="password" value={password} onChange={handlePasswordChange} className="input-dangnhap" />
        </div>
        <button className="button-dangnhap" onClick={handleLogin}>Đăng Nhập</button>
        <Link to="/forgot-password">
          <h6 className="forgot-dangnhap">Quên mật khẩu?</h6>
        </Link>
        <Link to="/register">
          <h7 className="forgot-dangnhap">Đăng ký</h7>
        </Link>
      </div>
    </div>
  );
};

export default LoginScreen;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/dangnhap.css"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { doc, getFirestore, getDoc } from "firebase/firestore";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const db = getFirestore();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Đăng nhập thành công
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // Nếu có profile thì chuyển người dùng sang home
          navigate("/home");
        } else {
          // Nếu chưa có hồ sơ, chuyển người dùng sang trang Profile
          navigate("/profile");
        }
      })
      .catch((error) => {
        // Xử lý lỗi nếu có lỗi trong quá trình xác thực
        console.error("Error during login:", error);
        alert("Đăng nhập không thành công. Vui lòng thử lại.");
      });
  };

  return (
    <div className="container-dangnhap">
      <div className="container-1">
        <h1 className="h1-dangnhap">WELCOME BACK YOU !!!!!</h1>
        <div className="v1-dangnhap">
          <h2 className="h2-dangnhap">Đăng Nhập </h2>
          <div className="inputContainer-dangnhap">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="input-dangnhap"
            />
          </div>
          <div className="inputContainer">
            <label>Mật khẩu :</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="input-dangnhap"
            />
          </div>
          <button className="button-dangnhap" onClick={handleLogin}>
            Đăng Nhập
          </button>
          <Link to="/forgot-password">
            <h6 className="forgot-dangnhap">Quên mật khẩu?</h6>
          </Link>
          <Link to="/register">
            <h7 className="forgot-dangnhap">Đăng ký</h7>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import "../css/dangnhap.css";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          navigate("/home");
        } else {
          navigate("/profile");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        if (error.code === "auth/user-not-found") {
          alert("Sai email. Vui lòng kiểm tra lại.");
        } else if (error.code === "auth/wrong-password") {
          alert("Sai mật khẩu. Vui lòng kiểm tra lại.");
        } else {
          alert("Đăng nhập không thành công do sai email hoặc mật khẩu. Vui lòng thử lại.");
        }
      });
  };
  

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          navigate("/home");
        } else {
          navigate("/profile");
        }
      })
      .catch((error) => {
        console.error("Error during Google login:", error);
        alert("Đăng nhập bằng Google không thành công. Vui lòng thử lại.");
      });
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        navigate("/home");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error during Facebook login:", error);
      alert("Đăng nhập bằng Facebook không thành công. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container-dangnhap">
      <div className="container-1">
        <h1 className="h1-dangnhap">WELCOME BACK !!!!!</h1>
        <div className="v1-dangnhap">
          <h2 className="h2-dangnhap">Đăng Nhập </h2>
          <div className="inputContainer-dangnhap input-container">
            <label>Email:</label>
            <input
              placeholder="Tài khoản"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="input-dangnhap"
            />
          </div>
          <div className="inputContainer input-container">
            <label>Mật khẩu :</label>
            <input
              placeholder="Mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="input-dangnhap"
            />
            <span className="password-toggle" onClick={handleTogglePasswordVisibility}>
              {showPassword ? "Ẩn" : "Hiện"}
            </span>
          </div>
          <button className="button-dangnhap" onClick={handleLogin}>
            Đăng Nhập
          </button>
          <Link to="/forgot-password">
            <h6 className="forgot-dangnhap">Quên mật khẩu?</h6>
          </Link>
          <Link to="/register">
            <span className="forgot-dangnhap">Đăng ký</span>
          </Link>
          <div className="social-login-container">
            <button className="button-dangnhap google" onClick={handleGoogleLogin}>
              Google
            </button>
            <button className="button-dangnhap facebook" onClick={handleFacebookLogin}>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

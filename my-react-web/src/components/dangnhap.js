import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup,  GoogleAuthProvider } from "firebase/auth"; //FacebookAuthProvider,
import { auth } from "../config/firebase";
import { doc, getFirestore, getDoc } from "firebase/firestore";
import "../css/dangnhap.css";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();
  // Xử lý thay đổi email
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  // Xử lý thay đổi mật khẩu
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  // Xử lý hiển thị hoặc ẩn mật khẩu
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Xử lý đăng nhập
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
  
  // Xử lý đăng nhập bằng Google
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
  // Xử lý đăng nhập bằng Facebook
  // const handleFacebookLogin = async () => {
  //   const provider = new FacebookAuthProvider();
  //   try {
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     const userDoc = await getDoc(doc(db, "users", user.uid));
  //     if (userDoc.exists()) {
  //       navigate("/home");
  //     } else {
  //       navigate("/profile");
  //     }
  //   } catch (error) {
  //     console.error("Error during Facebook login:", error);
  //     alert("Đăng nhập bằng Facebook không thành công. Vui lòng thử lại.");
  //   }
  // };

  return (
    <div className="container-dangnhap">
      <div className="container-1">
        <h1 className="h1-dangnhap">WELCOME BACK !!!!!</h1>
        <div className="v1-dangnhap">
          <h2 className="h2-dangnhap">Đăng Nhập </h2>
          <div className="inputContainer-dangnhap input-container">
          <label style={{ color: "black" }}>Email:</label>
            <input
              placeholder="Tài khoản"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="input-dangnhap"
            />
          </div>
          <div className="inputContainer input-container">
            <label  style={{ color: "black" }}>Mật khẩu :</label>
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
          <text style={{fontWeight:'bold'}}>  Đăng Nhập </text> 
          </button>
          <Link to="/forgot-password" style={{textDecoration:'none', marginTop:'0px'}}>
            <h5 className="forgot-dangnhap">Quên mật khẩu?</h5>
          </Link>
         
          <Link to="/register" style={{textDecoration:'none', fontWeight:'bold'}}>
            <text className="dk">Bạn chưa có tài khoản ?</text>
          </Link>
          <div className="social-login-container">
            <button className="button-dangnhap google" onClick={handleGoogleLogin}>
             <text> Google </text> 
            </button>
            {/* <button className="button-dangnhap facebook" onClick={handleFacebookLogin}>
              Facebook
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

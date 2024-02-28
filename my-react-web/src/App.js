import { Routes, Route, BrowserRouter } from 'react-router-dom';
//import ChatPanel from "./components/chatPanel";
//import ChatFrame from "./components/chatFrame";
import RegisterScreen from "./components/dangki";
import LoginScreen from "./components/dangnhap";
import ForgotPassScreen from "./components/forgotpassword";
import Home from './components/Home';


function App() {
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPassScreen />} />
            <Route path="/home" element={<Home/>} />
            {/* <Route path="/chatPanel" element={<ChatPanel />} /> */}

          </Routes>
    </BrowserRouter>
  );
}
export default App;

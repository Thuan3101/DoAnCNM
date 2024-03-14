import { Routes, Route, BrowserRouter } from 'react-router-dom';
import RegisterScreen from "./components/dangki";
import LoginScreen from "./components/dangnhap";
import ForgotPassScreen from "./components/forgotpassword";
import Home from './components/Home';
import Profile from './components/profile';


function App() {
  
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/forgot-password" element={<ForgotPassScreen />} />
            <Route path='/Profile' element={<Profile/>}/>
            <Route path="/home" element={<Home/>} />
            {/* <Route path="/chatPanel" element={<ChatPanel />} />  */}

          </Routes>
    </BrowserRouter>
  );
}
export default App;

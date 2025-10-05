import Dashboard from "./components/DashBoardPage/index";
import {Routes, Route} from "react-router-dom"
import Home from "./components/HomePage/index";
import 'react-toastify/dist/ReactToastify.css';
import Whiteboard from "./components/WhiteboardPage/index";
import WhiteboardPage from "./components/WhiteboardPage/WhiteboardPage";
import LoginPage from "./components/common/login/Login";
import RegisterPage from "./components/common/Register";
import AcceptInvitePage from "./components/common/AcceptInvite";
import VideoConference from "./components/VideoConferencePage";
import VideoConferencePage from "./components/VideoConferencePage/VideoConferencePage";
import ChatWithOthers from "./components/ChatWithOthersPage";
import MyProfile from "./components/common/MyProfile";

function App(){
  return(
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/accept-invite" element={<AcceptInvitePage/>}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/whiteboard" element={<Whiteboard/>}/>
        <Route path="/whiteboard/:id" element={<WhiteboardPage/>}/>
        <Route path="/video-conference" element={<VideoConference/>}/>
        <Route path="/video-conference/:roomId" element={<VideoConferencePage/>}/>
        <Route path="/chat" element={<ChatWithOthers/>}/> 
        <Route path="/my-profile" element={<MyProfile/>}/>
        
      </Routes>

    </div>
  )
}
export default App;
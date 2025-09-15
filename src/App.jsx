import Dashboard from "./components/DashBoard/index";
import {Routes, Route} from "react-router-dom"
import Home from "./components/HomeComponent/index";
import 'react-toastify/dist/ReactToastify.css';
import Whiteboard from "./components/Whiteboards/index";
import WhiteboardPage from "./components/Whiteboards/WhiteboardPage";
import LoginPage from "./components/common/login/Login";
import RegisterPage from "./components/common/Register";
import AcceptInvitePage from "./components/common/AcceptInvite";
import VideoConference from "./components/VideoConference";
import VideoConferencePage from "./components/VideoConference/VideoConferencePage";

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
        <Route path="/video-conference/:id" element={<VideoConferencePage/>}/>
        
      </Routes>

    </div>
  )
}
export default App;
// import DashboardHeader from "./components/common/DashboardHeader";
import Dashboard from "./components/DashBoard/index";
import {Routes, Route} from "react-router-dom"
import Home from "./components/HomeComponent/index";
import 'react-toastify/dist/ReactToastify.css';
import Whiteboard from "./components/Whiteboards/index";
import WhiteboardPage from "./components/Whiteboards/WhiteboardPage";
import VideoCall from "./components/VideoCall";

function App(){
  return(
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/whiteboard" element={<Whiteboard/>}/>
        <Route path="/whiteboard/:id" element={<WhiteboardPage/>}/>
        <Route path="/video-call" element={<VideoCall/>}/>

      </Routes>

    </div>
  )
}
export default App;
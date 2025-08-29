// import DashboardHeader from "./components/common/DashboardHeader";
import Dashboard from "./components/DashBoard/Dashboard";
import {Routes, Route} from "react-router-dom"
import Home from "./components/HomeComponent/Home";
import 'react-toastify/dist/ReactToastify.css';

function App(){
  return(
    <div className="App">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard" element={<Dashboard />}/>

      </Routes>

    </div>
  )
}
export default App;
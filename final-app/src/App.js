import Whiteboard from "./Components/Presentation/Whiteboard";
import Login from "./Components/Presentation/Login";
import Signup from "./Components/Presentation/Signup";
import Home from "./Components/Presentation/Home";
import React from "react";
import Analysis from "./Components/Presentation/Analysis"
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {
  return (
    <div className="App">
          <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/home" element={<Home/>}/>
            <Route path="/whiteboard" element={<Whiteboard/>}/>
            <Route path="/analysis" element={<Analysis/>}/>
         </Routes> 
    </div>
  );
}

export default App;

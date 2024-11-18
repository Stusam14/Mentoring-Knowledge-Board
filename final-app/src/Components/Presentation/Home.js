import React,  {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom"
import "./Home.css"

/*
*This component shows the overview where user will be taken when they have successfully logged in.
*it displays numbered sessions where user can choose from 
*when they have selected session they will be taken to corresponding whiteboard for that session
*/
function Home(){
    const location = useLocation()
    const history = useNavigate(); 
    const [teamNum, setTeamNum] = useState(0);

    /*
    *pass information to another page of the button that was pressed
    *useful to know which session the user entered to take them to the correct whiteboard for that session
    *after button press will take user to whiteboard page
    */
    function handleClick(buttonInfo) {
        history("/whiteboard", { state:{buttonInfo:buttonInfo,name:location.state.id, teamNum:teamNum }});
      }


    /*
    * displays session buttons to choose from and return it 
    */
    return(
        <div className="homepage">
            
             {location.state.id==="chris_green@gmail.com" ?(
                <div className="teamNum," style={{marginLeft:"45%", width:"370px",height:"27px", backgroundColor:"rgb(212, 233, 233)",borderRadius:"5px",border:"0"}}>
                    <input type="Number" onChange={(e)=>{setTeamNum(e.target.value)}}
                    placeholder="Search team..." style={{width:"350px", marginLeft:"2%", marginTop:"1%",border:"0, bo"}} name="" id=""/>
                     </div>
                 ):(<></>)}
             
            <div className="home-label-container">
                <h2 className="home-label">WELCOME TO HOME PAGE: {location.state.id}</h2>
                </div>
            <div className="all-buttons">
                <div className="each-button">
                    <button onClick={() => handleClick(1)}>SESSION 1</button>
                </div>
                <div className="each-button" >
                    <button onClick={() => handleClick(2)}>SESSION 2</button>
                </div>
                <div className="each-button">
                    <button onClick={() => handleClick(3)}>SESSION 3</button>
                </div>
                <div className="each-button" >
                    <button onClick={() => handleClick(4)}>SESSION 4</button>
                </div>
            </div>
            <div className="all-buttons2">
                <div className="each-button">
                    <button onClick={() => handleClick(5)}>SESSION 5</button>
                </div>
                <div className="each-button" >
                    <button onClick={() => handleClick(6)}>SESSION 6</button>
                </div>
                <div className="each-button">
                    <button onClick={() => handleClick(7)}>SESSION 7</button>
                </div>
                <div className="each-button" >
                    <button onClick={() => handleClick(8)}>SESSION 8</button>
                </div>
            </div>
        </div>
    )
}
export default Home
import React,  {useEffect, useState} from "react"
import {useNavigate, Link} from "react-router-dom"
import "./Signup.css";
import Swal from 'sweetalert2'
import axios from 'axios'; 

/*
*This component allow user to sign in if they are a new user.
*User will have to enter name, email, team and password. They will only be taken to home page only f
*they have entered valid data. If user does exist they are they can also go to log in page.
*/
 function Signup(){
     const history = useNavigate();
     const [email,setEmail] = useState("");
     const [password, setPassword] = useState("");
     const[name,setName] = useState("");
     const[team, setTeam] = useState("");

     /*
     *Checks if email entered by user is a valid email i.e contails @gmail.com etc.
     *If it is true or false is returned. Will ensure only valid data enters system and handle invalid data gracefully
     */
    const validateEmail = (emailToCheck) => {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        return emailRegex.test(emailToCheck);
      };

      /*
      *This function is executed when a submit button is pressed. It checks if the details entered by user are valid
      *it checks whether all details have been filled and valid email is entered then send a post request to the server
      *The server will access database a receive an appropriate response. By checking if user already exist on not
      */
     async function handleSubmit(e){
        e.preventDefault();
        if (email==="" || password==="" || name==="" || team===""){
            Swal.fire("Fill all details")
        }
        if (!validateEmail(email)){
            Swal.fire("Email invalid. Enter new email.")
        }
        else{
            try{
                const response = await axios.post(`http://localhost:3001/api/signup`, {name,email,team,password})
                if (response.data==="exist"){
                    Swal.fire("User already exist")
                }
                else if (response.data==="notexist"){
                    Swal.fire("Successfully signed in")
                    history("/home", {state:{id:email}})
                }
            }
            catch{
                alert("Incorrect details")
        }
    }
    }

    /*
    *creates a log in for the form that display input area for name, email,team and password and a 
    *submit then return this
    */
    return (
        <div className="signup">
            <h1 className="signup-label">Signup</h1>
            <form action="POST" className="signupform">
                <div className="all-inputs">
                    <div className="input">
                        <input onChange={(e)=>{setName(e.target.value)}}
                            placeholder="Name" name="" id=""/>
                    </div>
                    <div className="input">
                        <input type="email" onChange={(e)=>{setEmail(e.target.value)}}
                            placeholder="Email" name="" id=""/>
                    </div>
                    <div className="input">
                        <input type="number" onChange={(e)=>{setTeam(e.target.value)}}
                            placeholder="Team number" name="" id=""/>
                    </div>
                    <div className="input">
                        <input type="password" onChange={(e)=>{setPassword(e.target.value)}}
                            placeholder="Password" name="" id=""/>
                    </div>
                </div>
                <div className="submit-container">
                <input type="submit" onClick={handleSubmit} className="submit-input"/>
                </div>
            </form>
            <div className="new-user-container">
                <div className="new-user">
                     <p>Already signed in?</p>
                 </div>
                 <div className="new-user">
                    <Link to="/">Login Page</Link>
                </div>
            </div>
        </div>
    )
 }

 export default Signup
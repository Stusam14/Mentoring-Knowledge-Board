 import React,  {useState} from "react";
 import {useNavigate, Link} from "react-router-dom";
 import axios from 'axios';
 import "./Signup.css"
 import Swal from 'sweetalert2'

 /*
 *Component that will check user details and verify they have entered correct details, if they are not registered
 *they can be taken to sign in page. If they do exist takes them to the home page. If incorrect details entered display an alert message
 */
 const Login = ()=>{
    const history = useNavigate();
    const[email,setEmail] = useState("");
    const[password, setPassword] = useState("");

    /*
    *Function that handles when a submit button of the form is pressed.
    *when user is done filling details and press submit, this function will check if user exist or if all details are correct
    *this function request on the server (database) and an appropriate response is received 
    *if incorrect password or not registered an apropriate alert message will be displayed.
    */
     async function handleSubmit(e){
        e.preventDefault();
        try{
            const response = await axios.post(`http://localhost:3001/api/login`, {email,password})
            if (response.data==="exist"){
                history("/home", {state:{id:email}})
            }
            else if (response.data==="wrongPassword"){
                Swal.fire("Wrong password")
            }
            else if (response.data==="notexist"){
                Swal.fire("User not signed up")
            }
        }
        catch{
            Swal.fire("Incorrect details")
        }
     }

     /*
     *creates a log in form that includes email and password of the user then allow them to submit their details
     *then return this
     */
    return (
        <div className="signup">
            <h1 className="signup-label">Login</h1>
            <form action="POST" className="signupform">
                <div className="all-inputs">
                    <div className="input">
                        <input type="email" onChange={(e)=>{setEmail(e.target.value)}}
                            placeholder="Email" name="" id=""/>
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
                     <p>New user?</p>
                 </div>
                 <div className="new-user">
                    <Link to="/signup">Sign-up</Link>
                </div>
            </div>
        </div>
    )
 }
 export default Login;
 
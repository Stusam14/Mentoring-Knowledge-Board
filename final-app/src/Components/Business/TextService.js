import React, {useState, useEffect} from "react";
import Text from "../Presentation/Text";
import {useLocation, useNavigate} from "react-router-dom"
import axios from 'axios';
import io from 'socket.io-client';
import debounce from 'lodash.debounce';
import { FaTextHeight} from "react-icons/fa";

const socket = io('http://localhost:3001');

/*
*This component deals with user actions and how to respond to them, when a user creates a new sticky note
*this component handles the background actions that will make user be to see, delete, change colour and like sticky note
*it responds to user actions
*/
function TextController(){
    const[texts, setTexts] = useState([]); //store all text
    const[name, setName] = useState("");
    const[team, setTeam] = useState("");
    const location = useLocation()
    const history = useNavigate();
    const serverIP = 'localhost';

    /*
    *Fetches sticky notes from the database using http request get, an array of these sticky notes
    *is returned and stored to the array storing all sticky notes.
    */
    const fetchTexts = async () => {
        try {
          const session= location.state.buttonInfo;
          const email = location.state.name;
          const responseUser = await axios.get(`http://${serverIP}:3001/api/users/${email}`)
          setName(responseUser.data.name);
          setTeam(responseUser.data.team);
          if (location.state.name==="chris_green@gmail.com"){
            setTeam(location.state.teamNum);
          }
          const response = await axios.get(`http://${serverIP}:3001/api/text/${session}/${team}`);
          setTexts(response.data);
        } catch (error) {
          console.error(error);
        }
    };

    //allow user belonging to same team join same room for socket.io
    socket.emit("join-room",team)
    if (texts.length === 0){
        fetchTexts();}

    /*
    *Used for team collaboration by using socket.io for recieving data from other users in real time
    *then updating the sticky note array
    */
    useEffect(() => {

        //when other user adds a new sticky note this is suppose to receive the text details
        socket.on('textAdded', (data) => {
            const textAdd = {
                _id: data._id,
                session: data.session,
                positionX: data.positionX,
                positionY: data.positionY,
                text: data.text,
            }
            setTexts((prevText) => {
                return [...prevText, textAdd];
            })
          });

          //receive position details when other user drags text
         socket.on('updatedTextPosition', (updatedText) => {
            const {_id, positionX, positionY} = updatedText;
            setTexts((prevText) => {
            return prevText.map((text) =>
            text._id === _id ? { ...text, positionX:positionX,positionY:positionY} : text
             );
            });
         })

        //receive text details when other user changes text
        socket.on('updatedTextText', (updatedText) => {
            const {_id, text} = updatedText;
            setTexts((prevText) => {
             return prevText.map((note) =>
            note._id === _id ? { ...note, text: text } : note
            );
        });
         });

        //receive delete details id when other user deletes text
        socket.on('updatedTextDelete', (updatedText) => {
            const {_id} = updatedText;
            setTexts((prevNotes) => {
             return prevNotes.filter((note) =>
             note._id !== _id);
        });
         });

      }, []);

    
    /*
    *this function handles when a add a text, it initialises the text object and
    *specify default parameters used to create the note. This note is then saved in the database by making
    *a http post request to the server
    */
    const addText = async() =>{
        const newText = {
            _id: undefined,
            session: location.state.buttonInfo,
            name: name,
            team: team,
            positionX: 100 +texts.length * 20,
            positionY: 100 +texts.length * 20,
            text: "",
        }
         //makes http post request to server for adding text
        const response = await axios.post(`http://${serverIP}:3001/api/text`, { 
            name: newText.name,
            team: newText.team,
            session: newText.session,
            positionX: newText.positionX,
            positionY: newText.positionY,
            text: newText.text,
         });

         //emit new text details to other users reatime
         socket.emit('textAdd', 
          {_id:response.data._id,
             name: response.data.name,
             team: response.data.team,
             session: response.data.session,
             positionX: response.data.positionX,
             positionY: response.data.positionY,
             text: response.data.text,
            });
        setTexts([...texts, response.data]);
    };

    /*
    *This function handles action when user drags text, it updates the text position
    *and update changes in the database by making put request then emit it to other users in real time
    */
    const handleDrag = async(_id, newPositionX, newPositionY) =>{
        const response = await axios.put(`http://${serverIP}:3001/api/text/${_id}`, { positionX:newPositionX,positionY:newPositionY});
        const updatedText = texts.map((note) => 
        note._id === _id ? {...note, positionX: newPositionX, positionY: newPositionY}: note);
        setTexts(updatedText);
        socket.emit('updateTextPosition', {_id, positionX:newPositionX, positionY:newPositionY});
    };

    /*
    *This function delays the send of data to the database when user is texting
    *this ensures data of user is not overwritten by constantly updating in every time user enters letter
    *improves usability
    */
    const debouncedUpdateTextOnServer = debounce((_id, newText) => {
        axios.put(`http://${serverIP}:3001/api/text/${_id}`, { text: newText });
        socket.emit('updateTextText', {_id,text:newText});
      }, 500);

    
    /*
    *This function handles action when user changes text, it updates the text 
    *and update changes in the database by making put request then emit it to other users in real time
    */
    const handleTextChange = async(_id,newText) =>{ 
        const updateText = texts.map((note) =>
        note._id===_id ? {...note,text:newText}:note);
        setTexts(updateText);
        debouncedUpdateTextOnServer(_id, newText);
    };

     /*
    *This function handles action when user deletes text, it removes text
    *and update changes in the database by making delete request then emit it to other users in real time
    */
    const handleDelete = async(_id) =>{
        await axios.delete(`http://${serverIP}:3001/api/text/${_id}`);
        const updateText = texts.filter((note) => 
        note._id !== _id);
        setTexts(updateText);
        socket.emit('updateTextDelete', {_id});
    };

    /*
    *creates sticky notes for all notes inside the text array and display it to user
    *allow user to create multiple text.
    */
    return (
        <div className = "whiteboard">
            <div className="addTextButton">
                <button onClick = {addText}
                    style={{backgroundColor:'transparent', border:'0px'}}
                >
                    <FaTextHeight
                    style={{width:'25px', height:'25px'}}/>
                </button>
            </div>
        {texts.map((note) =>(
            <Text
                key = {note._id}
                _id = {note._id}
                positionX={note.positionX}
                positionY={note.positionY}
                text= {note.text}
                onDrag={handleDrag}
                onTextChange={handleTextChange}
                onDelete={handleDelete}
            />
        ))}
         </div>
    );
};

export default TextController;


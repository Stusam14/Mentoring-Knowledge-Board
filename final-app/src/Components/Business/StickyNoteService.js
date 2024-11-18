import React, {useState, useEffect} from "react";
import StickyNote from "../Presentation/StickyNote";
import {useLocation, useNavigate} from "react-router-dom"
import axios from 'axios';
import io from 'socket.io-client';
import Swal from 'sweetalert2'
import debounce from 'lodash.debounce';
import {FaRegStickyNote } from "react-icons/fa";

const socket = io('http://localhost:3001');

function StickyNoteController(){
    const[stickyNotes, setStickyNotes] = useState([]);
    const[name, setName] = useState("");
    const[team, setTeam] = useState("");
    const location = useLocation()
    const history = useNavigate();
    const serverIP = 'localhost';


    const fetchStickyNotes = async () => {
        try {
          const session= location.state.buttonInfo;
          const email = location.state.name;
          const responseUser = await axios.get(`http://${serverIP}:3001/api/users/${email}`)
          setName(responseUser.data.name);
          setTeam(responseUser.data.team);
          if (location.state.name==="chris_green@gmail.com"){
            setTeam(location.state.teamNum);
          }
          const response = await axios.get(`http://${serverIP}:3001/api/stickynotes/${session}/${team}`);
          setStickyNotes(response.data);
        } catch (error) {
          console.error(error);
        }
    };

    //allow user belonging to same team join same room for socket.io
    socket.emit("join-room",team)
    if (stickyNotes.length === 0){
        fetchStickyNotes();}
    useEffect(() => {

        //when other user adds a new sticky note this is suppose to receive the note details
        socket.on('stickyNoteAdded', (data) => {
            const stickynote = {
                _id: data._id,
                session: data.session,
                positionX: data.positionX,
                positionY: data.positionY,
                sizeWidth: data.sizeWidth,
                sizeHeight: data.sizeHeight,
                color: data.color,
                text: data.text,
                likes: data.likes
            }
            setStickyNotes((prevNotes) => {
                return [...prevNotes, stickynote];
            })
          });

         //receive colour details when other changes color of the note 
        socket.on('updatedColor', (updatedNote) => {
            const {_id, color} = updatedNote;
            setStickyNotes((prevNotes) => {
             return prevNotes.map((note) =>
            note._id === _id ? { ...note, color: color } : note
             );
            });
        });

        //receive position details when other user drags note
         socket.on('updatedPosition', (updatedNote) => {
            const {_id, positionX, positionY} = updatedNote;
            setStickyNotes((prevNotes) => {
            return prevNotes.map((note) =>
            note._id === _id ? { ...note, positionX:positionX,positionY:positionY} : note
             );
            });
         });

        //receive text details when other user changes text of sticky note
        socket.on('updatedText', (updatedNote) => {
            const {_id, text} = updatedNote;
            setStickyNotes((prevNotes) => {
             return prevNotes.map((note) =>
            note._id === _id ? { ...note, text: text } : note
            );
        });
         });

         //receive likes details when other user liked the note
         socket.on('updatedLikes', (updatedNote) => {
            const {_id, likes} = updatedNote;
            setStickyNotes((prevNotes) => {
             return prevNotes.map((note) =>
            note._id === _id ? { ...note, likes: likes } : note
            );
        });
         });

         //receive delete details id when other user deletes note
         socket.on('updatedDelete', (updatedNote) => {
            const {_id} = updatedNote;
            setStickyNotes((prevNotes) => {
             return prevNotes.filter((note) =>
             note._id !== _id);
        });
         });

      }, []);

      /*
      *this function handles when a add a new sticky note, it initialises the stick note object and
      *specify default parameters used to create the note. This note is then saved in the database by making
      *a http post request to the server
      */
    const addStickyNote = async() =>{ 
        const newStickyNote = {
            _id: undefined,
            session: location.state.buttonInfo,
            name: name,
            team: team,
            positionX: 100 +stickyNotes.length * 20,
            positionY: 100 +stickyNotes.length * 20,
            sizeWidth: 150,
            sizeHeight: 150,
            color: '#87cefa',
            text: "",
            likes: 0,
        }
        
        //makes http post request to server for adding sticky note
        const response = await axios.post(`http://${serverIP}:3001/api/stickynotes`, { 
            name: newStickyNote.name,
            team: newStickyNote.team,
            session: newStickyNote.session,
            positionX: newStickyNote.positionX,
            positionY: newStickyNote.positionY,
            sizeWidth: newStickyNote.sizeWidth,
            sizeHeight: newStickyNote.sizeHeight,
            color: newStickyNote.color,
            text: newStickyNote.text,
            likes: newStickyNote.likes
         });

         //emit new note details to other users reatime
         socket.emit('stickyNoteAdd', 
          {_id:response.data._id,
             name: response.data.name,
             team: response.data.team,
             session: response.data.session,
             positionX: response.data.positionX,
             positionY: response.data.positionY,
             sizeWidth: response.data.sizeWidth,
             sizeHeight: response.data.sizeHeight,
             color: response.data.color,
             text: response.data.text,
             likes: response.data.likes
             });
        setStickyNotes([...stickyNotes, response.data]); //adds new note details on existing sticky notes
    };

    /*
    *This function handles action when user drags note, it updates the note position
    *and update changes in the database by making put request then emit it to other users in real time
    */
    const handleDrag = async(_id, newPositionX, newPositionY) =>{
        const response = await axios.put(`http://${serverIP}:3001/api/stickynotes/${_id}`, { positionX:newPositionX,positionY:newPositionY});
        const updatedNotes = stickyNotes.map((note) => 
        note._id === _id ? {...note, positionX: newPositionX, positionY: newPositionY}: note); 
        setStickyNotes(updatedNotes);
        socket.emit('updatePosition', {_id, positionX:newPositionX, positionY:newPositionY});
    };
    
    //handle note resizing
    const handleResize = (_id, newWidth, newHeight) =>{
        const updatedNotes = stickyNotes.map((note) => 
        note._id === _id ? {...note, sizeWidth: newWidth, sizeHeight: newHeight}: note);
        setStickyNotes(updatedNotes);
    };

    /*
    *This function delays the send of data to the database when user is texting
    *this ensures data of user is not overwritten by constantly updating in every time user enters letter
    *improves usability
    */
    const debouncedUpdateTextOnServer = debounce((_id, newText) => {
        axios.put(`http://${serverIP}:3001/api/stickynotes/${_id}`, { text: newText });
        socket.emit('updateText', {_id,text:newText});
      }, 500);
    
    /*
    *This function handles action when user changes text, it updates the text 
    *and update changes in the database by making put request then emit it to other users in real time
    */
    const handleTextChange = async(_id,newText) =>{
        const updateNotes = stickyNotes.map((note) =>
        note._id===_id ? {...note,text:newText}:note);
        setStickyNotes(updateNotes);
        debouncedUpdateTextOnServer(_id, newText);
    };

     /*
    *This function handles action when user changes deletes, it removes sticky note
    *and update changes in the database by making delete request then emit it to other users in real time
    */
    const handleDelete = async(_id) =>{
        await axios.delete(`http://${serverIP}:3001/api/stickynotes/${_id}`);
        const updateNotes = stickyNotes.filter((note) =>
        note._id !== _id);
        setStickyNotes(updateNotes);
        socket.emit('updateDelete', {_id});
    };

    /*
    *This function handles action when user changes colour, it updates colour change
    *and update changes in the database by making get request then emit it to other users in real time
    */
    const handleColorChange = async(_id,newColor)=>{
        const response = await axios.put(`http://${serverIP}:3001/api/stickynotes/${_id}`, { color:newColor});
        const updateNotes = stickyNotes.map((note) =>
        note._id===_id ? {...note,color:newColor}:note);
        setStickyNotes(updateNotes);
        socket.emit('updateColor', {_id,color:newColor});
    }

    /*
    *This function handles action when user likes sticky note, it updates like count
    *and update changes in the database by making get request then emit it to other users in real time
    */
    const handleLikes = async(_idNote,newLikes)=>{
        const _id = _idNote;
        const email = location.state.name;
        const responseVote = await axios.get(`http://${serverIP}:3001/api/votes/${_idNote}/${email}`, )
        if (responseVote.data === "notLiked"){
            const postVote = await axios.post(`http://${serverIP}:3001/api/votes`, { 
                userEmail:email,
                _idNote:_idNote})
            newLikes = newLikes+1;
        }else{
            Swal.fire("Already liked the note")
        }
        const response = await axios.put(`http://${serverIP}:3001/api/stickynotes/${_id}`, { likes:newLikes});
        const updateNotes = stickyNotes.map((note) =>
        note._id===_idNote ? {...note,likes:newLikes}:note);
        setStickyNotes(updateNotes);
        socket.emit('updateLikes', {_id,likes:newLikes});
    }

    /*
    *creates sticky notes for all notes inside the sticky note array and display it to user
    *allow user to create multiple sticky notes.
    */
    return (
        <div className = "whiteboard">
            <div className="addButton">
                <button onClick = {addStickyNote}
                    style={{backgroundColor:'transparent', border:'0px'}}
                >
                    <FaRegStickyNote
                        style={{width:'25px', height:'25px'}}
                    />
                </button>
            </div>
        {stickyNotes.map((note) =>(
            <StickyNote
                key = {note._id}
                _id = {note._id}
                positionX={note.positionX}
                positionY={note.positionY}
                text= {note.text}
                color={note.color}
                likes={note.likes}
                sizeWidth={note.sizeWidth}
                sizeHeight={note.sizeHeight}
                onLikesChange={handleLikes}
                onResize={handleResize}
                onDrag={handleDrag}
                onTextChange={handleTextChange}
                onDelete={handleDelete}
                onColorChange={handleColorChange}
            />
        ))}
         </div>
    );
}

export default StickyNoteController;


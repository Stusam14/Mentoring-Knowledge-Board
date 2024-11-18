import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {FaFileSignature } from "react-icons/fa";
import {FaDownload } from "react-icons/fa";

function Extraction() {
  const [transcriptionText, setTranscriptionText] = useState("");
  const [transcribe, setTranscribe] = useState(false);

  const location = useLocation();
  const session = location.state.buttonInfo;


  useEffect (() =>{
    fetchStickyNotes()
  },[])

  const fetchStickyNotes = async () => {
    try {
      const email = location.state.name;
      const responseUser = await axios.get(`http://localhost:3001/api/users/${email}`);
      const team=responseUser.data.team;
      const response = await axios.get(`http://localhost:3001/api/stickynotes/${session}/${team}`);
      const notes =response.data;
      const nonEmptyNotes = notes.filter((note) => note.text.trim() !== "");
      //alert(nonEmptyNotes.length)
      const extractedText = nonEmptyNotes.map((note) => `> ${note.text}\n`).join("");
      setTranscriptionText(extractedText);

    } catch (error) {
      console.error("Error fetching sticky notes:", error);
    }
  };

  const onClick = async () => {
    //setTranscribe(true);
    fetchStickyNotes() 

    const extractBtn =document.getElementById("extractBtn")
    extractBtn.style.display="none";

    const downBtn = document.getElementById("downloadExtrBtn");
    downBtn.style.display = "inline"; 

  };

  const downloadTranscription = async() => {
    const element = document.createElement("a");
    const finalTranscriptedText =`***********************Session ${session} notes***********************`+"\n"+"\n"+transcriptionText
    const file = new Blob([finalTranscriptedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Session ${session}_transcription.txt`; // Set the filename to session_transcription.txt
    document.body.appendChild(element);
    element.click();
    const extractBtn =document.getElementById("extractBtn")
    extractBtn.style.display="inline";

    const downBtn = document.getElementById("downloadExtrBtn");
    downBtn.style.display = "none"; 
  };

  return (
    <div>
      <button 
        id="extractBtn"
        className="extractBtn" 
        onClick={onClick}
        style={{ width: '50px', height: "50px"}}
        >
        <FaFileSignature style={{width:'40px', height:'40px'}}/>
        </button>
      <button 
        id ="downloadExtrBtn" 
        className="downloadExtrBtn" 
        onClick={downloadTranscription} 
        //disabled={!transcribe} 
        style={{ display: 'none' }}
        >
        <FaDownload style={{width:'40px', height:'40px'}}/>
      </button>
    </div>
  );
}

export default Extraction;
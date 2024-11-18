import React,  {useState, useEffect} from "react";
import axios from 'axios';
import "./Analysis.css";
import {useLocation, useNavigate} from "react-router-dom";
import {Line} from "react-chartjs-2"
import {Bar} from "react-chartjs-2"
//import modules for drawing graphs
import{
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  PointElement,
  LinearScale, 
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

/*
*This component draws graph to show trend of the number of sticky notes for sessions in a line graph, showing number of sticky notes vs sessions
*It includes a bar graph that shows attendance for each session, showing attendance vs number of sessions
*Also reports students who attended for each session, showing attendance register for that session
*The user will have to enter team and session they want to analyse
*/
const Analysis = ()=>{
    const [allSessions, setAllSessions] = useState([]);
    const [sessionCount, setSessionCount] = useState([]);
    const [attendanceStudent, setAttendenceStudent] = useState([])
    const [team, setTeam] = useState(0);
    const [sessionNumber, setSessionNumber] = useState(0);
    const [studentNames, setStudentNames] = useState([]);
    const location = useLocation();

    /*
    *This function fetch data from the sticky note database,
    *An array containing the sticky notes data for a particular team is fetched
    *An array and map is used to filter this array data and create an array for attendence register, an array for sessions available so far
    *and an array for number of sticky notes.
    *These arrays are then used to draw the bar graph for attendance and line graph for number of sticky notes and also display attendance register
    */
    const fetchStickyNotes = async () => {
          try {
            const response = await axios.get(`http://localhost:3001/api/numbernotes/${team}`);
            const responseAttendance = await axios.get(`http://localhost:3001/api/attendance/${team}/${sessionNumber}`);
            const arrayAttendance = responseAttendance.data
            const uniqueNames = arrayAttendance.filter((item, index, array) => {
              const firstIndex = array.findIndex((element) => element.name === item.name);
              return index === firstIndex;
            })
            .map((item) => item.name);
            setStudentNames(uniqueNames);
            const occurrenceCount = {};
            let sessionArr = response.data
            let sessions = [];
            let counts = [];
            let namesLength = [];
            let subarrayLengths = [];
            const sessionNameMap = new Map();
        for (const obj of sessionArr) {
          const sessionValue = obj.session;
          const nameValue = obj.name;
          if (sessionNameMap.has(sessionValue)) {
            sessionNameMap.get(sessionValue).add(nameValue);
          } else {
            sessionNameMap.set(sessionValue, new Set([nameValue]));
          }
        }

        for (const [session, names] of sessionNameMap) {
          sessions.push(`session ${session}`);
          counts.push(sessionArr.filter((obj) => obj.session === session).length);
          const namesArray = Array.from(names);
          namesLength.push(namesArray);
          subarrayLengths.push(namesArray.length);
        }
        let session_arr = sessions.slice(0,sessionNumber)
        let notes_arr = counts.slice(0,sessionNumber)
        let attendance_arr = subarrayLengths.slice(0,sessionNumber)
        if (sessionNumber>0 && sessionNumber<9){
          setAllSessions(session_arr);
          setSessionCount(notes_arr);
          setAttendenceStudent(attendance_arr)
        }
        else{
          sessionArr = [];
          notes_arr = [];
          attendance_arr = [];
          setAllSessions(session_arr);
          setSessionCount(notes_arr);
          setAttendenceStudent(attendance_arr)
        }
        } catch (error) {
            console.error(error);
          }
    };
    
    fetchStickyNotes();//call fetch function to fetch sticky notes data

    /*
    *Describe and initialise data to be displayed on the line graph to show number of sticky notes per session
    *and style how the line graph will be displayed
    */
    const data = {
      labels: allSessions,
      datasets: [{
        label: 'Number of Sticky Notes',
        data: sessionCount,
        borderColor: 'red'
      }]
    };
    const options = {
      plugins: {
        legend: {
          display: true,
          position: "bottom"
        },
        title: {
          text: "Number of Sticky Notes Per Session",
          display: true,
          fontsSize: "20px"
        }
      }
    };

    /*
    *Describe and initialise data to be displayed on the bar graph to show number student attendance per session
    *and style how the bar graph will be displayed
    */

    const dataAttendance = {
      labels: allSessions,
      datasets: [{
        label: 'Student Attendance',
        data: attendanceStudent,
        backgroundColor: "rgb(127, 218, 219)",
        borderColor: 'green',
        borderWidth: 2,

      }]
    };
    const optionsAttendance = {
      plugins: {
        legend: {
          display: true,
          position: "bottom"
        },
        title: {
          text: "Attendance of Students Per Session",
          display: true,
          fontsSize: "50px"
        }
      }
    };
    
    /*
    *draws graphs on the screen and return it
    */
    return(
      <div> 
          <div className="search">
            <h3>Team: </h3>
            <div className="team"><input type="Number" onChange={(e)=>{setTeam(e.target.value)}}
              placeholder="Search team..." name="" id=""/>
            </div>
            <h3>Session: </h3>
            <div className="session"><input type="Number" onChange={(e)=>{setSessionNumber(e.target.value)}}
              placeholder="Search session..." name="" id=""/>
            </div>
          </div>
          <div className="analytics"> 
            <div className="graph" style={{width:'650px', height:'350px', marginLeft:'20px'}}>
              <Line data={data} options={options}></Line>
            </div>
            <div className="graphAttendance" style={{width:'650px', height:'350px'}}>
              <Bar data={dataAttendance} options={optionsAttendance} />
            </div>
          </div>
          <div className="attendance">
              <h3>Attendance register : Session {sessionNumber}</h3>
              {studentNames.map((element, index) => (
                <p key={index}>{element}</p>
              ))}
          </div>
      </div>
    )

}
export default Analysis
import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import StickyNoteController from "../Business/StickyNoteService";
import Analysis from "../Presentation/Analysis";
import {Link, useLocation} from "react-router-dom"
import TextController from "../Business/TextService";
import TextExtractor from '../Business/TextExtractor'
import "./Whiteboard.css"
import {FaChartBar,FaPen } from "react-icons/fa";
import {MdOutlineRectangle} from "react-icons/md";
import {RiDragMove2Fill} from "react-icons/ri";
import {GrRedo,GrUndo} from "react-icons/gr";
import {AiOutlineLine} from "react-icons/ai"
import {FaHeart} from "react-icons/fa";
import {createElement,nearPoint,onLine,positionWithinElement,distance,getElementAtposition,adjustElementCoordinates,cursorForPosition,resizedCoordinates} from "./Tools"
const generator = rough.generator();


//Custom Hook but note it still uses a real Hook
//but can be defined outside
//Also we use it to store the history of the elements that is onDraw and onMove
//We need the Array of Arrays for that history
const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action, overwrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () => index > 0 && setIndex((prevState) => prevState - 1);
  const redo = () =>
    index < history.length - 1 && setIndex((prevState) => prevState + 1);

  return [history[index], setState, undo, redo];
};

const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
};
//Dras all the different elements using their specific package.
const drawElement = (roughCanvas, context, element) => {
  switch (element.tool) {
    case "line":
    case "rectangle":
      roughCanvas.draw(element.roughElement);
      break;
    case "pencil":
      const stroke = getSvgPathFromStroke(
        getStroke(element.points, {
          size: 6,
        })
      );
      context.fill(new Path2D(stroke));
      break;
    default:
      throw new Error(`Tool recognise: ${element.tool}`);
  }
};

const adjustmentRequired = (tool) => ["line", "rectangle"].includes(tool);
//--------------------
//App Component******
/******************** */
const Whiteboard = () => {
  /**
   * Element useState holds track of X and Y coordinate while moving the mouse and we only take the last,
   *  as well as the width and height for rect.
   * Drawing help us avoid clicking on the canvas and taking unnecessary coordinate unrelated to the drawings
   */
  const [elements, setElements, undo, redo] = useHistory([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState(null);
  const [isCoodinator, setIsCoodinator] = useState(false);
  const location = useLocation();
  

  /**
   * Rendering the canvas whenever the is change using useLayout.
   *canvas gives access to the DOM element.
   *ctx allows us to create the shape/elements.
   *Rough is used for creating shapes as well.
   *we use generator ,so that we are able to store and reuse the shape.
   */
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    //clears the canvas, and allows a clean redraw.
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    elements.forEach((element) => drawElement(roughCanvas, context, element));
  }, [elements]);

  const updateElement = (id, x1, y1, x2, y2, type) => {
    const copyElements = [...elements];

    switch (type) {
      case "line":
      case "rectangle":
        copyElements[id] = createElement(id, x1, y1, x2, y2, type);
        break;

      case "pencil":
        copyElements[id].points = [
          ...copyElements[id].points,
          { x: x2, y: y2 },
        ];
        break;
      default:
        throw new Error(`tool not recognised: ${type}`);
    }
    setElements(copyElements, true);
  };

  //-----------------------------------------------------------------------------------
  //HandleMOuseDown******
  /********************************************************************************* */
  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    if (tool === "selection") {
      const element = getElementAtposition(clientX, clientY, elements);
      if (element) {
        if (element.tool === "pencil") {
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }

        //allows update of a moved element from history
        setElements((prevState) => prevState);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prevState) => [...prevState, element]);
      setSelectedElement(element);
      setAction("drawing");
    }
  };

  //-----------------------------------------------------------------------------------
  //HandleMOuseMove******
  /********************************************************************************* */
  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    if (tool === "selection") {
      const element = getElementAtposition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }
    if (action === "drawing") {
      //x1 and x2 are already on the array, but at the end
      //so we grab them , client X and Y are changing as we move the move
      //so where we stop is what we enter, then re-rendering will take place
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      /**
       * We are not keepimg track of useless coordinates with unfinished lines
       * instead we need to update the element to make up one line , which means
       * if we create an element it needs all of its coordinates set, we can rectify
       * an already created element(referring to the shapes) using array update techniques
       * for the coordinates.
       */
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.tool === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const copyElements = [...elements];
        copyElements[selectedElement.id] = {
          ...copyElements[selectedElement.id],
          points: newPoints,
        };
        setElements(copyElements, true);
      } else {
        const { id, x1, x2, y1, y2, tool, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, tool);
      }
    } else if (action === "resizing") {
      const { id, tool, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(id, x1, y1, x2, y2, tool);
    }
  };

  //-----------------------------------------------------------------------------------
  //HandleMOuseUp******
  /********************************************************************************* */
  const handleMouseUp = () => {
    if (selectedElement) {
      const index = selectedElement.id;
      const { id, tool } = elements[index];

      if (
        (action === "drawing" || action === "resizing") &&
        adjustmentRequired(tool)
      ) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, tool);
      }
    }
    setAction("none");
    setSelectedElement(null);
  };
  return (
    <div>
      <div>
         <StickyNoteController/> 
          <TextController /> 
          <TextExtractor/>
         <div className="analyticsTool">
         {location.state.name==="chris_green@gmail.com" ?(
              <Link to="/Analysis"> 
                    <button 
                      style={{borderColor:'rgb(156, 224, 239)', backgroundColor:'rgb(230, 240, 240)',border:0}} >
                      <FaChartBar style={{width:'40px', height:'40px'}}/>
                    </button> 
              </Link> 
         ):(<></>)}
            
          </div>
      </div>
        <div className="tools">
           <RiDragMove2Fill style={{fontSize:"24px",margin:"0 10px", cursor:"pointer"}} onClick={()=>setTool("selection")}/>
           <AiOutlineLine style={{fontSize:"24px",margin:"0 10px", cursor:"pointer"}} onClick={()=>setTool("line")}/>
           <MdOutlineRectangle style={{fontSize:"24px",margin:"0 10px", cursor:"pointer"}} onClick={()=>setTool("rectangle")}/>
           <FaPen style={{fontSize:"24px",margin:"0 10px", cursor:"pointer"}} onClick={()=>setTool("pen")}/>
              <GrUndo style={{fontSize:"24px",margin:"0 10px", cursor:"pointer"}} onClick={undo}/>
              <GrRedo style={{fontSize:"24px",margin:"0 10px", cursor:"pointer"}} onClick={redo}/>
        </div>
      
      <canvas
        id="canvas"
        // style={{ backgroundColor: "red" }}
        width={window.innerWidth}
        height={window.innerWidth}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
};

export default Whiteboard;

import React, {useState, useEffect} from "react";
import Draggable from "react-draggable";
import { Resizable } from 'react-resizable';
import { FaTrash} from "react-icons/fa";
import {FaPalette} from "react-icons/fa";
import "./StickyNote.css";
import {FaHeart} from "react-icons/fa";

/*
*This component describe structure of the component, this is a draggable component and 
*and also allow user to change its colour and delete. And also displays number of likes (votes) that it received
*/
const StickyNote = ({ 
    _id,             //parameters that define sticky note
    positionX,
    positionY,
    sizeWidth,
    sizeHeight,
    text,
    color,
    likes,
    onLikesChange,
    onDrag,
    onResize,
    onTextChange,
    onColorChange,
    onDelete
}) =>{

    const [isColorPickerOpen, setColorPickerOpen] = useState(false);
    const colorOptions = ['#87cefa', '#dda0dd', '#c0c0c0', '#90ee90', '#ffdab9'];
    const [position, setPosition] = useState({ x: positionX, y: positionY }); 

    /*
    *keeps track of the position of a sticky note where the note position has been changed 
    *then update position x and y parameters
    */
    useEffect(() => {
        setPosition({ x:positionX, y: positionY });
    }, [positionX,positionY]);

    /*
    *creates sticky note that is draggable and also provide writing area to write to, allow you to change colour
    *and also like sticky note or delete then return this
    */
    return(
        <Draggable
            position ={position}
            onStop={(e,data) => {onDrag(_id,data.x,data.y)  //updates position when it is dragged
                setPosition({ x:data.x, y: data.y })}} 
        >
            <Resizable 
                width={sizeWidth}
                height={sizeHeight}
                onResizeStop={(e,{size})=>{onResize(_id,size.width,size.height)}}
            >
                <div className="stickyNote" style={{backgroundColor:color,
                width: `${sizeWidth}px`, height: `${sizeHeight}px`}}
                    >
                    {!isColorPickerOpen && (  //allow user to select from diffent colours
                        <button className="change-color" 
                            style={{ backgroundColor: color, borderColor:color }}
                            onClick={()=>{setColorPickerOpen(true);}}>
                            <FaPalette/>
                        </button>
                    )}
                    {isColorPickerOpen && (
                        <div className="color-picker">
                            {colorOptions.map((color, index) => (
                                <button
                                    key={index}
                                    style={{ backgroundColor: color, borderColor:color }}
                                    onClick={()=>{onColorChange(_id,color)}}
                                ></button>
                            ))}
                            <button onClick={()=>{setColorPickerOpen(false)}}>
                                close
                            </button>
                        </div>
                    )}
                    <button className="deleteButton" 
                    style={{ backgroundColor: color, borderColor:color }}
                    onClick={()=>onDelete(_id)}>
                        <div>
                            <FaTrash/>
                        </div>
                    </button>
                    <button
                        style={{ backgroundColor: color, borderColor:color }} //display number of likes received
                        className="likeButton"
                        onClick={()=>onLikesChange(_id,likes)}
                      >
                    <div>
                        <FaHeart style= {{color:'rgb(200, 13, 194)'}}/>
                         <span style= {{color:'rgb(200, 13, 194)'}}>{likes}</span> 
                     </div>
                    </button>
                    <textarea className="textArea"
                        style={{backgroundColor:color}}
                        value={text} 
                        onChange={(e) => onTextChange(_id, e.target.value)} 
                        placeholder="Type..."
                    />
                </div>
            </Resizable>
        </Draggable>
    );
};

export default StickyNote;

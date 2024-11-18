import React, {useState, useEffect} from "react";
import Draggable from "react-draggable";
import "./Text.css";

/*
*This text component describe structure of the component, this is a draggable component and 
*and also allow user to delete.
*/
const Text = ({ 
    _id,             //parameters that define text
    positionX,
    positionY,
    text,
    onDrag,
    onTextChange,
    onDelete
}) =>{
    const [position, setPosition] = useState({ x: positionX, y: positionY }); // Manage position as a state

    /*
    *keeps track of the position of a text when the text position has been changed 
    *then update position x and y parameters accordingly
    */
    useEffect(() => {
        setPosition({ x:positionX, y: positionY });
    }, [positionX,positionY]);

    /*return structure of the text tool, this tool will be in the whiteboard and will be used
    *to write text, it allows user to drag it to new position
    */
    return(
        <Draggable
            position ={position}
            onStop={(e,data) => {onDrag(_id,data.x,data.y)
                setPosition({ x:data.x, y: data.y })}}
        >   
            <div className="text">
            <button className="delete-button" 
                onClick={()=>onDelete(_id)}>
                <div className="cancel-symbol">
                    X
                </div>
            </button>
            <textarea className="text-input"
                value={text} 
                onChange={(e) => onTextChange(_id, e.target.value)}
                placeholder="Type..."
                />
            </div>
        </Draggable>
    );
};

export default Text;

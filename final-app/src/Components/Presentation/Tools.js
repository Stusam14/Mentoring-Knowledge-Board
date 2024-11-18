import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";

const generator = rough.generator();
/**Extra functions */
/**_________________________________________________________________________________ */
/**
 * create element is used to create and track the coordinate of the roughjs elements
 *On the return we return the rough element for tracking and additional methods.
 *
 */
 function createElement(id, x1, y1, x2, y2, tool) {
    switch (tool) {
      case "line":
      case "rectangle":
        const roughElement =
          tool === "line"
            ? generator.line(x1, y1, x2, y2)
            : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  
        return { id, x1, y1, x2, y2, tool, roughElement };
      case "pencil":
        return { id, tool, points: [{ x: x1, y: y1 }] };
      default:
        throw new Error(`Tool not recognised: ${tool}`);
    }
  }

//checks if the point are near each other for resizing
const nearPoint = (x, y, x1, y1, name) => {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
  };

//Checks if the mouse is on top of the line drawn.
const onLine = (x1, y1, x2, y2, x, y, minOffset = 1) => {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < minOffset ? "inside" : null;
  };
  /**
   * Checks if the mouse position is within a certain element
   * And also marks the resizing values.
   */
  const positionWithinElement = (x, y, element) => {
    const { tool, x1, x2, y1, y2 } = element;
  
    switch (tool) {
      case "line":
        const on = onLine(x1, y1, x2, y2, x, y);
        const start = nearPoint(x, y, x1, y1, "start");
        const end = nearPoint(x, y, x2, y2, "end");
        return start || end || on;
      case "rectangle":
        const topLeft = nearPoint(x, y, x1, y1, "tl");
        const topRight = nearPoint(x, y, x2, y1, "tr");
        const bottomLeft = nearPoint(x, y, x1, y2, "bl");
        const bottomRight = nearPoint(x, y, x2, y2, "br");
        const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        return topLeft || topRight || bottomLeft || bottomRight || inside;
      case "pencil":
        const betweenAnyPoint = element.points.some((point, index) => {
          const nextPoint = element.points[index + 1];
          if (!nextPoint) return false;
          return (
            onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null
          );
        });
        return betweenAnyPoint ? "inside" : null;
      default:
        throw new Error(`tool not recognise ${tool}`);
    }
  };

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  const getElementAtposition = (x, y, elements) => {
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};


const adjustElementCoordinates = (element) => {
    const { tool, x1, y1, y2, x2 } = element;
    if (tool === "rectangle") {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    } else {
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      } else {
        return { x1: x2, y1: y2, x2: x1, y2: y1 };
      }
    }
  };
  
  //positions the cursor on the corners
  const cursorForPosition = (position) => {
    switch (position) {
      case "tl":
      case "br":
      case "start":
      case "end":
        return "nwse-resize";
      case "tr":
      case "bl":
        return "nesw-resize";
      default:
        return "move";
    }
  };
  
  const resizedCoordinates = (clientX, clientY, position, coordinates) => {
    const { x1, y1, x2, y2 } = coordinates;
    switch (position) {
      case "tl":
      case "start":
        return { x1: clientX, y1: clientY, x2, y2 };
      case "tr":
        return { x1, y1: clientY, x2: clientX, y2 };
      case "bl":
        return { x1: clientX, y1, x2, y2: clientY };
      case "br":
      case "end":
        return { x1, y1, x2: clientX, y2: clientY };
      default:
        return null;
    }
  };

export {createElement,nearPoint,onLine,positionWithinElement,distance,getElementAtposition,adjustElementCoordinates,cursorForPosition,resizedCoordinates}
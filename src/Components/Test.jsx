import React, { useEffect, useRef, useState } from "react";
// import { Document, Page } from 'react-pdf';
import { Document, Page, pdfjs } from "react-pdf";
import { Rect, Circle, Line } from "./PaintComponents/ShapesOOP";
import ToolIcon from "./PaintComponents/ToolIcon";
import InputSlider from "./PaintComponents/Slider";
import { CompactPicker, SketchPicker } from "react-color";
import Image from "next/image";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
export default function Test() {
  // tools
  const replaceElementInArray = (index, newShape) => {
    const newShapes = [...shapes]; // Create a copy of the original array
    newShapes.splice(index, 1, newShape); // Remove one element at the specified index and insert the new shape
    setShapes(newShapes); // Update the state with the new array
  };
  // Ui
  const [bg, setBg] = useState("A2D2FF");
  // canvases draw for finished drawing and drawing for drawing state
  const drawingRef = useRef(null);
  const drawRef = useRef(null);
  const [drawingCanvas, setDrawingCanvas] = useState(drawingRef.current);
  const [drawCanvas, setDrawCanvas] = useState(drawRef.current);
  // canvases settings
  const [PW, setPW] = useState(1000);
  const [PH, setPH] = useState(800);
  //hidden menus
  const [showColor, setShowColor] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [zoomSlider, setZoomSlider] = useState(false);
  const [opacitySlider, setOpacitySlider] = useState(false);
  // generals
  const [scale, setScale] = useState(1);
  const [tool, setTool] = useState("draw");
  const [drawTool, setDrawTool] = useState("rect");
  const [stroke, setStroke] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [Opacity, setRealOpacity] = useState(opacity / 100);
  const [color, setColor] = useState("red");
  // drawing steps
  const [drawing, setDrawing] = useState(false);
  const [finishDrawing, setFinishDrawing] = useState(false);
  // shape detection
  const [hovered, setHovered] = useState(false);
  const [hoveredShapes, setHoveredShapes] = useState([]);
  // mouse down coordinations
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  // shapes holder
  const [shapes, setShapes] = useState([]);
  // set canvases to variable
  useEffect(() => {
    shapes.forEach((shape) => {
      shape.draw(drawCanvas, scale);
    });
  }, [shapes]);
  useEffect(() => {
    setRealOpacity(opacity / 100);
  }, [opacity]);
  useEffect(() => {
    setDrawingCanvas(drawingRef.current);
    setDrawCanvas(drawRef.current);
  }, [drawingRef, drawRef]);
  const handleMouseDown = (e) => {
    const rect = drawingCanvas.getBoundingClientRect();
    setStartX((e.clientX - rect.left) / scale);
    setStartY((e.clientY - rect.top) / scale);
    if (tool == "draw") {
      setDrawing(true);
    }
    if (drawTool == "fill" && hovered) {
      let newShape = shapes[hoveredShapes[0]];
      newShape.filled = true;
      newShape.fillColor = color;
      newShape.color = color;
      replaceElementInArray(hoveredShapes[0], newShape);
    }
  };
  const handleMouseMove = (e) => {
    setFinishDrawing(true);
    if (drawingCanvas) {
      let ctx = drawingCanvas.getContext("2d");
      const rect = drawingCanvas.getBoundingClientRect();
      let currentX = (e.clientX - rect.left) / scale;
      let currentY = (e.clientY - rect.top) / scale;
      if (drawing) {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        switch (drawTool) {
          case "rect":
            let w = currentX - startX;
            let h = currentY - startY;
            let rect = new Rect(
              startX,
              startY,
              w,
              h,
              color,
              false,
              color,
              stroke,
              Opacity
            );
            rect.draw(drawingCanvas, scale);
            break;
          case "circle":
            let r = Math.sqrt(
              (currentX - startX) ** 2 + (currentY - startY) ** 2
            );
            let circle = new Circle(
              startX,
              startY,
              r,
              color,
              false,
              color,
              stroke,
              Opacity
            );
            circle.draw(drawingCanvas, scale);
            break;
          case "line":
            let line = new Line(
              startX,
              startY,
              currentX,
              currentY,
              color,
              stroke,
              Opacity
            );
            line.draw(drawingCanvas, scale);
            break;
          case "plan":
            break;
          case "pen":
          default:
            break;
        }
      }
      if (drawTool == "fill" || drawTool == "move") {
        let hovered;
        let newHoever = [];
        shapes.forEach((shape, i) => {
          if (shape instanceof Rect || shape instanceof Circle) {
            hovered = shape.isHovered(currentX, currentY);
            if (hovered) {
              newHoever.push(i);
            }
          }
        });
        if (newHoever.length > 0) {
          setHovered(true);
        } else {
          setHovered(false);
        }
        setHoveredShapes(newHoever);
      }
    }
  };
  const handleMouseUp = (e) => {
    let DrawingCtx = drawingCanvas.getContext("2d");
    const rect = drawingCanvas.getBoundingClientRect();
    let currentX = (e.clientX - rect.left) / scale;
    let currentY = (e.clientY - rect.top) / scale;
    if (finishDrawing) {
      DrawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      setDrawing(false);
      if (tool == "draw") {
        let newShapes;
        switch (drawTool) {
          case "rect":
            let w = currentX - startX;
            let h = currentY - startY;
            let rect = new Rect(
              startX,
              startY,
              w,
              h,
              color,
              false,
              color,
              stroke,
              Opacity
            );
            rect.draw(drawCanvas, scale);
            newShapes = [...shapes, rect]; // create new array with new shape added
            setShapes(newShapes);
            break;
          case "circle":
            let r = Math.sqrt(
              (currentX - startX) ** 2 + (currentY - startY) ** 2
            );
            let circle = new Circle(
              startX,
              startY,
              r,
              color,
              false,
              color,
              stroke,
              Opacity
            );
            circle.draw(drawCanvas, scale);
            newShapes = [...shapes, circle]; // create new array with new shape added
            setShapes(newShapes);
            break;
          case "line":
            let line = new Line(
              startX,
              startY,
              currentX,
              currentY,
              color,
              stroke,
              Opacity
            );
            line.draw(drawCanvas, scale);
            newShapes = [...shapes, line]; // create new array with new shape added
            setShapes(newShapes);
            break;
          case "plan":
            break;
          case "pen":
          default:
            break;
        }
      }
    }
    setFinishDrawing(false);
  };
  const handleMouseLeave = (e) => {
    setDrawing(false);
    setFinishDrawing(false);
  };
  const handleSave = () => {};
  const exportPdfPage = () => {};
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };
  return (
    <div className="relative w-full h-full">
      {/* hidden menus */}
      <>
        {showColor && (
          <div
            className="absolute top-0 left-0 w-screen h-screen z-50"
            onClick={() => setShowColor(false)}
          />
        )}
        {opacitySlider && (
          <div
            className="absolute top-0 left-0 w-screen h-screen z-40"
            onClick={() => setOpacitySlider(false)}
          />
        )}
        {zoomSlider && (
          <div
            className="absolute top-0 left-0 w-screen h-screen z-40"
            onClick={() => setZoomSlider(false)}
          />
        )}
        {clearing && (
          <div className="absolute top-0 left-0 w-screen h-screen z-50 flex justify-center items-center">
            {/* shadow background */}
            <div
              className="absolute top-0 left-0 w-screen h-screen z-20 bg-black opacity-10"
              onClick={() => setClearing(false)}
            ></div>
            {/* buttons */}
            <div className="w-96 h-64  flex flex-col justify-center items-center border border-black z-30 bg-white gap-4 rounded-md ">
              <p className="text-2xl text-red-600 text-center">
                You are about to reset all drawings
              </p>
              <button
                className="w-[200px] px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => {
                  setPaintings([]);
                  paintingsCanvas
                    .getContext("2d")
                    .clearRect(
                      0,
                      0,
                      paintingsCanvas.width,
                      paintingsCanvas.height
                    );
                  setClearing(false);
                }}
              >
                Clear paintings
              </button>
              <button
                className="w-[200px] px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => {
                  setPlans([]);
                  plansCanvas
                    .getContext("2d")
                    .clearRect(0, 0, plansCanvas.width, plansCanvas.height);
                  setClearing(false);
                }}
              >
                Clear plans
              </button>
              <button
                className="w-[200px] px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => {
                  setPaintings([]);
                  setPlans([]);
                  plansCanvas
                    .getContext("2d")
                    .clearRect(0, 0, plansCanvas.width, plansCanvas.height);
                  paintingsCanvas
                    .getContext("2d")
                    .clearRect(
                      0,
                      0,
                      paintingsCanvas.width,
                      paintingsCanvas.height
                    );
                  setClearing(false);
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </>
      {/* top bar */}
      <div className="flex justify-start items-center h-[110px] gap-4 border-b border-gray-400 w-full absolute top-0 left-0">
        <ToolIcon
          tool="save"
          drawTool={tool}
          setDrawTool={handleSave}
          disable={false}
          className={"ml-4"}
        />
        <ToolIcon
          tool="download"
          drawTool={tool}
          setDrawTool={exportPdfPage}
          disable={false}
        />
        {/* scale */}
        <div className="flex justify-center items-center gap-2">
          <Image
            width={24}
            height={24}
            src={`/images/zoomOut.png`}
            alt="zoonOut"
            className="cursor-pointer"
            onClick={() => {
              if (scale == 0.5) {
                return;
              } else {
                setScale(scale - 0.5);
              }
            }}
          />
          <input
            title="stroke"
            value={scale}
            className="w-[58px] h-[26px] rounded-md pl-2 text-black border border-black"
            onChange={(e) => setStroke(e.target.value)}
          />
          <Image
            width={24}
            height={24}
            src={`/images/zoomIn.png`}
            alt="zoomIn"
            className="cursor-pointer"
            onClick={() => setScale(scale + 0.5)}
          />
        </div>
        {/* opacity */}
        <InputSlider
          value={opacity}
          setValue={setOpacity}
          title={"opacity"}
          show={opacitySlider}
          setShow={setOpacitySlider}
        />
        {/* stroke */}
        <div className="flex justify-center items-center gap-2">
          <Image
            width={32}
            height={32}
            src={`/images/minus.png`}
            alt="arrow"
            className="cursor-pointer"
            onClick={() => {
              if (stroke < 0.5) {
                return;
              } else {
                setStroke(stroke - 1);
              }
            }}
          />
          <input
            title="stroke"
            value={stroke}
            className="w-[58px] h-[26px] rounded-md pl-2 text-black border border-black"
            onChange={(e) => setStroke(e.target.value)}
          />
          <Image
            width={24}
            height={24}
            src={`/images/plus.png`}
            alt="arrow"
            className="cursor-pointer"
            onClick={() => {
              setStroke(stroke + 1);
            }}
          />
        </div>
        {/* color changer */}
        <div className="relative flex justify-center items-center gap-4">
          <div
            className={`w-[48px] h-[48px] z-60 border border-black z-50 shadow-md`}
            style={{ background: color, borderRadius: 4, cursor: "pointer" }}
            onClick={() => setShowColor(true)}
          ></div>
          <CompactPicker color={color} onChange={handleColorChange} />
          {showColor && (
            <SketchPicker
              disableAlpha={true}
              color={color}
              onChange={handleColorChange}
              className="absolute top-[68px] left-[48px] z-50"
            />
          )}
        </div>
      </div>
      {/* left bar */}
      <div
        className={`flex flex-col justify-start items-center w-[80px] h-full top-[110px] left-0 bg-[#${bg}] absolute gap-4`}
      >
        <ToolIcon
          tool="move"
          drawTool={tool}
          setDrawTool={(tool) => {
            setDrawTool(""), setTool(tool);
          }}
          disable={false}
          className={"mt-4"}
        />
        <ToolIcon
          tool="circle"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="rect"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="line"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="pen"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="text"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="plan"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="fill"
          drawTool={drawTool}
          setDrawTool={(tool) => {
            setDrawTool(tool), setTool("draw");
          }}
          disable={false}
        />
        <ToolIcon
          tool="clear"
          drawTool={drawTool}
          setDrawTool={() => {
            setClearing(true);
          }}
          disable={false}
        />
        <ToolIcon
          tool="delete"
          drawTool={tool}
          setDrawTool={(tool) => {
            setDrawTool(""), setTool(tool);
          }}
          disable={false}
        />
        <ToolIcon
          tool="erace"
          drawTool={tool}
          setDrawTool={(tool) => {
            setDrawTool(""), setTool(tool);
          }}
          disable={false}
        />
      </div>
      {/* canvases */}
      <div className="relative w-[calc(100vw-80px)] h-full left-[80px] top-[100px] overflow-auto bg-gray-200">
        <canvas
          ref={drawingRef}
          width={PW}
          height={PH}
          className={`z-30 absolute top-0 left-0 border-[#EC058E] border`}
          scale={scale}
        />
        {/* paintings canvas */}
        <canvas
          ref={drawRef}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={(e) => handleMouseMove(e)}
          onMouseUp={(e) => handleMouseUp(e)}
          onMouseLeave={(e) => handleMouseLeave(e)}
          onLoad={() => setLoadingPlans(!loadingPlans)}
          width={PW}
          scale={scale}
          height={PH}
          className={`z-30 absolute top-0 left-0  
							${tool == "erace" && "cursor-erace"}
							${drawTool == "pen" && "cursor-pen"}
							${drawTool == "fill" && hovered && "cursor-fill"}
			`}
        />
      </div>
    </div>
  );
}

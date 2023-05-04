import React, { useEffect, useRef, useState } from "react";
// import { Document, Page } from 'react-pdf';
import { Document, Page, pdfjs } from "react-pdf";
import { Rect, Circle, Line, Plan, Text } from "./PaintComponents/ShapesOOP";
import ToolIcon from "./PaintComponents/ToolIcon";
import InputSlider from "./PaintComponents/Slider";
import { CompactPicker, SketchPicker } from "react-color";
import Image from "next/image";
import jsPDF from "jspdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
export default function Paint({
  pdfDoc,
  pageNumber,
  setActiveStep,
  setSketchInfo,
  sketchInfo,
}) {
  // tools
  const replaceElementInArray = (index, newShape) => {
    const newShapes = [...shapes]; // Create a copy of the original array
    newShapes.splice(index, 1, newShape); // Remove one element at the specified index and insert the new shape
    setShapes(newShapes); // Update the state with the new array
  };
  // Ui
  // canvases draw for finished drawing and drawing for drawing state
  const drawingRef = useRef(null);
  const drawRef = useRef(null);
  const pdfRef = useRef(null);
  const [drawingCanvas, setDrawingCanvas] = useState(drawingRef.current);
  const [drawCanvas, setDrawCanvas] = useState(drawRef.current);
  // canvases settings
  const [loaded, setLoaded] = useState(false);
  const [PW, setPW] = useState(1000);
  const [PH, setPH] = useState(800);
  //hidden menus
  const [showColor, setShowColor] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [zoomSlider, setZoomSlider] = useState(false);
  const [opacitySlider, setOpacitySlider] = useState(false);
  // generals
  const [scale, setScale] = useState(2);
  const [tool, setTool] = useState("draw");
  const [drawTool, setDrawTool] = useState("plan");
  const [stroke, setStroke] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [Opacity, setRealOpacity] = useState(opacity / 100);
  const [color, setColor] = useState("red");
  // drawing steps
  const [drawing, setDrawing] = useState(false);
  const [finishDrawing, setFinishDrawing] = useState(false);
  // move object activator
  const [moving, setMoving] = useState(false);
  const [movingObject, setMovingObject] = useState({});
  // shape detection
  const [hovered, setHovered] = useState(false);
  const [hoveredShapes, setHoveredShapes] = useState([]);
  // split vars
  const [spliting, setSpliting] = useState(false);
  const [splitStep, setSplitStep] = useState(0);
  const [splitDirection, setSplitDirection] = useState("");
  const [splitShapeIndex, setSplitShapeIndex] = useState();
  const [splitCircleHovered, setSplitCircleHovered] = useState(false);
  const [splitCircleShapes, setSplitCircleShapes] = useState(false);
  const [splitCursorDirection, setSplitCursorDirection] = useState("v");
  const [movingSplit, setMovingSplit] = useState(false);
  // writing ar
  const [writing, setWriting] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(300);
  const [fontStyle, setFontStyle] = useState("normal");
  const [text, setText] = useState("");
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => {
    if (writing && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }
  }, [writing, scale, color, opacity, fontSize, stroke, fontWeight, fontStyle]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
    }
  }, [text, fontSize, fontWeight, fontStyle]);
  function handleCheckboxChange() {
    setFontStyle(fontStyle == "normal" ? "italic" : "normal");
  }
  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      if (text != "") {
        setWriting(false);
        setText("");
        let text1 = new Text(
          startX,
          startY,
          text,
          fontSize,
          fontWeight,
          fontStyle,
          color,
          opacity
        );
        text1.draw(drawCanvas, scale);
        let newShapes = [...shapes, text1]; // create new array with new shape added
        setShapes(newShapes);
      }
    }
    if (e.keyCode === 27) {
      setWriting(false);
      setText("");
    }
  };
  const handleSubmitText = () => {
    if (text != "") {
      setWriting(false);
      setText("");
      let text1 = new Text(
        startX,
        startY,
        text,
        fontSize,
        fontWeight,
        fontStyle,
        color,
        opacity
      );
      text1.draw(drawCanvas, scale);
      let newShapes = [...shapes, text1]; // create new array with new shape added
      setShapes(newShapes);
    } else {
      setWriting(false);
    }
  };
  // mouse down coordinations
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [file, setFile] = useState();
  const Doc2File = async () => {
    const newBlob = await pdfDoc.save();
    const file = new File([newBlob], "testssPdf.pdf", {
      type: "application/pdf",
    });
    setFile(file);
  };
  useEffect(() => {
    Doc2File();
  }, []);
  // shapes holder
  const [shapes, setShapes] = useState(
    sketchInfo.pages[pageNumber - 1].sketches.shapes
  );
  console.log({ fontStyle });
  useEffect(() => {
    if (pdfRef) {
      const el = pdfRef.current;
      if (el) {
        const w = el.offsetWidth;
        setPW(w);
        const h = el.offsetHeight;
        setPH(h);
      }
    }
  }, [pdfRef, scale, loaded]);
  // set canvases to variable
  useEffect(() => {
    setDrawingCanvas(drawingRef.current);
    setDrawCanvas(drawRef.current);
  }, [drawingRef, drawRef]);
  // draw shapes when shapes or scale changes
  useEffect(() => {
    if (drawCanvas) {
      let drawCtx = drawCanvas.getContext("2d");
      drawCtx.clearRect(0, 0, drawCanvas.width, drawingCanvas.height);
      shapes.forEach((shape) => {
        shape.draw(drawCanvas, scale);
      });
    }
  }, [shapes]);
  useEffect(() => {
    if (drawCanvas) {
      let drawCtx = drawCanvas.getContext("2d");
      drawCtx.clearRect(0, 0, drawCanvas.width, drawingCanvas.height);
      setTimeout(() => {
        shapes.forEach((shape) => {
          shape.draw(drawCanvas, scale);
        });
      }, 0);
    }
  }, [scale, loaded]);
  // set Opacity variable to opacity/100
  useEffect(() => {
    setRealOpacity(opacity / 100);
  }, [opacity]);
  const handleMouseDown = (e) => {
    const rect = drawingCanvas.getBoundingClientRect();
    setStartX((e.clientX - rect.left) / scale);
    setStartY((e.clientY - rect.top) / scale);
    // start drawing
    if (tool == "draw" && splitStep == 0 && !splitCircleHovered) {
      setDrawing(true);
    }
    if (drawTool == "text") {
      setWriting(true);
      setInputX(e.clientX - rect.left);
      setInputY(e.clientY - rect.top);
    }
    // fill shapes
    if (drawTool == "fill" && hovered) {
      let newShape = shapes[hoveredShapes[0]];
      newShape.filled = true;
      newShape.fillColor = color;
      newShape.color = color;
      replaceElementInArray(hoveredShapes[0], newShape);
    }
    // split plans that are not splited if hovered
    if (
      drawTool == "plan" &&
      hovered &&
      !splitCircleHovered &&
      shapes[hoveredShapes[0]] instanceof Plan &&
      splitStep == 0 &&
      !shapes[hoveredShapes[0]].splited
    ) {
      setSplitShapeIndex(hoveredShapes[0]);
      setSpliting(true);
      setSplitStep(1);
      setDrawing(false);
    }
    // start moving shape by removing it from shapes and storing it to a variable then start drawing it in drawing canvas
    //  when tool is 'move' and a shape is hovered
    if (tool == "move" && hovered) {
      setMoving(true);
      let drawCtx = drawCanvas.getContext("2d");
      drawCtx.clearRect(0, 0, drawCanvas.width, drawingCanvas.height);
      let newShapes = [...shapes]; // create new array with new shape added
      newShapes.splice(hoveredShapes[0], 1);
      let newShape = shapes[hoveredShapes[0]];
      newShape.draw(drawingCanvas, scale);
      setMovingObject(newShape);
      setShapes(newShapes);
    }
    // start changing shape splitPoint removing it from shapes and storing it to a variable then start drawing it in drawing canvas
    //  when tool is 'move' and innercircle or splited shape is hovered
    if (drawTool == "plan" && splitCircleHovered) {
      setMovingSplit(true);
      let drawCtx = drawCanvas.getContext("2d");
      drawCtx.clearRect(0, 0, drawCanvas.width, drawingCanvas.height);
      let newShapes = [...shapes]; // create new array with new shape added
      newShapes.splice(splitCircleShapes[0], 1);
      let newShape = shapes[splitCircleShapes[0]];
      newShape.draw(drawingCanvas, scale);
      setMovingObject(newShape);
      setShapes(newShapes);
    }
  };
  const handleMouseMove = (e) => {
    if (!spliting) {
      setFinishDrawing(true);
      if (drawingCanvas) {
        let ctx = drawingCanvas.getContext("2d");
        const rect = drawingCanvas.getBoundingClientRect();
        let currentX = (e.clientX - rect.left) / scale;
        let currentY = (e.clientY - rect.top) / scale;
        // draw shapes
        if (drawing) {
          ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
          let w = currentX - startX;
          let h = currentY - startY;
          switch (drawTool) {
            case "rect":
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
            case "plan":
              let plan = new Plan(
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
              plan.draw(drawingCanvas, scale);
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
            case "pen":
            default:
              break;
          }
        }
        // detect hover
        if (
          drawTool == "fill" ||
          (tool == "move" && !moving) ||
          (drawTool == "plan" && !movingSplit)
        ) {
          let newHoever = [];
          let newCircleHovered = [];
          shapes.forEach((shape, i) => {
            if (shape.isHovered(currentX, currentY, drawingCanvas)) {
              newHoever.push(i);
            }
            if (
              shape instanceof Plan &&
              shape.splited &&
              shape.isInnerCircleHovered(currentX, currentY)
            ) {
              newCircleHovered.push(i);
            }
          });
          if (newHoever.length > 0) {
            setHovered(true);
          } else {
            setHovered(false);
          }
          if (newCircleHovered.length > 0) {
            setSplitCircleHovered(true);
            if (
              shapes[newCircleHovered[0]].splitPoint.direction == "vertical"
            ) {
              setSplitCursorDirection("V");
            } else {
              setSplitCursorDirection("H");
            }
          } else {
            setSplitCircleHovered(false);
          }
          setHoveredShapes(newHoever);
          setSplitCircleShapes(newCircleHovered);
        }
        // move shape
        if (moving) {
          ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
          movingObject.move(currentX - startX, currentY - startY);
          movingObject.draw(drawingCanvas, scale);
          const rect = drawingCanvas.getBoundingClientRect();
          setStartX((e.clientX - rect.left) / scale);
          setStartY((e.clientY - rect.top) / scale);
        }
        // change split point coordination
        if (movingSplit) {
          ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
          movingObject.moveSplit(currentX - startX, currentY - startY);
          movingObject.draw(drawingCanvas, scale);
          const rect = drawingCanvas.getBoundingClientRect();
          setStartX((e.clientX - rect.left) / scale);
          setStartY((e.clientY - rect.top) / scale);
        }
      }
    }
  };
  const handleMouseUp = (e) => {
    if (!spliting) {
      let DrawingCtx = drawingCanvas.getContext("2d");
      const rect = drawingCanvas.getBoundingClientRect();
      let currentX = (e.clientX - rect.left) / scale;
      let currentY = (e.clientY - rect.top) / scale;
      // draw final shape to draw canvas and add it to shapes
      if (finishDrawing) {
        DrawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        let newShapes;
        if (tool == "draw" && !movingSplit) {
          let w = currentX - startX;
          let h = currentY - startY;
          switch (drawTool) {
            case "rect":
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
            case "plan":
              let plan = new Plan(
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
              plan.draw(drawCanvas, scale);
              newShapes = [...shapes, plan]; // create new array with new shape added
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
            case "pen":
            default:
              break;
          }
        }
      }
      // draw final shape after moving and add it to shapes
      if (moving) {
        let drawCtx = drawCanvas.getContext("2d");
        drawCtx.clearRect(0, 0, drawCanvas.width, drawingCanvas.height);
        let newShapes = [...shapes]; // create new array with new shape added
        newShapes.splice(hoveredShapes[0], 0, movingObject);
        setMovingObject({});
        setShapes(newShapes);
      }
      // draw final shape after changing split point position and add it to shapes
      if (movingSplit) {
        let drawCtx = drawCanvas.getContext("2d");
        drawCtx.clearRect(0, 0, drawCanvas.width, drawingCanvas.height);
        let newShapes = [...shapes]; // create new array with new shape added
        newShapes.splice(hoveredShapes[0], 0, movingObject);
        setMovingObject({});
        setShapes(newShapes);
      }
      // finishing all tasks on mouse up
      setDrawing(false);
      setMoving(false);
      setMovingSplit(false);
      setFinishDrawing(false);
    }
  };
  const handleMouseLeave = (e) => {
    setDrawing(false);
    setFinishDrawing(false);
  };
  const handleSave = () => {
    let pages = sketchInfo.pages;
    let newPage = sketchInfo.pages[pageNumber - 1];
    newPage.edited = true;
    pages[pageNumber - 1] = newPage;
    sketchInfo.pages[pageNumber - 1].sketches = { shapes };
    setSketchInfo(sketchInfo);
  };
  const exportPdfPage = () => {
    const scaleFactor = 1;
    const canvasWidth = (pdfRef.current.clientWidth / scale) * scaleFactor;
    const canvasHeight = (pdfRef.current.clientHeight / scale) * scaleFactor;
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = canvasWidth;
    mergedCanvas.height = canvasHeight;
    const mergedCtx = mergedCanvas.getContext("2d");
    mergedCtx.drawImage(pdfRef.current, 0, 0, canvasWidth, canvasHeight);
    shapes.forEach((shape) => {
      shape.draw(mergedCanvas, scaleFactor);
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvasWidth, canvasHeight],
    });
    pdf.addImage(
      mergedCanvas.toDataURL("image/jpeg"),
      "JPEG",
      0,
      0,
      canvasWidth,
      canvasHeight,
      null,
      null,
      null,
      null,
      null,
      null,
      {
        pageNumber: 1, // add page number to the image options
      }
    );
    pdf.save("merged.pdf");
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };
  const handleSplit = (start, direction) => {
    let newShape = shapes[splitShapeIndex];
    newShape.splited = true;
    newShape.splitPoint.x = startX;
    newShape.splitPoint.y = startY;
    newShape.splitPoint.direction = direction;
    newShape.splitPoint.start = start;
    newShape.split(startX, startY, direction, start);
    replaceElementInArray(splitShapeIndex, newShape);
    setSplitStep(0);
    setSpliting(false);
  };
  return (
    <div className="relative w-full h-full">
      {/* hidden menus */}
      <>
        {writing && (
          <>
            <div
              className="w-screen h-screen absolute top-0 left-0 z-50"
              onClick={() => handleSubmitText()}
            ></div>
          </>
        )}
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
                  setShapes([]);
                  drawCanvas
                    .getContext("2d")
                    .clearRect(0, 0, drawCanvas.width, drawCanvas.height);
                  setClearing(false);
                }}
              >
                Clear All
              </button>
              <button
                className="w-[200px] px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => {
                  setClearing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
      {/* top bar */}
      <div className="flex justify-start items-center h-[110px] gap-4 bg-cyan-400 w-full absolute top-0 left-0 z-50">
        <img
          src="/images/back.png"
          alt="back"
          width="42px"
          height="42px"
          onClick={() => {
            setActiveStep(4);
          }}
          className=" ml-4 cursor-pointer"
        />
        <ToolIcon
          tool="save"
          drawTool={tool}
          setDrawTool={handleSave}
          disable={false}
          className={"ml-2"}
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
        {/* text settings  */}
        {writing && (
          <div className="w-[300px] h-full bg-red-200 z-50">
            <div>
              <label htmlFor="fontSizeSelect">Font Size:</label>
              <select
                id="fontSizeSelect"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={11}>11</option>
                <option value={14}>14</option>
                <option value={16}>16</option>
                <option value={18}>18</option>
                <option value={20}>20</option>
                <option value={22}>22</option>
                <option value={24}>24</option>
                <option value={26}>26</option>
                <option value={28}>28</option>
                <option value={32}>32</option>
                <option value={36}>36</option>
                <option value={42}>42</option>
                <option value={72}>72</option>
              </select>
            </div>
            <div>
              <label htmlFor="fontSizeSelect">Font Weight:</label>
              <select
                id="fontSizeSelect"
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
              >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={800}>800</option>
                <option value={900}>900</option>
              </select>
            </div>
            <>
              <img
                src={`/images/${
                  fontStyle == "normal" ? "fontStyleItalic" : "fontStyleNormal"
                }.png`}
                alt="fontStyle"
                className="w-[32px] h-[32px] rounded-md"
                onClick={handleCheckboxChange}
              />
            </>
          </div>
        )}
      </div>
      {/* left bar */}
      <div
        className={`flex flex-col justify-start items-center w-[80px] h-full top-[110px] left-0 bg-cyan-400 absolute gap-4 z-50`}
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
          disable={true}
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
          disable={true}
        />
      </div>
      {/* canvases */}
      <div className="relative w-[calc(100vw-80px)] h-[calc(100vh-110px)] left-[80px] top-[110px] overflow-auto bg-gray-200 z-30">
        <Document file={file} className="absolute top-0 left-0 overflow-hidden">
          <Page
            pageNumber={pageNumber}
            canvasRef={pdfRef}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            onLoadSuccess={() => setLoaded(!loaded)}
            scale={scale}
          />
        </Document>
        <canvas
          ref={drawingRef}
          width={PW}
          height={PH}
          className={`z-30 absolute top-0 left-0`}
        ></canvas>
        {/* paintings canvas */}
        <canvas
          ref={drawRef}
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={(e) => handleMouseMove(e)}
          onMouseUp={(e) => handleMouseUp(e)}
          onMouseLeave={(e) => handleMouseLeave(e)}
          width={PW}
          scale={scale}
          height={PH}
          className={`z-30 absolute top-0 left-0  
							${tool == "erace" && "cursor-erace"}
							${
                splitCircleHovered &&
                drawTool == "plan" &&
                splitCursorDirection == "V" &&
                "cursor-splitVA"
              }
							${
                splitCircleHovered &&
                drawTool == "plan" &&
                splitCursorDirection == "H" &&
                "cursor-splitHA"
              }
							${drawTool == "pen" && "cursor-pen"}
							${drawTool == "fill" && hovered && "cursor-fill"}
              ${hovered && tool == "move" && "cursor-move"}
			`}
        />
        {spliting && (
          <div className="z-50">
            {splitStep == 1 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: startY * scale,
                    left: startX * scale,
                  }}
                  className={`w-[270px] rounded-md z-50 gap-5 h-[130px] bg-white -translate-x-[100%] -translate-y-[100%] flex flex-col justify-start items-center`}
                >
                  <h1 className="my-2  text-lg">Split Direction</h1>
                  <div className="flex justify-center items-center gap-5">
                    <button
                      className="bg-cyan-400 px-5 py-2 rounded-md shadow-md hover:bg-cyan-600"
                      onClick={() => {
                        setSplitStep(2), setSplitDirection("vertical");
                      }}
                    >
                      Vertical
                    </button>
                    <button
                      className="bg-cyan-400 px-5 py-2 rounded-md shadow-md hover:bg-cyan-600"
                      onClick={() => {
                        setSplitStep(2), setSplitDirection("horizantal");
                      }}
                    >
                      Horizantal
                    </button>
                  </div>
                </div>
              </>
            )}
            {splitStep == 2 && (
              <div
                style={{
                  position: "absolute",
                  top: startY * scale,
                  left: startX * scale,
                  zIndex: 100,
                }}
                className={`w-[270px] rounded-md z-50 gap-5 h-[130px] bg-white -translate-x-[100%] -translate-y-[100%] flex flex-col justify-start items-center`}
              >
                <h1 className="my-2  text-lg">Progress Start</h1>
                {splitDirection == "vertical" ? (
                  <div className="flex justify-center items-center gap-5">
                    <button
                      className="bg-cyan-400 px-5 py-2 rounded-md shadow-md hover:bg-cyan-600"
                      onClick={() => {
                        handleSplit("top", splitDirection);
                      }}
                    >
                      Top
                    </button>
                    <button
                      className="bg-cyan-400 px-5 py-2 rounded-md shadow-md hover:bg-cyan-600"
                      onClick={() => {
                        handleSplit("bottom", splitDirection);
                      }}
                    >
                      bottom
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-5">
                    <button
                      className="bg-cyan-400 px-5 py-2 rounded-md shadow-md hover:bg-cyan-600"
                      onClick={() => {
                        handleSplit("left", splitDirection);
                      }}
                    >
                      Left
                    </button>
                    <button
                      className="bg-cyan-400 px-5 py-2 rounded-md shadow-md hover:bg-cyan-600"
                      onClick={() => {
                        handleSplit("right", splitDirection);
                      }}
                    >
                      Right
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {writing && (
          <>
            <input
              className="outline-none bg-transparent absolute -translate-y-[73%] z-40"
              style={{
                width: "4px",
                fontSize: `${fontSize * scale}px`,
                color: color,
                top: inputY,
                left: inputX,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
              }}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              ref={inputRef}
              onKeyDown={handleKeyPress}
            />
          </>
        )}
      </div>
    </div>
  );
}

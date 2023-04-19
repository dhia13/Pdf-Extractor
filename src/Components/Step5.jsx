import { useEffect, useRef, useState } from "react";
import ToolIcon from "./Components for uri pdf/ToolIcon";
import {
  drawRect,
  drawCircle,
  drawShapes,
  drawLine,
  detectShapes,
} from "./Components for uri pdf/drawingTools";
import { SketchPicker } from "react-color";

export default function Step5() {
  const pdfRef = useRef(null);
  const canvasRef = useRef(null);
  const secondCanvasRef = useRef(null);
  const [canvas, setCanvas] = useState(canvasRef.current);
  const [secondCanvas, setSecondCanvas] = useState(secondCanvasRef.current);
  const [PW, setPW] = useState(0);
  const [PH, setPh] = useState(0);
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState("#FF0000");
  const [showColor, setShowColor] = useState(false);
  const [stroke, setStroke] = useState(5);
  const [tool, setTool] = useState("draw");
  const [isHovered, setIsHovered] = useState(false);
  const [drawTool, setDrawTool] = useState("rect");
  const [loaded, setLoaded] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [drawingShape, setDrawingShape] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [borderHoveredShapes, setBorderHoveredShapes] = useState([]);
  const [hoveringBorder, setHoveringBorder] = useState(false);
  const [innerHoveredShapes, setInnerrHoveredShapes] = useState([]);
  const [hoveringInner, setHoveringInner] = useState(false);
  const [splitedRectInnerCircle, setSplitedRectInnerCircle] = useState(false);
  const [editingSplit, setEditingSplit] = useState(false);
  function handleColorChange(newColor) {
    setColor(newColor.hex);
  }
  const replaceShape = (index, newShape) => {
    const newShapes = [...shapes]; // Create a copy of the original array
    newShapes.splice(index, 1, newShape); // Remove one element at the specified index and insert the new shape
    setShapes(newShapes); // Update the state with the new array
  };
  useEffect(() => {
    setCanvas(canvasRef.current);
    setSecondCanvas(secondCanvasRef.current);
  }, [canvasRef, canvasRef.current, secondCanvasRef, secondCanvasRef.current]);
  useEffect(() => {
    (async function () {
      // We import this here so that it's only loaded during client-side rendering.
      const pdfJS = await import("pdfjs-dist/build/pdf");
      pdfJS.GlobalWorkerOptions.workerSrc =
        window.location.origin + "/pdf.worker.min.js";
      const pdf = await pdfJS.getDocument(
        "https://www.cdc.gov/tobacco/basic_information/e-cigarettes/severe-lung-disease/healthcare-providers/pdfs/Lab-Clinical-Specimen-Collection-Storage-Guidance-Lung-Injury-508.pdf"
      ).promise;
      const page = await pdf.getPage(2);
      const viewport = page.getViewport({ scale });
      // Prepare canvas using PDF page dimensions.
      const canvas = pdfRef.current;
      const canvasContext = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      setPW(pdfRef.current.offsetWidth);
      setPh(pdfRef.current.offsetHeight);
      // Render PDF page into canvas context.
      const renderContext = { canvasContext, viewport };
      page.render(renderContext);
    })();
  }, [pdfRef, scale]);
  // redraw
  useEffect(() => {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapes(canvas, scale, shapes);
    }
  }, [scale, shapes]);
  const handleMouseDown = (e) => {
    const rect = canvas.getBoundingClientRect();
    if (tool == "draw") {
      setStartX((e.clientX - rect.left) / scale);
      setStartY((e.clientY - rect.top) / scale);
      setDrawing(true);
    }
    if (tool == "split" && hoveringInner) {
      let shape = shapes[innerHoveredShapes[0]];
      if (shape.shape == "rect" && !shape.splited) {
        shape.splited = true;
        shape.splitPoint.x = e.clientX - rect.left;
        shape.splitPoint.y = e.clientY - rect.top;
        replaceShape(innerHoveredShapes[0], shape);
      }
    }
    if (tool == "split" && splitedRectInnerCircle) {
      console.log("splits");
      setEditingSplit(true);
    }
  };
  const handleMouseMove = (e) => {
    const rect = secondCanvas.getBoundingClientRect();
    const ctx = secondCanvas.getContext("2d");
    const ctx2 = canvas.getContext("2d");
    if (tool == "draw" && drawing) {
      if (drawTool == "pen") {
        ctx.lineWidth = stroke;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx2.closePath();
        ctx.closePath();
        let newDrawing = [
          ...drawingShape,
          {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale,
          },
        ];
        setDrawingShape(newDrawing);
      } else {
        ctx.clearRect(0, 0, secondCanvas.width, secondCanvas.height);
        // drawShapes(canvas, scale, shapes);
        if (drawTool == "rect") {
          drawRect(
            secondCanvas,
            scale,
            startX,
            startY,
            (e.clientX - startX * scale - rect.left) / scale,
            (e.clientY - startY * scale - rect.top) / scale,
            color,
            stroke
          );
        }
        if (drawTool == "circle") {
          drawCircle(
            secondCanvas,
            scale,
            startX,
            startY,
            Math.sqrt(
              (e.clientX - startX * scale - rect.left) ** 2 +
                (e.clientY - startY * scale - rect.top) ** 2
            ) / scale,
            color,
            stroke
          );
        }
        if (drawTool == "line") {
          drawLine(
            secondCanvas,
            scale,
            startX,
            startY,
            (e.clientX - rect.left) / scale,
            (e.clientY - rect.top) / scale,
            color,
            stroke
          );
        }
      }
    }
    if (tool == "select" || tool == "split") {
      let detected = detectShapes(
        canvas,
        scale,
        shapes,
        e.clientX - rect.left,
        e.clientY - rect.top
      );
      setShapes(detected.shapes);
      setInnerrHoveredShapes(detected.hoveredShapes);
      setHoveringInner(detected.hoveringInner);
      setBorderHoveredShapes(detected.hoveredBorders);
      setHoveringBorder(detected.hoveringBorder);
      setSplitedRectInnerCircle(detected.splitedRectInnerCircle);
    }
    if (tool == "split" && editingSplit) {
      // continue here if w>h change only split.x and if e.clientX>x+w setSplitedRectInnerCircle(false)
      let shape = shapes[innerHoveredShapes[0]];
      shape.splitPoint.x = e.clientX - rect.left;
      shape.splitPoint.y = e.clientY - rect.top;
      replaceShape(innerHoveredShapes[0], shape);
    }
  };
  const handleMouseUp = (e) => {
    setDrawing(false);
    setEditingSplit(false);
    let newShape;
    const ctx = canvas.getContext("2d");
    const ctx2 = secondCanvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    if (tool == "draw") {
      if (drawTool == "pen") {
        newShape = {
          shape: "painting",
          coordinations: drawingShape,
          stroke,
          color,
        };
      }
      if (drawTool == "rect") {
        let x = startX;
        let y = startY;
        let w = (e.clientX - startX * scale - rect.left) / scale;
        let h = (e.clientY - startY * scale - rect.top) / scale;
        if (e.clientX - startX * scale - rect.left < 0) {
          x = startX + (e.clientX - startX * scale - rect.left);
          w = Math.abs((e.clientX - startX * scale - rect.left) / scale);
        }
        if (e.clientY - startY * scale - rect.top < 0) {
          y = startY + (e.clientY - startY * scale - rect.top);
          h = Math.abs(Math.abs(e.clientY - startY * scale - rect.top) / scale);
        }
        newShape = {
          shape: "rect",
          x: x,
          y: y,
          w: w,
          h: h,
          color,
          stroke,
          filled: false,
          borderHovered: false,
          innerHovered: false,
          innerColor: "",
          index: shapes.length,
          splited: false,
          splitPoint: { x: 0, y: 0 },
        };
      }
      if (drawTool == "circle") {
        newShape = {
          shape: "circle",
          x: startX,
          y: startY,
          r:
            Math.sqrt(
              (e.clientX - startX * scale - rect.left) ** 2 +
                (e.clientY - startY * scale - rect.top) ** 2
            ) / scale,
          color,
          stroke,
          filled: false,
          borderHovered: false,
          innerHovered: false,
          innerColor: "",
          index: shapes.length,
        };
      }
      if (drawTool == "line") {
        newShape = {
          shape: "line",
          x: startX,
          y: startY,
          xb: (e.clientX - rect.left) / scale,
          yb: (e.clientY - rect.top) / scale,
          color,
          stroke,
        };
      }
      ctx2.closePath();
      ctx.closePath();
      const newShapes = [...shapes, newShape]; // create new array with new shape added
      setShapes(newShapes);
      setStartX(0);
      setStartY(0);
      setDrawingShape([]);
      drawShapes(canvas, scale, [newShape]);
    }
  };
  console.log(shapes);
  return (
    <div className="w-full h-full border border-green-500 relative overflow-hidden">
      {/* toolbars */}
      {/* top tb */}
      {showColor && (
        <div
          className="absolute top-0 left-0 w-screen h-screen z-50"
          onClick={() => setShowColor(false)}
        />
      )}
      <div className="w-full h-[100px]">
        <div className="flex justify-center items-center h-[100px] gap-4 border border-gray-200">
          <button
            onClick={() => {
              if (scale == 0.5) {
                return;
              } else {
                setScale(scale - 0.5);
              }
            }}
          >
            <img
              width={32}
              height={32}
              src={`/images/zoomOut.png`}
              alt="zoomOut"
            />
          </button>
          <p className="w-[40px] bg-blue-200 overflow-hidden">{scale}</p>
          <button onClick={() => setScale(scale + 0.5)}>
            <img
              width={32}
              height={32}
              src={`/images/zoomIn.png`}
              alt="zoomIn"
            />
          </button>
          <div className="relative">
            <div
              className={`w-8 h-8 z-60 border border-black z-50`}
              style={{ background: color, borderRadius: 4, cursor: "pointer" }}
              onClick={() => setShowColor(true)}
            ></div>
            {showColor && (
              <SketchPicker
                color={color}
                onChange={handleColorChange}
                className="absolute top-8 left-8 z-50"
              />
            )}
          </div>
          <ToolIcon
            tool="select"
            drawTool={tool}
            setDrawTool={setTool}
            disable={false}
          />
          <ToolIcon
            tool="split"
            drawTool={tool}
            setDrawTool={setTool}
            disable={false}
          />
        </div>
      </div>
      {/* display area */}
      <div className="w-full h-[calc(100vh-100px)]">
        <div className="w-[100px] h-full top-[100px] absolute flex justify-start items-center gap-4 flex-col mt-4">
          <ToolIcon
            tool="circle"
            drawTool={drawTool}
            setDrawTool={setDrawTool}
            disable={false}
          />
          <ToolIcon
            tool="rect"
            drawTool={drawTool}
            setDrawTool={setDrawTool}
            disable={false}
          />
          <ToolIcon
            tool="pen"
            drawTool={drawTool}
            setDrawTool={setDrawTool}
            disable={false}
          />
          <ToolIcon
            tool="line"
            drawTool={drawTool}
            setDrawTool={setDrawTool}
            disable={false}
          />
        </div>
        <div className="relative w-[calc(100vw-100px)] h-full left-[100px] overflow-scroll">
          <canvas
            ref={pdfRef}
            className="absolute top-0 left-0 border-2 border-blue-500"
          />
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={(e) => handleMouseUp(e)}
            onLoad={() => setLoaded(!loaded)}
            onChange={() => setLoaded(!loaded)}
            width={PW}
            height={PH}
            className={`z-30 absolute top-0 left-0 ${
              splitedRectInnerCircle ? "cursor-move" : "cursor-default"
            }`}
          />
          <canvas
            ref={secondCanvasRef}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={(e) => handleMouseUp(e)}
            onLoad={() => setLoaded(!loaded)}
            onChange={() => setLoaded(!loaded)}
            width={PW}
            height={PH}
            className={`z-30 absolute top-0 left-0 bg-blue-200 opacity-20 ${
              splitedRectInnerCircle ? "cursor-move" : "cursor-default"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

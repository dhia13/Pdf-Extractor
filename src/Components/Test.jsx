import { useEffect, useRef, useState } from "react";
import ToolIcon from "./Components for uri pdf/ToolIcon";
import {
  drawRect,
  drawCircle,
  drawShapes,
} from "./Components for uri pdf/drawingTools";
import { SketchPicker } from "react-color";

export default function Step6() {
  const pdfRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(canvasRef.current);
  const [PW, setPW] = useState(0);
  const [PH, setPh] = useState(0);
  const [scale, setScale] = useState(1);
  const [color, setColor] = useState("#FF0000");
  const [showColor, setShowColor] = useState(false);
  const [stroke, setStroke] = useState(5);
  const [tool, setTool] = useState("draw");
  const [drawTool, setDrawTool] = useState("rect");
  const [drawing, setDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [shapes, setShapes] = useState([]);
  function handleColorChange(newColor) {
    setColor(newColor.hex);
    setShowColor(false);
  }
  useEffect(() => {
    setCanvas(canvasRef.current);
  }, [canvasRef, canvasRef.current]);
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
  useEffect(() => {
    console.log("you say run");
    if (canvas && canvas.current) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapes(canvas, scale, shapes);
    }
  }, [shapes, scale, canvas]);
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (tool == "draw") {
      setStartX((e.clientX - rect.left) / scale);
      setStartY((e.clientY - rect.top) / scale);
      setDrawing(true);
    }
    if (tool == "test") {
      console.log("hello");
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 10, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (tool == "draw" && drawing) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapes(canvas, scale, shapes);
      if (drawTool == "rect") {
        drawRect(
          canvas,
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
          canvas,
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
    }
  };
  const handleMouseUp = (e) => {
    setDrawing(false);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (tool == "draw") {
      let newShape;
      if (drawTool == "rect") {
        newShape = {
          shape: "rect",
          x: startX,
          y: startY,
          w: (e.clientX - startX * scale - rect.left) / scale,
          h: (e.clientY - startY * scale - rect.top) / scale,
          color,
          stroke,
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
        };
      }
      const newShapes = [...shapes, newShape]; // create new array with new shape added
      setShapes(newShapes);
      setStartX(0);
      setStartY(0);
    }
  };
  return (
    <div className="w-full h-full border border-green-500 relative overflow-hidden">
      {/* toolbars */}
      {/* top tb */}
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
            -
          </button>
          <p className="w-[40px] bg-blue-200 overflow-hidden">{scale}</p>
          <button onClick={() => setScale(scale + 0.5)}>+</button>
          <div className="relative">
            <div
              className={`w-8 h-8 z-60 bg-[#FF0000] border border-black`}
              onClick={() => setShowColor(true)}
            ></div>
            {showColor && (
              <SketchPicker
                color={color}
                onChange={handleColorChange}
                className="absolute top-0 left-0 z-50"
              />
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-[calc(100vh-100px)]">
        <div className="w-[100px] h-full top-[100px] absolute bg-blue-700">
          <ToolIcon
            tool="circle"
            drawTool={drawTool}
            setDrawTool={setDrawTool}
          />
          <ToolIcon tool="rect" drawTool={drawTool} setDrawTool={setDrawTool} />
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
            width={PW}
            height={PH}
            className={`z-40 absolute top-0 left-0`}
          />
        </div>
      </div>
      {/* display area */}
    </div>
  );
}

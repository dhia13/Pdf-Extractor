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
  const [opacity, setOpacity] = useState(1);
  const [tool, setTool] = useState("draw");
  const [drawTool, setDrawTool] = useState("rect");
  const [drawing, setDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [shapes, setShapes] = useState([]);
  const [borderHoveredShapes, setBorderHoveredShapes] = useState([]);
  const [hoveringBorder, setHoveringBorder] = useState(false);
  const [innerHoveredShapes, setInnerrHoveredShapes] = useState([]);
  const [hoveringInner, setHoveringInner] = useState(false);
  const [splitedRectInnerCircle, setSplitedRectInnerCircle] = useState(false);
  const [editingSplit, setEditingSplit] = useState(false);
  const [moving, setMoving] = useState(false);
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
    if (tool == "delete" && hoveringInner) {
      console.log({ shapes, innerHoveredShapes });
      let shape = shapes[innerHoveredShapes[0]];
      if (shape.shape == "rect") {
        const newShapes = [...shapes]; // Create a copy of the original array
        newShapes.splice(innerHoveredShapes[0], 1); // Remove one element at the specified index and insert the new shape
        setShapes(newShapes);
      }
    }
    if (tool == "split" && splitedRectInnerCircle) {
      setEditingSplit(true);
    }
    if (tool == "move" && hoveringBorder) {
      setMoving(true);
      setStartX((e.clientX - rect.left) / scale);
      setStartY((e.clientY - rect.top) / scale);
    }
  };
  const handleMouseMove = (e) => {
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
      if (drawTool == "line") {
        drawLine(
          canvas,
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
    if (tool == "move" || tool == "split" || tool == "delete") {
      if (!moving) {
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
    }
    if (tool == "split" && editingSplit) {
      let shape = shapes[innerHoveredShapes[0]];
      if (shape) {
        if (
          shape.w > shape.h &&
          (e.clientX - rect.left > shape.x ||
            e.clientX - rect.left < shape.x + shape.w)
        ) {
          shape.splitPoint.x = e.clientX - rect.left;
        }
        if (
          shape.h > shape.w &&
          (e.clientY - rect.top > shape.y ||
            e.clientY - rect.top < shape.y + shape.h)
        ) {
          shape.splitPoint.y = e.clientY - rect.top;
        }
        replaceShape(innerHoveredShapes[0], shape);
      }
    }
    if (tool == "move" && moving) {
      console.log("move shape");
      let shape = shapes[borderHoveredShapes[0]];
      if (shape) {
        shape.x = e.clientX - rect.left;
        shape.y = e.clientY - rect.top;
        replaceShape(innerHoveredShapes[0], shape);
      }
    }
  };
  const handleMouseUp = (e) => {
    setDrawing(false);
    setEditingSplit(false);
    setMoving(false);
    let newShape;
    const rect = canvas.getBoundingClientRect();
    if (tool == "draw") {
      if (drawTool == "rect") {
        let x = startX;
        let y = startY;
        let w = (e.clientX - startX * scale - rect.left) / scale;
        let h = (e.clientY - startY * scale - rect.top) / scale;
        if (e.clientX - startX * scale - rect.left < 0) {
          x = startX + (e.clientX - startX * scale - rect.left) / scale;
          w = Math.abs((e.clientX - startX * scale - rect.left) / scale);
        }
        if (e.clientY - startY * scale - rect.top < 0) {
          y = startY + (e.clientY - startY * scale - rect.top) / scale;
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
        const newShapes = [...shapes, newShape]; // create new array with new shape added
        setShapes(newShapes);
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
        const newShapes = [...shapes, newShape]; // create new array with new shape added
        setShapes(newShapes);
        drawShapes(canvas, scale, [newShape]);
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
        const newShapes = [...shapes, newShape]; // create new array with new shape added
        setShapes(newShapes);
        drawShapes(canvas, scale, [newShape]);
      }
      setStartX(0);
      setStartY(0);
    }
  };
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
          <div className="flex justify-center items-center gap-2">
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
            <p
              className="w-[40px] bg-blue-200 overflow-hidden"
              title="scale" // added scale attribute to display tooltip
            >
              {scale}
            </p>
            <button onClick={() => setScale(scale + 0.5)}>
              <img
                width={32}
                height={32}
                src={`/images/zoomIn.png`}
                alt="zoomIn"
              />
            </button>
          </div>
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => {
                if (opacity <= 0.1) {
                  return;
                } else {
                  setOpacity(Math.max(opacity - 0.1, 0.1));
                }
              }}
            >
              <img
                width={28}
                height={28}
                src={`/images/minus.png`}
                alt="minus"
              />
            </button>
            <input
              type="number"
              value={opacity === 0 ? 0 : opacity === 1 ? 1 : opacity.toFixed(1)}
              className="w-[40px] h-[28px] rounded-sm outline-none"
              max={1}
              min={0.1}
              step={0.1}
              title="Opacity" // added title attribute to display tooltip
              onChange={(e) => {
                let value = parseFloat(e.target.value);
                if (value < 0.1) {
                  value = 0.1;
                } else if (value > 1) {
                  value = 1;
                }
                setOpacity(value);
              }}
            />
            <button
              onClick={() => {
                if (opacity >= 1) {
                  return;
                } else {
                  setOpacity(Math.min(opacity + 0.1, 1));
                }
              }}
            >
              <img width={28} height={28} src={`/images/plus.png`} alt="plus" />
            </button>
          </div>
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => {
                if (stroke == 0.5) {
                  return;
                } else {
                  setStroke(stroke - 1);
                }
              }}
            >
              <img
                width={28}
                height={28}
                src={`/images/minus.png`}
                alt="minus"
              />
            </button>
            <input
              type="number"
              title="stroke" // added stroke attribute to display tooltip
              value={stroke}
              className="w-[40px] h-[28px] rounded-sm outline-none"
              onChange={(e) => setStroke(e.target.value)}
            />
            <button onClick={() => setStroke(stroke + 1)}>
              <img width={28} height={28} src={`/images/plus.png`} alt="plus" />
            </button>
          </div>
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
            tool="move"
            drawTool={tool}
            setDrawTool={(tool) => {
              setDrawTool(""), setTool(tool);
            }}
            disable={false}
          />
          <ToolIcon
            tool="split"
            drawTool={tool}
            setDrawTool={(tool) => {
              setDrawTool(""), setTool(tool);
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
      </div>
      {/* display area */}
      <div className="w-full h-[calc(100vh-100px)]">
        <div className="w-[100px] h-full top-[100px] absolute flex justify-start items-center gap-4 flex-col mt-4">
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
            drawTool={(tool) => {
              setDrawTool(tool), setTool("draw");
            }}
            setDrawTool={setDrawTool}
            disable={false}
          />
        </div>
        <div className="relative w-[calc(100vw-100px)] h-full left-[100px] overflow-scroll">
          <canvas
            ref={pdfRef}
            className="absolute top-0 left-0 border-2 border-blue-500"
            scale={scale}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={(e) => handleMouseUp(e)}
            width={PW}
            height={PH}
            className={`z-30 absolute top-0 left-0 ${
              splitedRectInnerCircle && "cursor-col-resize"
            }
            ${hoveringBorder && tool == "move" && "cursor-move"}
            ${hoveringInner && tool == "delete" && "cursor-delete"}
            ${tool == "erace" && "cursor-erace"}
            `}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
}

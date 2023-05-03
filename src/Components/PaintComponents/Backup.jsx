import { useEffect, useRef, useState } from "react";
import ToolIcon from "./PaintComponents/ToolIcon";
import {
  drawRect,
  drawCircle,
  renderShapes,
  drawLine,
  detectShapes,
  detectRect,
  drawText,
} from "./PaintComponents/drawingTools";
import {
  SketchPicker,
  PhotoshopPicker,
  AlphaPicker,
  BlockPicker,
  CompactPicker,
} from "react-color";
import InputSlider from "./PaintComponents/Slider";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Image from "next/image";
import { Document, Page, pdfjs } from "react-pdf";
import jsPDF from "jspdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
export default function Paint({
  pdfDoc,
  pageNumber,
  setActiveStep,
  setSketchInfo,
  sketchInfo,
}) {
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
  const pdfRef = useRef(null);
  const paintingsRef = useRef(null);
  const plansRef = useRef(null);
  const drawingRef = useRef(null);
  const [paintingsCanvas, setPaintingsCanvas] = useState(paintingsRef.current);
  const [paintings, setPaintings] = useState(
    sketchInfo.pages[pageNumber - 1].sketches.paintings
  );
  const [plansCanvas, setPlansCanvas] = useState(plansRef.current);
  const [plans, setPlans] = useState(
    sketchInfo.pages[pageNumber - 1].sketches.plans
  );
  const [fontSize, setFontSize] = useState(16);
  const [drawingCanvas, setDrawingCanvas] = useState(drawingRef.current);
  const [PW, setPW] = useState(0);
  const [PH, setPh] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [color, setColor] = useState("#000000");
  const [showColor, setShowColor] = useState(false);
  const [stroke, setStroke] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [tool, setTool] = useState("draw");
  const [drawTool, setDrawTool] = useState("plan");
  const [drawing, setDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [hoveredPlanBorders, setHoveredPlanBorders] = useState([]);
  const [hoveringPlanBorder, setHoveringPlanBorder] = useState(false);
  const [hoveredPlans, setHoveredPlans] = useState([]);
  const [hoveringPlan, setHoveringPlan] = useState(false);
  const [moving, setMoving] = useState(false);
  const [planEditHover, setPlanEditHover] = useState(false);
  const [splitDirectionVertical, setSplitDirectionVertical] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadPaintings, setLoadPaintings] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [inputAdded, setInputAdded] = useState(false);
  // sliders
  const [opacitySlider, setOpacitySlider] = useState(false);
  const [zoomSlider, setZoomSlider] = useState(false);
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };
  const replaceElementInArray = (index, newShape, type) => {
    if (type == "plan") {
      const newPlans = [...plans]; // Create a copy of the original array
      newPlans.splice(index, 1, newShape); // Remove one element at the specified index and insert the new shape
      setPlans(newPlans); // Update the state with the new array
    }
    if (type == "painting") {
      const newPaintings = [...paintings]; // Create a copy of the original array
      newPaintings.splice(index, 1, newShape); // Remove one element at the specified index and insert the new shape
      setPaintings(newPaintings); // Update the state with the new array
    }
  };
  useEffect(() => {
    setPaintingsCanvas(paintingsRef.current);
    setPlansCanvas(plansRef.current);
    setDrawingCanvas(drawingRef.current);
  }, [drawingRef, plansRef, paintingsRef]);
  useEffect(() => {
    if (pdfRef) {
      const el = pdfRef.current;
      if (el) {
        const w = el.offsetWidth;
        setPW(w);
        const h = el.offsetHeight;
        setPh(h);
      }
    }
  }, [pdfRef, loaded, scale]);
  useEffect(() => {
    if (paintings && plansCanvas) {
      let ctx = paintingsCanvas.getContext("2d");
      ctx.clearRect(0, 0, paintingsCanvas.width, paintingsCanvas.height);
      ctx = plansCanvas.getContext("2d");
      ctx.clearRect(0, 0, plansCanvas.width, plansCanvas.height);
      setTimeout(() => {
        if (paintingsCanvas) {
          renderShapes(paintingsCanvas, scale, paintings);
        }
        if (plansCanvas) {
          renderShapes(plansCanvas, scale, plans);
        }
      }, 0);
    }
  }, [scale, loaded]);
  useEffect(() => {
    if (plansCanvas) {
      const ctx = plansCanvas.getContext("2d");
      ctx.clearRect(0, 0, plansCanvas.width, plansCanvas.height);
      setTimeout(() => {
        renderShapes(plansCanvas, scale, plans);
      }, 20);
    }
  }, [loaded, loadingPlans]);
  useEffect(() => {
    if (plansCanvas) {
      const ctx = plansCanvas.getContext("2d");
      ctx.clearRect(0, 0, plansCanvas.width, plansCanvas.height);
      renderShapes(plansCanvas, scale, plans);
    }
  }, [plans]);
  useEffect(() => {
    if (paintingsCanvas) {
      setTimeout(() => {
        renderShapes(paintingsCanvas, scale, paintings);
      }, 20);
    }
  }, [loadPaintings, paintingsCanvas, loaded]);
  const handleMouseDown = (e) => {
    const rect = paintingsCanvas.getBoundingClientRect();
    let mouseX = (e.clientX - rect.left) / scale;
    let mouseY = (e.clientY - rect.top) / scale;
    if (tool === "draw") {
      setStartX(mouseX);
      setStartY(mouseY);
      if (drawTool === "text" && !inputAdded) {
        const input = document.createElement("input");
        input.style.position = "absolute";
        input.style.top = `${mouseY * scale + 85}px`;
        input.style.left = `${mouseX * scale + 80}px`;
        input.style.zIndex = 100;
        input.style.outline = "none";
        input.style.backgroundColor = "transparent";
        input.style.fontSize = `${scale * 16}px`;
        input.style.color = color;
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const text = input.value;
            if (text !== "") {
              drawText(
                paintingsCanvas,
                scale,
                mouseX,
                mouseY,
                text,
                fontSize,
                color,
                1
              );
            }
            let newPainting = {
              shape: "text",
              x: startX,
              y: startY,
              text,
              fontSize,
              color,
              opacity,
            };
            let newPaintings = [...paintings, newPainting]; // create new array with new shape added
            setPaintings(newPaintings);
            try {
              input.remove();
            } catch (error) {
              console.log("Error removing input:", error);
            }
            setInputAdded(false);
          } else if (e.key === "Escape") {
            try {
              input.remove();
            } catch (error) {
              console.log("Error removing input:", error);
            }
            setInputAdded(false);
          }
        });
        input.addEventListener("blur", () => {
          // submit form
          if (input && input.parentNode === document.body) {
            const text = input.value;
            if (text !== "") {
              drawText(
                paintingsCanvas,
                scale,
                mouseX,
                mouseY,
                text,
                fontSize,
                color,
                opacity
              );
              let newPainting = {
                shape: "text",
                x: startX,
                y: startY,
                text,
                fontSize,
                color,
                opacity,
              };
              let newPaintings = [...paintings, newPainting]; // create new array with new shape added
              setPaintings(newPaintings);
            }
            try {
              input.remove();
            } catch (error) {
              console.log("Error removing input:", error);
            }
            setInputAdded(false);
          }
        });
        document.body.appendChild(input);
        setTimeout(() => {
          input.focus();
        }, 0);
        setInputAdded(true);
      } else if (drawTool == "plan" && hoveringPlan) {
        let plan = plans[hoveredPlans[0]];
        if (plan.shape == "plan" && !plan.splited) {
          plan.splited = true;
          plan.splitPoint.x = mouseX;
          plan.splitPoint.y = mouseY;
          replaceElementInArray(hoveredPlans[0], plan, "plan");
        }
      } else {
        if (drawTool == "pen") {
          let painting = {
            shape: "painting",
            coordinations: [
              {
                x: (e.clientX - rect.left) / scale,
                y: (e.clientY - rect.top) / scale,
              },
            ],
            stroke,
            color,
            lineCap: "round",
            opacity,
          };
          let newPaintings = [...paintings, painting]; // create new array with new shape added
          setPaintings(newPaintings);
        }
        setDrawing(true);
      }
    }
    if (tool == "delete" && hoveringPlan) {
      let plan = plans[hoveredPlans[0]];
      if (plan.shape == "plan") {
        const newPlans = [...plans]; // Create a copy of the original array
        newPlans.splice(hoveredPlans[0], 1); // Remove one element at the specified index and insert the new shape
        setPlans(newPlans);
      }
    }
    if (drawTool == "fill" && hoveringPlan) {
      let plan = plans[hoveredPlans[0]];
      if (plan.splited) {
        const subPlan = detectRect(mouseX, mouseY, plan);
        if (subPlan == 1) {
          plan.subColors.color1 = color;
        } else {
          plan.subColors.color2 = color;
        }
      } else {
        plan.filled = true;
        plan.fillColor = color;
      }
      replaceElementInArray(hoveredPlans[0], plan, "plan");
    }
    if (drawTool == "plan" && planEditHover) {
      setEditPlan(true);
      setDrawing(false);
    }
    if (tool == "move" && hoveringPlanBorder) {
      setMoving(true);
      setStartX(mouseX);
      setStartY(mouseY);
    }
  };
  const handleMouseMove = (e) => {
    const rect = drawingCanvas.getBoundingClientRect();
    let ctx = drawingCanvas.getContext("2d");
    //draw
    if (tool == "draw" && drawing) {
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      if (drawTool == "pen") {
        let painting = paintings[paintings.length - 1];
        ctx = paintingsCanvas.getContext("2d");
        ctx.globalAlpha = opacity;
        ctx.lineWidth = stroke;
        ctx.lineCap = "round";
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.closePath();

        let newCoordinations = [
          ...painting.coordinations,
          {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale,
          },
        ];
        painting.coordinations = newCoordinations;
        replaceElementInArray(-1, painting, "painting");
      }
      if (drawTool == "rect" || drawTool == "plan") {
        drawRect(
          drawingCanvas,
          scale,
          startX,
          startY,
          (e.clientX - startX * scale - rect.left) / scale,
          (e.clientY - startY * scale - rect.top) / scale,
          color,
          opacity,
          stroke
        );
      }
      if (drawTool == "circle") {
        drawCircle(
          drawingCanvas,
          scale,
          startX,
          startY,
          Math.sqrt(
            (e.clientX / scale - startX - rect.left / scale) ** 2 +
              (e.clientY / scale - startY - rect.top / scale) ** 2
          ),
          color,
          stroke
        );
      }
      if (drawTool == "line") {
        drawLine(
          drawingCanvas,
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
    // detect
    if (
      tool == "move" ||
      drawTool == "plan" ||
      tool == "delete" ||
      drawTool == "fill"
    ) {
      if (!moving) {
        let detected = detectShapes(
          scale,
          plans,
          e.clientX - rect.left,
          e.clientY - rect.top
        );
        setPlans(detected.plans);
        setHoveredPlans(detected.hoveredPlans);
        setHoveringPlan(detected.hoveringPlan);
        setHoveredPlanBorders(detected.hoveredBorders);
        setHoveringPlanBorder(detected.hoveringBorder);
        setPlanEditHover(detected.planEditHover);
        if (detected.hoveredPlans.length > 0) {
          // console.log({circle:detected.planEditHover,plan:detected.hoveredPlans})
          if (
            plans[detected.hoveredPlans[0]].h >
            plans[detected.hoveredPlans[0]].w
          ) {
            setSplitDirectionVertical(false);
          } else {
            setSplitDirectionVertical(true);
          }
        }
      }
    }
    // edit plan
    if (drawTool == "plan" && editPlan) {
      let plan = plans[hoveredPlans[0]];
      if (plan) {
        if (
          plan.w > plan.h &&
          (e.clientX - rect.left > plan.x ||
            e.clientX - rect.left < plan.x + plan.w)
        ) {
          plan.splitPoint.x = (e.clientX - rect.left) / scale;
        }
        if (
          plan.h > plan.w &&
          (e.clientY - rect.top > plan.y ||
            e.clientY - rect.top < plan.y + plan.h)
        ) {
          plan.splitPoint.y = (e.clientY - rect.top) / scale;
        }
        replaceElementInArray(hoveredPlans[0], plan, "plan");
      }
    }
    // move plan
    if (tool == "move" && moving) {
      let plan = plans[hoveredPlanBorders[0]];
      if (plan) {
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        plan.x += x - startX;
        plan.y += y - startY;
        setStartX(x);
        setStartY(y);
        if (plan.splited) {
          plan.splitPoint.x += x - startX;
          plan.splitPoint.y += y - startY;
        }
        replaceElementInArray(hoveredPlans[0], plan, "plan");
      }
    }
  };
  const handleMouseUp = (e) => {
    setDrawing(false);
    setMoving(false);
    setEditPlan(false);
    let newPainting;
    let newPlan;
    let newPaintings;
    let newPlans;
    const rect = drawingCanvas.getBoundingClientRect();
    let ctx = drawingCanvas.getContext("2d");
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    if (drawing) {
      switch (drawTool) {
        case "rect":
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
            h = Math.abs(
              Math.abs(e.clientY - startY * scale - rect.top) / scale
            );
          }
          newPainting = {
            shape: "rect",
            x: x,
            y: y,
            w: w,
            h: h,
            color,
            opacity,
            stroke,
            filled: false,
            fillColor: "",
            borderHovered: false,
            innerHovered: false,
            innerColor: "",
            index: paintings.length,
          };
          newPaintings = [...paintings, newPainting]; // create new array with new shape added
          setPaintings(newPaintings);
          drawRect(paintingsCanvas, scale, x, y, w, h, color, opacity, stroke);
          break;
        case "circle":
          newPainting = {
            shape: "circle",
            x: startX,
            y: startY,
            r:
              Math.sqrt(
                (e.clientX - startX * scale - rect.left) ** 2 +
                  (e.clientY - startY * scale - rect.top) ** 2
              ) / scale,
            color,
            opacity,
            stroke,
            filled: false,
            fillColor: "",
            index: paintings.length,
          };
          newPaintings = [...paintings, newPainting]; // create new array with new shape added
          setPaintings(newPaintings);
          drawCircle(
            paintingsCanvas,
            scale,
            newPainting.x,
            newPainting.y,
            newPainting.r,
            color,
            stroke
          );
          break;
        case "line":
          newPainting = {
            shape: "line",
            x: startX,
            y: startY,
            xb: (e.clientX - rect.left) / scale,
            yb: (e.clientY - rect.top) / scale,
            color,
            opacity,
            stroke,
          };
          newPaintings = [...paintings, newPainting]; // create new array with new shape added
          setPaintings(newPaintings);
          drawLine(
            paintingsCanvas,
            scale,
            newPainting.x,
            newPainting.y,
            newPainting.xb,
            newPainting.yb,
            color,
            stroke
          );
          break;
        case "plan":
          if (!hoveringPlan && drawing) {
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
              h = Math.abs(
                Math.abs(e.clientY - startY * scale - rect.top) / scale
              );
            }
            newPlan = {
              shape: "plan",
              x: x,
              y: y,
              w: w,
              h: h,
              color,
              opacity,
              stroke,
              filled: false,
              fillColor: "",
              borderHovered: false,
              hovered: false,
              fillColor: "",
              index: plans.length,
              splited: false,
              splitPoint: { x: 0, y: 0 },
              subColors: {
                color1: "#78f178",
                color2: "#ec4444",
              },
            };
            newPlans = [...plans, newPlan]; // create new array with new shape added
            setPlans(newPlans);
          }
          break;
        case "pen":
          ctx = paintingsCanvas.getContext("2d");
          ctx.beginPath();
        default:
          break;
      }
    }
  };
  const handleMouseLeave = (e) => {
    setDrawing(false);
    setMoving(false);
    setEditPlan(false);
    let newPainting;
    let newPlan;
    let newPaintings;
    let newPlans;
    const rect = drawingCanvas.getBoundingClientRect();
    let ctx = drawingCanvas.getContext("2d");
    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    if (drawing) {
      switch (drawTool) {
        case "rect":
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
            h = Math.abs(
              Math.abs(e.clientY - startY * scale - rect.top) / scale
            );
          }
          newPainting = {
            shape: "rect",
            x: x,
            y: y,
            w: w,
            h: h,
            color,
            opacity,
            stroke,
            filled: false,
            fillColor: "",
            borderHovered: false,
            innerHovered: false,
            innerColor: "",
            index: paintings.length,
          };
          newPaintings = [...paintings, newPainting]; // create new array with new shape added
          setPaintings(newPaintings);
          drawRect(paintingsCanvas, scale, x, y, w, h, color, opacity, stroke);
          break;
        case "circle":
          newPainting = {
            shape: "circle",
            x: startX,
            y: startY,
            r:
              Math.sqrt(
                (e.clientX - startX * scale - rect.left) ** 2 +
                  (e.clientY - startY * scale - rect.top) ** 2
              ) / scale,
            color,
            opacity,
            stroke,
            filled: false,
            fillColor: "",
            index: paintings.length,
          };
          newPaintings = [...paintings, newPainting]; // create new array with new shape added
          setPaintings(newPaintings);
          drawCircle(
            paintingsCanvas,
            scale,
            newPainting.x,
            newPainting.y,
            newPainting.r,
            color,
            stroke
          );
          break;
        case "line":
          newPainting = {
            shape: "line",
            x: startX,
            y: startY,
            xb: (e.clientX - rect.left) / scale,
            yb: (e.clientY - rect.top) / scale,
            color,
            opacity,
            stroke,
          };
          newPaintings = [...paintings, newPainting]; // create new array with new shape added
          setPaintings(newPaintings);
          drawLine(
            paintingsCanvas,
            scale,
            newPainting.x,
            newPainting.y,
            newPainting.xb,
            newPainting.yb,
            color,
            stroke
          );
          break;
        case "plan":
          if (!hoveringPlan && drawing) {
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
              h = Math.abs(
                Math.abs(e.clientY - startY * scale - rect.top) / scale
              );
            }
            newPlan = {
              shape: "plan",
              x: x,
              y: y,
              w: w,
              h: h,
              color,
              opacity,
              stroke,
              filled: false,
              fillColor: "",
              borderHovered: false,
              hovered: false,
              fillColor: "",
              index: plans.length,
              splited: false,
              splitPoint: { x: 0, y: 0 },
              subColors: {
                color1: "#78f178",
                color2: "#ec4444",
              },
            };
            newPlans = [...plans, newPlan]; // create new array with new shape added
            setPlans(newPlans);
          }
          break;
        case "pen":
          ctx = paintingsCanvas.getContext("2d");
          ctx.beginPath();
        default:
          break;
      }
    }
  };
  const handleSave = () => {
    let pages = sketchInfo.pages;
    let newPage = sketchInfo.pages[pageNumber - 1];
    newPage.edited = true;
    pages[pageNumber - 1] = newPage;
    sketchInfo.pages[pageNumber - 1].sketches = { plans, paintings };
    console.log(sketchInfo);
    setSketchInfo(sketchInfo);
  };
  const exportPdfPage = () => {
    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = 595;
    mergedCanvas.height = 842;

    const mergedCtx = mergedCanvas.getContext("2d");

    // draw pdf page
    mergedCtx.drawImage(pdfRef.current.querySelector("canvas"), 0, 0, 595, 842);

    // draw paintings
    mergedCtx.drawImage(paintingsRef.current, 0, 0, 595, 842);

    // draw plans
    mergedCtx.drawImage(plansRef.current, 0, 0, 595, 842);

    // export merged canvas as pdf
    const pdf = new jsPDF();
    pdf.addImage(mergedCanvas.toDataURL("image/jpeg"), "JPEG", 0, 0, 595, 842);
    pdf.save("merged.pdf");
  };
  return (
    <div className="w-full h-full border border-green-500 relative overflow-hidden">
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
      {/* toolbars */}
      <div className="w-full h-[110px] flex bg-[#62BBC1] text-black">
        <div className="w-[80px] h-[110px] justify-center items-center flex">
          <img
            src="/images/back.png"
            alt="back"
            width="32px"
            height="32px"
            onClick={() => {
              setActiveStep(4);
            }}
            className="cursor-pointer"
          />
        </div>
        <div className="flex justify-start items-center h-[110px] gap-4 border-b border-gray-400 w-[calc(100%-100px)]">
          <ToolIcon
            tool="save"
            drawTool={tool}
            setDrawTool={handleSave}
            disable={false}
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
              className="w-[58px] h-[26px] rounded-md pl-2 text-black"
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
              className="w-[58px] h-[26px] rounded-md pl-2 text-black"
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
      </div>
      <div className="w-full h-[calc(100vh-110px)]">
        {/* side bar tools*/}
        <div className="w-[80px] h-full top-[110px] absolute flex justify-start items-center gap-4 flex-col pt-2 border-r border-gray-400 bg-[#62BBC1]">
          <ToolIcon
            tool="move"
            drawTool={tool}
            setDrawTool={(tool) => {
              setDrawTool(""), setTool(tool);
            }}
            disable={false}
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
        {/* display area */}
        <div className="relative w-[calc(100vw-80px)] h-full left-[80px] overflow-auto bg-gray-200">
          <Document
            file={file}
            className="absolute top-0 left-0 overflow-hidden"
            width={595}
            height={842}
          >
            <Page
              pageNumber={pageNumber}
              canvasRef={pdfRef}
              renderAnnotationLayer={false}
              onLoadSuccess={() => setLoaded(!loaded)}
              scale={scale}
            />
          </Document>
          {/* drawing canvas for animation  */}
          <canvas
            ref={drawingRef}
            width={PW}
            height={PH}
            className={`z-30 absolute top-0 left-0 border-[#EC058E] border`}
            scale={scale}
          />
          {/* paintings canvas */}
          <canvas
            ref={paintingsRef}
            width={PW}
            height={PH}
            onLoad={() => setLoadPaintings(!loadPaintings)}
            className={`z-30 absolute top-0 left-0 `}
            scale={scale}
          />
          {/* plans canvas */}
          <canvas
            ref={plansRef}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={(e) => handleMouseUp(e)}
            onMouseLeave={(e) => handleMouseLeave(e)}
            onLoad={() => setLoadingPlans(!loadingPlans)}
            width={PW}
            scale={scale}
            height={PH}
            className={`z-30 absolute top-0 left-0  ${
              planEditHover && "cursor-col-resize"
            }
            				${
                      drawTool == "fill" && hoveringPlan
                        ? "cursor-fillA"
                        : drawTool == "fill"
                        ? "cursor-fill"
                        : ""
                    }
							${
                drawTool == "plan" &&
                (hoveringPlan
                  ? splitDirectionVertical
                    ? planEditHover
                      ? "cursor-splitHA"
                      : "cursor-splitH"
                    : planEditHover
                    ? "cursor-splitVA"
                    : "cursor-splitV"
                  : drawing
                  ? "cursor-planA"
                  : "cursor-plan")
              }
							${hoveringPlanBorder && tool == "move" && "cursor-move"}
							${hoveringPlan && tool == "delete" && "cursor-delete"}
							${tool == "erace" && "cursor-erace"}
							${drawTool == "pen" && "cursor-pen"}
			`}
          />
        </div>
      </div>
    </div>
  );
}

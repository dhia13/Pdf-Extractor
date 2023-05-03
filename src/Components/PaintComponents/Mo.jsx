import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";
import { RiPencilRulerLine, RiInformationLine } from "react-icons/ri";
import { FaPencilRuler } from "react-icons/fa";
import { ImPencil2 } from "react-icons/im";
import {
  MdUndo,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdOutlineDelete,
  MdFileDownloadDone,
  MdClose,
} from "react-icons/md";
import { ImPencil } from "react-icons/im";
import { BsDashLg, BsArrowsCollapse } from "react-icons/bs";

import moment from "moment";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// import "react-input-range/lib/css/index.css";
// import zIndex from "@mui/material/styles/zIndex";
export default function PdfModifier({
  url,
  setCurrentStep,
  pdfPage,
  taskModelData,
  setOpen,
  setShapes,
  shapes,
  handleDispatch,
}) {
  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(0);
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);
  const [scale, setScale] = useState(1);
  const [draw, setDraw] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawFinish, setDrawFinish] = useState(false);
  const [currentTool, setCurrentTool] = useState("rectangle");
  const [splitTool, setSplitTool] = useState(false);
  const [verify, setVerify] = useState(false);
  const [PH, setPH] = useState(0);
  const [PW, setPW] = useState(0);
  const drawCanvas = useRef();
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [overlayCanvas, setOverlayCanvas] = useState(null);
  useEffect(() => {
    if (canvasRef && drawCanvas) {
      setCanvas(canvasRef.current);
      setOverlayCanvas(drawCanvas.current);
    }
  }, [canvasRef, drawCanvas]);
  useEffect(() => {
    if (canvas && canvas.clientHeight) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      console.log(`Width: ${width}px, Height: ${height}px`);
      setPH(heigh * scale);
      setPW(width * scale);
    }
  }, []);
  const SetDate = (val) => {
    const d = moment.utc(val).format("MM/DD/YY");
    if (d == "Invalid date") {
      return "N/A";
    } else {
      return d;
    }
  };
  useEffect(() => {
    if (canvas) {
      let drawCtx = canvas.getContext("2d");
      drawCtx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((shape) => {
        shape.draw(canvasRef.current, scale);
      });
    }
  }, [shapes, scale]);
  const handleMouseDown = (event) => {
    console.log("non ");
    const canvas = drawCanvas.current;
    const rect = canvas.getBoundingClientRect();
    if (draw) {
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;
      setX1(x);
      setY1(y);
      setDrawing(true);
    }
  };
  const handleMouseMove = (event) => {
    if (draw && drawing) {
      const canvas = drawCanvas.current;
      const rect = canvas.getBoundingClientRect();
      const currentX = (event.clientX - rect.left) / scaleX;
      const currentY = (event.clientY - rect.top) / scaleY;
      let plan = new Plan(x1, y1, x1 - currentX, y1 - currentY);
      plan.draw(canvas, scale);
      setDrawFinish(true);
      setDrawFinish(true);
    }
    if (splitTool) {
      console.log("split mouse down");
    }
  };
  const handleMouseUp = (event) => {
    let DrawingCtx = canvasRef.current.getContext("2d");
    const rect = DrawingCtx.getBoundingClientRect();
    let currentX = (e.clientX - rect.left) / scale;
    let currentY = (e.clientY - rect.top) / scale;
    if (draw && drawing) {
      setDrawing(false);
      let newShapes;
      if (currentTool === "rectangle" && drawFinish) {
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
      }
    }
  };

  const undo = () => {
    // Remove the last shape from the shapes array
    const lastShape = shapes.pop();
    // Clear the canvas
    // const canvas = canvasRef.current;
    const canvas = drawCanvas.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all the shapes that are still in the shapes array
    for (const shape of shapes) {
      // Draw the rectangle
      const width = shape?.p2.x - shape?.p1.x;
      const height = shape?.p2.y - shape?.p1.y;
      // ctx.fillStyle = "rgba(12, 188, 139, 0.4)";
      ctx.strokeStyle = shape?.color;
      ctx.lineWidth = 3;
      // ctx.fillRect(shape.p1.x, shape.p1.y, width, height);
      ctx.strokeRect(shape?.p1.x, shape?.p1.y, width, height);
      // ctx.strokeRect(x1, y1, width, height);
    }
    // Update the shapes array state
    setShapes([...shapes]);
  };
  function handleSliderChange(value) {
    setScale(value);
  }
  console.log(shapes);
  return (
    // full screen
    <div
      style={{
        width: "calc(100%)",
        height: "100%",
        position: "absolute",
        top: "0px",
        left: "0px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          opacity: "0.5",
          zIndex: "30",
          top: 0,
          left: 0,
        }}
      ></div>
      {/* paint container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "90%",
            height: "90%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {/* /* topbar / */}
          <div
            style={{
              height: "60px",
              width: "100%",
              backgroundColor: "#F5F5F5",
              zIndex: "40",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            {/* <TopDiv><H3>{taskModelData.Name}</H3></TopDiv> */}
            {/* <TopDiv>
              <H3>
                {localStorage.getItem("ProjectName")
                  ? localStorage.getItem("ProjectName")
                  : ""}
              </H3>
            </TopDiv> */}
            {/* <TopDiv>
              <H3>{taskModelData.TLName}</H3>
              <H3>
                {SetDate(taskModelData.PlannedStart)}
                {"-- "}
                {SetDate(taskModelData.PlannedEnd)}
              </H3>
            </TopDiv> */}

            <TopDiv style={{ flexDirection: "row" }}>
              <RiInformationLine
                style={{
                  color: "#2491ff",
                  cursor: "pointer",
                  borderRadius: "50%",
                  margin: "auto",
                }}
                size="30"
                // onClick={() => setCurrentStep(2)}
              />
              <MdKeyboardArrowRight
                style={{
                  color: "#2491ff",
                  cursor: "pointer",
                  backgroundColor: "#E2F1FF",
                  borderRadius: "50%",
                  margin: "auto",
                }}
                size="30"
                onClick={() => {
                  setCurrentStep(2), handleDispatch();
                }}
              />
              <MdClose
                style={{
                  cursor: "pointer",
                  margin: "auto",
                }}
                size="30"
                onClick={() => setOpen(false)}
              />
            </TopDiv>
          </div>
          <div>
            <OptionalToolBar>
              {" "}
              {/* // back icon */}
              <Icons1 onClick={() => console.log("close")}>
                <MdKeyboardArrowLeft size="30" />
              </Icons1>
              <Label>Back</Label>
              {/* //////undo div */}
              <Icons1 onClick={() => undo()}>
                <MdUndo size="20" />
              </Icons1>
              <Label>Undo</Label>
              {/* ////// delete Icons1 */}
              <Icons1>
                <MdOutlineDelete size="20" />
              </Icons1>
              <Label>Delete</Label>
              {/* /////collapse Icons1 */}
              <Icons1>
                <BsArrowsCollapse size="20" />
              </Icons1>
              <Label>Collapse</Label>
              {/* ///toggle */}
              {/* ////assighn div */}
              <Icons1
                style={{
                  backgroundColor: draw ? "black" : "",
                  color: draw ? "white" : "",
                }}
                onClick={() => {
                  setSplitTool(!splitTool), setDraw(!draw);
                }}
                //  onClick={toggleTool}
              >
                <ImPencil2 size="20" />
              </Icons1>
              <Label>Assign</Label>
              <Icons1
                style={{
                  backgroundColor: splitTool ? "black" : "",
                  color: splitTool ? "white" : "",
                }}
                onClick={() => {
                  setSplitTool(!splitTool), setDraw(!draw);
                }}
              >
                {splitTool ? (
                  <FaPencilRuler size="20" />
                ) : (
                  <RiPencilRulerLine size="20" />
                )}
              </Icons1>
              <Label style={{ color: splitTool ? "red" : "" }}>
                {splitTool ? "click to Stop Editing" : "split"}
              </Label>
            </OptionalToolBar>
            {/* ///zooooom */}
            <SliderContainer>
              <SliderTrack />
              <SliderTrackActive style={{ width: `${(scale / 2) * 100}%` }} />
              <SliderInput
                type="range"
                min="0.1"
                max="2"
                step="0.05"
                value={scale}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              />
              <SliderLabelContainer>
                <SliderLabel>0.1</SliderLabel>
                <SliderLabel>2</SliderLabel>
              </SliderLabelContainer>
              <SliderValueLabel>{scale.toFixed(1)}</SliderValueLabel>
            </SliderContainer>
          </div>
          {/* bottom side */}
          <div
            style={{
              opacity: "1",
              zIndex: "40",
              display: "flex",
              justifyContent: "start",
              alignItems: "start",
              position: "relative",
              width: "100%",
              height: "100%",
            }}
          >
            {/* {/ side bar /} */}
            <div
              style={{
                width: "60px",
                height: "100%",
                backgroundColor: "#F5F5F5",
              }}
            >
              {/* // back icon */}
              <Icons onClick={() => setCurrentStep(0)}>
                <MdKeyboardArrowLeft size="30" />
              </Icons>
              <Label>Back</Label>

              {/* //////undo div */}
              <Icons onClick={() => undo()}>
                <MdUndo size="20" />
              </Icons>
              <Label>Undo</Label>
              {/* ////// delete Icons */}
              <Icons>
                <MdOutlineDelete size="20" />
              </Icons>
              <Label>Delete</Label>
              {/* /////collapse Icons */}
              <Icons>
                <BsArrowsCollapse size="20" />
              </Icons>
              <Label>Collapse</Label>
              {/* ///toggle */}
              {/* ////assighn div */}
              <Icons
                style={{
                  backgroundColor: draw ? "black" : "",
                  color: draw ? "white" : "",
                }}
                onClick={() => {
                  setSplitTool(!splitTool), setDraw(!draw);
                }}
                //  onClick={toggleTool}
              >
                <ImPencil2 size="20" />
              </Icons>
              <Label>Assign</Label>
              {/* <Icons onClick={toggleTool}>
                {currentTool === "rectangle" ? (
                  <BsAspectRatio size="20" />
                ) : (
                  <BsDashLg size="20" />
                )}
              </Icons> */}
              {/* ////assighn div */}
              {/* <Icons
                style={{
                  borderRadius: "50%",
                  backgroundColor: "#E2F1FF",
                  color: "black",
                }}
              >
                <ImPencil2 size="20" />
              </Icons>

              <Label>Draw</Label> */}

              {/* // move icon */}
              <Icons
                style={{
                  backgroundColor: splitTool ? "black" : "",
                  color: splitTool ? "white" : "",
                }}
                onClick={() => {
                  setSplitTool(!splitTool), setDraw(!draw);
                }}
              >
                {splitTool ? (
                  <FaPencilRuler size="20" />
                ) : (
                  <RiPencilRulerLine size="20" />
                )}
              </Icons>
              <Label style={{ color: splitTool ? "red" : "" }}>
                {splitTool ? "click to Stop Editing" : "split"}
              </Label>
            </div>
            {/* display doc and canvas */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "green",
                overflow: "auto",
                position: "relative",
              }}
            >
              {verify && (
                <div
                  style={{
                    position: "absolute",
                    top: vy,
                    left: vx,
                  }}
                >
                  <VerifyIcon
                    onClick={() => {
                      undo(), setVerify(false);
                    }}
                  >
                    <MdClose size="30" />
                  </VerifyIcon>
                  <h4 style={{ color: "red" }}>Redo</h4>
                  <ConfirmIcon
                    onClick={() => {
                      setVerify(false);
                    }}
                  >
                    <MdFileDownloadDone size="30" />
                  </ConfirmIcon>
                  <h4 style={{ color: "green" }}>Looks good</h4>
                </div>
              )}
              <Document
                file={
                  "https://au.int/sites/default/files/bids/36472-1._architectural_final.pdf"
                }
              >
                <Page
                  pageNumber={pdfPage}
                  size="A4"
                  scale={scale}
                  // width={PW}
                  // height={PH}
                  renderAnnotationLayer={false}
                  ref={canvasRef}
                  style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    zIndex: 30,
                  }}
                ></Page>
              </Document>
              <canvas
                width={"1000px"}
                height={"1000px"}
                onMouseDown={(e) => handleMouseDown(e)}
                onMouseUp={(e) => handleMouseUp(e)}
                onMouseMove={(e) => handleMouseMove(e)}
                ref={drawCanvas}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundColor: "blue",
                  zIndex: 40,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//styled components
const SliderContainer = styled.div`
  position: absolute;
  height: 24px;
  width: 500px;
  z-index: 70;
`;

const SliderTrack = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  width: 100%;
  background-color: #ccc;
`;

const SliderTrackActive = styled(SliderTrack)`
  background-color: #007bff;
`;

const SliderInput = styled.input`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 24px;
  background-color: transparent;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #007bff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #007bff;
    cursor: pointer;
  }
`;

const SliderLabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const SliderLabel = styled.div`
  font-size: 15px;
  color: #000000;
  margin-top: 10px;
`;

const SliderValueLabel = styled.div`
  font-size: 30px;
  color: #000000;
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 20px;
`;

const Icons = styled.div`
  display: flex;
  width: 50px;
  height: 50px;
  z-index: 40;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #e2f1ff;

  border: 0.5px solid gray;
  border-radius: 10px;
  margin: 5px;
  margin-top: 15px;
  :hover {
    background-color: black;
    color: white;
  }
`;
const VerifyIcon = styled.div`
  display: flex;
  width: 45px;
  height: 45px;
  z-index: 40;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #f59b93;
  border-radius: 10px;
  margin: 5px;
  margin-top: 15px;
  :hover {
    background-color: red;
    color: white;
  }
`;
const ConfirmIcon = styled.div`
  display: flex;
  width: 45px;
  height: 45px;
  z-index: 40;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  background-color: #9de0a0;
  // opacity: 12%;
  // border: 0.5px solid gray;
  border-radius: 10px;
  margin: 5px;
  margin-top: 15px;
  :hover {
    background-color: #1ca621;
    color: white;
  }
`;
const Label = styled.p`
  font-family: Roboto;
  font-style: normal;
  font-weight: 450;
  font-size: 10px;
  line-height: 14px;
  color: gray;
  margin-left: 13px;
`;
const TopDiv = styled.div`
  width: 250px;
  height: 60px;
  border: 0.25px solid lightgray;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
const H3 = styled.h1`
  margin-left: 12px;
  margin-top: 5px;
  font-family: Roboto;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 16px;
`;
const OptionalToolBar = styled.div`
  position: absolute;
  margin-top: 70px;
  z-index: 70;
  display: flex;
  flex-direction: row;
  opacity: 60%;
`;
const Icons1 = styled.div`
  display: flex;
  width: 30px;
  height: 30px;
  z-index: 40;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #e2f1ff;

  border: 0.5px solid gray;
  border-radius: 10px;
  margin: 5px;
  margin-top: 15px;
  :hover {
    background-color: black;
    color: white;
  }
`;

{
  /* <div style={{ backgroundColor: "white", zIndex: "40" }}>
                <label htmlFor="nameInput">X1:</label>
                <input
                  style={{ width: "40px", height: "40px" }}
                  type="number"
                  id="x1Input"
                  value={x1}
                  onChange={(e) => setX1(e.target.value)}
                />
              </div>
              <div style={{ backgroundColor: "white", zIndex: "40" }}>
                <label htmlFor="nameInput">Y1:</label>
                <input
                  style={{ width: "40px", height: "40px" }}
                  type="number"
                  id="y1Input"
                  value={y1}
                  onChange={(e) => setY1(e.target.value)}
                />
              </div>
              <div style={{ backgroundColor: "white", zIndex: "40" }}>
                <label htmlFor="nameInput">X2:</label>
                <input
                  style={{ width: "40px", height: "40px" }}
                  type="number"
                  id="x2Input"
                  value={x2}
                  onChange={(e) => setX2(e.target.value)}
                />
              </div>
              <div style={{ backgroundColor: "white", zIndex: "40" }}>
                <label htmlFor="nameInput">Y2:</label>
                <input
                  style={{ width: "40px", height: "40px" }}
                  type="number"
                  id="y2Input"
                  value={y2}
                  onChange={(e) => setY2(e.target.value)}
                />
              </div> */
}
{
  /* ////// */
}
{
  /* first btn */
}

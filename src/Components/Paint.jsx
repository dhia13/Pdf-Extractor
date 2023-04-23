import { useEffect, useRef, useState } from "react"
import ToolIcon from "./Components for uri pdf/ToolIcon"
import { drawRect, drawCircle, renderShapes, drawLine, detectShapes } from "./Components for uri pdf/drawingTools"
import { SketchPicker } from "react-color"
export default function Paint() {
	const pdfRef = useRef(null)
	const paintingsRef = useRef(null)
	const plansRef = useRef(null)
	const drawingRef = useRef(null)
	const [paintingsCanvas, setPaintingsCanvas] = useState(paintingsRef.current)
	const [paintings, setPaintings] = useState([])
	const [plansCanvas, setPlansCanvas] = useState(plansRef.current)
	const [plans, setPlans] = useState([])
	const [drawingCanvas, setDrawingCanvas] = useState(drawingRef.current)
	const [PW, setPW] = useState(0)
	const [PH, setPh] = useState(0)
	const [scale, setScale] = useState(1)
	const [color, setColor] = useState("#000000")
	const [showColor, setShowColor] = useState(false)
	const [stroke, setStroke] = useState(1)
	const [opacity, setOpacity] = useState(1)
	const [tool, setTool] = useState("draw")
	const [drawTool, setDrawTool] = useState("plan")
	const [drawing, setDrawing] = useState(false)
	const [startX, setStartX] = useState(0)
	const [startY, setStartY] = useState(0)
	const [hoveredPlanBorders, setHoveredPlanBorders] = useState([])
	const [hoveringPlanBorder, setHoveringPlanBorder] = useState(false)
	const [hoveredPlans, setHoveredPlans] = useState([])
	const [hoveringPlan, setHoveringPlan] = useState(false)
	const [moving, setMoving] = useState(false)
	const [writing, setWriting] = useState(false)
	const [planEditHover, setPlanEditHover] = useState(false)
	const [editPlan, setEditPlan] = useState(false)
	const handleColorChange = (newColor) => {
		setColor(newColor.hex)
	}
	const replacePlan = (index, newShape) => {
		const newPlans = [...plans] // Create a copy of the original array
		newPlans.splice(index, 1, newShape) // Remove one element at the specified index and insert the new shape
		setPlans(newPlans) // Update the state with the new array
	}
	console.log(hoveredPlans)
	useEffect(() => {
		setPaintingsCanvas(paintingsRef.current)
		setPlansCanvas(plansRef.current)
		setDrawingCanvas(drawingRef.current)
	}, [drawingRef, plansRef, paintingsRef])
	useEffect(() => {
		;(async function () {
			const pdfJS = await import("pdfjs-dist/build/pdf")
			pdfJS.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.js"
			const pdf = await pdfJS.getDocument(
				"https://www.cdc.gov/tobacco/basic_information/e-cigarettes/severe-lung-disease/healthcare-providers/pdfs/Lab-Clinical-Specimen-Collection-Storage-Guidance-Lung-Injury-508.pdf"
			).promise
			const page = await pdf.getPage(2)
			const viewport = page.getViewport({ scale })
			const canvas = pdfRef.current
			const canvasContext = canvas.getContext("2d")
			canvas.height = viewport.height
			canvas.width = viewport.width
			setPW(pdfRef.current.offsetWidth)
			setPh(pdfRef.current.offsetHeight)
			const renderContext = { canvasContext, viewport }
			page.render(renderContext)
		})()
	}, [pdfRef, scale])
	// render paintings
	useEffect(() => {
		if (paintingsCanvas) {
			renderShapes(paintingsCanvas, scale, paintings)
		}
		if (plansCanvas) {
			renderShapes(plansCanvas, scale, plans)
		}
	}, [scale])
	useEffect(() => {
		if (plansCanvas) {
			const ctx = plansCanvas.getContext("2d")
			ctx.clearRect(0, 0, plansCanvas.width, plansCanvas.height)
			renderShapes(plansCanvas, scale, plans)
		}
	}, [plans])
	const handleMouseDown = (e) => {
		const rect = paintingsCanvas.getBoundingClientRect()
		if (tool === "draw") {
			setStartX((e.clientX - rect.left) / scale)
			setStartY((e.clientY - rect.top) / scale)
			if (drawTool === "text") {
				setWriting(true)
			} else if (drawTool == "plan" && hoveringPlan) {
				let plan = plans[hoveredPlans[0]]
				if (plan.shape == "plan" && !plan.splited) {
					console.log({ plan, hoveredPlans })
					plan.splited = true
					plan.splitPoint.x = e.clientX - rect.left
					plan.splitPoint.y = e.clientY - rect.top
					replacePlan(hoveredPlans[0], plan)
				}
			} else {
				setDrawing(true)
			}
		}
		if (tool == "delete" && hoveringPlan) {
			let shape = paintings[hoveredPlans[0]]
			if (shape.shape == "plan") {
				const newShapes = [...paintings] // Create a copy of the original array
				newShapes.splice(hoveredPlans[0], 1) // Remove one element at the specified index and insert the new shape
				setPlans(newShapes)
			}
		}
		if (tool == "fill" && hoveringPlan) {
			console.log("hover with fill tool")
			// let shape = paintings[hoveredPlans[0]];
			// if (shape.shape == "rect") {
			//   const newShapes = [...paintings]; // Create a copy of the original array
			//   newShapes.splice(hoveredPlans[0], 1); // Remove one element at the specified index and insert the new shape
			//   setPaintings(newShapes);
			// }
		}
		if (drawTool == "plan" && planEditHover) {
			setEditPlan(true)
			setDrawing(false)
		}
		if (tool == "move" && hoveringPlanBorder) {
			setMoving(true)
			setStartX((e.clientX - rect.left) / scale)
			setStartY((e.clientY - rect.top) / scale)
		}
	}
	const handleMouseMove = (e) => {
		const rect = drawingCanvas.getBoundingClientRect()
		const ctx = drawingCanvas.getContext("2d")
		//draw
		if (tool == "draw" && drawing) {
			ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
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
				)
			}
			if (drawTool == "circle") {
				drawCircle(
					drawingCanvas,
					scale,
					startX,
					startY,
					Math.sqrt((e.clientX - startX * scale - rect.left) ** 2 + (e.clientY - startY * scale - rect.top) ** 2) / scale,
					color,
					stroke
				)
			}
			if (drawTool == "line") {
				drawLine(drawingCanvas, scale, startX, startY, (e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale, color, stroke)
			}
		}
		// detect
		if (tool == "move" || drawTool == "plan" || tool == "delete") {
			if (!moving) {
				let detected = detectShapes(scale, plans, e.clientX - rect.left, e.clientY - rect.top)
				// console.log({
				//   hoveringPlan: detected.hoveringPlan,
				//   hoveringBorder: detected.hoveringBorder,
				// });
				setPlans(detected.plans)
				setHoveredPlans(detected.hoveredPlans)
				setHoveringPlan(detected.hoveringPlan)
				setHoveredPlanBorders(detected.hoveredBorders)
				setHoveringPlanBorder(detected.hoveringBorder)
				setPlanEditHover(detected.planEditHover)
			}
		}
		// edit plan
		if (drawTool == "plan" && editPlan) {
			let plan = plans[hoveredPlans[0]]
			if (plan) {
				if (plan.w > plan.h && (e.clientX - rect.left > plan.x || e.clientX - rect.left < plan.x + plan.w)) {
					plan.splitPoint.x = e.clientX - rect.left
				}
				if (plan.h > plan.w && (e.clientY - rect.top > plan.y || e.clientY - rect.top < plan.y + plan.h)) {
					plan.splitPoint.y = e.clientY - rect.top
				}
				replacePlan(hoveredPlans[0], plan)
			}
		}
		// move plan
		if (tool == "move" && moving) {
			let plan = plans[hoveredPlanBorders[0]]
			if (plan) {
				let x = e.clientX - rect.left
				let y = e.clientY - rect.top
				plan.x += x - startX
				plan.y += y - startY
				setStartX(x)
				setStartY(y)
				if (plan.shape == "rect" && plan.splited) {
					plan.splitPoint.x += x - startX
					plan.splitPoint.y += y - startX
				}
				replacePlan(hoveredPlans[0], plan)
			}
		}
	}
	const handleMouseUp = (e) => {
		setDrawing(false)
		setMoving(false)
		setEditPlan(false)
		let newPainting
		let newPlan
		let newPaintings
		let newPlans
		const rect = paintingsCanvas.getBoundingClientRect()
		const ctx = drawingCanvas.getContext("2d")
		ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
		if (drawing) {
			switch (drawTool) {
				case "rect":
					let x = startX
					let y = startY
					let w = (e.clientX - startX * scale - rect.left) / scale
					let h = (e.clientY - startY * scale - rect.top) / scale
					if (e.clientX - startX * scale - rect.left < 0) {
						x = startX + (e.clientX - startX * scale - rect.left) / scale
						w = Math.abs((e.clientX - startX * scale - rect.left) / scale)
					}
					if (e.clientY - startY * scale - rect.top < 0) {
						y = startY + (e.clientY - startY * scale - rect.top) / scale
						h = Math.abs(Math.abs(e.clientY - startY * scale - rect.top) / scale)
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
					}
					newPaintings = [...paintings, newPainting] // create new array with new shape added
					setPaintings(newPaintings)
					drawRect(paintingsCanvas, scale, x, y, w, h, color, opacity, stroke)
					break

				case "circle":
					newPainting = {
						shape: "circle",
						x: startX,
						y: startY,
						r: Math.sqrt((e.clientX - startX * scale - rect.left) ** 2 + (e.clientY - startY * scale - rect.top) ** 2) / scale,
						color,
						opacity,
						stroke,
						filled: false,
						fillColor: "",
						index: paintings.length,
					}
					newPaintings = [...paintings, newPainting] // create new array with new shape added
					setPaintings(newPaintings)
					drawCircle(paintingsCanvas, scale, newPainting.x, newPainting.y, newPainting.r, color, stroke)
					break

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
					}
					newPaintings = [...paintings, newPainting] // create new array with new shape added
					setPaintings(newPaintings)
					drawLine(paintingsCanvas, scale, newPainting.x, newPainting.y, newPainting.xb, newPainting.yb, color, stroke)
					break
				case "plan":
					if (!hoveringPlan && drawing) {
						let x = startX
						let y = startY
						let w = (e.clientX - startX * scale - rect.left) / scale
						let h = (e.clientY - startY * scale - rect.top) / scale
						if (e.clientX - startX * scale - rect.left < 0) {
							x = startX + (e.clientX - startX * scale - rect.left) / scale
							w = Math.abs((e.clientX - startX * scale - rect.left) / scale)
						}
						if (e.clientY - startY * scale - rect.top < 0) {
							y = startY + (e.clientY - startY * scale - rect.top) / scale
							h = Math.abs(Math.abs(e.clientY - startY * scale - rect.top) / scale)
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
						}
						newPlans = [...plans, newPlan] // create new array with new shape added
						setPlans(newPlans)
					}
					break
				default:
					break
			}
		}
	}
	return (
		<div className="w-full h-full border border-green-500 relative overflow-hidden">
			{showColor && <div className="absolute top-0 left-0 w-screen h-screen z-50" onClick={() => setShowColor(false)} />}
			{/* toolbars */}
			<div className="w-full h-[100px]">
				<div className="flex justify-center items-center h-[100px] gap-4 border border-gray-200">
					<div className="flex justify-center items-center gap-2">
						<button
							onClick={() => {
								if (scale == 0.5) {
									return
								} else {
									setScale(scale - 0.5)
								}
							}}
						>
							<img width={32} height={32} src={`/images/zoomOut.png`} alt="zoomOut" />
						</button>
						<p
							className="w-[40px] bg-blue-200 overflow-hidden"
							title="scale" // added scale attribute to display tooltip
						>
							{scale}
						</p>
						<button onClick={() => setScale(scale + 0.5)}>
							<img width={32} height={32} src={`/images/zoomIn.png`} alt="zoomIn" />
						</button>
					</div>
					<div className="flex justify-center items-center gap-2">
						<button
							onClick={() => {
								if (opacity <= 0.1) {
									return
								} else {
									setOpacity(Math.max(opacity - 0.1, 0.1))
								}
							}}
						>
							<img width={28} height={28} src={`/images/minus.png`} alt="minus" />
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
								let value = parseFloat(e.target.value)
								if (value < 0.1) {
									value = 0.1
								} else if (value > 1) {
									value = 1
								}
								setOpacity(value)
							}}
						/>
						<button
							onClick={() => {
								if (opacity >= 1) {
									return
								} else {
									setOpacity(Math.min(opacity + 0.1, 1))
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
									return
								} else {
									setStroke(stroke - 1)
								}
							}}
						>
							<img width={28} height={28} src={`/images/minus.png`} alt="minus" />
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
						{showColor && <SketchPicker color={color} onChange={handleColorChange} className="absolute top-8 left-8 z-50" />}
					</div>
					<ToolIcon
						tool="move"
						drawTool={tool}
						setDrawTool={(tool) => {
							setDrawTool(""), setTool(tool)
						}}
						disable={false}
					/>
					<ToolIcon
						tool="split"
						drawTool={tool}
						setDrawTool={(tool) => {
							setDrawTool(""), setTool(tool)
						}}
						disable={false}
					/>
					<ToolIcon
						tool="delete"
						drawTool={tool}
						setDrawTool={(tool) => {
							setDrawTool(""), setTool(tool)
						}}
						disable={false}
					/>
					<ToolIcon
						tool="erace"
						drawTool={tool}
						setDrawTool={(tool) => {
							setDrawTool(""), setTool(tool)
						}}
						disable={false}
					/>
				</div>
			</div>
			<div className="w-full h-[calc(100vh-100px)]">
				{/* side bar */}
				<div className="w-[100px] h-full top-[100px] absolute flex justify-start items-center gap-4 flex-col mt-4">
					<ToolIcon
						tool="circle"
						drawTool={drawTool}
						setDrawTool={(tool) => {
							setDrawTool(tool), setTool("draw")
						}}
						disable={false}
					/>
					<ToolIcon
						tool="rect"
						drawTool={drawTool}
						setDrawTool={(tool) => {
							setDrawTool(tool), setTool("draw")
						}}
						disable={false}
					/>
					<ToolIcon
						tool="line"
						drawTool={drawTool}
						setDrawTool={(tool) => {
							setDrawTool(tool), setTool("draw")
						}}
						disable={false}
					/>
					<ToolIcon
						tool="text"
						drawTool={drawTool}
						setDrawTool={(tool) => {
							setDrawTool(tool), setTool("draw")
						}}
						disable={false}
					/>
					<ToolIcon
						tool="plan"
						drawTool={drawTool}
						setDrawTool={(tool) => {
							setDrawTool(tool), setTool("draw")
						}}
						disable={false}
					/>
					<ToolIcon
						tool="fill"
						drawTool={drawTool}
						setDrawTool={(tool) => {
							setDrawTool(tool), setTool("draw")
						}}
						disable={false}
					/>
				</div>
				{/* display area */}
				<div className="relative w-[calc(100vw-100px)] h-full left-[100px] overflow-scroll">
					<canvas ref={pdfRef} className="absolute top-0 left-0 border-2 border-blue-500" scale={scale} />
					<canvas
						ref={drawingRef}
						onMouseDown={(e) => handleMouseDown(e)}
						onMouseMove={(e) => handleMouseMove(e)}
						onMouseUp={(e) => handleMouseUp(e)}
						width={PW}
						height={PH}
						className={`z-30 absolute top-0 left-0 ${planEditHover && "cursor-col-resize"}
            ${hoveringPlanBorder && tool == "move" && "cursor-move"}
            ${hoveringPlan && tool == "delete" && "cursor-delete"}
            ${tool == "erace" && "cursor-erace"}
            `}
						scale={scale}
					/>
					<canvas
						ref={paintingsRef}
						onMouseDown={(e) => handleMouseDown(e)}
						onMouseMove={(e) => handleMouseMove(e)}
						onMouseUp={(e) => handleMouseUp(e)}
						width={PW}
						height={PH}
						className={`z-30 absolute top-0 left-0  ${planEditHover && "cursor-col-resize"}
            ${tool == "fill" && "cursor-fill"}
            ${hoveringPlanBorder && tool == "move" && "cursor-move"}
            ${hoveringPlan && tool == "delete" && "cursor-delete"}
            ${tool == "erace" && "cursor-erace"}
            `}
					></canvas>
					<canvas
						ref={plansRef}
						onMouseDown={(e) => handleMouseDown(e)}
						onMouseMove={(e) => handleMouseMove(e)}
						onMouseUp={(e) => handleMouseUp(e)}
						width={PW}
						height={PH}
						className={`z-30 absolute top-0 left-0  ${planEditHover && "cursor-col-resize"}
            ${tool == "fill" && "cursor-fill"}
            ${hoveringPlanBorder && tool == "move" && "cursor-move"}
            ${hoveringPlan && tool == "delete" && "cursor-delete"}
            ${tool == "erace" && "cursor-erace"}
            `}
					></canvas>
					{writing && (
						<div
							style={{
								width: PW,
								height: PH,
								position: "absolute",
							}}
						>
							<div className="w-full h-full relative">
								<input
									className="absolute z-50 bg-transparent border-none focus:outline-none"
									style={{
										left: `${startX}px`,
										top: `${startY - 8}px`,
										fontSize: "16px",
									}}
									autoFocus={true}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

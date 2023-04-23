// draw

export function drawRect(canvas, scale, x, y, width, height, color, opacity, stroke, filled, fillColor) {
	const ctx = canvas.getContext("2d")
	ctx.beginPath()
	ctx.strokeStyle = color
	ctx.globalAlpha = opacity // set the global alpha for the context
	ctx.lineWidth = stroke * scale
	ctx.rect(x * scale, y * scale, width * scale, height * scale)
	if (filled) {
		ctx.fillStyle = fillColor
		ctx.fill()
	}
	ctx.stroke()
	ctx.closePath()
}

export function drawPlan(canvas, scale, x, y, w, h, color, opacity, stroke, splited, splitPoint, subColors) {
	const ctx = canvas.getContext("2d")
	if (splited) {
		if (splited && w > h) {
			const leftRectWidth = splitPoint.x - x
			const rightRectWidth = w * scale - (splitPoint.x - x * scale)
			const radius = Math.min(20, Math.max(h / 8, 10))

			drawRect(canvas, scale, x, y, leftRectWidth, h, "black", 0.5, 1, true, subColors.color1)
			drawRect(canvas, scale, splitPoint.x, y, rightRectWidth, h, "black", 0.5, 1, true, subColors.color2)
			drawCircle(canvas, scale, splitPoint.x, y + h / 2, radius, "black", 1)
			drawArrow(canvas, scale, splitPoint.x, y + h / 2, "left", radius, 0.5)
			drawArrow(canvas, scale, splitPoint.x, y + h / 2, "right", radius, 0.5)
		}
		if (h > w) {
			const leftRectHeight = splitPoint.y - y
			const rightRectHeight = h - (splitPoint.y - y)

			ctx.lineWidth = stroke * scale
			drawRect(canvas, scale, x, y, w, leftRectHeight, "black", 0.5, 1, true, subColors.color1)
			drawRect(canvas, scale, x, splitPoint.y, w, rightRectHeight, "black", 0.5, 1, true, subColors.color2)

			const radius = Math.min(20, Math.max(w / 8, 10))
			drawCircle(canvas, scale, x + w / 2, splitPoint.y, radius, "black", 1)
			drawArrow(canvas, scale, x + w / 2, splitPoint.y, "top", radius, 0.5)
			drawArrow(canvas, scale, x + w / 2, splitPoint.y, "bottom", radius, 0.5)
		}
	} else {
		drawRect(canvas, scale, x, y, w, h, color, opacity, stroke)
	}
}

export function drawCircle(canvas, scale, x, y, r, color, stroke) {
	const ctx = canvas.getContext("2d")
	ctx.beginPath()
	ctx.arc(scale * x, scale * y, scale * r, 0, 2 * Math.PI)
	ctx.strokeStyle = color
	ctx.lineWidth = stroke * scale
	ctx.stroke()
	ctx.closePath()
}

export function drawLine(canvas, scale, x, y, xb, yb, color, stroke) {
	const ctx = canvas.getContext("2d")
	ctx.beginPath()
	ctx.moveTo(x * scale, y * scale)
	ctx.lineTo(xb * scale, yb * scale)
	ctx.strokeStyle = color
	ctx.lineWidth = stroke * scale
	ctx.stroke()
	ctx.closePath()
}

export function drawArrow(canvas, scale, x, y, direction, size, stroke) {
	const ctx = canvas.getContext("2d")
	const w = size * scale

	ctx.beginPath()
	if (direction === "left") {
		ctx.moveTo(x - (w * 3) / 4, y)
		ctx.lineTo(x - w / 4, y - w / 2)
		ctx.lineTo(x - w / 4, y + w / 2)
	} else if (direction === "right") {
		ctx.moveTo(x + (w * 3) / 4, y)
		ctx.lineTo(x + w / 4, y - w / 2)
		ctx.lineTo(x + w / 4, y + w / 2)
	} else if (direction === "top") {
		ctx.moveTo(x, y - (w * 5) / 6)
		ctx.lineTo(x + w / 2, y - w / 6)
		ctx.lineTo(x - w / 2, y - w / 6)
	} else if (direction === "bottom") {
		ctx.moveTo(x, y + (w * 5) / 6)
		ctx.lineTo(x + w / 2, y + w / 6)
		ctx.lineTo(x - w / 2, y + w / 6)
	}
	ctx.closePath()
	ctx.fillStyle = "white"
	ctx.fill()
	ctx.lineWidth = stroke * scale
	ctx.strokeStyle = "black"
	ctx.stroke()
}

export function drawPainting(canvas, scale, coordinations, color, stroke) {
	const ctx = canvas.getContext("2d")

	ctx.lineWidth = stroke
	ctx.lineCap = "round"
	ctx.strokeStyle = color

	coordinations.forEach(({ x, y }) => {
		ctx.lineTo(x * scale, y * scale)
		ctx.stroke()
		ctx.moveTo(x * scale, y * scale)
	})

	ctx.closePath()
}

export function drawText(canvas, x, y, scale, text, fontSize, color) {
	const ctx = canvas.getContext("2d")
	ctx.fillStyle = color
	ctx.font = `${fontSize * scale}px sans-serif`
	ctx.fillText(text, x * scale, y * scale)
}

export function renderShapes(canvas, scale, shapes) {
	shapes.forEach((shape) => {
		switch (shape.shape) {
			case "rect":
				drawRect(canvas, scale, shape.x, shape.y, shape.w, shape.h, shape.color, shape.opacity, shape.stroke)
				break
			case "circle":
				drawCircle(canvas, scale, shape.x, shape.y, shape.r, shape.color, shape.stroke)
				break
			case "line":
				drawLine(canvas, scale, shape.x, shape.y, shape.xb, shape.yb, shape.color, shape.stroke)
				break
			case "painting":
				drawPainting(canvas, scale, shape.coordinations, shape.color, shape.stroke)
			case "plan":
				drawPlan(
					canvas,
					scale,
					shape.x,
					shape.y,
					shape.w,
					shape.h,
					shape.color,
					shape.opacity,
					shape.stroke,
					shape.splited,
					shape.splitPoint,
					shape.subColors
				)
				break
			default:
				break
		}
	})
}

//detection

export function detectShapes(scale, plans, mouseX, mouseY) {
	// console.log({ scale, plans, mouseX, mouseY });
	const hoveredBorders = []
	const hoveredPlans = []
	let hoveringBorder = false
	let hoveringPlan = false
	let planEditHover = false
	let insideCircle = false
	plans.forEach((plan, i) => {
		if (plan.shape === "plan") {
			const { x, y, w, h, stroke, splited, splitPoint } = plan
			const borderLeft = x * scale - (stroke * scale) / 2
			const borderRight = x * scale + (stroke * scale) / 2 + w * scale
			const borderTop = y * scale - (stroke * scale) / 2
			const borderBottom = y * scale + (stroke * scale) / 2 + h * scale

			if (mouseX >= borderLeft && mouseX <= borderRight && mouseY >= borderTop && mouseY <= borderBottom) {
				plan.borderHovered = true
				hoveredBorders.push(plan)
			}

			const innerLeft = x * scale + (stroke * scale) / 2
			const innerRight = x * scale - (stroke * scale) / 2 + w * scale
			const innerTop = y * scale + (stroke * scale) / 2
			const innerBottom = y * scale - (stroke * scale) / 2 + h * scale

			if (mouseX >= innerLeft && mouseX <= innerRight && mouseY >= innerTop && mouseY <= innerBottom) {
				plan.hovered = true
				hoveredPlans.push(i)
			}
			if (splited) {
				if (w > h) {
					insideCircle = isPointInCircle(splitPoint.x * scale, (y + h / 2) * scale, 14, mouseX, mouseY)
					if (insideCircle) {
						planEditHover = true
					}
				} else if (h > w) {
					insideCircle = isPointInCircle(x + (w / 2) * scale, splitPoint.y * scale, 14, mouseX, mouseY)
					if (insideCircle) {
						planEditHover = true
					}
				}
			}
		} else if (planType === "circle") {
			// not implemented yet
		} else if (planType === "line") {
			// not implemented yet
		}
	})
	hoveringBorder = hoveredBorders.length > 0
	hoveringPlan = hoveredPlans.length > 0
	return {
		plans,
		hoveredBorders,
		hoveringBorder,
		hoveredPlans,
		hoveringPlan,
		planEditHover,
	}
}

export function isPointInCircle(X0, Y0, radius, X, Y) {
	const dx = X - X0
	const dy = Y - Y0
	const distance = Math.sqrt(dx * dx + dy * dy)
	return distance <= radius
}

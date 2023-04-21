export function drawRect(canvas, scale, x, y, width, height, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke * scale;
  ctx.rect(x * scale, y * scale, width * scale, height * scale);
  ctx.stroke();
  ctx.closePath();
}
export function drawSplitedRect(
  canvas,
  scale,
  x,
  y,
  w,
  h,
  color,
  stroke,
  splitPoint
) {
  if (w > h) {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = stroke * scale;
    ctx.rect(x * scale, y * scale, splitPoint.x * scale - x * scale, h * scale);
    ctx.fillStyle = "rgba(144, 238, 144, 0.7)"; // light green
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.rect(
      splitPoint.x * scale,
      y * scale,
      w * scale - (splitPoint.x - x * scale),
      h * scale
    );
    ctx.fillStyle = "rgba(255, 192, 203, 0.7)"; // light red
    ctx.fill();
    ctx.closePath();
    drawCircle(canvas, scale, splitPoint.x, y + h / 2, 14, "blue", 2);
  }
  if (h > w) {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = stroke * scale;
    ctx.rect(x * scale, y * scale, w * scale, splitPoint.y - y * scale);
    ctx.fillStyle = "rgba(144, 238, 144, 0.7)"; // light green
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.rect(
      x * scale,
      splitPoint.y * scale,
      w * scale,
      h * scale - (splitPoint.y - y * scale)
    );
    ctx.fillStyle = "rgba(255, 192, 203, 0.7)"; // light red
    ctx.fill();
    ctx.closePath();
    drawCircle(canvas, scale, x + w / 2, splitPoint.y, 14, "blue", 2);
  }
}
export function drawCircle(canvas, scale, x, y, r, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(scale * x, scale * y, scale * r, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke * scale;
  ctx.stroke();
  ctx.closePath();
}
export function drawLine(canvas, scale, x, y, xb, yb, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x * scale, y * scale);
  ctx.lineTo(xb * scale, yb * scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke * scale;
  ctx.stroke();
  ctx.closePath();
}
export function drawPainting(canvas, scale, coordinations, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = stroke;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  coordinations.forEach((x) => {
    ctx.lineTo(x.x * scale, x.y * scale);
    ctx.stroke();
    ctx.moveTo(x.x * scale, x.y * scale);
  });
  ctx.closePath();
}
export function drawShapes(canvas, scale, shapes) {
  const ctx = canvas.getContext("2d");
  if (shapes.length > 0) {
    shapes.forEach((shape) => {
      if (shape.shape === "rect") {
        if (shape.splited == true) {
          drawSplitedRect(
            canvas,
            scale,
            shape.x,
            shape.y,
            shape.w,
            shape.h,
            shape.color,
            shape.stroke,
            shape.splitPoint
          );
        } else {
          drawRect(
            canvas,
            scale,
            shape.x,
            shape.y,
            shape.w,
            shape.h,
            shape.color,
            shape.stroke
          );
        }
      }
      if (shape.shape === "circle") {
        drawCircle(
          canvas,
          scale,
          shape.x,
          shape.y,
          shape.r,
          shape.color,
          shape.stroke
        );
      }
      if (shape.shape === "line") {
        drawLine(
          canvas,
          scale,
          shape.x,
          shape.y,
          shape.xb,
          shape.yb,
          shape.color,
          shape.stroke
        );
      }
      if (shape.shape === "painting") {
        drawPainting(
          canvas,
          scale,
          shape.coordinations,
          shape.color,
          shape.stroke
        );
      }
      ctx.closePath();
    });
  }
}
export function detectShapes(canvas, scale, shapes, Mx, My) {
  let hoveredBorders = [];
  let hoveredShapes = [];
  let hoveringBorder = false;
  let hoveringInner = false;
  let splitedRectInnerCircle = false;
  shapes.forEach((Shape, i) => {
    let mouseX = Mx;
    let mouseY = My;
    if (Shape.shape == "rect") {
      let { splitPoint, h, w, x, y, stroke, splited } = Shape;
      // detect border
      if (
        // right border
        (mouseX >= x * scale - (stroke * scale) / 2 &&
          mouseX <= x * scale + (stroke * scale) / 2 &&
          mouseY >= y * scale - (stroke * scale) / 2 &&
          mouseY <= (y + h) * scale + (stroke * scale) / 2) ||
        // left border
        (mouseX >= x * scale - (stroke * scale) / 2 + w * scale &&
          mouseX <= x * scale + (stroke * scale) / 2 + w * scale &&
          mouseY >= y * scale - (stroke * scale) / 2 &&
          mouseY <= (y + h) * scale + (stroke * scale) / 2) ||
        // top border
        (mouseY >= y * scale - (stroke * scale) / 2 &&
          mouseY <= y * scale + (stroke * scale) / 2 &&
          mouseX >= x * scale - (stroke * scale) / 2 &&
          mouseX <= (x + w) * scale + (stroke * scale) / 2) ||
        // bottom border
        (mouseY >= y * scale - (stroke * scale) / 2 + h * scale &&
          mouseY <= y * scale + (stroke * scale) / 2 + h * scale &&
          mouseX >= x * scale - (stroke * scale) / 2 &&
          mouseX <= (x + w) * scale + (stroke * scale) / 2)
      ) {
        hoveredBorders.push(i);
        Shape.borderHovered = true;
      }
      // detect inner shape
      if (
        mouseX >= x * scale + (stroke * scale) / 2 &&
        mouseX <= x * scale - (stroke * scale) / 2 + w * scale &&
        mouseY >= y * scale + (stroke * scale) / 2 &&
        mouseY <= y * scale - (stroke * scale) / 2 + h * scale
      ) {
        hoveredShapes.push(i);
        Shape.innerHovered = true;
      }
      if (splited) {
        if (w > h) {
          splitedRectInnerCircle = isMouseInCircle(
            splitPoint.x * scale,
            (y + h / 2) * scale,
            14,
            mouseX,
            mouseY
          );
        }
        if (h > w) {
          splitedRectInnerCircle = isMouseInCircle(
            x + (w / 2) * scale,
            splitPoint.y * scale,
            14,
            mouseX,
            mouseY
          );
        }
      }
    }
    if (Shape.shape == "circle") {
    }
    if (Shape.shape == "line") {
    }
  });
  if (hoveredBorders.length > 0) {
    hoveringBorder = true;
  }
  if (hoveredShapes.length > 0) {
    hoveringInner = true;
  }
  return {
    shapes,
    hoveredBorders,
    hoveredShapes,
    hoveringBorder,
    hoveringInner,
    splitedRectInnerCircle,
  };
}
function isMouseInCircle(circleX, circleY, radius, mouseX, mouseY) {
  // Calculate the distance between the mouse and the center of the circle
  const distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - circleY) ** 2);

  // Check if the distance is less than the radius of the circle
  if (distance <= radius) {
    return true;
  } else {
    return false;
  }
}

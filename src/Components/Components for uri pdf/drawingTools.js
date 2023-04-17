export function drawRect(canvas, scale, x, y, width, height, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.rect(x * scale, y * scale, width * scale, height * scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke * scale;
  ctx.stroke();
}
export function drawCircle(canvas, scale, x, y, r, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(scale * x, scale * y, scale * r, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke * scale;
  ctx.stroke();
}
export function drawLine(canvas, scale, x, y, xb, yb, color, stroke) {
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(x * scale, y * scale);
  ctx.lineTo(xb * scale, yb * scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke * scale;
  ctx.stroke();
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
  if (shapes.length > 0) {
    shapes.forEach((shape) => {
      if (shape.shape === "rect") {
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
    });
  }
}
// export function drawRoundedRect(
//   canvas,
//   scale,
//   x,
//   y,
//   width,
//   height,
//   radius,
//   color,
//   stroke
// ) {
//   const ctx = canvas.getContext("2d");
//   const cornerRadius = radius * scale;
//   const xScaled = x * scale;
//   const yScaled = y * scale;
//   const widthScaled = width * scale;
//   const heightScaled = height * scale;
//   const xRightScaled = (x + width) * scale;
//   const yBottomScaled = (y + height) * scale;
//   const xLeftScaled = xScaled + cornerRadius;
//   const xRightCornerScaled = xRightScaled - cornerRadius;
//   const yTopScaled = yScaled + cornerRadius;
//   const yBottomCornerScaled = yBottomScaled - cornerRadius;

//   ctx.beginPath();
//   ctx.moveTo(xLeftScaled, yScaled);
//   ctx.lineTo(xRightCornerScaled, yScaled);
//   ctx.arc(xRightCornerScaled, yTopScaled, cornerRadius, Math.PI * 1.5, 0);
//   ctx.lineTo(xRightScaled, yBottomCornerScaled);
//   ctx.arc(
//     xRightCornerScaled,
//     yBottomCornerScaled,
//     cornerRadius,
//     0,
//     Math.PI * 0.5
//   );
//   ctx.lineTo(xLeftScaled, yBottomScaled);
//   ctx.arc(
//     xLeftScaled,
//     yBottomCornerScaled,
//     cornerRadius,
//     Math.PI * 0.5,
//     Math.PI
//   );
//   ctx.lineTo(xScaled, yTopScaled);
//   ctx.arc(xLeftScaled, yTopScaled, cornerRadius, Math.PI, Math.PI * 1.5);
//   ctx.closePath();

//   ctx.strokeStyle = color;
//   ctx.lineWidth = stroke * scale;
//   ctx.stroke();
// }

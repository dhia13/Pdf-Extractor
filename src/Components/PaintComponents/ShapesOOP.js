export function Rect(x, y, w, h, color, filled, fillColor, stroke, opacity) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color;
  this.filled = filled;
  this.fillColor = fillColor;
  this.stroke = stroke;
  this.opacity = opacity;
  this.draw = function (canvas, scale) {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.lineWidth = this.stroke * scale;
    ctx.rect(this.x * scale, this.y * scale, this.w * scale, this.h * scale);
    if (this.filled) {
      ctx.fillStyle = this.fillColor;
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
  };
  this.isHovered = function (mouseX, mouseY) {
    const x1 = this.x;
    const x2 = this.x + this.w;
    const y1 = this.y;
    const y2 = this.y + this.h;
    return mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2;
  };
}
export function Circle(x, y, r, color, filled, fillColor, stroke, opacity) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = color;
  this.filled = filled;
  this.fillColor = fillColor;
  this.stroke = stroke;
  this.opacity = opacity;
  this.draw = function (canvas, scale) {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, 2 * Math.PI);
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.lineWidth = this.stroke * scale;
    if (this.filled) {
      ctx.fillStyle = this.fillColor;
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
  };
  this.isHovered = function (mouseX, mouseY) {
    const dx = x - mouseX;
    const dy = y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.r;
  };
}
export function Line(x, y, xb, yb, color, stroke, opacity) {
  this.x = x;
  this.y = y;
  this.xb = xb;
  this.yb = yb;
  this.color = color;
  this.stroke = stroke;
  this.opacity = opacity;
  this.draw = function (canvas, scale) {
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(x * scale, y * scale);
    ctx.lineTo(xb * scale, yb * scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = stroke * scale;
    ctx.stroke();
    ctx.closePath();
  };
}

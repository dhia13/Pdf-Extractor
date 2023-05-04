export function Plan(x, y, w, h, color, filled, fillColor, stroke, opacity) {
  if (w > 0 && h > 0) {
    this.x = x;
    this.y = y;
  }
  if (w < 0 && h > 0) {
    this.x = x + w;
    this.y = y;
  }
  if (w > 0 && h < 0) {
    this.x = x;
    this.y = y + h;
  }
  if (w < 0 && h < 0) {
    this.x = x + w;
    this.y = y + h;
  }
  this.w = Math.abs(w);
  this.h = Math.abs(h);
  if (this.w > this.h) {
    this.direction = "horizantal";
  } else {
    this.direction = "vertical";
  }
  this.color = color;
  this.filled = filled;
  this.fillColor = fillColor;
  this.stroke = stroke;
  this.opacity = opacity;
  this.splited = false;
  let progress = 0;
  this.splitPoint = {
    x: 0,
    y: 0,
    opacity: 0.3,
    shape1Color: "green",
    shape2Color: "red",
    start: "",
    direction: "",
    progress: progress,
  };
  this.draw = function (canvas, scale) {
    const ctx = canvas.getContext("2d");
    if (!this.splited) {
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
    } else {
      if (this.splited && this.splitPoint.direction == "horizantal") {
        const leftRectWidth = this.splitPoint.x - this.x;
        const rightRectWidth = this.w - (this.splitPoint.x - this.x);
        ctx.beginPath();
        ctx.globalAlpha = this.splitPoint.opacity;
        ctx.strokeStyle =
          this.splitPoint.start == "left"
            ? this.splitPoint.shape2Color
            : this.splitPoint.shape1Color;
        ctx.fillStyle =
          this.splitPoint.start == "left"
            ? this.splitPoint.shape2Color
            : this.splitPoint.shape1Color;
        ctx.lineWidth = this.stroke * scale;
        ctx.rect(
          this.x * scale,
          this.y * scale,
          leftRectWidth * scale,
          this.h * scale
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle =
          this.splitPoint.start == "left"
            ? this.splitPoint.shape1Color
            : this.splitPoint.shape2Color;
        ctx.fillStyle =
          this.splitPoint.start == "left"
            ? this.splitPoint.shape1Color
            : this.splitPoint.shape2Color;
        ctx.lineWidth = this.stroke * scale;
        ctx.rect(
          this.splitPoint.x * scale,
          this.y * scale,
          rightRectWidth * scale,
          this.h * scale
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(
          this.splitPoint.x * scale,
          (this.y + this.h / 2) * scale,
          20 * scale,
          0,
          2 * Math.PI
        );
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.fillStyle = "white";
        ctx.globalAlpha = 1;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
      if (this.splited && this.splitPoint.direction == "vertical") {
        const topRectHeight = this.splitPoint.y - this.y;
        const bottomRectHeight = this.h - (this.splitPoint.y - this.y);
        ctx.globalAlpha = this.splitPoint.opacity;
        ctx.lineWidth = this.stroke * scale;
        ctx.beginPath();
        ctx.strokeStyle =
          this.splitPoint.start == "top"
            ? this.splitPoint.shape1Color
            : this.splitPoint.shape2Color;
        ctx.fillStyle =
          this.splitPoint.start == "top"
            ? this.splitPoint.shape1Color
            : this.splitPoint.shape2Color;
        ctx.lineWidth = this.stroke * scale;
        ctx.rect(
          this.x * scale,
          this.y * scale,
          this.w * scale,
          topRectHeight * scale
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = this.stroke * scale;
        ctx.beginPath();
        ctx.strokeStyle =
          this.splitPoint.start == "top"
            ? this.splitPoint.shape2Color
            : this.splitPoint.shape1Color;
        ctx.fillStyle =
          this.splitPoint.start == "top"
            ? this.splitPoint.shape2Color
            : this.splitPoint.shape1Color;
        ctx.lineWidth = this.stroke * scale;
        ctx.rect(
          this.x * scale,
          this.splitPoint.y * scale,
          this.w * scale,
          bottomRectHeight * scale
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(
          (this.x + this.w / 2) * scale,
          this.splitPoint.y * scale,
          this.direction == "horizantal"
            ? this.h / 4 > 20
              ? 20
              : this.h / 4
            : this.w / 4 > 20
            ? 20
            : this.w / 4,
          0,
          2 * Math.PI
        );
        ctx.strokeStyle = "white";
        ctx.lineWidth = this.stroke * scale;
        ctx.fillStyle = "white";
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
    }
  };
  this.isHovered = function (mouseX, mouseY) {
    const x1 = this.x;
    const x2 = this.x + this.w;
    const y1 = this.y;
    const y2 = this.y + this.h;
    return mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2;
  };
  this.move = function (nx, ny) {
    this.x += nx;
    this.y += ny;
    if (this.splited) {
      this.splitPoint.x += nx;
      this.splitPoint.y += ny;
    }
  };
  this.split = function (nx, ny, direction, start) {
    this.splitPoint = { ...this.splitPoint, x: nx, y: ny, direction, start };
    // calculate percentage
    if (this.splited) {
      if (this.splitPoint.direction == "vertical") {
        if (this.splitPoint.start == "top") {
          this.splitPoint.progress = "";
        } else {
          this.splitPoint.progress = "";
        }
      }
      if (this.splitPoint.direction == "horizantal") {
        if (this.splitPoint.start == "left") {
          console.log("hirizantal left");
          this.splitPoint.progress = "";
        } else {
          console.log("horizantal top");
          this.splitPoint.progress = "";
        }
      }
    }
  };
  this.isInnerCircleHovered = function (mouseX, mouseY) {
    let dx;
    let dy;
    let distance;
    if (this.splitPoint.direction == "horizantal") {
      let r = this.h / 4 > 20 ? 20 : this.h / 4;
      dx = this.splitPoint.x - mouseX;
      dy = this.y + this.h / 2 - mouseY;
      distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= r;
    }
    if (this.splitPoint.direction == "vertical") {
      let r = this.w / 4 > 20 ? 20 : this.w / 4;
      dx = this.splitPoint.y - mouseY;
      dy = this.x + this.w / 2 - mouseX;
      distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= r;
    }
  };
  this.moveSplit = function (nx, ny) {
    if (this.splitPoint.direction == "horizantal") {
      if (
        this.splitPoint.x + nx > this.x &&
        this.splitPoint.x + nx < this.x + this.w
      ) {
        this.splitPoint.x += nx;
        return true;
      } else {
        return false;
      }
    }
    if (this.splitPoint.direction == "vertical") {
      if (this.splitPoint.y >= this.y && this.splitPoint.y <= this.y + this.h) {
        this.splitPoint.y += ny;
        return true;
      } else {
        return false;
      }
    }
  };
}
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
    if (w < 0 && h > 0) {
      return mouseX <= x1 && mouseX >= x2 && mouseY >= y1 && mouseY <= y2;
    }
    if (h < 0 && w > 0) {
      return mouseX >= x1 && mouseX <= x2 && mouseY <= y1 && mouseY >= y2;
    }
    if (h < 0 && w < 0) {
      return mouseX <= x1 && mouseX >= x2 && mouseY <= y1 && mouseY >= y2;
    } else {
      return mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2;
    }
  };
  this.move = function (nx, ny) {
    this.x += nx;
    this.y += ny;
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
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.r;
  };
  this.move = function (nx, ny) {
    this.x += nx;
    this.y += ny;
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
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.moveTo(this.x * scale, this.y * scale);
    ctx.lineTo(this.xb * scale, this.yb * scale);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.stroke * scale;
    ctx.stroke();
    ctx.closePath();
  };
  this.isHovered = function (Mx, My) {
    const tolerance = 5 * scale; // adjust the tolerance as needed
    const distance =
      Math.abs(
        (this.xb - this.x) * (this.y - My) - (this.x - Mx) * (this.yb - this.y)
      ) /
      Math.sqrt(
        (this.xb - this.x) * (this.xb - this.x) +
          (this.yb - this.y) * (this.yb - this.y)
      );
    return distance <= tolerance;
  };
  this.move = function (nx, ny) {
    this.x += nx;
    this.y += ny;
    this.xb += nx;
    this.yb += ny;
  };
}
export function Text(
  x,
  y,
  text,
  fontSize,
  fontWeight,
  fontStyle,
  color,
  opacity
) {
  this.x = x;
  this.y = y;
  this.text = text;
  this.fontSize = fontSize;
  this.fontWeight = fontWeight;
  this.fontStyle = fontStyle;
  this.color = color;
  this.opacity = opacity;
  this.draw = function (canvas, scale) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = this.color;
    const fontStyle = this.fontStyle || "normal";
    const fontWeight = this.fontWeight || "normal";
    const fontSize = this.fontSize * scale;
    const fontFamily = this.fontFamily || "Arial";
    const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = font;
    ctx.globalAlpha = this.opacity;
    ctx.fillText(this.text, this.x * scale, this.y * scale);
  };
  this.isHovered = function (Mx, My, canvas) {
    const ctx = canvas.getContext("2d");
    ctx.font = `${this.fontSize}px Arial`;
    console.log({
      Mx,
      My,
      x: this.x,
      y: this.y,
      textWidth: ctx.measureText(this.text).width,
    });
    console.log(
      Mx >= this.x &&
        Mx <= this.x + ctx.measureText(this.text).width &&
        My >= this.y - this.fontSize &&
        My <= this.y
    );
    return (
      Mx >= this.x &&
      Mx <= this.x + ctx.measureText(this.text).width &&
      My >= this.y - this.fontSize &&
      My <= this.y
    );
  };
  this.move = function (nx, ny) {
    this.x += nx;
    this.y += ny;
  };
}

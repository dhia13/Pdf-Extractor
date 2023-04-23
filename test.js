let sample = {
  scale: 1,
  plans: [
    {
      shape: "plan",
      x: 0,
      y: 0,
      w: 200,
      h: 200,
      color: "#000000",
      opacity: 1,
      stroke: 1,
      filled: false,
      fillColor: "",
      borderHovered: false,
      hovered: false,
      index: 0,
      splited: false,
      splitPoint: {
        x: 0,
        y: 0,
      },
      subColor: {
        color1: "#78f178",
        color2: "#ec4444",
      },
    },
  ],
  mouseX: 100,
  mouseY: 100,
};
function detectShapes(scale, plans, mouseX, mouseY) {
  console.log({ scale, plans, mouseX, mouseY });
  const hoveredBorders = [];
  const hoveredPlans = [];
  let hoveringBorder = false;
  let hoveringPlans = false;
  let planEditHover = false;
  plans.forEach((plan, i) => {
    const { plan: planType } = plan;

    if (planType === "plan") {
      const { x, y, w, h, stroke, splited, splitPoint } = plan;

      const borderLeft = x * scale - (stroke * scale) / 2;
      const borderRight = x * scale + (stroke * scale) / 2 + w * scale;
      const borderTop = y * scale - (stroke * scale) / 2;
      const borderBottom = y * scale + (stroke * scale) / 2 + h * scale;

      if (
        mouseX >= borderLeft &&
        mouseX <= borderRight &&
        mouseY >= borderTop &&
        mouseY <= borderBottom
      ) {
        plan.borderHovered = true;
        hoveredBorders.push(plan);
      }

      const innerLeft = x * scale + (stroke * scale) / 2;
      const innerRight = x * scale - (stroke * scale) / 2 + w * scale;
      const innerTop = y * scale + (stroke * scale) / 2;
      const innerBottom = y * scale - (stroke * scale) / 2 + h * scale;
      console.log({ innerLeft, innerRight, innerTop, innerBottom, Mou });
      if (
        mouseX >= innerLeft &&
        mouseX <= innerRight &&
        mouseY >= innerTop &&
        mouseY <= innerBottom
      ) {
        plan.hovered = true;
        hoveredPlans.push(plan);
      }

      if (splited) {
        if (w > h) {
          planEditHover = isMouseInCircle(
            splitPoint.x * scale,
            (y + h / 2) * scale,
            14,
            mouseX,
            mouseY
          );
        } else if (h > w) {
          planEditHover = isMouseInCircle(
            x + (w / 2) * scale,
            splitPoint.y * scale,
            14,
            mouseX,
            mouseY
          );
        }
      }
    } else if (planType === "circle") {
      // not implemented yet
    } else if (planType === "line") {
      // not implemented yet
    }
  });
  hoveringBorder = hoveredBorders.length > 0;
  hoveringPlans = hoveredPlans.length > 0;
  return {
    plans,
    hoveredBorders,
    hoveringBorder,
    hoveredPlans,
    hoveringPlans,
    planEditHover,
  };
}
let result = detectShapes(
  sample.scale,
  sample.plans,
  sample.mouseX,
  sample.mouseY
);
console.log(result);

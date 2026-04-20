export type RenderKind = "gun" | "bird" | "bullet";

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#8ed6ff");
  sky.addColorStop(1, "#e6f7ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(130, 70, 20, 0, Math.PI * 2);
  ctx.arc(155, 70, 16, 0, Math.PI * 2);
  ctx.arc(145, 55, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(610, 95, 18, 0, Math.PI * 2);
  ctx.arc(635, 95, 14, 0, Math.PI * 2);
  ctx.arc(625, 82, 16, 0, Math.PI * 2);
  ctx.fill();

  // Grass / ground
  ctx.fillStyle = "#7cb342";
  ctx.fillRect(0, height - 35, width, 35);
}

export function drawGameObject(
  ctx: CanvasRenderingContext2D,
  kind: RenderKind,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  if (kind === "gun") {
    drawGunIcon(ctx, x, y, w, h);
    return;
  }

  if (kind === "bird") {
    drawBirdIcon(ctx, x, y, w, h);
    return;
  }

  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, w, h);
}

export function drawScore(
  ctx: CanvasRenderingContext2D,
  points: number,
  x: number,
  y: number
): void {
  ctx.save();
  ctx.fillStyle = "#1d3557";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.fillText(`Score: ${points}`, x, y);
  ctx.restore();
}

function drawGunIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const iconSize = Math.max(20, Math.min(34, h + 12));

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${iconSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.fillText("🚀", x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

function drawBirdIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const iconSize = Math.max(24, Math.min(42, h + 16));

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${iconSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
  ctx.fillText("🐦", x + w / 2, y + h / 2);
  ctx.restore();
}

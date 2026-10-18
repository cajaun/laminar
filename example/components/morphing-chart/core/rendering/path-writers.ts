import { CHART_HEIGHT } from "@/components/morphing-chart/core/model/geometry";
import { Skia, type SkPath } from "@shopify/react-native-skia";

// build a reusable line path for native interpolation
export function createLinePath(
  yValues: readonly number[],
  chartWidth: number,
) {
  const path = Skia.Path.Make();
  writeLinePath(path, yValues, chartWidth);
  return path;
}

// build the closed path used by the optional chart fill
export function createFillPath(
  yValues: readonly number[],
  chartWidth: number,
) {
  const path = Skia.Path.Make();
  writeFillPath(path, yValues, chartWidth);
  return path;
}

// write the tangent continuous cubic path used by rendering and cursors
export function writeLinePath(
  path: SkPath,
  yValues: readonly number[],
  chartWidth: number,
) {
  "worklet";

  path.reset();
  if (yValues.length === 0) return;

  const stepX = chartWidth / Math.max(1, yValues.length - 1);
  path.moveTo(0, yValues[0]);

  for (let index = 1; index < yValues.length; index += 1) {
    const startX = (index - 1) * stepX;
    const endX = index * stepX;
    const startY = yValues[index - 1];
    const endY = yValues[index];
    const previousY = yValues[Math.max(0, index - 2)];
    const followingY = yValues[Math.min(yValues.length - 1, index + 1)];
    const firstControlY = startY + (endY - previousY) / 6;
    const secondControlY = endY - (followingY - startY) / 6;

    path.cubicTo(
      startX + stepX / 3,
      firstControlY,
      endX - stepX / 3,
      secondControlY,
      endX,
      endY,
    );
  }
}

export function writeFillPath(
  path: SkPath,
  yValues: readonly number[],
  chartWidth: number,
) {
  "worklet";

  writeLinePath(path, yValues, chartWidth);
  if (yValues.length === 0) return;

  path.lineTo(chartWidth, CHART_HEIGHT);
  path.lineTo(0, CHART_HEIGHT);
  path.close();
}

export function writeFutureClipPath(
  path: SkPath,
  cursorX: number,
  graphWidth: number,
  canvasWidth: number,
) {
  "worklet";

  path.reset();
  // clamp the carried cursor to the new graph bounds
  const startX = Math.max(0, Math.min(graphWidth, cursorX));
  const endX = Math.max(canvasWidth, startX + 0.001);

  path.moveTo(startX, 0);
  path.lineTo(endX, 0);
  path.lineTo(endX, CHART_HEIGHT);
  path.lineTo(startX, CHART_HEIGHT);
  path.close();
}

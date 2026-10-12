import type { CursorPoint } from "@/components/flux-chart/core/types";

function cubicAt(
  start: number,
  controlOne: number,
  controlTwo: number,
  end: number,
  t: number,
) {
  "worklet";

  const inverseT = 1 - t;

  return (
    inverseT ** 3 * start +
    3 * inverseT ** 2 * t * controlOne +
    3 * inverseT * t ** 2 * controlTwo +
    t ** 3 * end
  );
}

/** Finds the point on the rendered cubic line at a continuous chart X. */
export function getChartCursorPoint(
  points: CursorPoint[],
  x: number,
  chartWidth: number,
): CursorPoint | null {
  "worklet";

  if (points.length === 0) return null;
  if (points.length === 1 || chartWidth <= 0) return points[0];

  const clampedX = Math.max(0, Math.min(chartWidth, x));
  const segmentCount = points.length - 1;
  const segmentPosition = (clampedX / chartWidth) * segmentCount;
  const segmentIndex = Math.min(segmentCount - 1, Math.floor(segmentPosition));
  const left = points[segmentIndex];
  const right = points[segmentIndex + 1];
  const segmentWidth = right.x - left.x;
  const localX = segmentWidth > 0
    ? Math.max(0, Math.min(1, (clampedX - left.x) / segmentWidth))
    : 0;

  // The renderer uses X control points at 1/3 and 2/3, so X is linear in t.
  const previousPoint = points[Math.max(0, segmentIndex - 1)];
  const followingPoint = points[Math.min(points.length - 1, segmentIndex + 2)];
  const firstControlY = left.y + (right.y - previousPoint.y) / 6;
  const secondControlY = right.y - (followingPoint.y - left.y) / 6;
  const firstControlValue = left.value + (right.value - previousPoint.value) / 6;
  const secondControlValue = right.value - (followingPoint.value - left.value) / 6;

  return {
    x: clampedX,
    y: cubicAt(left.y, firstControlY, secondControlY, right.y, localX),
    value: cubicAt(
      left.value,
      firstControlValue,
      secondControlValue,
      right.value,
      localX,
    ),
  };
}

import { BOTTOM, CHART_WIDTH, RANGE } from "@/components/flux-chart/core/model/geometry";
import type { CursorPoint } from "@/components/flux-chart/core/types";

function getPointY(value: number) {
  return BOTTOM - (value / 100) * RANGE;
}

/** Converts normalized chart samples into render-space Y coordinates. */
export function buildChartYValues(data: number[]): number[] {
  return data.map(getPointY);
}

/** Converts normalized chart samples into the shared cursor lookup model. */
export function buildChartPoints(
  data: number[],
  chartWidth: number = CHART_WIDTH,
): CursorPoint[] {
  if (data.length === 0) return [];

  return data.map((value, index) => ({
    x: (index / Math.max(1, data.length - 1)) * chartWidth,
    y: getPointY(value),
    value,
  }));
}

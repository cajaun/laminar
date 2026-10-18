import { BOTTOM, CHART_WIDTH, RANGE } from "@/components/morphing-chart/core/model/geometry";
import type { CursorPoint } from "@/components/morphing-chart/core/types";

function getPointY(value: number) {
  return BOTTOM - (value / 100) * RANGE;
}

// convert normalized samples into render space y coordinates
export function buildChartYValues(data: number[]): number[] {
  return data.map(getPointY);
}

// convert normalized samples into cursor lookup points
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

import { BOTTOM, CHART_WIDTH, RANGE } from "@/components/morphing-chart/core/model/geometry";
import type { CursorPoint } from "@/components/morphing-chart/core/types";

function getPointY(value: number) {
  return BOTTOM - (value / 100) * RANGE;
}

const chartYValuesCache = new WeakMap<readonly number[], number[]>();
const chartPointsCache = new WeakMap<
  readonly number[],
  Map<number, CursorPoint[]>
>();

// map normalized samples to chart y coordinates
export function buildChartYValues(data: number[]): number[] {
  return data.map(getPointY);
}

// reuse range geometry between press handling and rendering
export function getCachedChartYValues(data: number[]): number[] {
  const cached = chartYValuesCache.get(data);
  if (cached) return cached;

  const next = buildChartYValues(data);
  chartYValuesCache.set(data, next);
  return next;
}

// map normalized samples to cursor lookup points
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

// reuse cursor points until the selected range changes
export function getCachedChartPoints(
  data: number[],
  chartWidth: number = CHART_WIDTH,
): CursorPoint[] {
  let widthCache = chartPointsCache.get(data);

  if (!widthCache) {
    widthCache = new Map();
    chartPointsCache.set(data, widthCache);
  }

  const cached = widthCache.get(chartWidth);
  if (cached) return cached;

  const next = buildChartPoints(data, chartWidth);
  widthCache.set(chartWidth, next);
  return next;
}

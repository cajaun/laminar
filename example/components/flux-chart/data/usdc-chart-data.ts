import type { ChartDataBySource, RangeMeta, RangeType } from "@/components/flux-chart/data/chart-data";

const RAW_USDC_SERIES: Record<RangeType, number[]> = {
  "1H": [
    51, 63, 45, 58, 55, 39, 54, 61, 43, 67, 50, 57, 47, 42, 63, 52,
    59, 48, 54, 45, 61, 51, 58, 44, 56, 49, 64, 52, 58, 47, 55, 50,
  ],
  "1D": [
    56, 64, 48, 58, 55, 39, 54, 63, 44, 68, 51, 57, 45, 42, 61, 53,
    59, 47, 54, 43, 62, 50, 57, 45, 56, 49, 65, 52, 58, 47, 55, 51,
  ],
  "1W": [
    53, 62, 47, 59, 55, 38, 53, 66, 45, 70, 50, 58, 46, 41, 64, 52,
    61, 48, 55, 43, 63, 51, 59, 44, 57, 48, 67, 53, 60, 46, 56, 50,
  ],
  "1M": [
    54, 65, 47, 59, 56, 42, 55, 64, 46, 69, 51, 57, 45, 39, 63, 52,
    60, 49, 55, 43, 62, 50, 58, 45, 56, 48, 66, 52, 59, 47, 55, 50,
    61, 45, 67, 53, 58, 46, 64, 51, 57, 43, 62, 49, 56, 47, 65, 52,
    59, 45, 63, 50, 57, 44, 61, 48, 55, 46, 64, 51, 58, 45, 62, 49,
  ],
  "1Y": [
    68, 64, 59, 54, 57, 51, 47, 50, 44, 39, 42, 36, 40, 34, 38, 31,
    35, 29, 33, 28, 31, 35, 29, 34, 30, 37, 32, 39, 34, 42, 38, 45,
  ],
};

const USDC_POINT_COUNT = 64;

function resampleSeries(values: number[]) {
  return Array.from({ length: USDC_POINT_COUNT }, (_, index) => {
    const position =
      (index / Math.max(1, USDC_POINT_COUNT - 1)) * (values.length - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.min(values.length - 1, lowerIndex + 1);
    const progress = position - lowerIndex;

    return (
      values[lowerIndex] +
      (values[upperIndex] - values[lowerIndex]) * progress
    );
  });
}

const USDC_SERIES: Record<RangeType, number[]> = {
  "1H": resampleSeries(RAW_USDC_SERIES["1H"]),
  "1D": resampleSeries(RAW_USDC_SERIES["1D"]),
  "1W": resampleSeries(RAW_USDC_SERIES["1W"]),
  "1M": resampleSeries(RAW_USDC_SERIES["1M"]),
  "1Y": resampleSeries(RAW_USDC_SERIES["1Y"]),
};

const metadata: Record<RangeType, RangeMeta> = {
  "1H": { totalValue: 1, percentChange: -0.04, periodLabel: "last hour" },
  "1D": { totalValue: 1, percentChange: 0, periodLabel: "last day" },
  "1W": { totalValue: 1, percentChange: 0.08, periodLabel: "last week" },
  "1M": { totalValue: 1, percentChange: -0.23, periodLabel: "last month" },
  "1Y": { totalValue: 1, percentChange: -0.12, periodLabel: "last year" },
};

export const USDC_CHART_DATA: ChartDataBySource = {
  chartDataSets: USDC_SERIES,
  rangeMetadata: metadata,
};

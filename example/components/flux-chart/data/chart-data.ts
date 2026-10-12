export type RangeType = "1H" | "1D" | "1W" | "1M" | "1Y";
export type DataSourceOption = "Revenue" | "Downloads" | "MRR";

export type RangeMeta = {
  totalValue: number;
  percentChange: number;
  periodLabel: string;
};

export type ChartDataBySource = {
  chartDataSets: Record<RangeType, number[]>;
  rangeMetadata: Record<RangeType, RangeMeta>;
};

/**
 * High-resolution centerline samples traced from the supplied 1170px
 * reference screenshots. Keeping the samples dense preserves the small
 * oscillations while still allowing the chart path to morph between ranges.
 */
const REFERENCE_SERIES: Record<RangeType, number[]> = {
  "1H": [
    63.8, 64.4, 66.2, 69.2, 73.2, 77.6, 81.3, 83.9, 85.4, 85.8, 84.8, 82.8,
    79.5, 75.1, 70.5, 66.8, 64.3, 62.9, 62.7, 62.9, 63.4, 64.1, 65.2, 66.2,
    66.9, 67.4, 67.7, 67.8, 67.9, 68.3, 68.9, 69.7, 70.3, 70.8, 71.2, 71.3,
    71.2, 71.0, 70.7, 70.2, 69.5, 68.9, 68.5, 68.2, 68.1, 67.9, 67.2, 65.9,
    64.1, 62.1, 60.2, 58.9, 58.2, 57.9, 57.6, 56.7, 55.2, 53.1, 50.9, 49.1,
    47.7, 47.0, 46.8, 47.8, 49.9, 53.2, 57.6, 62.2, 65.9, 68.4, 69.7, 69.5,
    66.4, 60.4, 51.2, 39.4, 27.5, 18.4, 12.4, 9.2, 8.9, 9.7, 11.1, 13.3,
    16.0, 18.6, 20.5, 21.8, 22.3, 22.3, 21.8, 21.0, 19.7, 18.2, 16.9, 15.9,
    15.3, 15.1, 14.9, 14.1, 12.7, 10.6, 8.4, 6.7, 4.9, 4.6, 4.6, 4.6,
    4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6, 4.6,
  ],
  "1D": [
    51.2, 55.3, 57.2, 54.6, 52.3, 52.6, 53.2, 56.0, 60.6, 64.0, 61.7, 57.4,
    53.8, 53.5, 55.4, 58.2, 64.2, 71.4, 72.2, 66.3, 61.9, 60.0, 56.0, 49.3,
    42.8, 39.4, 41.2, 43.0, 41.9, 39.0, 38.5, 42.4, 46.1, 47.0, 46.3, 45.8,
    45.8, 46.5, 48.0, 49.9, 51.5, 51.9, 51.0, 50.2, 50.9, 52.4, 51.7, 48.4,
    43.8, 39.0, 35.2, 33.9, 32.0, 25.0, 16.8, 12.8, 11.8, 9.3, 8.9, 11.0,
    11.6, 11.8, 14.9, 17.6, 17.5, 21.0, 27.0, 31.9, 34.0, 35.5, 38.0, 40.3,
    39.4, 36.0, 33.2, 31.9, 30.3, 30.6, 33.7, 37.1, 41.8, 50.7, 60.0, 63.6,
    61.0, 57.4, 52.0, 47.1, 51.1, 59.2, 65.4, 70.2, 76.0, 78.6, 75.1, 72.3,
    73.2, 72.8, 69.2, 62.3, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8,
    57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8, 57.8,
  ],
  "1W": [
    27.9, 26.1, 29.5, 35.3, 40.7, 44.4, 46.4, 47.3, 49.4, 52.5, 55.5, 57.7,
    59.0, 58.6, 56.9, 56.2, 56.0, 55.1, 54.2, 55.5, 55.4, 52.0, 48.4, 46.8,
    46.4, 45.2, 43.3, 39.6, 33.8, 29.3, 28.1, 28.1, 26.3, 24.4, 23.9, 24.8,
    27.0, 28.0, 23.8, 16.3, 9.2, 6.2, 9.3, 12.7, 14.0, 14.1, 15.3, 15.7,
    13.0, 9.8, 10.4, 15.3, 20.5, 23.4, 23.4, 22.6, 20.8, 19.2, 25.2, 39.0,
    55.3, 66.8, 72.5, 75.4, 76.1, 73.6, 71.7, 72.5, 74.2, 75.7, 76.1, 76.6,
    79.8, 84.1, 81.6, 68.5, 52.5, 43.5, 45.9, 48.7, 47.9, 46.5, 46.6, 46.9,
    47.2, 47.6, 47.0, 46.5, 46.9, 48.2, 48.8, 48.8, 49.3, 49.8, 50.9, 53.6,
    57.4, 60.3, 61.0, 61.1, 62.7, 65.8, 70.0, 73.6, 74.6, 74.3, 72.0, 69.6,
    71.0, 72.7, 72.5, 67.4, 61.7, 63.2, 67.1, 69.0, 72.0, 76.3, 80.0, 80.2,
  ],
  "1M": [
    10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.1, 10.2, 10.0, 8.7, 6.8,
    5.3, 5.0, 5.4, 6.0, 6.7, 6.9, 7.0, 7.3, 7.6, 7.8, 7.5, 6.6,
    5.5, 4.8, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.9,
    7.0, 8.2, 8.8, 8.8, 8.6, 8.5, 8.4, 8.5, 9.5, 11.1, 12.4, 13.8,
    21.2, 35.4, 48.9, 55.3, 57.9, 62.5, 67.7, 70.7, 71.2, 71.8, 72.7, 73.3,
    73.5, 74.7, 76.6, 78.1, 78.7, 79.0, 79.8, 80.6, 80.8, 80.8, 80.8, 80.7,
    80.7, 80.7, 80.8, 80.9, 81.0, 81.1, 82.1, 83.8, 85.3, 85.8, 84.0, 80.5,
    76.9, 75.2, 75.4, 76.6, 78.0, 78.7, 78.6, 77.4, 75.6, 74.4, 74.3, 75.7,
    78.2, 80.4, 81.1, 79.7, 76.6, 73.4, 71.9, 71.9, 72.1, 72.5, 72.6, 73.4,
    76.6, 81.1, 84.6, 85.4, 84.0, 81.5, 79.2, 78.4, 79.5, 81.9, 84.3, 85.4,
  ],
  "1Y": [
    82.6, 82.3, 80.0, 74.6, 69.8, 72.2, 77.4, 80.9, 78.6, 73.5, 69.7, 67.8,
    65.6, 65.3, 67.1, 67.8, 63.5, 57.4, 53.5, 53.1, 50.6, 46.1, 41.5, 39.3,
    40.3, 42.2, 43.1, 43.5, 45.2, 46.7, 44.5, 41.6, 40.3, 41.3, 41.0, 40.5,
    42.2, 44.8, 46.3, 46.1, 47.7, 50.0, 47.8, 43.2, 39.9, 38.4, 32.9, 25.5,
    20.0, 17.5, 16.6, 16.5, 15.8, 14.4, 13.7, 14.9, 16.6, 17.0, 15.9, 16.4,
    19.1, 21.4, 20.1, 18.7, 17.8, 16.7, 17.2, 17.9, 19.6, 22.1, 24.3, 25.2,
    24.7, 24.0, 24.3, 23.7, 23.6, 24.5, 24.5, 24.3, 23.1, 21.1, 19.4, 19.1,
    18.4, 17.0, 15.0, 11.3, 7.7, 6.3, 7.1, 8.6, 9.3, 8.4, 6.7, 5.1,
    5.7, 8.0, 9.8, 10.1, 10.9, 12.2, 12.7, 13.1, 13.5, 13.6, 13.2, 12.6,
    13.0, 13.7, 13.2, 12.9, 12.9, 19.1, 26.1, 28.4, 28.1, 27.5, 27.6, 28.4,
  ],
};

const metadata: Record<DataSourceOption, Record<RangeType, RangeMeta>> = {
  Revenue: {
    "1H": { totalValue: 2_502.3, percentChange: -0.39, periodLabel: "last hour" },
    "1D": { totalValue: 2_502.3, percentChange: 0, periodLabel: "last day" },
    "1W": { totalValue: 2_502.3, percentChange: 3.61, periodLabel: "last week" },
    "1M": { totalValue: 2_502.3, percentChange: 30.9, periodLabel: "last month" },
    "1Y": { totalValue: 2_502.3, percentChange: -43.83, periodLabel: "last year" },
  },
  Downloads: {
    "1H": { totalValue: 28_400, percentChange: -0.06, periodLabel: "last hour" },
    "1D": { totalValue: 28_450, percentChange: 0.52, periodLabel: "last day" },
    "1W": { totalValue: 28_305, percentChange: -0.51, periodLabel: "last week" },
    "1M": { totalValue: 36_856, percentChange: 29.59, periodLabel: "last month" },
    "1Y": { totalValue: 312_000, percentChange: 24.5, periodLabel: "last year" },
  },
  MRR: {
    "1H": { totalValue: 4_180, percentChange: -0.06, periodLabel: "last hour" },
    "1D": { totalValue: 4_200, percentChange: 0.52, periodLabel: "last day" },
    "1W": { totalValue: 4_178, percentChange: -0.51, periodLabel: "last week" },
    "1M": { totalValue: 5_443, percentChange: 29.59, periodLabel: "last month" },
    "1Y": { totalValue: 48_500, percentChange: 18, periodLabel: "last year" },
  },
};

const sourceOffsets: Record<DataSourceOption, number> = {
  Revenue: 0,
  Downloads: 4,
  MRR: -4,
};

function getSeries(range: RangeType, source: DataSourceOption) {
  const offset = sourceOffsets[source];
  const variation = source === "Revenue"
    ? 0
    : Math.sin((offset + 1) * 0.7) * 0.9;

  return REFERENCE_SERIES[range].map((value) =>
    Math.max(
      3,
      Math.min(97, value + offset + variation),
    ),
  );
}

const makeSourceData = (source: DataSourceOption): ChartDataBySource => ({
  chartDataSets: {
    "1H": getSeries("1H", source),
    "1D": getSeries("1D", source),
    "1W": getSeries("1W", source),
    "1M": getSeries("1M", source),
    "1Y": getSeries("1Y", source),
  },
  rangeMetadata: metadata[source],
});

export const CHART_DATA_BY_SOURCE: Record<
  DataSourceOption,
  ChartDataBySource
> = {
  Revenue: makeSourceData("Revenue"),
  Downloads: makeSourceData("Downloads"),
  MRR: makeSourceData("MRR"),
};

export const CHART_DATA_SETS = CHART_DATA_BY_SOURCE.Revenue.chartDataSets;
export const RANGE_METADATA = CHART_DATA_BY_SOURCE.Revenue.rangeMetadata;

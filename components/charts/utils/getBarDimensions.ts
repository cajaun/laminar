import { SCREEN_WIDTH, CHART_PADDING, MAX_BAR_WIDTH} from "./Chart";
import { Period } from "../types/ChartTypes";

export const getBarDimensions = (period: Period, dataLength: number) => {
  "worklet";
  const availableWidth = SCREEN_WIDTH - CHART_PADDING * 2;
  let barWidth: number;
  let gap: number;

  switch (period) {
    case "1D":
      barWidth = MAX_BAR_WIDTH;
      gap = 0;
      break;
    case "1W":
      barWidth = MAX_BAR_WIDTH;
      gap = (availableWidth - barWidth * 7) / 6;
      break;
    case "1M":
      // Scale the bar width dynamically based on the number of data points
      const maxBarsInWidth = Math.floor(availableWidth / (10 + 4)); // max bar + gap space
      barWidth = Math.max(availableWidth / (maxBarsInWidth * 1.5), 8); // Scale width dynamically, with a minimum bar width
      gap = Math.max((availableWidth - barWidth * dataLength) / (dataLength - 1), 4);
      break;
    case "1Y":
      barWidth = 20;
      gap = (availableWidth - barWidth * 12) / 11;
      break;
    default:
      barWidth = MAX_BAR_WIDTH;
      gap = 10;
  }

  return { barWidth, gap };
};

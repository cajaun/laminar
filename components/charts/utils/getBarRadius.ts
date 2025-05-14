import { Period } from "../types/ChartTypes";




export const getBarRadius = (period: Period, barWidth: number) => {
  switch (period) {
    case "1D":
        return barWidth / 3;
      case "1W":
        return barWidth / 3;
      case "1M":
        return 4;
      case "1Y":
        return barWidth / 3;
      default:
        return barWidth / 2;
    }
  };
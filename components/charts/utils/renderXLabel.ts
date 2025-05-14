import { Period } from "../types/ChartTypes";



export const renderXLabel = (label: string, index: number, selectedPeriod: Period) => {
    if (selectedPeriod === "1M") {
      // Show every 5th label for months
      return index % 5 === 0 ? label : "";
    }
    return label;
  };

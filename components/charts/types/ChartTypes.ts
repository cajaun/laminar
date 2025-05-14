export type Period = "1D" | "1W" | "1M" | "1Y";

export type TooltipData = {
    value: number;
    label: string;
    barIndex: number;
  } | null;
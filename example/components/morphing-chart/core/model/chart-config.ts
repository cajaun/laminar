import { ReduceMotion } from "react-native-reanimated";
import type { RangeType } from "@/components/morphing-chart/data/chart-data";

export const CHART_COLOR = "#000000";
export const FUTURE_LINE_COLOR = "#F5F5F5";
export const REFERENCE_GREEN = "#00CA47";
export const REFERENCE_GRAY = "#999999";

export const REFERENCE_GRAPH_EXTENT: Record<RangeType, number> = {
  "1H": 1040 / 1170,
  "1D": 992 / 1170,
  "1W": 1,
  "1M": 1,
  "1Y": 1,
};

export const CURSOR_FADE_DURATION = 250;
export const CURSOR_SCALE_DURATION = 100;
export const CHART_MORPH_DURATION = 250;
export const CURSOR_SCALE_START = 0;
export const CURSOR_ENTRY_SPRING = {
  stiffness: 2000,
  damping: 100,
  mass: 2,
  energyThreshold: 6e-9,
  velocity: 0,
  reduceMotion: ReduceMotion.System,
};

export const DAY_LABEL_START_MINUTES = 2 * 60 + 45;
export const DAY_LABEL_END_MINUTES = 11 * 60 + 25;

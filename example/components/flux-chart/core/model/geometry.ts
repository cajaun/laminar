import { Dimensions } from "react-native";

const { width: windowWidth } = Dimensions.get("window");

export const CHART_HEIGHT = 380;
export const CHART_WIDTH = Math.min(520, Math.max(280, windowWidth - 40));
export const CHART_PADDING_TOP = 0.08;
export const CHART_PADDING_BOTTOM = 0.08;
export const CROSSHAIR_RADIUS = 6;
export const TOP = CHART_HEIGHT * CHART_PADDING_TOP;
export const BOTTOM = CHART_HEIGHT * (1 - CHART_PADDING_BOTTOM);
export const RANGE = BOTTOM - TOP;

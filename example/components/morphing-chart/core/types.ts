import type { SharedValue } from "react-native-reanimated";

export type Cursor = {
  x: number;
  y: number;
  value: number;
};

export type CursorPoint = Cursor;

export type CursorAnimated = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  value: SharedValue<number>;
  isCursorVisible: SharedValue<number>;
};

export type AnimatedTextProps = {
  // animate the numeric value when it changes
  value: number;
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "600" | "700";
  prefix?: string;
  suffix?: string;
  fractionDigits?: number;
  className?: string;
  style?: object;
};

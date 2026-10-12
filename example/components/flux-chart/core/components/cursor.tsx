import React from "react";
import { Circle, Line } from "@shopify/react-native-skia";
import {
  type SharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { CHART_HEIGHT, CROSSHAIR_RADIUS } from "@/components/flux-chart/core/model/geometry";

const CURSOR_GUIDE_START_Y = 32;
const CURSOR_GUIDE_COLOR = "#F6F7F7";
const CURSOR_BORDER_COLOR = "#F6F7F7";

type CursorProps = {
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  scale: SharedValue<number>;
  fadeProgress: SharedValue<number>;
};

export function Cursor({ cursorX, cursorY, scale, fadeProgress }: CursorProps) {
  const center = useDerivedValue(() => ({
    x: cursorX.value,
    y: cursorY.value,
  }));
  const guideStart = useDerivedValue(() => ({
    x: cursorX.value,
    y: CURSOR_GUIDE_START_Y,
  }));
  const guideEnd = useDerivedValue(() => ({
    x: cursorX.value,
    y: CHART_HEIGHT,
  }));
  const outerRadius = useDerivedValue(
    () => (CROSSHAIR_RADIUS + 2) * scale.value,
  );
  const innerRadius = useDerivedValue(
    () => CROSSHAIR_RADIUS * scale.value,
  );
  const outerBorderWidth = useDerivedValue(() => 0.75 * scale.value);
  const innerBorderWidth = useDerivedValue(() => 2 * scale.value);
  const outerBorderOpacity = useDerivedValue(
    () => 0.26 * fadeProgress.value,
  );

  return (
    <>
      <Line
        p1={guideStart}
        p2={guideEnd}
        color={CURSOR_GUIDE_COLOR}
        strokeWidth={1.25}
        opacity={fadeProgress}
      />
      <Circle c={center} r={outerRadius} color="#FFFFFF" opacity={fadeProgress} />
      <Circle
        c={center}
        r={outerRadius}
        color={CURSOR_BORDER_COLOR}
        opacity={outerBorderOpacity}
        style="stroke"
        strokeWidth={outerBorderWidth}
      />
      <Circle c={center} r={innerRadius} color="#000000" opacity={fadeProgress} />
      <Circle
        c={center}
        r={innerRadius}
        color="#FFFFFF"
        opacity={fadeProgress}
        style="stroke"
        strokeWidth={innerBorderWidth}
      />
    </>
  );
}

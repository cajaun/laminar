import React from "react";
import { Circle, Line } from "@shopify/react-native-skia";
import {
  type SharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { CHART_HEIGHT, CROSSHAIR_RADIUS } from "@/components/morphing-chart/core/model/geometry";
import { useMorphingChartTheme } from "@/components/morphing-chart/ui/morphing-chart-theme";

const CURSOR_GUIDE_START_Y = 32;
type CursorProps = {
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  scale: SharedValue<number>;
  fadeProgress: SharedValue<number>;
};

export function Cursor({ cursorX, cursorY, scale, fadeProgress }: CursorProps) {
  const theme = useMorphingChartTheme();
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
        color={theme.cursorGuide}
        strokeWidth={1.25}
        opacity={fadeProgress}
      />
      <Circle c={center} r={outerRadius} color={theme.cursorOuter} opacity={fadeProgress} />
      <Circle
        c={center}
        r={outerRadius}
        color={theme.cursorBorder}
        opacity={outerBorderOpacity}
        style="stroke"
        strokeWidth={outerBorderWidth}
      />
      <Circle c={center} r={innerRadius} color={theme.cursorInner} opacity={fadeProgress} />
      <Circle
        c={center}
        r={innerRadius}
        color={theme.cursorBorder}
        opacity={fadeProgress}
        style="stroke"
        strokeWidth={innerBorderWidth}
      />
    </>
  );
}

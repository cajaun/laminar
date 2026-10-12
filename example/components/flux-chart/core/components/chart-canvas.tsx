import React from "react";
import {
  Canvas,
  Circle as SkiaCircle,
  Group,
  LinearGradient,
  Path,
  usePathValue,
  vec,
} from "@shopify/react-native-skia";
import {
  interpolateColor,
  type DerivedValue,
  type SharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { CHART_HEIGHT, CROSSHAIR_RADIUS } from "@/components/flux-chart/core/model/geometry";
import { Cursor } from "@/components/flux-chart/core/components/cursor";
import {
  writeFillPath,
  writeFutureClipPath,
  writeLinePath,
} from "@/components/flux-chart/core/rendering/path-writers";
import {
  CHART_COLOR,
  FUTURE_LINE_COLOR,
} from "@/components/flux-chart/core/model/chart-config";

const LIVE_DOT_COLLAPSE_DISTANCE = CROSSHAIR_RADIUS * 8;

function withAlpha(color: string, alpha: number) {
  if (!color.startsWith("#")) return color;

  const hex = color.slice(1);
  const normalized = hex.length === 3
    ? hex.split("").map((channel) => `${channel}${channel}`).join("")
    : hex;

  if (normalized.length !== 6) return color;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export type ChartCanvasProps = {
  animatedGraphWidth: SharedValue<number>;
  chartWidth: number;
  cursorScale: SharedValue<number>;
  cursorX: SharedValue<number>;
  cursorY: SharedValue<number>;
  fadeProgress: SharedValue<number>;
  fillBottomColor?: string;
  fillTopColor?: string;
  futureLineColor?: string;
  lineColor?: string;
  morphedYValues: DerivedValue<number[]>;
  showFill?: boolean;
};

/** Renders the chart through Skia so cursor scrubbing stays on the GPU-backed canvas. */
function ChartCanvasComponent({
  animatedGraphWidth,
  chartWidth,
  cursorScale,
  cursorX,
  cursorY,
  fadeProgress,
  fillBottomColor = CHART_COLOR,
  fillTopColor = CHART_COLOR,
  futureLineColor = FUTURE_LINE_COLOR,
  lineColor = CHART_COLOR,
  morphedYValues,
  showFill = false,
}: ChartCanvasProps) {
  const animatedLinePath = usePathValue((path) => {
    "worklet";

    writeLinePath(path, morphedYValues.value, animatedGraphWidth.value);
  });
  const animatedFillPath = usePathValue((path) => {
    "worklet";

    if (showFill) {
      writeFillPath(path, morphedYValues.value, animatedGraphWidth.value);
    } else {
      path.reset();
    }
  });
  const futureClipPath = usePathValue((path) => {
    "worklet";

    writeFutureClipPath(
      path,
      cursorX.value,
      animatedGraphWidth.value,
      chartWidth,
    );
  });
  const animatedFutureLineColor = useDerivedValue(() =>
    interpolateColor(fadeProgress.value, [0, 1], [lineColor, futureLineColor]),
  );
  const animatedEndpointRadius = useDerivedValue(() => {
    // Keep the marker attached to the terminal path point. When a range fills
    // the canvas, the endpoint becomes the line's round cap by collapsing the
    // marker radius instead of removing a separate dot mid-morph.
    const distanceToEdge = chartWidth - animatedGraphWidth.value;

    const scale = Math.max(
      0,
      Math.min(1, distanceToEdge / LIVE_DOT_COLLAPSE_DISTANCE),
    );

    return CROSSHAIR_RADIUS * scale;
  });
  const animatedEndpointCenter = useDerivedValue(() => {
    // Read the endpoint from the exact path being drawn. This keeps the live
    // marker locked to the line even while the path is morphing between ranges.
    const endpoint = animatedLinePath.value.getLastPt();

    return {
      x: endpoint.x,
      y: endpoint.y,
    };
  });

  return (
    <Canvas style={{ width: chartWidth, height: CHART_HEIGHT }}>
      {showFill ? (
        <>
          <Path path={animatedFillPath}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, CHART_HEIGHT)}
              colors={[
                withAlpha(fillTopColor, 0.16),
                withAlpha(fillBottomColor, 0),
              ]}
            />
          </Path>
          <Group clip={futureClipPath} opacity={fadeProgress}>
            <Path path={animatedFillPath}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, CHART_HEIGHT)}
                colors={[
                  withAlpha(futureLineColor, 0.16),
                  withAlpha(futureLineColor, 0),
                ]}
              />
            </Path>
          </Group>
        </>
      ) : null}
      <Group clip={futureClipPath} invertClip>
        <Path
          path={animatedLinePath}
          style="stroke"
          color={lineColor}
          strokeCap="round"
          strokeJoin="round"
          strokeWidth={5}
        />
      </Group>
      <Group clip={futureClipPath}>
        <Path
          path={animatedLinePath}
          style="stroke"
          color={animatedFutureLineColor}
          strokeCap="round"
          strokeJoin="round"
          strokeWidth={5}
        />
      </Group>
      {/* Keep the live marker in the same clipped color layers as the line.
       * This makes it turn grey with the future segment while scrubbing and
       * return to the line color as the scrub fades out. */}
      <Group clip={futureClipPath} invertClip>
        <SkiaCircle
          c={animatedEndpointCenter}
          r={animatedEndpointRadius}
          color={lineColor}
        />
      </Group>
      <Group clip={futureClipPath}>
        <SkiaCircle
          c={animatedEndpointCenter}
          r={animatedEndpointRadius}
          color={animatedFutureLineColor}
        />
      </Group>
      <Cursor
        cursorX={cursorX}
        cursorY={cursorY}
        scale={cursorScale}
        fadeProgress={fadeProgress}
      />
    </Canvas>
  );
}

export const ChartCanvas = React.memo(ChartCanvasComponent);

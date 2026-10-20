import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { useGrowthChartMarker } from "../core/use-growth-chart-marker";

export const GrowthChart = React.memo(function GrowthChart({
  width,
  height,
  axisColor,
  isDark,
}: {
  readonly width: number;
  readonly height: number;
  readonly axisColor: string;
  readonly isDark: boolean;
}) {
  const line = `M 0 ${height * 0.77} C ${width * 0.3} ${height * 0.69}, ${width * 0.7} ${height * 0.55}, ${width} 0`;
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const {
    chartGesture,
    lowerStemStyle,
    markerStyle,
    upperStemStyle,
  } = useGrowthChartMarker(width, height);

  return (
    <View style={{ width, height: height + 44 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgLinearGradient id="projectionArea" x1="0" y1="0" x2="1" y2="0">
            <Stop
              offset="0"
              stopColor={isDark ? "#B9D6FC" : "#238EFF"}
              stopOpacity={isDark ? 0.2 : 0.17}
            />
            <Stop
              offset="1"
              stopColor={isDark ? "#A5A4F7" : "#9A91FF"}
              stopOpacity={isDark ? 0.2 : 0.18}
            />
          </SvgLinearGradient>
          <SvgLinearGradient id="projectionLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={isDark ? "#C0D3F9" : "#1688FF"} />
            <Stop offset="1" stopColor={isDark ? "#9896F8" : "#9287FF"} />
          </SvgLinearGradient>
        </Defs>
        <Path d={area} fill="url(#projectionArea)" />
        {Array.from({ length: 7 }, (_, index) => {
          const x = (width * index) / 6;
          return (
            <Path
              key={index}
              d={`M ${x} 0 L ${x} ${height}`}
              stroke={isDark ? "#26252E" : "#E1E1E5"}
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          );
        })}
        <Path
          d={line}
          fill="none"
          stroke="url(#projectionLine)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            width: 12,
            overflow: "hidden",
          },
          upperStemStyle,
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ["rgba(119, 132, 255, 0.01)", "rgba(119, 132, 255, 0.08)"]
              : ["rgba(155, 146, 255, 0.02)", "rgba(155, 146, 255, 0.12)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 10,
            backgroundColor: isDark ? "#7784FF" : "#9B92FF",
            opacity: isDark ? 0.22 : 0.13,
          },
          lowerStemStyle,
        ]}
      />
      <GestureDetector gesture={chartGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            },
            markerStyle,
          ]}
        >
          <View
            style={{
              width: 35,
              height: 35,
              borderRadius: 17.5,
              backgroundColor: isDark ? "#29283F" : "white",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#4C4C65",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 23,
                height: 23,
                borderRadius: 11.5,
                backgroundColor: "#7784FF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Svg width={15} height={14} viewBox="0 0 15 14">
                <Path
                  d="M6 2.5 1.8 7 6 11.5M9 2.5 13.2 7 9 11.5"
                  fill="none"
                  stroke="white"
                  strokeWidth={2.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      <View
        style={{
          position: "absolute",
          top: height + 17,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={chartAxisText(axisColor)}>Today</Text>
        <Text style={chartAxisText(axisColor)}>30Y</Text>
      </View>
    </View>
  );
});

const chartAxisText = (color: string) =>
  ({
    color,
    fontFamily: "Sf-semibold",
    fontSize: 16,
    lineHeight: 21,
  }) as const;

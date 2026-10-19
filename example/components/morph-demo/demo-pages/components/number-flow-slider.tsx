import React, { useCallback } from "react";
import { Text, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Laminar } from "react-native-laminar";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { AnimatedSlider } from "../../components/animated-slider";
import { numberFlowSliderValues } from "../../demo-data";
import {
  useNumberFlowSliderDemoStore,
  useCyclicValueStoreSnapshot,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";
import type { DemoPageProps } from "../types";

const SCREEN = {
  primary: "#101114",
  secondary: "#818184",
  violet: "#9188FF",
} as const;

type NumberFlowStore = ReturnType<typeof useNumberFlowSliderDemoStore>;

const NumberFlowReadout = React.memo(function NumberFlowReadout({
  store,
  width,
  isDark,
}: {
  readonly store: NumberFlowStore;
  readonly width: number;
  readonly isDark: boolean;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const fontSize = Math.min(66, Math.max(48, width * 0.164));

  return (
    <MaskedView
      style={{ width: "100%", height: fontSize * 1.5 }}
      maskElement={
        <View
          collapsable={false}
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Laminar
            text={state.value}
            variant="number"
            numberMode="ticker"
            animationPreset="ticker"
            fontSize={70}
            autoSize
            align="center"
            containerStyle={{ alignSelf: "center" }}
            style={{
              color: "black",
              fontFamily: "Sf-bold",
              // fontSize,
              // lineHeight: fontSize * 1.12,
              textAlign: "center",
            }}
          />
        </View>
      }
    >
      <LinearGradient
        colors={
          isDark
            ? ["#B4D2FF", "#A6AFFA", "#998DFF"]
            : ["#0787F9", "#4187F7", "#8F83FF"]
        }
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: "100%", height: "100%" }}
      />
    </MaskedView>
  );
});

const GrowthChart = React.memo(function GrowthChart({
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
  const markerProgress = useSharedValue(0.88);
  const gestureStartProgress = useSharedValue(0.88);
  const markerScale = useSharedValue(0.8);
  const markerPoint = useDerivedValue(() => {
    const t = markerProgress.get();
    const inverseT = 1 - t;
    return {
      x:
        3 * inverseT * inverseT * t * (width * 0.3) +
        3 * inverseT * t * t * (width * 0.7) +
        t * t * t * width,
      y:
        inverseT * inverseT * inverseT * (height * 0.77) +
        3 * inverseT * inverseT * t * (height * 0.69) +
        3 * inverseT * t * t * (height * 0.55),
    };
  });
  const upperStemStyle = useAnimatedStyle(() => ({
    left: markerPoint.get().x - 6,
    height: markerPoint.get().y,
  }));
  const lowerStemStyle = useAnimatedStyle(() => ({
    left: markerPoint.get().x - 5,
    top: markerPoint.get().y,
    height: height - markerPoint.get().y,
  }));
  const markerStyle = useAnimatedStyle(() => ({
    left: markerPoint.get().x - 24,
    top: markerPoint.get().y - 24,
    transform: [{ scale: markerScale.get() }],
  }));
  const chartGesture = Gesture.Pan()
    .hitSlop(16)
    .onBegin(() => {
      gestureStartProgress.set(markerProgress.get());
      markerScale.set(withSpring(1));
    })
    .onUpdate((event) => {
      const horizontalDelta = event.translationX / width;
      const verticalDelta = -event.translationY / height;
      const delta =
        Math.abs(verticalDelta) > Math.abs(horizontalDelta)
          ? verticalDelta
          : horizontalDelta;
      markerProgress.set(clamp(gestureStartProgress.get() + delta, 0.04, 0.96));
    })
    .onFinalize(() => {
      markerScale.set(withSpring(0.8));
    });

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

export const NumberFlowSliderHeaderAction = React.memo(
  function NumberFlowSliderHeaderAction() {
    const theme = useDemoTheme();
    const iconColor = theme.isDark ? "#FFFFFF" : SCREEN.primary;

    return (
      <PressableScale
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg width={27} height={27} viewBox="0 0 27 27">
          <Circle
            cx={13.5}
            cy={13.5}
            r={10}
            fill="none"
            stroke={iconColor}
            strokeWidth={2.2}
          />
          <Path
            d="M13.5 7.5v6.2l4.1 2.8"
            fill="none"
            stroke={iconColor}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </PressableScale>
    );
  },
);

function NumberFlowSliderPage({ height, width }: DemoPageProps) {
  const theme = useDemoTheme();
  const pageBackground = theme.background;
  const primaryColor = theme.isDark ? "#FFFFFF" : SCREEN.primary;
  const secondaryColor = theme.isDark ? "#838596" : SCREEN.secondary;
  const accentColor = theme.isDark ? "#9896F8" : SCREEN.violet;
  const initialIndex = numberFlowSliderValues.length - 1;
  const store = useNumberFlowSliderDemoStore(initialIndex);
  const progress = useSharedValue(1);
  const sliderIndex = useDerivedValue(() =>
    Math.round(
      clamp(progress.get(), 0, 1) * (numberFlowSliderValues.length - 1),
    ),
  );
  // Even values are the last index published to React; odd values mark the
  // single outstanding UI-to-JS update.
  const bridgeState = useSharedValue(initialIndex * 2);
  const horizontalInset = Math.min(32, Math.max(24, width * 0.082));
  const contentWidth = Math.max(0, width - horizontalInset * 2);
  const chartHeight = Math.min(242, Math.max(188, height * 0.27));
  const pickerSize = 35;
  const publishLatestIndex = useCallback(() => {
    // runOnJS is asynchronous. Read the current shared index when JS handles
    // the message instead of replaying the index captured by an older frame.
    const latestIndex = sliderIndex.get();
    store.setIndex(latestIndex);
    bridgeState.set(latestIndex * 2);
  }, [bridgeState, sliderIndex, store]);
  useAnimatedReaction(
    () => {
      const valueCount = numberFlowSliderValues.length;
      const index = sliderIndex.get();
      const publishedState = bridgeState.get();

      // Pack the current target and bridge state into a scalar so the reaction
      // only runs when one changes, not on every UI frame.
      return index * valueCount * 2 + publishedState;
    },
    (state) => {
      const valueCount = numberFlowSliderValues.length;
      const publishedState = state % (valueCount * 2);
      const publishedIndex = Math.floor(publishedState / 2);
      const pending = publishedState % 2 === 1;
      const index = Math.floor(state / (valueCount * 2));

      if (pending || index === publishedIndex) {
        return;
      }

      bridgeState.set(publishedIndex * 2 + 1);
      runOnJS(publishLatestIndex)();
    },
    [bridgeState, publishLatestIndex, sliderIndex],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: pageBackground,

        paddingBottom: 12,
        justifyContent: "space-between",
      }}
    >
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: secondaryColor,
              fontFamily: "Sf-bold",
              fontSize: 20,
              lineHeight: 26,
            }}
          >
            Start Earning 6.00%
          </Text>
          <View
            style={{
              marginLeft: 8,
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 1.7,
              borderColor: secondaryColor,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: secondaryColor,
                fontFamily: "Sf-bold",
                fontSize: 11,
                lineHeight: 14,
              }}
            >
              i
            </Text>
          </View>
        </View>

        <View style={{ width: "100%", marginTop: 17 }}>
          <NumberFlowReadout
            store={store}
            width={contentWidth}
            isDark={theme.isDark}
          />
        </View>
        <Text
          style={{
            marginTop: 9,
            color: secondaryColor,
            fontFamily: "Sf-semibold",
            fontSize: 18,
            lineHeight: 24,
            textAlign: "center",
          }}
        >
          Estimated Value in 27 Years
        </Text>
      </View>

      <View style={{ width: contentWidth, alignSelf: "center" }}>
        <GrowthChart
          width={contentWidth}
          height={chartHeight}
          axisColor={secondaryColor}
          isDark={theme.isDark}
        />
      </View>

      <View
        style={{
          width: "100%",
          alignItems: "center",
          paddingHorizontal: horizontalInset,
        }}
      >
        <Text
          style={{
            color: secondaryColor,
            fontFamily: "Sf-semibold",
            fontSize: 16,
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          Initial Deposit
        </Text>
        <Text
          style={{
            marginTop: 4,
            color: primaryColor,
            fontFamily: "Sf-bold",
            fontSize: 36,
            lineHeight: 44,
            textAlign: "center",
          }}
        >
          $100,000
        </Text>
        <View style={{ width: "100%", marginTop: 20 }}>
          <AnimatedSlider
            progress={progress}
            initialProgress={1}
            pickerSize={pickerSize}
            color={accentColor}
            trackColor={theme.isDark ? "#29283F" : "#F0EFFF"}
            style={{
              width: Math.max(0, contentWidth - pickerSize),
              height: 8,
              marginHorizontal: pickerSize / 2,
            }}
          />
        </View>
        <PressableScale
          style={{
            width: "100%",
            height: 52,
            marginTop: 22,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accentColor,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: "Sf-bold",
              fontSize: 22,
              lineHeight: 28,
            }}
          >
            Add Money
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

export const NumberFlowSliderDemoPage = React.memo(NumberFlowSliderPage);

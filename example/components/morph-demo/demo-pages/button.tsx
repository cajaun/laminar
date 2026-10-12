import React from "react";
import { Laminar } from "react-native-laminar";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import { SymbolView } from "expo-symbols";
import { useButtonDemoState } from "../use-demo-state";

function LoadingSpinner() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 400,
        easing: Easing.linear,
      }),
      -1,
      false
    );

  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg
        width={32}
        height={32}
        viewBox="0 0 18 18"
        fill="none"
        accessibilityLabel="Loading Spinner"
      >
        <Circle
          cx="9"
          cy="9"
          r="7"
          stroke="#ffffff"
          strokeOpacity={0.2}
          strokeWidth="2.5"
        />
        <Path
          d="M16 9C16 5.13401 12.866 2 9 2"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

function ButtonPage({ height, width }: DemoPageProps) {
  const state = useButtonDemoState();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={state.fontSize}
      onReverse={state.reverse}
      onMorph={state.morph}
      preview={
        <PressableScale
          onPress={state.cycleButtonWord}
          style={{
            alignSelf: "center",
            height: 56,
            borderRadius: 36,
            backgroundColor: "#007aff",
            paddingHorizontal: state.fontSize * 0.72,
            paddingVertical: state.fontSize * 0.22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Laminar
            text={state.buttonWord}
            autoSize
            leading={{
              "Running Simulation": <LoadingSpinner />,

              "Simulation Done!": (
                <SymbolView
                  name="checkmark.circle.fill"
                  size={32}
                  tintColor="#ffffff"
                />
              ),
            }}
            leadingGap={4}
            animationPreset="default"
            clipToBounds={false}
            style={{
              color: "#ffffff",
              fontFamily: "Sf-semibold",
              fontSize: 32,
            }}
          />
        </PressableScale>
      }
      settings={
        <>
          {settingsRow({
            label: "Button Text",
            value: state.buttonWord,
            onPress: state.cycleButtonWord,
          })}
          {settingsRow({ label: "Surface", value: "Pressable" })}
          {settingsRow({ label: "Auto Size", value: "On" })}
        </>
      }
    />
  );
}

export const ButtonDemoPage = React.memo(ButtonPage);

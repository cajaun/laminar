import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Laminar } from "react-native-laminar";
import * as Haptics from "expo-haptics";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { PreviewStage } from "../demo-chrome";
import { sameMetrics } from "./shared";
import type { DemoPageProps } from "./types";

const BUTTON_HEIGHT = 50;
const BUTTON_WIDTH_RATIO = 0.82;
const PRIMARY_WIDTH_RATIO = 0.49;
const BUTTON_GAP = 10;
const PRIMARY_COLOR = "#3EB1FF";

type SplitStep = "single" | "split" | "joined";

function PressableSplitPage({ metrics }: DemoPageProps) {
  const [step, setStep] = useState<SplitStep>("single");
  const buttonWidth = metrics.width * BUTTON_WIDTH_RATIO;
  const primaryCollapsedWidth = Math.round(buttonWidth * PRIMARY_WIDTH_RATIO);
  const secondaryWidth = buttonWidth - primaryCollapsedWidth - BUTTON_GAP;
  const shouldShowSecondary = step === "split";
  const isJoined = step === "joined";
  const splitTarget = useSharedValue(0);

  useEffect(() => {
    splitTarget.value = withTiming(shouldShowSecondary ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  }, [shouldShowSecondary, splitTarget]);

  const primaryStyle = useAnimatedStyle(() => ({
    width: Math.round(
      interpolate(
        splitTarget.value,
        [0, 1],
        [buttonWidth, primaryCollapsedWidth]
      )
    ),
  }), [buttonWidth, primaryCollapsedWidth]);

  const secondaryStyle = useAnimatedStyle(() => ({
    opacity: interpolate(splitTarget.value, [0, 0.6, 1], [0, 0, 1]),
    transform: [
      {
        scale: interpolate(splitTarget.value, [0, 1], [0.97, 1]),
      },
    ],
  }));

  const advance = useCallback(async () => {

    setStep((current) =>
      current === "single" ? "split" : current === "split" ? "joined" : "single"
    );
  }, []);

  const cancel = useCallback(async () => {

    setStep("single");
  }, []);

  return (
    <PreviewStage metrics={metrics}>
      <View
        style={{
          width: buttonWidth,
          height: BUTTON_HEIGHT,
          justifyContent: "center",
        }}
      >
        <Animated.View
          pointerEvents={shouldShowSecondary ? "auto" : "none"}
          style={[
            {
              position: "absolute",
              left: 0,
              width: secondaryWidth,
              height: BUTTON_HEIGHT,
              justifyContent: "center",
            },
            secondaryStyle,
          ]}
        >
          <PressableScale
            onPress={cancel}
            style={{
              width: "100%",
              height: BUTTON_HEIGHT,
              borderRadius: BUTTON_HEIGHT / 2,
              backgroundColor: "#F5F5FA",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Laminar
              text="Cancel"
              autoSize={false}
              align="center"
              style={{ color: "#000000", fontFamily: "Sf-bold" }}
              className="text-2xl"
            />
          </PressableScale>
        </Animated.View>

        <Animated.View
          style={[
            primaryStyle,
            {
              position: "absolute",
              right: 0,
              height: BUTTON_HEIGHT,
            },
          ]}
        >
          <PressableScale
            onPress={advance}
            style={{
              width: "100%",
              height: BUTTON_HEIGHT,
              alignItems: "center",
              backgroundColor: PRIMARY_COLOR,
              borderRadius: BUTTON_HEIGHT / 2,
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <Laminar
              text={isJoined ? "Continue and Finish" : "Continue"}
              autoSize={false}
              align="center"
              animationPreset="default"
              clipToBounds={false}
              style={{ color: "#ffffff", fontFamily: "Sf-bold" }}
              className="text-2xl"
            />
          </PressableScale>
        </Animated.View>
      </View>
    </PreviewStage>
  );
}

export const PressableSplitDemoPage = React.memo(
  PressableSplitPage,
  (previous, next) => sameMetrics(previous, next)
);

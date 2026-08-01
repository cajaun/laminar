import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Laminar } from "react-native-laminar";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { PreviewStage } from "../demo-chrome";
import { sameMetrics } from "./shared";
import type { DemoPageProps } from "./types";
import { SymbolView } from "expo-symbols";

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
  const showLeading = !shouldShowSecondary;
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

  const primaryLabelStyle = useAnimatedStyle(() => ({
    left: interpolate(
      splitTarget.value,
      [0, 1],
      [0, -(buttonWidth - primaryCollapsedWidth) / 2]
    ),
  }), [buttonWidth, primaryCollapsedWidth]);

  const secondaryStyle = useAnimatedStyle(() => ({
    left: interpolate(splitTarget.value, [0, 1], [-BUTTON_GAP, 0]),
    width: interpolate(splitTarget.value, [0, 1], [0, secondaryWidth]),
    opacity: interpolate(splitTarget.value, [0, 0.85, 1], [0, 0, 1]),
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
        <PressableScale
          onPress={advance}
          style={[
            primaryStyle,
            {
              position: "absolute",
              right: 0,
              height: BUTTON_HEIGHT,
              overflow: "visible",
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: PRIMARY_COLOR,
              borderRadius: BUTTON_HEIGHT / 2,
            }}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                top: 0,
                width: buttonWidth,
                height: BUTTON_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              },
              primaryLabelStyle,
            ]}
          >
            <Laminar
              text={isJoined ? "Continue and Finish" : "Continue"}
              leading={
                showLeading ? (
                  <SymbolView
                    name="faceid"
                    size={23}
                    tintColor="#ffffff"
                  />
                ) : undefined
              }
              leadingGap={6}
              autoSize={false}
              align="center"
              animationPreset="default"
              clipToBounds={false}
              containerStyle={{ width: "100%" }}
              style={{ color: "#ffffff", fontFamily: "Sf-bold" }}
              className="text-2xl"
            />
          </Animated.View>
        </PressableScale>

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
            <Text
              className="text-2xl"
              style={{ color: "#000000", fontFamily: "Sf-bold" }}
            >
              Cancel
            </Text>
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

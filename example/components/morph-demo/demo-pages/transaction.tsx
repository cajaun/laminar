import React, { useEffect } from "react";
import { Laminar } from "react-native-laminar";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { SymbolView } from "expo-symbols";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, sameMetrics, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";

const TRANSACTION_COLORS = {
  "Analyzing Transaction": {
    background: "#E5F4FF",
    color: "#4DAFFF",
    ring: "#B8DFFF",
  },
  "Transaction Safe": {
    background: "#D5F4E1",
    color: "#34C759",
    ring: "#34C759",
  },
  "Transaction Warning": {
    background: "#FDE5E5",
    color: "#FF3F3F",
    ring: "#FF3F3F",
  },
} as const;

function TransactionSpinner({ color, ringColor }: { color: string; ringColor: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 360,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(rotation);
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
        accessibilityLabel="Analyzing Transaction"
      >
        <Circle
          cx="9"
          cy="9"
          r="7"
          stroke={ringColor}
          strokeWidth="2.5"
        />
        <Path
          d="M16 9C16 5.13401 12.866 2 9 2"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

function TransactionPage({ metrics, state }: DemoPageProps) {
  const transactionState = state.transactionState;
  const colors = TRANSACTION_COLORS[transactionState];

  return (
    <DemoPageLayout
      metrics={metrics}
      preview={
        <PressableScale
          onPress={state.cycleTransaction}
          style={{
            alignSelf: "center",
            height: 56,
            borderRadius: 36,
            backgroundColor: colors.background,
            paddingHorizontal: 32 * 0.9,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Laminar
            text={transactionState}
            autoSize
            leading={{
              "Analyzing Transaction": (
                <TransactionSpinner
                  color={colors.color}
                  ringColor={colors.ring}
                />
              ),
              "Transaction Safe": (
                <SymbolView
                  name="checkmark.circle.fill"
                  size={32}
                  tintColor={colors.color}
                />
              ),
              "Transaction Warning": (
                <SymbolView
                  name="exclamationmark.triangle.fill"
                  size={32}
                  tintColor={colors.color}

                />
              ),
            }}
            leadingGap={12}
            animationPreset="default"
            style={{
              color: colors.color,
              fontFamily: "Sf-semibold",
              fontSize: 28,
            }}
          />
        </PressableScale>
      }
      settings={
        <>
          {settingsRow({
            label: "Button Text",
            value: transactionState,
            onPress: state.cycleTransaction,
          })}
          {settingsRow({ label: "Surface", value: "Pressable" })}
          {settingsRow({ label: "Auto Size", value: "On" })}
        </>
      }
    />
  );
}

export const TransactionDemoPage = React.memo(
  TransactionPage,
  (previous, next) =>
    sameMetrics(previous, next) &&
    previous.state.transactionState === next.state.transactionState &&
    previous.state.cycleTransaction === next.state.cycleTransaction
);

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
import {
  useButtonDemoStore,
  useCyclicValueStoreSnapshot,
} from "../use-demo-state";

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

type ButtonStore = ReturnType<typeof useButtonDemoStore>;

const ButtonPreview = React.memo(function ButtonPreview({
  store,
}: {
  readonly store: ButtonStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <PressableScale
      onPress={store.next}
      style={{
        alignSelf: "center",
        height: 56,
        borderRadius: 36,
        backgroundColor: "#007aff",
        paddingHorizontal: 40 * 0.72,
        paddingVertical: 40 * 0.22,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Laminar
        text={state.value}
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
  );
});

const ButtonSettings = React.memo(function ButtonSettings({
  store,
}: {
  readonly store: ButtonStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      {settingsRow({
        label: "Button Text",
        value: state.value,
        onPress: store.next,
      })}
      {settingsRow({ label: "Surface", value: "Pressable" })}
      {settingsRow({ label: "Auto Size", value: "On" })}
    </>
  );
});

function ButtonPage({ height, width }: DemoPageProps) {
  const store = useButtonDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<ButtonPreview store={store} />}
      settings={<ButtonSettings store={store} />}
    />
  );
}

export const ButtonDemoPage = React.memo(ButtonPage);

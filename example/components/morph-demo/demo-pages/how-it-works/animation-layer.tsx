import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  settingsValue,
  TeachingLabel,
} from "../shared";
import { NumberMechanism } from "../illustrations";
import type { DemoPageProps } from "../types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useAnimationLayerDemoStore,
  useCyclicValueStoreSnapshot,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

const numberPreviewContainerStyle = {
  alignSelf: "center" as const,
  height: 78,
  justifyContent: "center" as const,
};

type AnimationLayerStore = ReturnType<typeof useAnimationLayerDemoStore>;

const AnimationLayerValue = React.memo(function AnimationLayerValue({
  store,
  theme,
}: {
  readonly store: AnimationLayerStore;
  readonly theme: ReturnType<typeof useDemoTheme>;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const previewTextStyle = React.useMemo(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold" as const,
      fontSize: 62,
      lineHeight: 78,
      fontVariant: ["tabular-nums"] as ["tabular-nums"],
    }),
    [theme.primary],
  );

  return (
    <Laminar
      text={state.value}
      variant="number"
      autoSize
      clipToBounds={false}
      fontSize={62}
      containerStyle={numberPreviewContainerStyle}
      style={previewTextStyle}
    />
  );
});

const AnimationLayerMechanismPreview = React.memo(function AnimationLayerMechanismPreview({
  store,
}: {
  readonly store: AnimationLayerStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return <NumberMechanism current={state.value} />;
});

const AnimationLayerPreview = React.memo(function AnimationLayerPreview({
  store,
}: {
  readonly store: AnimationLayerStore;
}) {
  const theme = useDemoTheme();
  const previewFrameStyle = React.useMemo(
    () => ({
      borderWidth: 1.5,
      borderStyle: "dashed" as const,
      borderColor: theme.accent,
      borderRadius: 16,
      paddingHorizontal: 20,
      height: 78,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      backgroundColor: theme.teachingSurface,
    }),
    [theme.accent, theme.teachingSurface],
  );

  return (
    <>
      <View style={previewFrameStyle}>
        <AnimationLayerValue store={store} theme={theme} />
      </View>
      <TeachingLabel>each digit keeps its place as the value changes</TeachingLabel>
      <AnimationLayerMechanismPreview store={store} />
    </>
  );
});

function AnimationLayerPage({ height, width }: DemoPageProps) {
  const store = useAnimationLayerDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<AnimationLayerPreview store={store} />}
      settingsStore={store}
      renderStaticSettings={(theme) => (
        <>
          {settingsRow({
            label: "Number",
            value: settingsValue({
              store,
              select: (snapshot) => snapshot.value,
              theme,
            }),
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Lanes", value: "Place value", theme })}
          {settingsRow({ label: "Mode", value: "Morph", theme })}
        </>
      )}
    />
  );
}

export const AnimationLayerDemoPage = React.memo(AnimationLayerPage);


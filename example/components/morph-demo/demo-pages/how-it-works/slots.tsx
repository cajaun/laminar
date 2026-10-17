import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  settingsValue,
  TeachingLabel,
} from "../shared";
import { SlotMechanism } from "../illustrations";
import type { DemoPageProps } from "../types";
import {
  useCyclicValueStoreSnapshot,
  useSlotMechanismDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

const slotsPreviewContainerStyle = {
  alignSelf: "center" as const,
  height: 78,
  justifyContent: "center" as const,
};

type SlotsStore = ReturnType<typeof useSlotMechanismDemoStore>;

const SlotsValue = React.memo(function SlotsValue({
  store,
  theme,
}: {
  readonly store: SlotsStore;
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
      variant="slots"
      shadow
      autoSize
      clipToBounds={false}
      fontSize={62}
      containerStyle={slotsPreviewContainerStyle}
      style={previewTextStyle}
    />
  );
});

const SlotsMechanismPreview = React.memo(function SlotsMechanismPreview({
  store,
}: {
  readonly store: SlotsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return <SlotMechanism current={state.value} />;
});

const SlotsPreview = React.memo(function SlotsPreview({
  store,
}: {
  readonly store: SlotsStore;
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
        <SlotsValue store={store} theme={theme} />
      </View>
      <TeachingLabel>each digit rolls through a fixed window</TeachingLabel>
      <SlotsMechanismPreview store={store} />
    </>
  );
});

function SlotsPage({ height, width }: DemoPageProps) {
  const store = useSlotMechanismDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<SlotsPreview store={store} />}
      settingsStore={store}
      renderStaticSettings={(theme) => (
        <>
          {settingsRow({ label: "Variant", value: "slots", onPress: store.next, theme })}
          {settingsRow({
            label: "Previous",
            value: settingsValue({
              store,
              select: (snapshot) => snapshot.previousValue,
              theme,
            }),
            theme,
          })}
          {settingsRow({
            label: "Next",
            value: settingsValue({
              store,
              select: (snapshot) => snapshot.nextValue,
              theme,
            }),
            theme,
          })}
        </>
      )}
    />
  );
}

export const SlotsDemoPage = React.memo(SlotsPage);


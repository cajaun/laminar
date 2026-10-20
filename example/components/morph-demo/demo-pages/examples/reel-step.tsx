import React from "react";
import type { TextStyle } from "react-native";
import { Laminar } from "react-native-laminar";
import { useDemoTheme } from "../../demo-theme";
import {
  useCyclicValueStoreSnapshot,
  useReelStepDemoStore,
} from "../../use-demo-state";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";

type ReelStepStore = ReturnType<typeof useReelStepDemoStore>;

const previewContainerStyle = {
  width: "100%",
  alignSelf: "center",
} as const;

const ReelStepPreview = React.memo(function ReelStepPreview({
  store,
}: {
  readonly store: ReelStepStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();
  const textStyle = React.useMemo<TextStyle>(
    () => ({
      color: theme.primary,
      fontFamily: "Sf-semibold",
      fontSize: 72,
      fontVariant: ["tabular-nums"],
      textAlign: "center" as const,
    }),
    [theme.primary],
  );

  return (
    <Laminar
      text={state.value}
      variant="slots"
      slotMode="reelStep"
      animationPreset="smooth"
      shadow
      fontSize={72}
      align="center"
      clipToBounds={false}
      containerStyle={previewContainerStyle}
      style={textStyle}
    />
  );
});

function ReelStepPage({ height, width }: DemoPageProps) {
  const store = useReelStepDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={72}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<ReelStepPreview store={store} />}
      settingsStore={store}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Reel Step",
            value: state.value,
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Previous", value: state.previousValue, theme })}
          {settingsRow({ label: "Next", value: state.nextValue, theme })}
        </>
      )}
    />
  );
}

export const ReelStepDemoPage = React.memo(ReelStepPage);

import React from "react";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  TeachingLabel,
  showcaseTextStyle,
  teachingDurationMs,
  teachingBlue,
} from "./shared";
import { AutoSizeComparison } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useAutoSizeDemoStore,
  useCyclicValueStoreSnapshot,
} from "../use-demo-state";

type AutoSizeStore = ReturnType<typeof useAutoSizeDemoStore>;

const AutoSizePreview = React.memo(function AutoSizePreview({
  store,
}: {
  readonly store: AutoSizeStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: teachingBlue, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 12 }}>
        <Laminar
          text={state.value}
          animationDuration={teachingDurationMs}
          animationPreset="smooth"
          autoSize
          clipToBounds={false}
          fontSize={32}
          style={[showcaseTextStyle, { fontSize: 32 }]}
        />
      </View>
      <TeachingLabel>autoSize animates this dashed border</TeachingLabel>
      <AutoSizeComparison value={state.value} />
    </>
  );
});

function AutoSizePage({ height, width }: DemoPageProps) {
  const store = useAutoSizeDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<AutoSizePreview store={store} />}
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({ label: "String", value: state.value, onPress: store.next })}
          {settingsRow({ label: "Auto Size", value: "On" })}
          {settingsRow({ label: "Container", value: "Measured" })}
        </>
      )}
    />
  );
}

export const AutoSizeDemoPage = React.memo(AutoSizePage);

import React from "react";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  settingsRow,
  TeachingLabel,
  showcaseTextStyle,
  teachingDurationMs,
} from "./shared";
import { LaneStrip } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useNumberIdentityDemoStore,
} from "../use-demo-state";

type NumberIdentityStore = ReturnType<typeof useNumberIdentityDemoStore>;

const NumberIdentityPreview = React.memo(function NumberIdentityPreview({
  store,
}: {
  readonly store: NumberIdentityStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      <Laminar
        text={state.value}
        variant="number"
        animationDuration={teachingDurationMs}
        animationPreset="snappy"
        autoSize
        clipToBounds={false}
        fontSize={54}
        containerStyle={{ alignSelf: "center" }}
        style={[showcaseTextStyle, { fontSize: 54, fontVariant: ["tabular-nums"] }]}
      />
      <TeachingLabel>place value starts with fixed lanes</TeachingLabel>
      <LaneStrip value={state.value} />
    </>
  );
});

const NumberIdentitySettings = React.memo(function NumberIdentitySettings({
  store,
}: {
  readonly store: NumberIdentityStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      {settingsRow({ label: "Number", value: state.value, onPress: store.next })}
      {settingsRow({ label: "Direction", value: "Up / Down" })}
      {settingsRow({ label: "Lanes", value: "Fixed width" })}
    </>
  );
});

function NumberIdentityPage({ height, width }: DemoPageProps) {
  const store = useNumberIdentityDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<NumberIdentityPreview store={store} />}
      settings={<NumberIdentitySettings store={store} />}
    />
  );
}

export const NumberIdentityDemoPage = React.memo(NumberIdentityPage);

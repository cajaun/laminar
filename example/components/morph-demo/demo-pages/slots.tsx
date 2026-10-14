import React from "react";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  TeachingLabel,
  settingsRow,
} from "./shared";
import { SlotMechanism } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  useCyclicValueStoreSnapshot,
  useSlotsDemoStore,
} from "../use-demo-state";

type SlotsStore = ReturnType<typeof useSlotsDemoStore>;

const SlotsPreview = React.memo(function SlotsPreview({
  store,
}: {
  readonly store: SlotsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      <Laminar
        text={state.value}
        variant="slots"
        animationPreset="smooth"
        shadow
        autoSize
        clipToBounds={false}
        fontSize={40}
        containerStyle={{ alignSelf: "center" }}
        style={{
          color: "#000000",
          fontFamily: "Sf-semibold",
          fontSize: 40,
          fontVariant: ["tabular-nums"],
          textAlign: "center",
        }}
      />
      <TeachingLabel>slot columns preserve each digit's vertical window</TeachingLabel>
      <SlotMechanism
        current={state.value}
        previous={state.previousValue}
        next={state.nextValue}
      />
    </>
  );
});

const SlotsSettings = React.memo(function SlotsSettings({
  store,
}: {
  readonly store: SlotsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      {settingsRow({ label: "Slots", value: state.value, onPress: store.next })}
      {settingsRow({ label: "Reverse", value: state.previousValue })}
      {settingsRow({ label: "Morph", value: state.nextValue })}
    </>
  );
});

function SlotsPage({ height, width }: DemoPageProps) {
  const store = useSlotsDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<SlotsPreview store={store} />}
      settings={<SlotsSettings store={store} />}
    />
  );
}

export const SlotsDemoPage = React.memo(SlotsPage);

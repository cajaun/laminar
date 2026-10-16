import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  useCyclicValueStoreSnapshot,
  useSlotsDemoStore,
} from "../use-demo-state";

type SlotsStore = ReturnType<typeof useSlotsDemoStore>;

const SlotsNextPreview = React.memo(function SlotsNextPreview({
  store,
}: {
  readonly store: SlotsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <Laminar
      text={state.value}
      variant="slots"
      animationPreset="smooth"
      shadow={{ color: "#FFFFFF", size: 12 }}
      autoSize
      clipToBounds={false}
      fontSize={40}
      containerStyle={{ alignSelf: "center" }}
      style={{
        color: "#000000",
        fontFamily: "Sf-semibold",
        fontSize: 80,
        fontVariant: ["tabular-nums"],
        textAlign: "center",
      }}
    />
  );
});

function SlotsNextPage({ height, width }: DemoPageProps) {
  const store = useSlotsDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={40}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<SlotsNextPreview store={store} />}
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({ label: "Number", value: state.value, onPress: store.next })}
          {settingsRow({ label: "Reverse", value: state.previousValue })}
          {settingsRow({ label: "Next", value: state.nextValue })}
        </>
      )}
    />
  );
}

export const SlotsNextDemoPage = React.memo(SlotsNextPage);

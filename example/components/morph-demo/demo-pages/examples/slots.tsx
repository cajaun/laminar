import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  useCyclicValueStoreSnapshot,
  useSlotsDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type SlotsStore = ReturnType<typeof useSlotsDemoStore>;

const SlotsPreview = React.memo(function SlotsPreview({
  store,
}: {
  readonly store: SlotsStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <Laminar
      text={state.value}
      variant="slots"
      animationPreset="smooth"
      shadow
      autoSize
      clipToBounds={false}
      fontSize={62}
      containerStyle={{ alignSelf: "center" }}
      style={{
        color: theme.primary,
        fontFamily: "Sf-semibold",
        fontSize: 62,
        fontVariant: ["tabular-nums"],
        textAlign: "center",
      }}
    />
  );
});

function SlotsPage({ height, width }: DemoPageProps) {
  const store = useSlotsDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={62}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<SlotsPreview store={store} />}
      settingsStore={store}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Slots",
            value: state.value,
            onPress: store.next,
            theme,
          })}
          {settingsRow({ label: "Reverse", value: state.previousValue, theme })}
          {settingsRow({ label: "Morph", value: state.nextValue, theme })}
        </>
      )}
    />
  );
}

export const SlotsExampleDemoPage = React.memo(SlotsPage);

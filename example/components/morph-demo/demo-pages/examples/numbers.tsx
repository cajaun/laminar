import React from "react";
import { Laminar } from "react-native-laminar";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  useCyclicValueStoreSnapshot,
  useNumbersDemoStore,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type NumbersStore = ReturnType<typeof useNumbersDemoStore>;

const NumbersPreview = React.memo(function NumbersPreview({
  store,
}: {
  readonly store: NumbersStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <Laminar
      text={state.value}
      variant="number"
      animationPreset="default"
      fontSize={62}
      clipToBounds={false}
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

function NumbersPage({ height, width }: DemoPageProps) {
  const store = useNumbersDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={62}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<NumbersPreview store={store} />}
      settingsStore={store}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Number",
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

export const NumbersDemoPage = React.memo(NumbersPage);

import React from "react";
import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, settingsRow } from "../shared";
import type { DemoPageProps } from "../types";
import {
  useConfirmationDemoStore,
  useCyclicValueStoreSnapshot,
} from "../../use-demo-state";
import { useDemoTheme } from "../../demo-theme";

type ConfirmationStore = ReturnType<typeof useConfirmationDemoStore>;

const ConfirmationPreview = React.memo(function ConfirmationPreview({
  store,
}: {
  readonly store: ConfirmationStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);
  const theme = useDemoTheme();

  return (
    <View style={{ width: "70%", alignItems: "center" }}>
      <PressableScale
        onPress={store.next}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.primary,
        }}
      >
        <Laminar
          text={state.value}
          leading={{
            Confirm: (
              <SymbolView name="faceid" size={23} tintColor={theme.inverse} />
            ),
          }}
          leadingGap={5}
          autoSize={false}
          align="center"
          animationPreset="default"
          clipToBounds={false}
          containerStyle={{ width: "100%" }}
          style={{
            color: theme.inverse,
            fontFamily: "Sf-bold",
            fontSize: 24,
            textAlign: "center",
          }}
        />
      </PressableScale>
    </View>
  );
});

function ConfirmationPage({ height, width }: DemoPageProps) {
  const store = useConfirmationDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={32}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<ConfirmationPreview store={store} />}
      settingsStore={store}
      renderSettings={(state, theme) => (
        <>
          {settingsRow({
            label: "Button Text",
            value: state.value,
            onPress: store.next,
            theme,
          })}
          {settingsRow({
            label: "Leading Icon",
            value: state.value === "Confirm" ? "Face ID" : "None",
            theme,
          })}
          {settingsRow({ label: "Auto Size", value: "Off", theme })}
        </>
      )}
    />
  );
}

export const ConfirmationDemoPage = React.memo(ConfirmationPage);


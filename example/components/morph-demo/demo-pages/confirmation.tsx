import React from "react";
import { SymbolView } from "expo-symbols";
import { View } from "react-native";
import { Laminar } from "react-native-laminar";
import { PressableScale } from "@/shared/ui/pressable-scale";
import { DemoPageLayout, settingsRow } from "./shared";
import type { DemoPageProps } from "./types";
import {
  useConfirmationDemoStore,
  useCyclicValueStoreSnapshot,
} from "../use-demo-state";

type ConfirmationStore = ReturnType<typeof useConfirmationDemoStore>;

const confirmationLeading = {
  Confirm: <SymbolView name="faceid" size={23} tintColor="#FFFFFF" />,
} as const;

const ConfirmationPreview = React.memo(function ConfirmationPreview({
  store,
}: {
  readonly store: ConfirmationStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

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
          backgroundColor: "#000000",
        }}
      >
        <Laminar
          text={state.value}
          leading={confirmationLeading}
          leadingGap={5}
          autoSize={false}
          align="center"
          animationPreset="default"
          clipToBounds={false}
          containerStyle={{ width: "100%" }}
          style={{
            color: "#FFFFFF",
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
      renderSettings={(state) => (
        <>
          {settingsRow({
            label: "Button Text",
            value: state.value,
            onPress: store.next,
          })}
          {settingsRow({
            label: "Leading Icon",
            value: state.value === "Confirm" ? "Face ID" : "None",
          })}
          {settingsRow({ label: "Auto Size", value: "Off" })}
        </>
      )}
    />
  );
}

export const ConfirmationDemoPage = React.memo(ConfirmationPage);

import React from "react";
import { Text } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  MechanismFrame,
  settingsRow,
  TeachingLabel,
  showcaseTextStyle,
  teachingDurationMs,
} from "./shared";
import { NoLcsLaminar } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useCyclicValueStoreSnapshot,
  useTextIdentityDemoStore,
} from "../use-demo-state";

type TextIdentityStore = ReturnType<typeof useTextIdentityDemoStore>;

const TextIdentityPreview = React.memo(function TextIdentityPreview({
  store,
}: {
  readonly store: TextIdentityStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      <Laminar
        text={state.value}
        animationDuration={teachingDurationMs}
        animationPreset="default"
        autoSize
        clipToBounds={false}
        fontSize={56}
        containerStyle={{ alignSelf: "center" }}
        style={[showcaseTextStyle, { fontSize: 56 }]}
      />
      <TeachingLabel>matching glyphs hold position with LCS</TeachingLabel>
      <MechanismFrame>
        <Text style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>
          without LCS
        </Text>
        <NoLcsLaminar
          text={state.value}
          animationDuration={teachingDurationMs}
          animationPreset="default"
          autoSize
          clipToBounds={false}
          fontSize={56}
          containerStyle={{ alignSelf: "center" }}
          style={[showcaseTextStyle, { fontSize: 56 }]}
        />
      </MechanismFrame>
    </>
  );
});

function TextIdentityPage({ height, width }: DemoPageProps) {
  const store = useTextIdentityDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<TextIdentityPreview store={store} />}
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({ label: "Text", value: state.value, onPress: store.next })}
          {settingsRow({ label: "Identity", value: "LCS" })}
          {settingsRow({ label: "Speed", value: "Readable" })}
        </>
      )}
    />
  );
}

export const TextIdentityDemoPage = React.memo(TextIdentityPage);

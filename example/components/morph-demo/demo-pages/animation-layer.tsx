import React from "react";
import { Text, View } from "react-native";
import { Laminar } from "react-native-laminar";
import {
  DemoPageLayout,
  MechanismFrame,
  settingsRow,
  TeachingLabel,
  showcaseTextStyle,
  teachingBlue,
  teachingDurationMs,
} from "./shared";
import { NoProbeDigit } from "./illustrations";
import type { DemoPageProps } from "./types";
import {
  DEFAULT_DEMO_FONT_SIZE,
  useAnimationLayerDemoStore,
  useCyclicValueStoreSnapshot,
} from "../use-demo-state";

type AnimationLayerStore = ReturnType<typeof useAnimationLayerDemoStore>;

const AnimationLayerPreview = React.memo(function AnimationLayerPreview({
  store,
}: {
  readonly store: AnimationLayerStore;
}) {
  const state = useCyclicValueStoreSnapshot(store);

  return (
    <>
      <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: teachingBlue, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#f7fbff" }}>
        <Laminar
          text={state.value}
          variant="number"
          animationDuration={teachingDurationMs}
          animationPreset="default"
          autoSize
          clipToBounds={false}
          fontSize={62}
          containerStyle={{ alignSelf: "center" }}
          style={[showcaseTextStyle, { fontSize: 62, fontVariant: ["tabular-nums"] }]}
        />
      </View>
      <TeachingLabel>probe token holds the lane width during swap</TeachingLabel>
      <MechanismFrame>
        <Text style={{ color: "#8e8e93", fontFamily: "Sf-semibold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>
          without probe
        </Text>
        <View style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: "#c7c7cc", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10 }}>
          <NoProbeDigit value={state.value} />
        </View>
      </MechanismFrame>
    </>
  );
});

function AnimationLayerPage({ height, width }: DemoPageProps) {
  const store = useAnimationLayerDemoStore();

  return (
    <DemoPageLayout
      height={height}
      width={width}
      fontSize={DEFAULT_DEMO_FONT_SIZE}
      onReverse={store.previous}
      onMorph={store.next}
      preview={<AnimationLayerPreview store={store} />}
      settingsStore={store}
      renderSettings={(state) => (
        <>
          {settingsRow({ label: "Digit", value: state.value, onPress: store.next })}
          {settingsRow({ label: "Layer", value: "Space + digit" })}
          {settingsRow({ label: "Speed", value: "Readable" })}
        </>
      )}
    />
  );
}

export const AnimationLayerDemoPage = React.memo(AnimationLayerPage);

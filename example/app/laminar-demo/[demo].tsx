import { Stack, useLocalSearchParams } from "expo-router";
import { useWindowDimensions } from "react-native";
import {
  DemoDetailScreen,
  type ExamplePageId,
} from "@/components/morph-demo";
import { examplePages } from "@/components/morph-demo/demo-data";

export default function LaminarDemoRoute() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { width, height } = useWindowDimensions();
  const pageId = examplePages.some((page) => page.id === demo)
    ? (demo as ExamplePageId)
    : "textIdentity";

  return (
    <>
      <Stack.Screen
        options={{
          title: examplePages.find((page) => page.id === pageId)?.label,
          headerShown: pageId !== "numberFlowSlider",
        }}
      />
      <DemoDetailScreen pageId={pageId} width={width} height={height} />
    </>
  );
}

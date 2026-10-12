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
    : "numbers";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DemoDetailScreen pageId={pageId} width={width} height={height} />
    </>
  );
}

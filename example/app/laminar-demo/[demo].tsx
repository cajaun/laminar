import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import {
  DemoDetailScreen,
  type ExamplePageId,
} from "@/components/morph-demo";
import { examplePages } from "@/components/morph-demo/demo-data";
import { NavigationHeaderAction } from "@/components/ui/navigation-header-action";

export default function LaminarDemoRoute() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const pageId = examplePages.some((page) => page.id === demo)
    ? (demo as ExamplePageId)
    : "numbers";

  return (
    <>
      <Stack.Screen
        options={{
          title: examplePages.find((page) => page.id === pageId)?.label,
          headerRight: () => (
            <NavigationHeaderAction
              accessibilityLabel="Open Ethereum chart"
              icon="analytics-outline"
              onPress={() => router.push("/chart")}
            />
          ),
        }}
      />
      <DemoDetailScreen pageId={pageId} width={width} height={height} />
    </>
  );
}

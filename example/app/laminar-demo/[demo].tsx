import { Stack, useLocalSearchParams } from "expo-router";
import { useWindowDimensions } from "react-native";
import {
  DemoDetailScreen,
  type ExamplePageId,
} from "@/components/morph-demo";
import { examplePages } from "@/components/morph-demo/demo-data";
import { NumberFlowSliderHeaderAction } from "@/components/morph-demo/demo-pages/components/number-flow-slider";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";

export default function LaminarDemoRoute() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { width, height } = useWindowDimensions();
  const theme = useDemoTheme();
  const pageId = examplePages.some((page) => page.id === demo)
    ? (demo as ExamplePageId)
    : "textIdentity";
  const isNumberFlowSlider = pageId === "numberFlowSlider";

  return (
    <>
      <Stack.Screen
        options={{
          title: isNumberFlowSlider
            ? ""
            : examplePages.find((page) => page.id === pageId)?.label,
          headerShown: true,
          ...(isNumberFlowSlider
            ? {
                headerTransparent: false,
                headerBackVisible: false,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.primary,
                headerRight: () => <NumberFlowSliderHeaderAction />,
              }
            : undefined),
        }}
      />
      <DemoDetailScreen pageId={pageId} width={width} height={height} />
    </>
  );
}

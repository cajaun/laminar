import { Stack, useLocalSearchParams } from "expo-router";
import { useWindowDimensions } from "react-native";
import {
  DemoDetailScreen,
  type ExamplePageId,
} from "@/components/morph-demo";
import { examplePages } from "@/components/morph-demo/demo-data";
import { NumberTickerSliderHeaderAction } from "@/components/number-ticker-slider";
import { useDemoTheme } from "@/components/morph-demo/demo-theme";

export default function LaminarDemoRoute() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { width, height } = useWindowDimensions();
  const theme = useDemoTheme();
  const pageId = examplePages.some((page) => page.id === demo)
    ? (demo as ExamplePageId)
    : "textIdentity";
  const isNumberTickerSlider = pageId === "numberTickerSlider";
  const isNumberInput = pageId === "numberInput";

  return (
    <>
      <Stack.Screen
        options={{
          title: isNumberTickerSlider
            ? ""
            : examplePages.find((page) => page.id === pageId)?.label,
          headerShown: isNumberInput ? false : true,
          ...(isNumberInput
            ? {
                headerTransparent: false,
                headerBackVisible: false,
                headerShadowVisible: false,
              }
            : undefined),
          ...(isNumberTickerSlider
            ? {
                headerTransparent: false,
                headerBackVisible: false,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.primary,
                headerRight: () => <NumberTickerSliderHeaderAction />,
              }
            : undefined),
        }}
      />
      <DemoDetailScreen pageId={pageId} width={width} height={height} />
    </>
  );
}

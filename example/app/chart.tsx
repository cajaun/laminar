import { Stack, useRouter } from "expo-router";
import { FluxChartScreen } from "@/components/flux-chart";
import { NavigationHeaderAction } from "@/components/ui/navigation-header-action";

export default function ChartRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ethereum",
          headerRight: () => (
            <NavigationHeaderAction
              accessibilityLabel="Open Laminar demos"
              icon="grid-outline"
              onPress={() => router.replace("/laminar")}
            />
          ),
        }}
      />
      <FluxChartScreen />
    </>
  );
}

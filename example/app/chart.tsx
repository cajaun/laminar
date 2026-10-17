import { Stack } from "expo-router";
import { FluxChartScreen } from "@/components/flux-chart";

export default function ChartRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Ethereum",
        }}
      />
      <FluxChartScreen />
    </>
  );
}

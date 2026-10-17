import { Stack } from "expo-router";
import { MorphingChartScreen } from "@/components/morphing-chart";

export default function ChartRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Ethereum",
        }}
      />
      <MorphingChartScreen />
    </>
  );
}

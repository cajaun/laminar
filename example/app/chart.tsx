import React from "react";
import { Stack } from "expo-router";
// Import the route screen directly so the route does not first evaluate the
// feature barrel (which also initializes the public chart exports).
import { MorphingChartScreen } from "@/components/morphing-chart/morphing-chart-screen";

const ChartRoute = React.memo(function ChartRoute() {
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
});

ChartRoute.displayName = "ChartRoute";

export default ChartRoute;

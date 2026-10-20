import React from "react";
import { MorphingChart } from "./morphing-chart";
import type { MorphingAsset } from "./ui/assets/asset-config";

// render the reusable chart in the route screen
export const MorphingChartScreen = React.memo(function MorphingChartScreen({
  asset = "ethereum",
}: { asset?: MorphingAsset }) {
  return <MorphingChart asset={asset} />;
});

MorphingChartScreen.displayName = "MorphingChartScreen";

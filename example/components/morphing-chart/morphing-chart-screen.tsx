import React from "react";
import { MorphingChart } from "./morphing-chart";
import type { MorphingAsset } from "./ui";

/** Route-facing screen wrapper. The feature implementation is the reusable MorphingChart. */
export function MorphingChartScreen({ asset = "ethereum" }: { asset?: MorphingAsset }) {
  return <MorphingChart asset={asset} />;
}

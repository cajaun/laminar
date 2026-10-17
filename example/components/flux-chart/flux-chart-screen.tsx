import React from "react";
import { FluxChart } from "./flux-chart";
import type { FluxAsset } from "./ui";

/** Route-facing screen wrapper. The feature implementation is the reusable FluxChart. */
export function FluxChartScreen({ asset = "ethereum" }: { asset?: FluxAsset }) {
  return <FluxChart asset={asset} />;
}

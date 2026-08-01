import type { DemoMetrics } from "../use-demo-metrics";
import type { DemoState } from "../use-demo-state";

export type DemoPageProps = {
  readonly metrics: DemoMetrics;
  readonly state: DemoState;
};

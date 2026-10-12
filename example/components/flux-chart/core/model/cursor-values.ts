import type { RangeType } from "@/components/flux-chart/data/chart-data";
import type { CursorPoint } from "@/components/flux-chart/core/types";

type CursorPriceSample = {
  progress: number;
  value: number;
};

/**
 * Cursor price samples measured from the supplied screen recording. Keeping
 * them separate from the chart renderer makes the display model replaceable
 * without changing gesture or SVG code.
 */
const CURSOR_PRICE_SAMPLES: Record<RangeType, readonly CursorPriceSample[]> = {
  "1H": [
    { progress: 0.114, value: 2_505.75 },
    { progress: 0.220, value: 2_504.56 },
    { progress: 0.384, value: 2_503.87 },
    { progress: 0.487, value: 2_500.31 },
    { progress: 0.600, value: 2_500.19 },
    { progress: 0.747, value: 2_503.58 },
    { progress: 0.908, value: 2_499.54 },
    { progress: 1, value: 2_502.30 },
  ],
  "1D": [
    { progress: 0.212, value: 2_496.58 },
    { progress: 0.350, value: 2_498.27 },
    { progress: 0.494, value: 2_493.18 },
    { progress: 0.595, value: 2_484.77 },
    { progress: 0.704, value: 2_491.54 },
    { progress: 0.815, value: 2_506.86 },
    { progress: 0.930, value: 2_513.72 },
    { progress: 1, value: 2_502.30 },
  ],
  "1W": [
    { progress: 0.216, value: 2_443.07 },
    { progress: 0.387, value: 2_392.44 },
    { progress: 0.523, value: 2_500.46 },
    { progress: 0.620, value: 2_521.17 },
    { progress: 0.729, value: 2_452.75 },
    { progress: 0.845, value: 2_480.00 },
    { progress: 0.938, value: 2_477.48 },
    { progress: 0.972, value: 2_505.91 },
  ],
  "1M": [
    { progress: 0.438, value: 2_278.99 },
    { progress: 0.583, value: 2_474.20 },
    { progress: 0.739, value: 2_457.09 },
    { progress: 0.858, value: 2_408.08 },
    { progress: 1, value: 2_502.30 },
  ],
  // The recording switches to 1Y but does not drag the cursor there. Keep
  // its value anchored until there are observed 1Y cursor samples to match.
  "1Y": [],
};

const CURSOR_PRICE_TIGHTENING = 0.5;

export function getCursorDisplayValue(
  range: RangeType,
  totalValue: number,
  cursor: CursorPoint | null,
  graphWidth: number,
) {
  const samples = CURSOR_PRICE_SAMPLES[range];

  if (!cursor || graphWidth <= 0 || samples.length === 0) return totalValue;

  const progress = Math.max(0, Math.min(1, cursor.x / graphWidth));
  let sampledValue = samples[samples.length - 1].value;

  if (progress <= samples[0].progress) {
    sampledValue = samples[0].value;
  } else {
    for (let index = 1; index < samples.length; index += 1) {
      const previous = samples[index - 1];
      const current = samples[index];

      if (progress <= current.progress) {
        const span = Math.max(0.0001, current.progress - previous.progress);
        const localProgress = (progress - previous.progress) / span;
        sampledValue =
          previous.value + (current.value - previous.value) * localProgress;
        break;
      }
    }
  }

  return totalValue + (sampledValue - totalValue) * CURSOR_PRICE_TIGHTENING;
}

export function getCursorDisplayPercent(
  rangePercent: number,
  totalValue: number,
  displayValue: number,
) {
  if (totalValue === 0) return rangePercent;

  return rangePercent + ((displayValue - totalValue) / totalValue) * 100;
}

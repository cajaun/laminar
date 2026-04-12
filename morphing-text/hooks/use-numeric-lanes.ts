import { useMemo, useRef } from "react";
import type { NumericFlowDirection } from "../types";
import {
  findNumericLeadLength,
  splitDisplayUnits,
} from "../model/display-units";
import { reconcileNumericLanes } from "../model/numeric-lanes";

type NumericLedger = {
  previousValue: string;
  laneKeys: readonly number[];
  nextSeed: number;
  direction: NumericFlowDirection;
};

type NumericLaneSnapshot = {
  readonly units: readonly string[];
  readonly laneKeys: readonly number[];
  readonly direction: NumericFlowDirection;
  readonly leadLength: number;
};

export const useNumericLanes = (value: string): NumericLaneSnapshot => {
  const units = useMemo(() => splitDisplayUnits(value), [value]);
  const ledgerRef = useRef<NumericLedger>({
    previousValue: value,
    laneKeys: units.map((_, index) => index),
    nextSeed: units.length,
    direction: 0,
  });

  // keep lane ids in a ref so the number can reflow without remounting everything
  if (value !== ledgerRef.current.previousValue) {
    const nextLedger = reconcileNumericLanes(
      ledgerRef.current.previousValue,
      value,
      ledgerRef.current.laneKeys,
      ledgerRef.current.nextSeed
    );

    ledgerRef.current = {
      previousValue: value,
      laneKeys: nextLedger.laneKeys,
      nextSeed: nextLedger.nextSeed,
      direction: nextLedger.direction,
    };
  }

  return {
    units,
    laneKeys: ledgerRef.current.laneKeys,
    direction: ledgerRef.current.direction,
    leadLength: findNumericLeadLength(units),
  };
};

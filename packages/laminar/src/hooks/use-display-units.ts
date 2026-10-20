import { useMemo } from "react";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";

// normalize display units before measuring them
export const useDisplayUnits = (
  value: string,
  enabled = true
): readonly string[] =>
  useMemo(
    () =>
      // skip unit normalization when auto sizing is disabled
      enabled
        ? splitDisplayUnits(value).map(normalizeDisplayUnit)
        : [],
    [enabled, value]
  );

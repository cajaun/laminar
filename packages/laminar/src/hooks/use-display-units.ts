import { useMemo } from "react";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";

// normalize display units before measurement reads them
export const useDisplayUnits = (
  value: string,
  enabled = true
): readonly string[] =>
  useMemo(
    () =>
      // skip unit work when auto size is disabled
      enabled
        ? splitDisplayUnits(value).map(normalizeDisplayUnit)
        : [],
    [enabled, value]
  );

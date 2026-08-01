import { useMemo } from "react";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";

// normalize the same units used by rendering before measurement reads them
export const useDisplayUnits = (
  value: string,
  enabled = true
): readonly string[] =>
  useMemo(
    () =>
      // skip unit work when auto size is off
      enabled
        ? splitDisplayUnits(value).map(normalizeDisplayUnit)
        : [],
    [enabled, value]
  );

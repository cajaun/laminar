import { useMemo } from "react";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";

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

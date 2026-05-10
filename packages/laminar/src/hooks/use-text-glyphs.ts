import { useMemo, useRef } from "react";
import {
  normalizeDisplayUnit,
  splitDisplayUnits,
} from "../model/display-units";
import { reconcileTextGlyphKeys } from "../model/text-keys";
import type { GlyphToken } from "../types";

type TextGlyphLedger = {
  previousValue: string;
  previousUnits: readonly string[];
  glyphKeys: readonly string[];
  nextSeed: number;
};

export const useTextGlyphs = (
  value: string,
  namespace: string
): readonly GlyphToken[] => {
  const units = useMemo(() => splitDisplayUnits(value), [value]);
  const ledgerRef = useRef<TextGlyphLedger>({
    previousValue: value,
    previousUnits: units,
    glyphKeys: units.map((_, index) => `${namespace}:c${index}`),
    nextSeed: units.length,
  });

  if (value !== ledgerRef.current.previousValue) {
    // keep ids stable so unchanged glyphs stay mounted between updates
    const nextLedger = reconcileTextGlyphKeys(
      ledgerRef.current.previousUnits,
      units,
      ledgerRef.current.glyphKeys,
      ledgerRef.current.nextSeed,
      namespace
    );

    ledgerRef.current = {
      previousValue: value,
      previousUnits: units,
      glyphKeys: nextLedger.glyphKeys,
      nextSeed: nextLedger.nextSeed,
    };
  }

  const glyphKeys = ledgerRef.current.glyphKeys;

  return useMemo(
    () =>
      units.map((unit, index) => ({
        id: glyphKeys[index],
        value: normalizeDisplayUnit(unit),
      })),
    [glyphKeys, units]
  );
};
